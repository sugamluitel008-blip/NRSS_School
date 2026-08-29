import React, { useState, useEffect } from 'react';
import { User, SchoolUpdate } from '../types';
import {
  Bell,
  PlusCircle,
  Pin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Bookmark,
  Share2,
  Trash2,
  Pencil,
  RefreshCw,
  Eye,
  Users,
  Check,
  Printer,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SchoolUpdatesViewProps {
  currentUser: User;
  updates: SchoolUpdate[];
  onAddUpdate: (newUpdate: Omit<SchoolUpdate, 'id' | 'date' | 'time'>) => void;
  onEditUpdate?: (id: string, updatedFields: Partial<SchoolUpdate>) => void;
  onDeleteUpdate?: (id: string) => void;
  onTogglePinUpdate?: (id: string) => void;
  onClearAllUpdates?: () => void;
}

export const SchoolUpdatesView: React.FC<SchoolUpdatesViewProps> = ({
  currentUser,
  updates,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  onTogglePinUpdate,
  onClearAllUpdates
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterView, setFilterView] = useState<'all' | 'pinned' | 'bookmarked' | 'urgent'>('all');

  // Modals & Interactivity State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<SchoolUpdate | null>(null);
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [selectedUpdateForDetail, setSelectedUpdateForDetail] = useState<SchoolUpdate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bookmarks persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nrss_bookmarked_updates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nrss_bookmarked_updates', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Form State for creating / editing updates
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SchoolUpdate['category']>('Academics');
  const [priority, setPriority] = useState<SchoolUpdate['priority']>('medium');
  const [targetAudience, setTargetAudience] = useState<SchoolUpdate['targetAudience']>('All');
  const [pinned, setPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);

  const categories = ['All', 'Academics', 'Exams', 'Events'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setTitle('');
    setContent('');
    setCategory('Academics');
    setPriority('medium');
    setTargetAudience('All');
    setPinned(false);
    setHasAttachment(false);
    setAttachmentName('');
    setEditingUpdate(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const openEditModal = (upd: SchoolUpdate) => {
    setEditingUpdate(upd);
    setTitle(upd.title);
    setContent(upd.content);
    setCategory(upd.category);
    setPriority(upd.priority);
    setTargetAudience(upd.targetAudience || 'All');
    setPinned(!!upd.pinned);
    setHasAttachment(!!(upd.attachments && upd.attachments.length > 0));
    setAttachmentName(upd.attachments && upd.attachments[0] ? upd.attachments[0].name : '');
    setShowCreateModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const attachmentsList = hasAttachment ? [
      {
        name: attachmentName.trim() ? (attachmentName.endsWith('.pdf') ? attachmentName : `${attachmentName}.pdf`) : `${title.trim().replace(/\s+/g, '_')}_Document.pdf`,
        size: '1.8 MB'
      }
    ] : undefined;

    if (editingUpdate && onEditUpdate) {
      onEditUpdate(editingUpdate.id, {
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        pinned,
        targetAudience,
        attachments: attachmentsList
      });
      showToast('Announcement updated successfully!');
    } else {
      onAddUpdate({
        title: title.trim(),
        content: content.trim(),
        authorName: currentUser.name,
        authorRole: currentUser.gradeOrDept || 'Senior Faculty Administrator',
        authorAvatar: currentUser.avatar,
        category,
        priority,
        pinned,
        targetAudience,
        attachments: attachmentsList
      });
      showToast('New announcement published to bulletin board!');
    }

    setShowCreateModal(false);
    setEditingUpdate(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUpdateId || !onDeleteUpdate) return;
    onDeleteUpdate(deletingUpdateId);
    setDeletingUpdateId(null);
    showToast('Announcement removed from bulletin.');
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from saved notices' : 'Saved to your bookmarked notices');
      return updated;
    });
  };

  const handleShareNotice = (update: SchoolUpdate) => {
    const textToCopy = `📢 [NRSS Notice] ${update.title}\n📅 Date: ${update.date} at ${update.time}\n\n${update.content}\n\n— Published by ${update.authorName} (${update.authorRole})`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Notice text copied to clipboard for sharing!');
  };

  const handleDownloadAttachment = (fileName: string) => {
    showToast(`Downloading attachment: ${fileName}...`);
  };

  // Filtered dataset
  const filteredUpdates = updates.filter(update => {
    // Category match
    const matchesCategory = selectedCategory === 'All' || update.category === selectedCategory;

    // View tab match
    const matchesView = 
      filterView === 'all' ? true :
      filterView === 'pinned' ? !!update.pinned :
      filterView === 'bookmarked' ? bookmarkedIds.includes(update.id) :
      filterView === 'urgent' ? update.priority === 'urgent' : true;

    return matchesCategory && matchesView;
  });

  const getPriorityBadge = (priority: SchoolUpdate['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Urgent Circular
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Important Notice
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            General Bulletin
          </span>
        );
    }
  };

  const getCategoryColor = (cat: SchoolUpdate['category']) => {
    switch (cat) {
      case 'Exams':
        return 'bg-rose-950/50 text-rose-300 border-rose-800/60';
      case 'Events':
        return 'bg-purple-950/50 text-purple-300 border-purple-800/60';
      case 'Academics':
        return 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const pinnedCount = updates.filter(u => u.pinned).length;
  const urgentCount = updates.filter(u => u.priority === 'urgent').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Management Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>NRSS Official Circulars & Bulletin Board</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            School Announcements & Updates
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {isTeacher
              ? 'Administrative circular management portal. Post new session circulars, edit existing guidelines, pin critical notices, or clean the board.'
              : 'Official notice board for National Rhododendron Secondary School. Stay updated on examination routines, events, and school schedules.'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="px-2.5 py-1 sm:py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium">
              Total Notices: <strong className="text-white">{updates.length}</strong>
            </span>
            <span className="px-2.5 py-1 sm:py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 font-medium">
              Pinned: <strong>{pinnedCount}</strong>
            </span>
            {urgentCount > 0 && (
              <span className="px-2.5 py-1 sm:py-0.5 rounded-md bg-rose-950/60 border border-rose-800/50 text-rose-300 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Urgent: <strong>{urgentCount}</strong>
              </span>
            )}
            {bookmarkedIds.length > 0 && (
              <span className="px-2.5 py-1 sm:py-0.5 rounded-md bg-amber-950/60 border border-amber-800/50 text-amber-300 font-medium">
                Saved by You: <strong>{bookmarkedIds.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isTeacher ? (
            <>
              <button
                id="btn-post-new-announcement"
                type="button"
                onClick={openCreateModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Announcement</span>
              </button>

              {/* Clean / Reset Board Menu */}
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                title="Board cleaning & reset options"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clean Board</span>
              </button>
            </>
          ) : (
            <div className="text-xs font-medium text-slate-300 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-1.5 select-none">
              <span>📢 Active Broadcasts: 0</span>
            </div>
          )}
        </div>
      </div>

      {/* Simplified Category & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Simplified Core Categories */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setFilterView('all');
              }}
              className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat && filterView === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick View Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilterView(filterView === 'pinned' ? 'all' : 'pinned')}
            className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              filterView === 'pinned'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${filterView === 'pinned' ? 'rotate-45 text-amber-400' : ''}`} />
            <span>Pinned ({pinnedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterView(filterView === 'bookmarked' ? 'all' : 'bookmarked')}
            className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              filterView === 'bookmarked'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filterView === 'bookmarked' ? 'fill-indigo-400 text-indigo-400' : ''}`} />
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Announcements Feed List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">No announcements found</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {updates.length === 0
                  ? 'The bulletin board is currently clean. Ready for new circulars and announcements to be posted.'
                  : 'No notices match your active filters or search query.'}
              </p>
            </div>

            {isTeacher && (
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post New Announcement</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredUpdates.map((update) => {
            const isBookmarked = bookmarkedIds.includes(update.id);

            return (
              <motion.article
                key={update.id}
                id={`school-update-${update.id}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border transition hover:border-slate-700 shadow-lg space-y-3.5 relative overflow-hidden ${
                  update.pinned
                    ? 'border-indigo-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Pinned Accent Glow Bar */}
                {update.pinned && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />
                )}

                {/* Top Metadata Row: Tags, Dates, and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {update.pinned && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                        <Pin className="w-3 h-3 rotate-45 text-amber-400" /> PINNED
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryColor(update.category)}`}>
                      {update.category}
                    </span>

                    {getPriorityBadge(update.priority)}

                    {update.targetAudience && update.targetAudience !== 'All' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> For {update.targetAudience}
                      </span>
                    )}
                  </div>

                  {/* Right Side: Timestamp & Actions Toolbar */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {update.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {update.time}
                    </span>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(update.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'text-slate-500 hover:text-slate-200 border-transparent hover:bg-white/5'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Notice'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Share Notice Button */}
                    <button
                      type="button"
                      onClick={() => handleShareNotice(update)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 border border-transparent hover:bg-white/5 transition"
                      title="Share / Copy Notice text"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Admin / Teacher Actions Toolbar */}
                    {isTeacher && (
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                        {/* Toggle Pin */}
                        {onTogglePinUpdate && (
                          <button
                            type="button"
                            onClick={() => {
                              onTogglePinUpdate(update.id);
                              showToast(update.pinned ? 'Notice unpinned' : 'Notice pinned to top');
                            }}
                            className={`p-1.5 rounded-lg text-xs transition ${
                              update.pinned ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                            title={update.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${update.pinned ? 'rotate-45' : ''}`} />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(update)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition"
                          title="Edit Announcement"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingUpdateId(update.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h3
                    onClick={() => setSelectedUpdateForDetail(update)}
                    className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug hover:text-indigo-300 transition cursor-pointer"
                  >
                    {update.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-2 line-clamp-3">
                    {update.content}
                  </p>
                </div>

                {/* Attachments Section */}
                {update.attachments && update.attachments.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-2">
                    {update.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="p-2 px-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300 group hover:border-slate-700 transition"
                      >
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium truncate max-w-[180px] sm:max-w-xs">{att.name}</span>
                        <span className="text-[10px] text-slate-500">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att.name)}
                          className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 ml-1 transition"
                          title="Download Circular File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Author Footer & Read Detail */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={update.authorAvatar}
                      alt={update.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{update.authorName}</span>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {update.authorRole}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedUpdateForDetail(update)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                  >
                    <span>Read Full Notice</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: FULL NOTICE DETAIL VIEW                            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedUpdateForDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getCategoryColor(selectedUpdateForDetail.category)}`}>
                    {selectedUpdateForDetail.category}
                  </span>
                  {getPriorityBadge(selectedUpdateForDetail.priority)}
                  {selectedUpdateForDetail.pinned && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                      <Pin className="w-3 h-3 rotate-45" /> PINNED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareNotice(selectedUpdateForDetail)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copy Notice text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Print Circular"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUpdateForDetail(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {selectedUpdateForDetail.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Published: {selectedUpdateForDetail.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Time: {selectedUpdateForDetail.time}
                  </span>
                  {selectedUpdateForDetail.targetAudience && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Target: {selectedUpdateForDetail.targetAudience}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedUpdateForDetail.content}
              </div>

              {selectedUpdateForDetail.attachments && selectedUpdateForDetail.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Official Document Attachments
                  </div>
                  {selectedUpdateForDetail.attachments.map((att, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-slate-200">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold">{att.name}</span>
                        <span className="text-slate-500 text-[11px]">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att.name)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedUpdateForDetail.authorAvatar}
                    alt={selectedUpdateForDetail.authorName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {selectedUpdateForDetail.authorName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedUpdateForDetail.authorRole}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => {
                        const upd = selectedUpdateForDetail;
                        setSelectedUpdateForDetail(null);
                        openEditModal(upd);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedUpdateForDetail(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: POST / EDIT ANNOUNCEMENT (Teachers / Admins)        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingUpdate ? 'Edit School Announcement' : 'Publish Official School Announcement'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Broadcast to students, faculty, and academic departments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUpdate(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Announcement Headline *
                  </label>
                  <input
                    id="input-new-update-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Schedule for Trimester 2 Examinations & Lab Routine"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      id="select-new-update-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Academics">Academics</option>
                      <option value="Exams">Exams</option>
                      <option value="Events">Events</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Priority Level *
                    </label>
                    <select
                      id="select-new-update-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="low">General Bulletin (Low)</option>
                      <option value="medium">Important Notice (Medium)</option>
                      <option value="urgent">Urgent Circular (High Alert)</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All School (Students, Faculty & Parents)</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty & Staff Only</option>
                    <option value="Parents">Parents Only</option>
                  </select>
                </div>

                {/* Body Content */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Notice Content & Instructions *
                  </label>
                  <textarea
                    id="input-new-update-content"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Provide full details, guidelines, venue, reporting timings, and instructions for scholars..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Attachments Section */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAttachment}
                      onChange={(e) => setHasAttachment(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="font-medium">Attach Official PDF / Circular Document</span>
                  </label>

                  {hasAttachment && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        placeholder="Document name (e.g. Exam_Routine_2083.pdf)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Pin Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 rotate-45 text-amber-400" />
                      Pin to top of bulletin board
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingUpdate(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-publish-update"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingUpdate ? 'Save Changes' : 'Publish Notice'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {deletingUpdateId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete Announcement?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to remove this announcement from the public bulletin board?
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUpdateId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20"
                >
                  Delete Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: CLEAN / RESET BOARD CONFIRMATION                   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Clean Bulletin Board Options</h4>
                  <p className="text-xs text-slate-400">Choose how you wish to manage the bulletin notices</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Wiping the board will remove all current announcements to maintain a clean slate for new official notices.
              </p>

              <div className="space-y-2 pt-1">
                {onClearAllUpdates && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllUpdates();
                      setShowClearConfirmModal(false);
                      showToast('Bulletin board cleared. Ready for new announcements!');
                    }}
                    className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between transition text-left"
                  >
                    <div>
                      <div className="font-bold">Wipe & Clear All Notices</div>
                      <div className="text-[10px] text-rose-300/70">Start with a completely clean slate (0 notices)</div>
                    </div>
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
