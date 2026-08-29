import React, { useState, useEffect } from 'react';
import { User, UserRole, AdminRequest } from '../types';
import {
  registerUserAccount,
  signInUserAccount,
  createAdminAccountRequest,
  subscribeToDeviceAdminRequest,
  LOCAL_STORAGE_PENDING_ADMIN_KEY
} from '../lib/firebase';
import { DeviceAdminRequestModal } from './DeviceAdminRequestModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Smartphone,
  Info,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gradeOrDept, setGradeOrDept] = useState('');
  const [customId, setCustomId] = useState('');
  const [dob, setDob] = useState('');

  // Device Admin Request Tracking State
  const [deviceRequestId, setDeviceRequestId] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_PENDING_ADMIN_KEY) || '';
    } catch (e) {
      return '';
    }
  });
  const [deviceRequest, setDeviceRequest] = useState<AdminRequest | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [authSuccessBanner, setAuthSuccessBanner] = useState('');

  // Subscribe to device's pending admin request in real time
  useEffect(() => {
    if (!deviceRequestId) {
      setDeviceRequest(null);
      return;
    }

    const unsubscribe = subscribeToDeviceAdminRequest(deviceRequestId, (req) => {
      setDeviceRequest(req);
      if (!req) {
        setDeviceRequestId('');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [deviceRequestId]);

  const formatFirebaseError = (err: any): string => {
    const code = err?.code || '';
    const message = (err?.message || '').replace('Firebase: ', '').trim();

    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      message.toLowerCase().includes('invalid password') ||
      message.toLowerCase().includes('wrong password')
    ) {
      return 'Invalid password. Please try again or use Forgot Password to reset it.';
    }
    if (
      code === 'auth/user-not-found' ||
      message.toLowerCase().includes('no account found') ||
      message.toLowerCase().includes('user not found')
    ) {
      return 'No account found with this email. Please check for typos or create an account.';
    }
    if (code === 'auth/invalid-email' || message.toLowerCase().includes('invalid email') || message.toLowerCase().includes('valid email')) {
      return 'Please enter a valid institutional email address.';
    }
    if (code === 'auth/email-already-in-use' || message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already in use')) {
      return 'This email address is already registered. Please sign in instead.';
    }
    if (code === 'auth/weak-password' || message.toLowerCase().includes('6 characters')) {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection failed. Please check your internet connection.';
    }
    return message || 'Authentication failed. Please check your credentials and try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your school email and password.');
      return;
    }

    if (isRegisterMode && !fullName.trim()) {
      setError('Please provide your full legal name for the school directory.');
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        if (activeTab === 'teacher') {
          // ADMIN CREATION QUEUE: Prevent students from self-assigning admin accounts.
          // Place request in admin verification queue for existing administrators to approve.
          const req = await createAdminAccountRequest({
            name: fullName.trim(),
            email: email.trim(),
            password: password,
            department: gradeOrDept.trim() || 'Faculty & Administration',
            employeeId: customId.trim() || undefined,
            dob: dob || undefined
          });

          setDeviceRequestId(req.id);
          setDeviceRequest(req);
          setIsDeviceModalOpen(true);
        } else {
          // Standard student registration
          const newUser = await registerUserAccount({
            email: email.trim(),
            password: password,
            name: fullName.trim(),
            role: 'student',
            gradeOrDept: gradeOrDept.trim() || 'Grade 11 - General',
            studentId: customId.trim() || undefined,
            dob: dob || undefined
          });
          onLogin(newUser);
        }
      } else {
        // Sign in existing Firebase Account & Retrieve Profile from Firestore
        const user = await signInUserAccount(email.trim(), password);
        onLogin(user);
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err?.adminRequest) {
        setDeviceRequest(err.adminRequest);
        setIsDeviceModalOpen(true);
      }
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDismissDeviceRequest = () => {
    setDeviceRequestId('');
    setDeviceRequest(null);
  };

  return (
    <div id="auth-portal-wrapper" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Device Admin Request Status Modal */}
      <AnimatePresence>
        {isDeviceModalOpen && deviceRequest && (
          <DeviceAdminRequestModal
            request={deviceRequest}
            onClose={() => setIsDeviceModalOpen(false)}
            onActivated={(user) => {
              setIsDeviceModalOpen(false);
              onLogin(user);
            }}
            onDismissRequest={handleDismissDeviceRequest}
          />
        )}
      </AnimatePresence>

      {/* Forgot Password Security Verification Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <ForgotPasswordModal
            initialEmail={email}
            initialRole={activeTab}
            onClose={() => setIsForgotPasswordOpen(false)}
            onSuccess={(updatedEmail, newPass, updatedRole) => {
              setEmail(updatedEmail);
              setPassword(newPass);
              setActiveTab(updatedRole);
              setIsRegisterMode(false);
              setIsForgotPasswordOpen(false);
              setError('');
              setAuthSuccessBanner('Password updated successfully! Click sign in to continue.');
            }}
          />
        )}
      </AnimatePresence>

      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col lg:flex-row items-center justify-center gap-8 z-10 flex-1">
        {/* Left Side: School Info & Feature Highlights */}
        <div className="w-full lg:w-1/2 space-y-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                NRSS Academy
              </h1>
              <p className="text-xs text-indigo-300 font-medium">Official Institutional Cloud Portal</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Cloud Database & Real-Time Sync Connected
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            Live Unified Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Students & Faculty</span>
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Welcome to National Rhododendron Secondary School (NRSS) Academy. Sign in or register your institutional account to access live school chat channels, official notices, faculty directory, and responsive helpdesk support with persistent cloud storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center gap-2.5 text-indigo-300 font-semibold text-xs mb-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Student Portal
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Campus overview, real-time student chat, official updates, teacher directory, and live ticket support.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center gap-2.5 text-emerald-300 font-semibold text-xs mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Faculty & Admin Console
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Admin verification queue prevents unauthorized student registrations. Manage broadcasts and staff channels.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login & Registration Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Role Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-6">
              <button
                id="tab-student-login"
                type="button"
                onClick={() => { setActiveTab('student'); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 ${
                  activeTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                id="tab-teacher-login"
                type="button"
                onClick={() => { setActiveTab('teacher'); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 ${
                  activeTab === 'teacher'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Faculty / Admin</span>
              </button>
            </div>

            {/* Form Title & Mode Indicator */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${activeTab === 'student' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  {isRegisterMode
                    ? (activeTab === 'student' ? 'Create Student Account' : 'Apply for Faculty / Admin Account')
                    : `${activeTab === 'student' ? 'Student' : 'Faculty'} Sign In`}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isRegisterMode
                  ? (activeTab === 'student'
                      ? 'Register your student profile for immediate portal access.'
                      : 'Submit your faculty credentials to the verification queue.')
                  : 'Enter your verified account email and password to access the portal.'}
              </p>
            </div>

            {/* Admin Security Warning in Register Mode */}
            {isRegisterMode && activeTab === 'teacher' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300">Admin Queue Security:</strong> To ensure no students create unauthorized teacher accounts, faculty registrations are sent to the approval queue for existing admins to verify.
                </div>
              </div>
            )}

            {/* Auth Success Banner */}
            {authSuccessBanner && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{authSuccessBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthSuccessBanner('')}
                  className="text-[10px] text-emerald-300 hover:text-white underline font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
                {/* Helpful recovery shortcuts if account not found or wrong password */}
                <div className="pt-1.5 border-t border-rose-500/20 flex flex-wrap items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(true);
                      setError('');
                    }}
                    className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-semibold flex items-center gap-1 transition"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{activeTab === 'teacher' ? 'Forgot Password (Contact +9779869400576)' : 'Forgot Password (Reset with PIN)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        id="input-reg-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={activeTab === 'student' ? 'e.g. Alex Morgan' : 'e.g. Dr. Robert King'}
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {activeTab === 'student' ? 'Grade / Program' : 'Department *'}
                      </label>
                      <input
                        id="input-reg-grade"
                        type="text"
                        required={activeTab === 'teacher'}
                        value={gradeOrDept}
                        onChange={(e) => setGradeOrDept(e.target.value)}
                        placeholder={activeTab === 'student' ? 'Grade 11 - STEM' : 'Computer Science'}
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {activeTab === 'student' ? 'Student ID (Optional)' : 'Employee ID *'}
                      </label>
                      <input
                        id="input-reg-id"
                        type="text"
                        required={activeTab === 'teacher'}
                        value={customId}
                        onChange={(e) => setCustomId(e.target.value)}
                        placeholder={activeTab === 'student' ? 'STD-2083' : 'FAC-104'}
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'student' ? 'student@nrss.edu.np' : 'teacher@nrss.edu.np'}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Password *
                  </label>
                  {!isRegisterMode && (
                    <button
                      id="btn-link-forgot-password"
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordOpen(true);
                        setError('');
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Forgot password?</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {isRegisterMode && (
                  <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters.</p>
                )}
              </div>

              <button
                id="btn-submit-auth"
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === 'student'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isRegisterMode
                        ? (activeTab === 'student' ? 'Register Student Account' : 'Submit Admin Account to Queue')
                        : `Sign In to ${activeTab === 'student' ? 'Student' : 'Faculty'} Portal`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 transition"
              >
                {isRegisterMode ? 'Already registered? Sign In' : 'New user? Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(true);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-200 transition text-[11px]"
              >
                Reset with PIN
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 z-10 gap-2">
        <div>© 2026 National Rhododendron Secondary School (NRSS). All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Campus Helpdesk: (01) 425-8900</span>
          <span>•</span>
          <span>Admin Queue & Role Verification Active</span>
        </div>
      </footer>
    </div>
  );
};

