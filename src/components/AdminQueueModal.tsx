import React, { useState } from 'react';
import { AdminRequest, User } from '../types';
import {
  approveAdminRequestInDb,
  rejectAdminRequestInDb
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
  X,
  Sparkles,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminQueueModalProps {
  requests: AdminRequest[];
  currentUser: User;
  onClose: () => void;
}

export const AdminQueueModal: React.FC<AdminQueueModalProps> = ({
  requests,
  currentUser,
  onClose
}) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const filteredRequests = requests.filter((r) => {
    if (activeFilter !== 'all' && r.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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

  return (
    <div
      id="admin-queue-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Admin Account Verification Queue
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Prevent unauthorized student registrations by manually reviewing and approving faculty accounts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}

          {actionError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters & Search */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('approved')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                activeFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('rejected')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                activeFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All ({requests.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant, email, dept..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {activeFilter === 'pending'
                  ? 'No pending admin account requests'
                  : 'No requests match the selected filter'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeFilter === 'pending'
                  ? 'When a faculty member or staff applies for an admin account on their phone or computer, it will appear here for verification.'
                  : 'Try switching filters or clearing your search term.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isReqPending = req.status === 'pending';
              const isReqApproved = req.status === 'approved';
              const isReqRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition ${
                    isReqPending
                      ? 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : isReqApproved
                      ? 'bg-slate-950/50 border-emerald-500/20'
                      : 'bg-slate-950/50 border-rose-500/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Applicant Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isReqPending
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : isReqApproved
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          {isReqPending ? '⏳ Awaiting Approval' : isReqApproved ? '✓ Approved' : '✕ Declined'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {req.employeeId}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-slate-200 truncate">{req.email}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 truncate">{req.department}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-500" />
                          <span>Device: {req.deviceModel || 'Mobile Device'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Submitted: {new Date(req.requestedAt).toLocaleString()}</span>
                        </div>
                        {req.approvedBy && (
                          <div className="text-emerald-400 font-medium">
                            Reviewed by: {req.approvedBy}
                          </div>
                        )}
                      </div>

                      {req.rejectionReason && (
                        <div className="text-[11px] p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Action Controls for Pending */}
                    {isReqPending && (
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id, req.name)}
                          disabled={processingId === req.id}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                        >
                          {processingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Admin</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(req.id);
                            setRejectReason('');
                          }}
                          disabled={processingId === req.id}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reject reason input drawer */}
                  {rejectingId === req.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-800 space-y-2"
                    >
                      <label className="block text-[11px] font-semibold text-rose-300">
                        Reason for declining request (optional):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Unverified staff member, student ID detected..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(req.id, req.name)}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition shrink-0"
                        >
                          Confirm Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Approved accounts receive full Faculty & Admin portal privileges.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
