import React, { useState, useRef } from 'react';
import { User, AdminRequest, CampusPhoto } from '../types';
import {
  approveAdminRequestInDb,
  rejectAdminRequestInDb,
  addCampusPhotoToDb,
  deleteCampusPhotoFromDb,
  resetCampusPhotosInDb
} from '../lib/firebase';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  UserCheck,
  Mail,
  Building,
  Smartphone,
  Calendar,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ArrowLeft,
  ChevronRight,
  Plus,
  StickyNote,
  FileCheck2,
  Sparkles,
  Users,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  RotateCcw,
  ExternalLink,
  Eye,
  Check,
  AlertTriangle,
  Link as LinkIcon,
  CalendarDays,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusGallery } from './CampusGallery';
import { AllAccountsManager } from './AllAccountsManager';
import { ClassRoutinesManager } from './ClassRoutinesManager';


interface StaffToolsViewProps {
  currentUser: User;
  adminRequests: AdminRequest[];
  campusPhotos?: CampusPhoto[];
}

export const StaffToolsView: React.FC<StaffToolsViewProps> = ({
  currentUser,
  adminRequests,
  campusPhotos = []
}) => {
  // Navigation inside Staff Tools: null = Notes Overview, 'queued-accounts' = Queued Account Page, 'campus-photos' = Photo Manager
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Approval Queue State
  const [activeQueueTab, setActiveQueueTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [queueSearch, setQueueSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Photo Management State
  const [photoUploadMode, setPhotoUploadMode] = useState<'file' | 'url'>('file');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [isResettingPhotos, setIsResettingPhotos] = useState(false);
  const [showLiveGalleryPreview, setShowLiveGalleryPreview] = useState(false);
  const [photoActionSuccess, setPhotoActionSuccess] = useState<string | null>(null);
  const [photoActionError, setPhotoActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingRequests = adminRequests.filter((r) => r.status === 'pending');
  const approvedRequests = adminRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = adminRequests.filter((r) => r.status === 'rejected');

  const filteredRequests = adminRequests.filter((r) => {
    if (activeQueueTab !== 'all' && r.status !== activeQueueTab) return false;
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = async (requestId: string, applicantName: string) => {
    try {
      setProcessingId(requestId);
      setActionError(null);
      await approveAdminRequestInDb(requestId, currentUser.name);
      setActionSuccess(`Successfully approved faculty/admin account for ${applicantName}! The user can now log in.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Approval error:', err);
      setActionError(err?.message || 'Failed to approve admin request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (requestId: string, applicantName: string) => {
    try {
      setProcessingId(requestId);
      setActionError(null);
      await rejectAdminRequestInDb(requestId, currentUser.name, rejectReason.trim() || undefined);
      setActionSuccess(`Declined admin request for ${applicantName}.`);
      setRejectingId(null);
      setRejectReason('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Rejection error:', err);
      setActionError(err?.message || 'Failed to decline admin request.');
    } finally {
      setProcessingId(null);
    }
  };

  // Photo Upload Handler (Handles local file compression to base64 Data URL)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoActionError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and compress to reasonable canvas dimensions
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(compressedDataUrl);
          setPhotoActionError(null);
          if (!photoTitle.trim()) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setPhotoTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit New Photo to Firestore
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      setPhotoActionError('Please select or provide an image to upload.');
      return;
    }
    if (!photoTitle.trim()) {
      setPhotoActionError('Please enter a descriptive title for this photo.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setPhotoActionError(null);
      await addCampusPhotoToDb({
        url: photoUrl.trim(),
        title: photoTitle.trim(),
        description: photoDescription.trim() || undefined,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAt: Date.now()
      });

      setPhotoActionSuccess('Photo successfully published to About Us auto-swiping gallery!');
      setPhotoUrl('');
      setPhotoTitle('');
      setPhotoDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setPhotoActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setPhotoActionError(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Delete Photo from Firestore
  const handleDeletePhoto = async (photoId: string, photoTitleText: string) => {
    try {
      setDeletingPhotoId(photoId);
      setPhotoActionError(null);
      await deleteCampusPhotoFromDb(photoId);
      setPhotoActionSuccess(`Deleted "${photoTitleText}" from About Us gallery.`);
      setTimeout(() => setPhotoActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Delete photo error:', err);
      setPhotoActionError(err?.message || 'Failed to delete photo.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // Reset Photos to Default Showcase
  const handleResetPhotos = async () => {
    if (!window.confirm('Reset all photos to the default official N.R. College showcase collection? This will replace custom uploads.')) {
      return;
    }
    try {
      setIsResettingPhotos(true);
      setPhotoActionError(null);
      await resetCampusPhotosInDb();
      setPhotoActionSuccess('Successfully reset campus photos to default collection.');
      setTimeout(() => setPhotoActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Reset photos error:', err);
      setPhotoActionError(err?.message || 'Failed to reset photos.');
    } finally {
      setIsResettingPhotos(false);
    }
  };

  return (
    <div id="staff-tools-container" className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* VIEW 1: Notes Overview Grid */}
      {selectedTool === null && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Staff Tools</h1>
                <p className="text-xs text-slate-400">
                  Select a tool note below to access administrative features.
                </p>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{pendingRequests.length} Queued Account{pendingRequests.length > 1 ? 's' : ''} Awaiting Review</span>
              </div>
            )}
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Note 1: Queued Account */}
            <motion.button
              id="note-queued-account"
              type="button"
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool('queued-accounts')}
              className={`p-6 rounded-2xl border text-left transition relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px] ${
                pendingRequests.length > 0
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10'
                  : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    pendingRequests.length > 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    pendingRequests.length > 0
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold animate-pulse'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {pendingRequests.length > 0
                      ? `${pendingRequests.length} Pending`
                      : 'Active'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Queued Account</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Review and verify incoming faculty and staff registration requests. Approve authorized accounts or decline unverified submissions.
                  </p>
                </div>
              </div>

              {/* Note Footer Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Open Queued Accounts</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </motion.button>

            {/* Note 2: School & Campus Photos Manager */}
            <motion.button
              id="note-school-photos"
              type="button"
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool('campus-photos')}
              className="p-6 rounded-2xl border text-left transition relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
                    {campusPhotos.length} Photo{campusPhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>School Photos (About Us)</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Upload new school and campus pictures directly into the About Us auto-swiping showcase, or delete unwanted photos.
                  </p>
                </div>
              </div>

              {/* Note Footer Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Manage School Photos</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </motion.button>

            {/* Note 3: All Accounts Manager (Admin Accounts vs Student Accounts) */}
            <motion.button
              id="note-all-accounts"
              type="button"
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool('all-accounts')}
              className="p-6 rounded-2xl border text-left transition relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border-slate-800 hover:border-sky-500/50 hover:shadow-sky-500/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-sky-500/15 text-sky-300 border-sky-500/30">
                    Admin & Students
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>All Accounts</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Manage all user accounts created till now. View admin accounts and student accounts, reset passwords, change names, suspend, or delete accounts.
                  </p>
                </div>
              </div>

              {/* Note Footer Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Manage All Accounts</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </motion.button>

            {/* Note 4: Class Routines Manager (Grades 1-12) */}
            <motion.button
              id="note-class-routines"
              type="button"
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTool('class-routines')}
              className="p-6 rounded-2xl border text-left transition relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
                    Grades 1-12
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Class Routines (1-12)</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Upload & manage PDF or image timetables for every class and section (Grade 1 Sec A, Sec B, etc.). Supports instant conversion to crisp visual timetables.
                  </p>
                </div>
              </div>

              {/* Note Footer Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manage Class Routines</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {/* VIEW: Class Routines Manager Tool */}
      {selectedTool === 'class-routines' && (
        <ClassRoutinesManager
          currentUser={currentUser}
          onBack={() => setSelectedTool(null)}
        />
      )}

      {/* VIEW: All Accounts Management Tool */}
      {selectedTool === 'all-accounts' && (
        <AllAccountsManager
          currentUser={currentUser}
          onBack={() => setSelectedTool(null)}
        />
      )}

      {/* VIEW 2: School & Campus Photos Detailed Manager */}
      {selectedTool === 'campus-photos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 flex items-center justify-center shrink-0"
                aria-label="Back to Staff Tools"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">School Photos Manager</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    {campusPhotos.length} Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Upload photos for the About Us auto-swiping showcase or delete existing pictures.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowLiveGalleryPreview(!showLiveGalleryPreview)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  showLiveGalleryPreview
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showLiveGalleryPreview ? 'Hide Preview' : 'Live Auto-Swipe Preview'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetPhotos}
                disabled={isResettingPhotos}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1.5 transition"
                title="Restore default campus photos"
              >
                {isResettingPhotos ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {photoActionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{photoActionSuccess}</span>
            </div>
          )}

          {photoActionError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{photoActionError}</span>
            </div>
          )}

          {/* Live Preview Toggle Section */}
          {showLiveGalleryPreview && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Live About Us Auto-Swiping Preview
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Updates instantly on upload or delete</span>
              </div>
              <CampusGallery photos={campusPhotos} />
            </div>
          )}

          {/* UPLOAD NEW SCHOOL PHOTO FORM */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Upload New School Photo</h2>
                <p className="text-xs text-slate-400">Add high-resolution photos of classrooms, events, laboratories, or activities.</p>
              </div>
            </div>

            {/* Mode Selector: Local File vs Direct URL */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 max-w-xs">
              <button
                type="button"
                onClick={() => setPhotoUploadMode('file')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  photoUploadMode === 'file'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoUploadMode('url')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  photoUploadMode === 'url'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              {/* Mode 1: File Upload Picker */}
              {photoUploadMode === 'file' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Image from Device
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-950/60 hover:bg-slate-950 p-6 rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                        Click to browse or drag & drop photo
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PNG, JPG, WebP supported. Optimized automatically.
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Mode 2: Direct Image URL */}
              {photoUploadMode === 'url' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Direct Image URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://example.com/school-event.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Title & Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Photo Title / Caption <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Sports Meet 2083, Chemistry Lab..."
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subtitle / Location Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tarakeshwor-11 Nepaltar, Main Courtyard..."
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Live Card Preview if URL/File selected */}
              {photoUrl && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Preview Image:
                  </div>
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] max-h-48 border border-slate-800 bg-black">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <div>
                        <div className="text-xs font-bold text-white drop-shadow">
                          {photoTitle || 'Your Photo Title Here'}
                        </div>
                        {photoDescription && (
                          <div className="text-[10px] text-slate-300 drop-shadow">
                            {photoDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUploadingPhoto || !photoUrl}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Photo...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Add to About Us Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ACTIVE PHOTOS SHOWCASE GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Current Gallery Photos ({campusPhotos.length})</h2>
                <p className="text-xs text-slate-400">These photos are currently cycling in the About Us auto-swiping gallery.</p>
              </div>
            </div>

            {campusPhotos.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No photos in the About Us gallery.</p>
                <p className="text-xs text-slate-500">Upload a photo above or click 'Reset Defaults' to populate initial campus pictures.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {campusPhotos.map((photo, index) => (
                  <div
                    key={photo.id || index}
                    className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {photo.description}
                          </p>
                        )}
                      </div>

                      {/* Meta & Delete Action */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-500 truncate">
                          {photo.uploadedBy ? `By ${photo.uploadedBy}` : 'Official Campus Asset'}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id, photo.title)}
                          disabled={deletingPhotoId === photo.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 flex items-center gap-1.5 transition shrink-0"
                          title="Delete from About Us gallery"
                        >
                          {deletingPhotoId === photo.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Queued Account Detailed Page */}
      {selectedTool === 'queued-accounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 flex items-center justify-center shrink-0"
                aria-label="Back to Staff Tools"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Queued Account Approvals</h1>
                  {pendingRequests.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                      {pendingRequests.length} Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Review and verify faculty registrations. Authorize access or reject invalid submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Action Alerts */}
          {actionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => {
                const count =
                  tab === 'pending'
                    ? pendingRequests.length
                    : tab === 'approved'
                    ? approvedRequests.length
                    : tab === 'rejected'
                    ? rejectedRequests.length
                    : adminRequests.length;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveQueueTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition flex items-center gap-1.5 shrink-0 ${
                      activeQueueTab === tab
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeQueueTab === tab
                          ? 'bg-emerald-800/60 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, dept..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* List of Requests */}
          <div className="space-y-3.5">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  {queueSearch
                    ? 'No faculty requests matched your search criteria.'
                    : activeQueueTab === 'pending'
                    ? 'No pending account requests in the verification queue.'
                    : `No ${activeQueueTab} requests found.`}
                </p>
                <p className="text-xs text-slate-500">
                  New faculty registration requests submitted via the portal will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isProcessing = processingId === req.id;
                const isDecliningThis = rejectingId === req.id;

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition duration-200 ${
                      isPending
                        ? 'bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/20'
                        : isApproved
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                        : 'bg-slate-900/30 border-slate-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Applicant Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-sm font-bold text-white tracking-tight">{req.name}</h3>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                              isPending
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                : isApproved
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            }`}
                          >
                            {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                            {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {isRejected && <XCircle className="w-3 h-3 text-rose-400" />}
                            <span className="capitalize">{req.status}</span>
                          </span>

                          <span className="text-[11px] text-slate-500">
                            Requested: {req.requestedAt || 'Recently'}
                          </span>
                        </div>

                        {/* Attribute Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-300 pt-1">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-200 truncate">{req.email}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-200 truncate">{req.department || 'General Faculty'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-200 font-mono">{req.employeeId || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-200 truncate" title={req.deviceId}>
                              {req.deviceModel || 'Verified Device'}
                            </span>
                          </div>
                        </div>

                        {/* Audit Details for Approved / Rejected */}
                        {isApproved && req.approvedBy && (
                          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved by {req.approvedBy} on {req.approvedAt || 'record'}</span>
                          </div>
                        )}

                        {isRejected && (
                          <div className="text-[11px] text-rose-400/90 flex items-center gap-1.5 pt-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>
                              Declined by {req.approvedBy || 'Staff'}
                              {req.rejectionReason ? `: "${req.rejectionReason}"` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      {isPending && (
                        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(req.id, req.name)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Approve Account</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingId(req.id);
                              setRejectReason('');
                            }}
                            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Decline Form */}
                    {isDecliningThis && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                        <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Provide reason for declining (optional):</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="e.g., Unverified employee ID, duplicate submission..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleConfirmReject(req.id, req.name)}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                            >
                              {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                              Confirm Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingId(null)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
