import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Sparkles,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Eye,
  RefreshCw,
  Search,
  BookOpen,
  School,
  Clock,
  MapPin,
  Layers,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassRoutine, User } from '../types';
import {
  subscribeToClassRoutines,
  addClassRoutineToDb,
  updateClassRoutineInDb,
  deleteClassRoutineFromDb,
  reorderClassRoutinesInDb
} from '../lib/firebase';
import { convertPdfToImageDataUrl, readImageAsDataUrl } from '../lib/pdfHelper';

interface ClassRoutinesManagerProps {
  currentUser: User;
  onBack: () => void;
  onSelectRoutineToView?: (routineId: string) => void;
}

const PRESET_GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11 (Science)', 'Grade 11 (Management)',
  'Grade 12 (Science)', 'Grade 12 (Management)'
];

const PRESET_SECTIONS = ['Sec A', 'Sec B', 'Sec C', 'Sec D', 'Morning', 'Day'];

export const ClassRoutinesManager: React.FC<ClassRoutinesManagerProps> = ({
  currentUser,
  onBack,
  onSelectRoutineToView
}) => {
  const [routines, setRoutines] = useState<ClassRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<ClassRoutine | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewRoutine, setPreviewRoutine] = useState<ClassRoutine | null>(null);

  // Form Fields
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [customGrade, setCustomGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('Sec A');
  const [customSection, setCustomSection] = useState('');
  const [routineTitle, setRoutineTitle] = useState('Grade 1 Sec A');
  const [shift, setShift] = useState('Morning Shift (06:30 AM - 11:30 AM)');
  const [roomNo, setRoomNo] = useState('Room 101');
  const [academicYear, setAcademicYear] = useState('2083 B.S.');
  const [notes, setNotes] = useState('');
  
  // Image & Upload handling
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time subscription to class routines from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToClassRoutines((items) => {
      setRoutines(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update routineTitle automatically when grade/section changes (if user hasn't customized freely)
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    const finalGrade = grade === 'Custom' ? customGrade : grade;
    const finalSec = selectedSection === 'Custom' ? customSection : selectedSection;
    setRoutineTitle(`${finalGrade} ${finalSec}`.trim());
  };

  const handleSectionChange = (sec: string) => {
    setSelectedSection(sec);
    const finalGrade = selectedGrade === 'Custom' ? customGrade : selectedGrade;
    const finalSec = sec === 'Custom' ? customSection : sec;
    setRoutineTitle(`${finalGrade} ${finalSec}`.trim());
  };

  const openAddModal = () => {
    setEditingRoutine(null);
    setSelectedGrade('Grade 1');
    setCustomGrade('');
    setSelectedSection('Sec A');
    setCustomSection('');
    setRoutineTitle('Grade 1 Sec A');
    setShift('Morning Shift (06:30 AM - 11:30 AM)');
    setRoomNo('Room 101');
    setAcademicYear('2083 B.S.');
    setNotes('');
    setImagePreviewUrl('');
    setFileName('');
    setFileType('image');
    setUploadError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (routine: ClassRoutine) => {
    setEditingRoutine(routine);
    if (PRESET_GRADES.includes(routine.grade)) {
      setSelectedGrade(routine.grade);
      setCustomGrade('');
    } else {
      setSelectedGrade('Custom');
      setCustomGrade(routine.grade);
    }

    if (PRESET_SECTIONS.includes(routine.section)) {
      setSelectedSection(routine.section);
      setCustomSection('');
    } else {
      setSelectedSection('Custom');
      setCustomSection(routine.section);
    }

    setRoutineTitle(routine.title);
    setShift(routine.shift || '');
    setRoomNo(routine.roomNo || '');
    setAcademicYear(routine.academicYear || '2083 B.S.');
    setNotes(routine.notes || '');
    setImagePreviewUrl(routine.imageUrl);
    setFileName(routine.fileName || '');
    setFileType(routine.fileType || 'image');
    setUploadError(null);
    setIsFormOpen(true);
  };

  // Process File Upload (Supports PDF conversion to canvas image or image read)
  const handleFileUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadError(null);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        setFileType('pdf');
        setFileName(file.name);
        const convertedImgUrl = await convertPdfToImageDataUrl(file);
        setImagePreviewUrl(convertedImgUrl);
      } else if (file.type.startsWith('image/')) {
        setFileType('image');
        setFileName(file.name);
        const imgUrl = await readImageAsDataUrl(file);
        setImagePreviewUrl(imgUrl);
      } else {
        throw new Error('Unsupported format. Please upload a PDF timetable or an image (PNG, JPG, Screenshot).');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to process routine file.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreviewUrl) {
      setUploadError('Please upload a routine timetable file (PDF, Image, or Screenshot).');
      return;
    }

    const finalGrade = selectedGrade === 'Custom' ? (customGrade.trim() || 'Grade 1') : selectedGrade;
    const finalSec = selectedSection === 'Custom' ? (customSection.trim() || 'Sec A') : selectedSection;
    const finalTitle = routineTitle.trim() || `${finalGrade} ${finalSec}`;

    setSaving(true);
    try {
      if (editingRoutine) {
        await updateClassRoutineInDb(editingRoutine.id, {
          grade: finalGrade,
          section: finalSec,
          title: finalTitle,
          shift: shift.trim(),
          roomNo: roomNo.trim(),
          academicYear: academicYear.trim(),
          notes: notes.trim(),
          imageUrl: imagePreviewUrl,
          fileName,
          fileType,
          uploadedBy: currentUser.name,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
      } else {
        // Find maximum orderIndex so it appears sequentially at bottom of current list
        const maxOrder = routines.length > 0 
          ? Math.max(...routines.map(r => r.orderIndex || 0)) + 10
          : 10;

        await addClassRoutineToDb({
          grade: finalGrade,
          section: finalSec,
          title: finalTitle,
          shift: shift.trim(),
          roomNo: roomNo.trim(),
          academicYear: academicYear.trim(),
          notes: notes.trim(),
          imageUrl: imagePreviewUrl,
          fileName,
          fileType,
          uploadedBy: currentUser.name,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          orderIndex: maxOrder,
          createdAt: Date.now()
        });
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Error saving routine:', err);
      setUploadError(err.message || 'Failed to save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClassRoutineFromDb(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting routine:', err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === routines.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...routines];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Assign sequential order indices
    const itemsToUpdate = updated.map((item, idx) => ({
      id: item.id,
      orderIndex: (idx + 1) * 10
    }));

    setRoutines(updated);
    await reorderClassRoutinesInDb(itemsToUpdate);
  };

  // Filter routines based on search
  const filteredRoutines = routines.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      (r.roomNo && r.roomNo.toLowerCase().includes(q)) ||
      (r.shift && r.shift.toLowerCase().includes(q))
    );
  });

  return (
    <div id="class-routines-manager-container" className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
            title="Back to Staff Tools"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <CalendarDays className="w-4 h-4" />
              <span>Academic Administration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Class Routines Manager (Grades 1-12)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload PDF or image timetables for every class & section. Renders directly as high-resolution visual timetables for students and faculty.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Routine</span>
          </button>
        </div>
      </div>

      {/* Search & Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by grade, section (e.g. Grade 1 Sec A)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Total Published Routines: <strong className="text-white">{routines.length}</strong></span>
        </div>
      </div>

      {/* Routine Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          <span>Loading class routines database...</span>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">No Routines Uploaded Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start by uploading the first routine PDF or timetable screenshot for Grade 1 Sec A, Grade 1 Sec B, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Routine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine, idx) => (
            <motion.div
              key={routine.id}
              layout
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3.5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                {/* Header with grade badge & ordering */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {routine.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {routine.section}
                    </span>
                  </div>

                  {/* Move Up/Down controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 disabled:cursor-not-allowed transition"
                      title="Move Up"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === routines.length - 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 disabled:cursor-not-allowed transition"
                      title="Move Down"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title and details */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {routine.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                    {routine.shift && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>{routine.shift}</span>
                      </span>
                    )}
                    {routine.roomNo && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{routine.roomNo}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Thumbnail */}
                <div
                  onClick={() => setPreviewRoutine(routine)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 cursor-pointer group flex items-center justify-center"
                >
                  <img
                    src={routine.imageUrl}
                    alt={routine.title}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Click to Zoom</span>
                  </div>
                </div>

                {routine.notes && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                    "{routine.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500">
                  By {routine.uploadedBy}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(routine)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1 border border-slate-700"
                  >
                    <Edit2 className="w-3 h-3 text-sky-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(routine.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRoutine ? 'Edit Class Routine' : 'Add New Class Routine'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Provide class details and upload routine PDF or image
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-4">
              {/* Grade Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Select Grade / Class *
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {PRESET_GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="Custom">+ Custom Class Name...</option>
                </select>
                {selectedGrade === 'Custom' && (
                  <input
                    type="text"
                    value={customGrade}
                    onChange={(e) => {
                      setCustomGrade(e.target.value);
                      setRoutineTitle(`${e.target.value} ${selectedSection}`.trim());
                    }}
                    placeholder="Enter custom grade (e.g. Nursery, Grade 11 Law)..."
                    className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                    required
                  />
                )}
              </div>

              {/* Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Section *
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {PRESET_SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Custom">+ Custom Section...</option>
                  </select>
                  {selectedSection === 'Custom' && (
                    <input
                      type="text"
                      value={customSection}
                      onChange={(e) => {
                        setCustomSection(e.target.value);
                        setRoutineTitle(`${selectedGrade} ${e.target.value}`.trim());
                      }}
                      placeholder="e.g. Sec E, Evening"
                      className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Routine Display Title *
                  </label>
                  <input
                    type="text"
                    value={routineTitle}
                    onChange={(e) => setRoutineTitle(e.target.value)}
                    placeholder="e.g. Grade 1 Sec A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Shift, Room & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Shift
                  </label>
                  <input
                    type="text"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    placeholder="e.g. Morning Shift (06:30 - 11:30)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Room / Block
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="e.g. Room 101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2083 B.S."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Notes & Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Notes / Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Laboratory sessions conducted every Wednesday in Block C"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* File Upload (PDF or Image/Screenshot) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Upload Timetable Document or Image *</span>
                  <span className="text-[11px] text-sky-400 font-normal">Supports PDF, PNG, JPG, Screenshots</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {!imagePreviewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-950/60 hover:bg-slate-950 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition">
                      {uploadLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {uploadLoading ? 'Converting PDF / Processing Image...' : 'Click to select Routine PDF or Image'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PDFs will automatically render as high-resolution images for all devices
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 flex flex-col items-center justify-center">
                      <img
                        src={imagePreviewUrl}
                        alt="Routine Preview"
                        className="max-h-56 w-auto object-contain rounded-lg"
                      />
                      <div className="w-full flex items-center justify-between pt-2 px-1 text-xs text-slate-400">
                        <span className="truncate max-w-[200px] flex items-center gap-1.5 text-sky-300 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {fileName || 'Routine Image Loaded'}
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
                        >
                          Change File
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadLoading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Routine...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingRoutine ? 'Update Routine' : 'Publish Routine'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* PREVIEW ZOOM MODAL */}
      {previewRoutine && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{previewRoutine.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {previewRoutine.shift || 'Session 2083'}
                </span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setPreviewRoutine(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 w-full max-w-4xl flex items-center justify-center p-2 overflow-auto">
            <img
              src={previewRoutine.imageUrl}
              alt={previewRoutine.title}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>

          <div className="w-full max-w-4xl pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>{previewRoutine.roomNo ? `Classroom: ${previewRoutine.roomNo}` : ''}</span>
            <button
              type="button"
              onClick={() => {
                const a = document.createElement('a');
                a.href = previewRoutine.imageUrl;
                a.download = `${previewRoutine.title.replace(/\s+/g, '_')}_Routine.png`;
                a.click();
              }}
              className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition"
            >
              Download Timetable Image
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Class Routine?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This routine will be removed for students and faculty. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
