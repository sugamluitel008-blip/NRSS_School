import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { registerUserAccount, signInUserAccount } from '../lib/firebase';
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
  Calendar
} from 'lucide-react';

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

  const formatFirebaseError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials or create a new account.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err?.message || 'An unexpected error occurred during authentication.';
    }
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
        // Register new Firebase Account & Save Firestore User Profile
        const newUser = await registerUserAccount({
          email: email.trim(),
          password: password,
          name: fullName.trim(),
          role: activeTab,
          gradeOrDept: gradeOrDept.trim() || (activeTab === 'student' ? 'Grade 11 - General' : 'Faculty Member'),
          studentId: activeTab === 'student' ? (customId.trim() || undefined) : undefined,
          employeeId: activeTab === 'teacher' ? (customId.trim() || undefined) : undefined,
          dob: dob || undefined
        });
        onLogin(newUser);
      } else {
        // Sign in existing Firebase Account & Retrieve Profile from Firestore
        const user = await signInUserAccount(email.trim(), password);
        onLogin(user);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-portal-wrapper" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
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
                Broadcast announcements, multi-channel discussions (Staff Lounge & Document Transfer), and support resolution.
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
                    ? `Create ${activeTab === 'student' ? 'Student' : 'Faculty'} Account`
                    : `${activeTab === 'student' ? 'Student' : 'Faculty'} Sign In`}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isRegisterMode
                  ? 'Register your official profile on the cloud database.'
                  : 'Enter your verified account email and password to access the portal.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-snug">{error}</span>
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
                        {activeTab === 'student' ? 'Grade / Program' : 'Department'}
                      </label>
                      <input
                        id="input-reg-grade"
                        type="text"
                        value={gradeOrDept}
                        onChange={(e) => setGradeOrDept(e.target.value)}
                        placeholder={activeTab === 'student' ? 'Grade 11 - STEM' : 'Computer Science'}
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {activeTab === 'student' ? 'Student ID (Optional)' : 'Employee ID (Optional)'}
                      </label>
                      <input
                        id="input-reg-id"
                        type="text"
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password *
                </label>
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
                    <span>Connecting to Database...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegisterMode ? `Register ${activeTab === 'student' ? 'Student' : 'Faculty'} Account` : `Sign In to ${activeTab === 'student' ? 'Student' : 'Faculty'} Portal`}</span>
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
              <span className="text-slate-500 text-[11px]">Academic Year 2026</span>
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
          <span>Firebase Cloud Firestore Database</span>
        </div>
      </footer>
    </div>
  );
};
