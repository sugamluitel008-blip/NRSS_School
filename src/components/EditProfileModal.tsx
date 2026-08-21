import React, { useState, useRef } from 'react';
import { User } from '../types';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Check,
  Sparkles,
  User as UserIcon,
  GraduationCap,
  ShieldCheck,
  Building,
  Calendar,
  IdCard,
  Image as ImageIcon,
  Loader2,
  Smile
} from 'lucide-react';
import { motion } from 'motion/react';

export const PRESET_AVATARS = [
  // Student & Youth Avatars
  {
    id: 'student_boy_1',
    name: 'Tech Scholar',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_girl_1',
    name: 'Science Honors',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_boy_2',
    name: 'Creative Arts',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_girl_2',
    name: 'Student Council',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_boy_3',
    name: 'Athletics & Sports',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_girl_3',
    name: 'Debate & Literature',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },

  // Faculty & Admin Avatars
  {
    id: 'faculty_govinda',
    name: 'Executive Leadership',
    category: 'Faculty',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'faculty_woman_1',
    name: 'Senior Instructor',
    category: 'Faculty',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'faculty_man_2',
    name: 'STEM Coordinator',
    category: 'Faculty',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'faculty_woman_2',
    name: 'Academic Advisor',
    category: 'Faculty',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80'
  },

  // Official Institutional Logos & Crests
  {
    id: 'school_seal_crest',
    name: 'NRSS Official Seal',
    category: 'Institutional',
    url: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'academic_excellence_shield',
    name: 'Academic Shield',
    category: 'Institutional',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'robotics_lab_emblem',
    name: 'Robotics & AI Emblem',
    category: 'Institutional',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'sports_crest',
    name: 'Champions Athletics Crest',
    category: 'Institutional',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80'
  }
];

export const AVATAR_EMOJIS = [
  '🎓', '🏫', '🔬', '📚', '🌟', '🛡️', '⚡', '🏆', '🦁', '🦅',
  '🚀', '💡', '🎨', '🪐', '💻', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '🎯'
];

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onClose,
  onSave
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const [name, setName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [gradeOrDept, setGradeOrDept] = useState(currentUser.gradeOrDept || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [customId, setCustomId] = useState(
    currentUser.studentId || currentUser.employeeId || ''
  );

  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url' | 'emoji'>('presets');
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Emoji avatar generator (Creates a SVG data URI)
  const handleSelectEmoji = (emoji: string) => {
    const bgColors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" rx="100" fill="${randomBg}" />
        <text x="50%" y="56%" font-size="100" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      </svg>
    `.trim();
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatar(encoded);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAvatar(urlInput.trim());
    setUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a valid display name.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await onSave({
        name: name.trim(),
        avatar: avatar.trim() || currentUser.avatar,
        gradeOrDept: gradeOrDept.trim() || undefined,
        dob: dob || undefined,
        ...(isTeacher
          ? { employeeId: customId.trim() || undefined }
          : { studentId: customId.trim() || undefined })
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 text-left relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Profile & Logo</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isTeacher
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {isTeacher ? 'Admin / Faculty' : 'Student Account'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Update your name, profile photo, and school details</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Avatar / Logo Customizer Section */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Circular Avatar Preview with Camera Overlay */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-indigo-500/60 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img
                    src={avatar || currentUser.avatar}
                    alt={name || 'Avatar Preview'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1"
                  title="Click to Upload Local Photo"
                >
                  <Camera className="w-5 h-5 text-indigo-300" />
                  <span>Upload</span>
                </button>
              </div>

              {/* Avatar Summary & Quick Actions */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h3 className="text-sm font-bold text-white">Profile Photo & Emblem</h3>
                <p className="text-xs text-slate-400">
                  Choose from verified school presets, upload a photo from your device, or generate an emblem badge.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar(isTeacher
                      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    Reset Default
                  </button>
                </div>
              </div>
            </div>

            {/* Logo Picker Tabs */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'presets'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Device Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'url'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>URL Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('emoji')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'emoji'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Emblems</span>
                </button>
              </div>

              {/* Tab 1: Presets Grid */}
              {activeTab === 'presets' && (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mt-3 max-h-44 overflow-y-auto p-1 custom-scrollbar">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = avatar === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        className={`relative rounded-2xl overflow-hidden p-0.5 border-2 transition group flex flex-col items-center ${
                          isSelected
                            ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-105 shadow-lg'
                            : 'border-slate-800 hover:border-indigo-500/60 hover:scale-105'
                        }`}
                        title={p.name}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full aspect-square rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/40 rounded-xl flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Upload Zone */}
              {activeTab === 'upload' && (
                <div className="mt-3 p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-900/60 transition text-center space-y-2 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white">Click or tap to choose a photo</div>
                  <div className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP up to 5MB</div>
                </div>
              )}

              {/* Tab 3: URL Link */}
              {activeTab === 'url' && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Apply URL
                  </button>
                </div>
              )}

              {/* Tab 4: Emoji / Symbol Badges */}
              {activeTab === 'emoji' && (
                <div className="mt-3 grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {AVATAR_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="w-full aspect-square rounded-xl bg-slate-800 hover:bg-indigo-600/40 border border-slate-700 hover:border-indigo-500 text-xl flex items-center justify-center transition hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Profile Fields */}
          <div className="space-y-4">
            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Legal Name / Display Name *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sugam Luitel / Govinda Timalsina"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Email Address (Read-only for account integrity) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <span>Account Email Address</span>
                <span className="text-[10px] text-slate-500 font-normal">(Registered Cloud ID)</span>
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            {/* Grade / Department & ID Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isTeacher ? 'Faculty Department / Subject' : 'Class / Grade Section'}</span>
                </label>
                <input
                  type="text"
                  value={gradeOrDept}
                  onChange={(e) => setGradeOrDept(e.target.value)}
                  placeholder={isTeacher ? 'e.g. Science & Physics' : 'e.g. Grade 11 - Science A'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isTeacher ? 'Employee ID Number' : 'Student Roll / ID'}</span>
                </label>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder={isTeacher ? 'e.g. FAC-1002' : 'e.g. STD-2041'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
