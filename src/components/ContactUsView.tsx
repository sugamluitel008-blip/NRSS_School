import React, { useState, useRef, useEffect } from 'react';
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
  GraduationCap,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Download,
  Share2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactUsViewProps {
  currentUser: User;
  tickets: SupportTicket[];
  onCreateTicket: (newTicket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>) => void;
  onAddTicketReply: (ticketId: string, replyContent: string) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: SupportTicket['status']) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({
  currentUser,
  tickets,
  onCreateTicket,
  onAddTicketReply,
  onUpdateTicketStatus,
  onDeleteTicket
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'tickets' | 'directory'>('tickets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Transcript state
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  // Delete ticket confirmation state
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Academic Inquiries');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Medium');
  const [description, setDescription] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keep selectedTicket synchronized with tickets prop (for real-time updates)
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (selectedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.replies.length]);

  // If student: see my tickets. If teacher: see all tickets
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
  };

  const handleCloseTicket = (ticket: SupportTicket) => {
    onUpdateTicketStatus(ticket.id, 'Closed');
    setSelectedTicket(prev => prev && prev.id === ticket.id ? { ...prev, status: 'Closed' } : prev);
  };

  const handleReopenTicket = (ticket: SupportTicket) => {
    onUpdateTicketStatus(ticket.id, 'Open');
    setSelectedTicket(prev => prev && prev.id === ticket.id ? { ...prev, status: 'Open' } : prev);
  };

  const handleConfirmDeleteTicket = () => {
    if (!ticketToDelete) return;
    if (onDeleteTicket) {
      onDeleteTicket(ticketToDelete.id);
    }
    if (selectedTicket?.id === ticketToDelete.id) {
      setSelectedTicket(null);
    }
    setTicketToDelete(null);
  };

  // Transcript generation
  const generateTranscriptText = (ticket: SupportTicket): string => {
    const divider = '========================================================================';
    const subDivider = '------------------------------------------------------------------------';
    
    let text = `${divider}\n`;
    text += `N.R. COLLEGE & NEPAL RASTRIYA SECONDARY SCHOOL\n`;
    text += `OFFICIAL SUPPORT HELPDESK TICKET TRANSCRIPT\n`;
    text += `${divider}\n\n`;
    text += `Ticket Number  : ${ticket.ticketNumber}\n`;
    text += `Subject        : ${ticket.subject}\n`;
    text += `Category       : ${ticket.category}\n`;
    text += `Priority       : ${ticket.priority}\n`;
    text += `Current Status : ${ticket.status.toUpperCase()}\n`;
    text += `Submitted By   : ${ticket.userName} (${ticket.userRole.toUpperCase()})\n`;
    text += `User Email     : ${ticket.userEmail}\n`;
    text += `Date Created   : ${ticket.createdAt}\n`;
    text += `Last Updated   : ${ticket.updatedAt || ticket.createdAt}\n\n`;
    text += `${subDivider}\n`;
    text += `INITIAL INQUIRY / PROBLEM DESCRIPTION:\n`;
    text += `${subDivider}\n`;
    text += `[${ticket.createdAt}] ${ticket.userName} (${ticket.userRole}):\n`;
    text += `${ticket.description}\n\n`;

    text += `${subDivider}\n`;
    text += `COMMUNICATION LOG (${ticket.replies.length} REPLIES):\n`;
    text += `${subDivider}\n`;

    if (ticket.replies.length === 0) {
      text += `No replies recorded yet.\n`;
    } else {
      ticket.replies.forEach((reply, index) => {
        text += `[#${index + 1}] [${reply.timestamp}] ${reply.authorName} (${reply.authorRole}):\n`;
        text += `${reply.content}\n\n`;
      });
    }

    text += `${divider}\n`;
    text += `TRANSCRIPT EXPORTED: ${new Date().toLocaleString()}\n`;
    text += `Portal: NRSS Academy Helpdesk System (Tarakeshwor-11, Kathmandu)\n`;
    text += `${divider}\n`;

    return text;
  };

  const handleDownloadTranscript = (ticket: SupportTicket) => {
    const transcript = generateTranscriptText(ticket);
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcript_${ticket.ticketNumber}_${ticket.userName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTranscript = (ticket: SupportTicket) => {
    const transcript = generateTranscriptText(ticket);
    navigator.clipboard.writeText(transcript);
    setTranscriptCopied(true);
    setTimeout(() => setTranscriptCopied(false), 2500);
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
      case 'Closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Closed
          </span>
        );
    }
  };

  return (
    <div id="contact-support-view" className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Headphones className="w-4 h-4" />
            Support Helpdesk & Communications
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            Contact Us & Live Ticket Support
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Submit a real-time assistance ticket, chat live with support staff, manage tickets, and export full conversation transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-open-new-ticket"
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Tabs: Live Support Desk vs Contact Phone/Email Directory */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
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
                  className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
                >
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className="space-y-1.5 min-w-0 flex-1 cursor-pointer"
                  >
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

                  {/* Actions on Ticket Row */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Live Chat ({ticket.replies.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketToDelete(ticket);
                      }}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900/50 transition"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
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

      {/* Modal: Live Ticket Chat & Full Management */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[750px] overflow-hidden">
            {/* Ticket Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/60 shrink-0">
                    {selectedTicket.ticketNumber}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                    {selectedTicket.category}
                  </span>
                </div>

                {/* Top Action Bar: Transcript, Status & Close */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Transcript Button */}
                  <button
                    type="button"
                    onClick={() => setShowTranscriptModal(true)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    title="Export or download ticket transcript"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Take Transcript</span>
                    <span className="sm:hidden">Transcript</span>
                  </button>

                  {/* Close / Reopen Ticket Button */}
                  {selectedTicket.status !== 'Closed' ? (
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(selectedTicket)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Close this ticket"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Close</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopenTicket(selectedTicket)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Reopen this ticket"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reopen</span>
                    </button>
                  )}

                  {/* Status Dropdown for Faculty */}
                  {isTeacher && (
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as SupportTicket['status'];
                        onUpdateTicketStatus(selectedTicket.id, newStatus);
                        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setTicketToDelete(selectedTicket)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title & Requester Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {selectedTicket.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Category: <strong className="text-slate-300">{selectedTicket.category}</strong></span>
                  <span>•</span>
                  <span>Requester: <strong className="text-slate-300">{selectedTicket.userName}</strong> ({selectedTicket.userRole})</span>
                  <span>•</span>
                  <span>Created: {selectedTicket.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/80 custom-scrollbar">
              {/* Original Ticket Description Card (Inquiry Header) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-sm space-y-2 text-left">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{selectedTicket.userName}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                      selectedTicket.userRole === 'teacher'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {selectedTicket.userRole === 'teacher' ? 'Faculty Admin' : 'Student'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{selectedTicket.createdAt}</span>
                </div>
                <div className="text-xs font-semibold text-indigo-400">Original Inquiry Description:</div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Conversation Messages */}
              {selectedTicket.replies.map((reply) => {
                const isMe = reply.authorId === currentUser.id;
                const isFaculty = reply.authorRole === 'teacher' || reply.authorRole === 'support';

                return (
                  <div
                    key={reply.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={reply.authorAvatar || (isFaculty ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}
                      alt={reply.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1"
                    />

                    <div className={`max-w-[82%] sm:max-w-[70%] space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-bold text-slate-200">{reply.authorName}</span>
                        {isFaculty && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Staff
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">• {reply.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap inline-block text-left shadow-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {reply.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Closed Ticket Notice or Live Reply Input */}
            {selectedTicket.status === 'Closed' ? (
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>This support ticket is marked as <strong>Closed</strong>. You can take a transcript or reopen to continue chatting.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReopenTicket(selectedTicket)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 transition"
                >
                  Reopen Ticket
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleReplySubmit}
                className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  id="input-ticket-reply"
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type your response to this ticket (Enter to send)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  id="btn-send-ticket-reply"
                  type="submit"
                  disabled={!replyInput.trim()}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 shrink-0 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Transcript Taking & Export */}
      {showTranscriptModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Ticket Transcript ({selectedTicket.ticketNumber})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official conversation record ready for download or copy.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTranscriptModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transcript Preview Box */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800/90 font-mono text-[11px] sm:text-xs text-slate-300 whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-96 select-all">
              {generateTranscriptText(selectedTicket)}
            </div>

            {/* Transcript Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Total messages logged: <strong>{selectedTicket.replies.length + 1}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyTranscript(selectedTicket)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {transcriptCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{transcriptCopied ? 'Copied Transcript!' : 'Copy to Clipboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTranscript(selectedTicket)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .TXT File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation Dialog */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/50 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Support Ticket?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete ticket <strong className="text-white font-mono">{ticketToDelete.ticketNumber}</strong>?
                This will remove all associated chat messages and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTicket}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Ticket</span>
              </button>
            </div>
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
