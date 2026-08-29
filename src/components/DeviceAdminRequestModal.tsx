import React, { useState } from 'react';
import { AdminRequest, User } from '../types';
import {
  cancelAdminRequestInDb,
  activateApprovedAdminOnDevice
} from '../lib/firebase';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Calendar,
  Building,
  Mail,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

interface DeviceAdminRequestModalProps {
  request: AdminRequest | null;
  onClose: () => void;
  onActivated: (user: User) => void;
  onDismissRequest: () => void;
}

export const DeviceAdminRequestModal: React.FC<DeviceAdminRequestModalProps> = ({
  request,
  onClose,
  onActivated,
  onDismissRequest
}) => {
  const [activating, setActivating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  if (!request) {
    return null;
  }

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';

  const handleActivate = async () => {
    try {
      setActivating(true);
      setError('');
      const user = await activateApprovedAdminOnDevice(request.id);
      onActivated(user);
    } catch (err: any) {
      console.error('Activation error:', err);
      setError(err?.message || 'Failed to activate approved admin account.');
    } finally {
      setActivating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel and withdraw this admin account request from the queue?')) {
      return;
    }
    try {
      setCancelling(true);
      await cancelAdminRequestInDb(request.id);
      onDismissRequest();
      onClose();
    } catch (err: any) {
      setError('Could not cancel request. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      id="device-admin-request-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
              isApproved
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : isRejected
                ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isApproved ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isRejected ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Admin Account Request
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  This Device Only
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking verification status for this phone/client
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Banner */}
          {isPending && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Queued for Administrator Approval
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To maintain strict school security and prevent students from creating teacher accounts, your application is currently waiting for review by an active NRSS Administrator.
                  </p>
                  <p className="text-[11px] text-amber-400/80 pt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    This screen updates automatically in real time as soon as an Admin approves your request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Application Approved!
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your Faculty / Admin access has been verified and approved by{' '}
                    <strong className="text-white">{request.approvedBy || 'School Administrator'}</strong>. You can now activate your account and enter the Faculty Console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                    Request Not Approved
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {request.rejectionReason || 'The submitted credentials could not be verified with the NRSS Faculty Directory.'}
                  </p>
                  {request.approvedBy && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      Reviewed by: {request.approvedBy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Details Overview Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Submitted Application Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500 font-medium">Applicant Name</div>
                  <div className="text-slate-200 font-semibold truncate">{request.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500 font-medium">Email Address</div>
                  <div className="text-slate-200 font-semibold truncate">{request.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500 font-medium">Department</div>
                  <div className="text-slate-200 font-semibold truncate">{request.department}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-500 font-medium">Employee ID</div>
                  <div className="text-slate-200 font-semibold truncate">{request.employeeId}</div>
                </div>
              </div>
            </div>

            {/* Device & Timestamp details */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Device: {request.deviceModel || 'Registered Mobile Device'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Submitted: {new Date(request.requestedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isPending && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Withdraw Request</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Close & Check Later
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={handleActivate}
              disabled={activating}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {activating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Admin Console...</span>
                </>
              ) : (
                <>
                  <span>Activate & Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {isRejected && (
            <button
              type="button"
              onClick={() => {
                onDismissRequest();
                onClose();
              }}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Dismiss Application
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
