import React, { useState } from 'react';
import { User, SupportTicket, TicketReply } from '../types';
import {
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Send,
  X,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactUsViewProps {
  currentUser: User;
  tickets: SupportTicket[];
  onCreateTicket: (newTicket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  onAddTicketReply: (ticketId: string, replyContent: string) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: SupportTicket['status']) => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({
  currentUser,
  tickets,
  onCreateTicket,
  onAddTicketReply,
  onUpdateTicketStatus
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'tickets' | 'directory'>('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Academic Inquiries');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [description, setDescription] = useState('');

  // If student: see my tickets. If teacher: see all tickets with filter
  const visibleTickets = isTeacher
    ? tickets
    : tickets.filter(t => t.userId === currentUser.id || t.userEmail === currentUser.email);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    onCreateTicket({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      subject: subject.trim(),
      category: category,
      priority: priority,
      status: 'Open',
      description: description.trim()
    });

    setSubject('');
    setDescription('');
    setCategory('Academic Inquiries');
    setPriority('Medium');
    setShowCreateModal(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedTicket) return;

    onAddTicketReply(selectedTicket.id, replyInput.trim());
    setReplyInput('');

    // Update locally for immediate reflection in active modal
    setSelectedTicket(prev => {
      if (!prev) return null;
      const newReply: TicketReply = {
        id: `rep_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorAvatar: currentUser.avatar,
        content: replyInput.trim(),
        timestamp: 'Just now'
      };
      return {
        ...prev,
        replies: [...prev.replies, newReply]
      };
    });
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
    }
  };

  return (
    <div id="contact-support-view" className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Headphones className="w-4 h-4" />
            Support Helpdesk & Communications
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Contact Us & Live Ticket Support
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Submit a real-time assistance ticket, check resolution status, or get in touch with institutional departments directly.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-open-new-ticket"
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Tabs: Live Support Desk vs Contact Phone/Email Directory */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Support Tickets ({visibleTickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Direct Phone & Email Directory</span>
        </button>
      </div>

      {/* TAB 1: Live Ticket System */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isTeacher
                ? 'All Student & Staff Tickets (Faculty Admin View)'
                : 'My Support Tickets'}
            </span>
            <span className="text-[11px] text-slate-500">
              Typical response time: &lt; 20 minutes during school hours
            </span>
          </div>

          {visibleTickets.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <Headphones className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">No support tickets found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need help with courses, lab permissions, IT credentials, or facilities? Open a ticket to receive live assistance.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  id={`support-ticket-${ticket.id}`}
                  onClick={() => setSelectedTicket(ticket)}
                  className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {ticket.ticketNumber}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {ticket.category}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        ticket.priority === 'Urgent' ? 'text-rose-400' : ticket.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        • Priority: {ticket.priority}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition truncate">
                      {ticket.subject}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Submitted by: <strong className="text-slate-300">{ticket.userName}</strong> ({ticket.userRole})</span>
                      <span>•</span>
                      <span>{ticket.createdAt}</span>
                      <span>•</span>
                      <span>{ticket.replies.length} replies</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-xs font-semibold text-slate-200 group-hover:text-white transition"
                    >
                      Open Ticket Chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Direct Phone and Email Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Direct Phone Lines */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Direct Phone Numbers (Valid School Contacts)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>School Mobile / Primary Helpline</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Valid Number</span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-1">+977 976-1487778</div>
                  <div className="text-[10px] text-slate-400">Daily 7:00 AM – 6:00 PM • Direct Helpdesk</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('+977 976-1487778', 'p1')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Phone Number"
                >
                  {copiedKey === 'p1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>School Landline Office Desk</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Official Landline</span>
                  </div>
                  <div className="text-sm font-extrabold text-indigo-400 mt-1">01-6612776</div>
                  <div className="text-[10px] text-slate-400">Administration & Front Desk • Tarakeshwar 11</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('01-6612776', 'p2')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Landline Number"
                >
                  {copiedKey === 'p2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Official Email Inboxes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Official Email Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">General & Official Correspondence</div>
                  <div className="text-sm font-extrabold text-indigo-300 mt-1">nrss014350469@gmail.com</div>
                  <div className="text-[10px] text-slate-400">General Public, Admissions, Academic & Administration</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('nrss014350469@gmail.com', 'e1')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Email Address"
                >
                  {copiedKey === 'e1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Portal & Student Support Desk</div>
                  <div className="text-sm font-extrabold text-sky-300 mt-1">nrss014350469@gmail.com</div>
                  <div className="text-[10px] text-slate-400">Account Credentials, Tickets & Inquiries</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('nrss014350469@gmail.com', 'e2')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Email Address"
                >
                  {copiedKey === 'e2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Physical Address & Hours */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <MapPin className="w-4 h-4" /> Physical Campus Location
              </div>
              <div className="text-sm font-bold text-white">
                Nepal Rastriya Secondary School
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tarakeshwar Municipality, Ward No. 11<br />
                Bagmati Province, Nepal
              </p>
              <div className="text-[11px] text-amber-300 font-medium">
                Leadership: Principal Govinda Timalsina
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Clock className="w-4 h-4" /> Campus Operating Hours
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div><strong>Daily Campus Timing:</strong> 07:00 AM – 06:00 PM (Sun–Fri)</div>
                <div><strong>Academic Year:</strong> Session 2083 B.S.</div>
                <div><strong>Student Strength:</strong> 600+ Active Scholars</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Ticket Chat & Status Management */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            {/* Ticket Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {selectedTicket.ticketNumber}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>

                <div className="flex items-center gap-2">
                  {/* If Teacher / Admin: Can update ticket status directly */}
                  {isTeacher && (
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as SupportTicket['status'];
                        onUpdateTicketStatus(selectedTicket.id, newStatus);
                        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Open">Status: Open</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Resolved">Status: Resolved</option>
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <h3 className="text-base font-bold text-white">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Category: <strong>{selectedTicket.category}</strong></span>
                  <span>•</span>
                  <span>Submitted by: {selectedTicket.userName}</span>
                </div>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 custom-scrollbar max-h-64 sm:max-h-80">
              {/* Original Query Message */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">{selectedTicket.userName} (Original Ticket Inquiry)</span>
                  <span>{selectedTicket.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Replies list */}
              {selectedTicket.replies.map((reply) => {
                const isMyReply = reply.authorId === currentUser.id;

                return (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-xl text-left space-y-1 border ${
                      isMyReply
                        ? 'bg-indigo-950/40 border-indigo-800/60 ml-6'
                        : 'bg-slate-900 border-slate-800 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {reply.authorName}
                        {reply.authorRole === 'support' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Support Staff
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500">{reply.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleReplySubmit} className="flex items-center gap-2 pt-2">
              <input
                id="input-ticket-reply"
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Type your response to this support ticket..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                id="btn-send-ticket-reply"
                type="submit"
                disabled={!replyInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Support Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Submit New Support Request
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subject / Summary of Issue *
                </label>
                <input
                  id="input-ticket-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics Lab Access Card Replacement"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="select-ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Academic Inquiries">Academic Inquiries</option>
                    <option value="IT & Portal Access">IT & Portal Access</option>
                    <option value="Campus Facilities">Campus Facilities</option>
                    <option value="Fee & Accounts">Fee & Accounts</option>
                    <option value="Extracurricular">Extracurricular</option>
                    <option value="General">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    id="select-ticket-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low (General inquiry)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Impacting exams/classes)</option>
                    <option value="Urgent">Urgent (Immediate attention)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="input-ticket-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue with specific details (e.g. room number, student ID, course code)..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-ticket"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
