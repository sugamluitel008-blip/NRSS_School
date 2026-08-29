import React, { useState } from 'react';
import { UserRole } from '../types';
import { resetUserPassword, STUDENT_FORGOT_PIN } from '../lib/firebase';
import {
  KeyRound,
  ShieldCheck,
  GraduationCap,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Info,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';

interface ForgotPasswordModalProps {
  initialEmail?: string;
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (email: string, newPass: string, role: UserRole) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  initialEmail = '',
  initialRole = 'student',
  onClose,
  onSuccess
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(initialEmail);
  const [pinCode, setPinCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please provide your registered institutional email.');
      return;
    }

    if (!pinCode.trim()) {
      if (role === 'teacher') {
        setError('Please enter your Admin Authorization PIN. Contact +9779869400576 For Password Reset.');
      } else {
        setError('Please enter the student security PIN (STUDENTS100).');
      }
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetUserPassword({
        email: email.trim(),
        role: role,
        pinCode: pinCode.trim(),
        newPassword: newPassword
      });

      setSuccessMessage(res.message);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err?.message || 'Failed to reset password. Please check your credentials and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStudentPin = () => {
    setPinCode(STUDENT_FORGOT_PIN);
    setError('');
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              role === 'teacher'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-600/10'
                : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-indigo-600/10'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Reset Account Password
              </h2>
              <p className="text-xs text-slate-400">
                Security PIN verification for NRSS accounts
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Role selector tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
                setPinCode('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setError('');
                setPinCode('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'teacher'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty / Admin</span>
            </button>
          </div>

          {/* Security PIN Requirement Info Callout */}
          {role === 'teacher' ? (
            <div className="p-3.5 rounded-xl border text-xs leading-relaxed bg-emerald-950/40 border-emerald-500/30 text-emerald-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">
                      Contact +9779869400576 For Password Reset
                    </div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">
                      Call or SMS school administration to obtain your authorization PIN
                    </div>
                  </div>
                </div>
                <a
                  href="tel:+9779869400576"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition shrink-0 shadow"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border text-xs leading-relaxed bg-indigo-950/40 border-indigo-500/30 text-indigo-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Student Portal Reset PIN</div>
                    <div className="text-[11px] opacity-90 mt-0.5">
                      Student Verification PIN:{' '}
                      <code className="px-1.5 py-0.5 rounded bg-slate-950 font-mono font-bold text-white border border-slate-700 select-all">
                        {STUDENT_FORGOT_PIN}
                      </code>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyStudentPin}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-white flex items-center gap-1 transition shrink-0"
                  title="Auto-fill student PIN"
                >
                  <Copy className="w-3 h-3" />
                  <span>Fill PIN</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Password Reset Successful!</div>
              <p className="text-xs text-slate-300">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={() => onSuccess(email.trim(), newPassword, role)}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <span>Sign In with New Password Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'teacher' ? 'faculty@nrss.edu.np' : 'student@nrss.edu.np'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    {role === 'teacher'
                      ? 'Admin Authorization PIN *'
                      : 'Student Security PIN Code (STUDENTS100) *'}
                  </span>
                  {role === 'teacher' && (
                    <span className="text-[10px] text-emerald-400">
                      Contact +9779869400576
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-forgot-pin"
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder={role === 'teacher' ? 'Enter PIN (Contact +9779869400576 for PIN)' : STUDENT_FORGOT_PIN}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password (min 6 characters) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-forgot-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-forgot-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                id="btn-confirm-forgot-password"
                type="submit"
                disabled={loading}
                className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition duration-200 shadow-lg disabled:opacity-50 ${
                  role === 'teacher'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying PIN & Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">NRSS Security Gate</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
