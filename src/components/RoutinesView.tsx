import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Printer,
  Plus,
  SlidersHorizontal,
  BookOpen,
  Info,
  ChevronLeft,
  GraduationCap,
  Layers,
  FileText,
  Share2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassRoutine, User } from '../types';
import { subscribeToClassRoutines } from '../lib/firebase';

interface RoutinesViewProps {
  currentUser?: User | null;
  onNavigateToStaffTools?: () => void;
  onNavigateToUpdates?: () => void;
  onNavigateToAbout?: () => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  currentUser,
  onNavigateToStaffTools,
  onNavigateToUpdates,
  onNavigateToAbout
}) => {
  const [routines, setRoutines] = useState<ClassRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Selected Routine State
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'primary' | 'middle' | 'secondary' | 'plustwo'>('all');
  
  // Image Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isStaff = currentUser?.role === 'teacher';

  // Real-time Firestore subscription
  useEffect(() => {
    const unsubscribe = subscribeToClassRoutines((items) => {
      setRoutines(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId) || null;

  // Grade category helper
  const matchesCategory = (routine: ClassRoutine, cat: string) => {
    if (cat === 'all') return true;
    const gradeStr = routine.grade.toLowerCase();
    if (cat === 'primary') {
      return gradeStr.includes('grade 1') || gradeStr.includes('grade 2') || gradeStr.includes('grade 3') || gradeStr.includes('grade 4') || gradeStr.includes('grade 5');
    }
    if (cat === 'middle') {
      return gradeStr.includes('grade 6') || gradeStr.includes('grade 7') || gradeStr.includes('grade 8');
    }
    if (cat === 'secondary') {
      return gradeStr.includes('grade 9') || gradeStr.includes('grade 10');
    }
    if (cat === 'plustwo') {
      return gradeStr.includes('grade 11') || gradeStr.includes('grade 12') || gradeStr.includes('+2') || gradeStr.includes('science') || gradeStr.includes('mgmt') || gradeStr.includes('management');
    }
    return true;
  };

  const filteredRoutines = routines.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.shift && r.shift.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.roomNo && r.roomNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && matchesCategory(r, selectedCategory);
  });

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  // Print routine safely within iframe or browser
  const handlePrint = () => {
    if (!selectedRoutine) return;
    try {
      window.print();
    } catch (e) {
      console.warn('Print triggered error:', e);
    }
  };

  // Download routine
  const handleDownload = () => {
    if (!selectedRoutine) return;
    const a = document.createElement('a');
    a.href = selectedRoutine.imageUrl;
    a.download = `${selectedRoutine.title.replace(/\s+/g, '_')}_Timetable.png`;
    a.click();
  };

  const handleShare = () => {
    if (!selectedRoutine) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin} - Class Routine: ${selectedRoutine.title}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Get next and previous routine indices
  const currentIdx = routines.findIndex(r => r.id === selectedRoutineId);
  const prevRoutine = currentIdx > 0 ? routines[currentIdx - 1] : null;
  const nextRoutine = currentIdx >= 0 && currentIdx < routines.length - 1 ? routines[currentIdx + 1] : null;

  return (
    <div id="routines-of-classes-view" className="space-y-6 pb-16">
      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* VIEW 1: ROUTINE DETAIL SCREEN (When an option is clicked)  */}
        {/* ========================================================= */}
        {selectedRoutine ? (
          <motion.div
            key="routine-detail-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoutineId(null);
                    setZoomLevel(1);
                  }}
                  className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
                  <span className="hidden sm:inline">Back to Classes</span>
                  <span className="sm:hidden">Back</span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
                      {selectedRoutine.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {selectedRoutine.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    {selectedRoutine.shift && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{selectedRoutine.shift}</span>
                      </span>
                    )}
                    {selectedRoutine.roomNo && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{selectedRoutine.roomNo}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between sm:justify-end">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.75}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-slate-300 px-1.5 min-w-[38px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Fit to Window"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  title="Print Timetable"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                  title="Download Timetable Image"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Fullscreen View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timetable Image Display Canvas (Optimized for all browsers & small phones) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-2 sm:p-4 overflow-hidden shadow-2xl relative min-h-[420px] flex flex-col items-center justify-center">
              <div className="w-full overflow-auto custom-scrollbar flex items-center justify-center p-2">
                <motion.div
                  animate={{ scale: zoomLevel }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="origin-center max-w-full"
                >
                  <img
                    src={selectedRoutine.imageUrl}
                    alt={selectedRoutine.title}
                    className="max-w-full h-auto max-h-[72vh] rounded-2xl object-contain shadow-2xl border border-slate-800/80 bg-white"
                  />
                </motion.div>
              </div>

              {/* Instructions banner at bottom of image */}
              <div className="w-full pt-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    Academic Year {selectedRoutine.academicYear || '2083 B.S.'} • Published by {selectedRoutine.uploadedBy} on {selectedRoutine.uploadedAt}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Routine Copied!' : 'Share Routine'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Notes Section */}
            {selectedRoutine.notes && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Special Guidelines & Notes:</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-5">
                  {selectedRoutine.notes}
                </p>
              </div>
            )}

            {/* Bottom Quick Switch Navigation (Previous / Next Class) */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {prevRoutine ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoutineId(prevRoutine.id);
                    setZoomLevel(1);
                  }}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center gap-3 max-w-[48%]"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 font-medium">Previous Class</div>
                    <div className="text-xs font-bold text-white truncate">{prevRoutine.title}</div>
                  </div>
                </button>
              ) : <div />}

              {nextRoutine ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoutineId(nextRoutine.id);
                    setZoomLevel(1);
                  }}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-right transition flex items-center justify-end gap-3 max-w-[48%] ml-auto"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 font-medium">Next Class</div>
                    <div className="text-xs font-bold text-white truncate">{nextRoutine.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ) : <div />}
            </div>

            {/* FULLSCREEN LIGHTBOX MODAL */}
            {isFullscreen && (
              <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 text-white border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold">{selectedRoutine.title}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedRoutine.shift || 'Session 2083'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                  <img
                    src={selectedRoutine.imageUrl}
                    alt={selectedRoutine.title}
                    className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl bg-white"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <span>{selectedRoutine.roomNo ? `Classroom: ${selectedRoutine.roomNo}` : ''}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: MAIN CLASS OPTIONS LIST (Routines Of Classes 1-12) */
          /* ========================================================= */
          <motion.div
            key="routines-list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <CalendarDays className="w-4 h-4" />
                  <span>Academic Session 2083 B.S.</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Routines Of Classes 1-12
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Select your class and section below (e.g., Grade 1 Sec A, Grade 1 Sec B) to view the complete daily timetable, laboratory periods, and faculty schedule.
                </p>
              </div>

              {/* Staff Management CTA */}
              {isStaff && onNavigateToStaffTools && (
                <button
                  type="button"
                  onClick={onNavigateToStaffTools}
                  className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 shrink-0 self-start md:self-auto"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Manage in Staff Tools</span>
                </button>
              )}
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'primary', label: 'Primary (1-5)' },
                  { id: 'middle', label: 'Middle (6-8)' },
                  { id: 'secondary', label: 'Secondary (9-10)' },
                  { id: 'plustwo', label: 'Higher Sec (11-12)' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search class (e.g. Grade 1 Sec A)..."
                  className="w-full pl-9 pr-4 py-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Routine Options Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span>Loading class routines...</span>
              </div>
            ) : filteredRoutines.length === 0 ? (
              /* CLEAN START / EMPTY STATE */
              <div className="min-h-[360px] rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-bold text-white">
                    {searchQuery ? 'No Routines Found Matching Search' : 'No Class Routines Uploaded Yet'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {searchQuery
                      ? 'Try clearing the search query or selecting a different class category.'
                      : 'Class and section timetables for Grades 1 through 12 will appear here once published by faculty.'}
                  </p>
                </div>

                {isStaff && onNavigateToStaffTools && (
                  <button
                    type="button"
                    onClick={onNavigateToStaffTools}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload First Routine in Staff Tools</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredRoutines.map((routine) => (
                  <motion.button
                    key={routine.id}
                    id={`routine-card-${routine.id}`}
                    type="button"
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRoutineId(routine.id)}
                    className="group p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900 hover:bg-slate-900/90 text-left transition flex flex-col justify-between shadow-lg relative overflow-hidden space-y-4"
                  >
                    <div className="space-y-3 w-full">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {routine.grade}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {routine.section}
                        </span>
                      </div>

                      {/* Title and metadata */}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition tracking-tight">
                          {routine.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                          {routine.shift && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{routine.shift}</span>
                            </span>
                          )}
                          {routine.roomNo && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{routine.roomNo}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Small Thumbnail Preview */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center relative">
                        <img
                          src={routine.imageUrl}
                          alt={routine.title}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold shadow">
                            Open Timetable
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300 w-full">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Routine Schedule</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
