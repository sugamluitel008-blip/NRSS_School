import React from 'react';
import {
  School,
  Award,
  BookOpen,
  Users,
  Compass,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Calendar,
  Phone,
  GraduationCap,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Power,
  Lock,
  DoorOpen,
  DoorClosed
} from 'lucide-react';
import { User } from '../types';

interface AboutUsViewProps {
  onExploreChat: () => void;
  onExploreUpdates: () => void;
  onExploreTeachers: () => void;
  isSchoolOpen?: boolean;
  onToggleSchoolStatus?: () => void;
  currentUser?: User | null;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  onExploreChat,
  onExploreUpdates,
  onExploreTeachers,
  isSchoolOpen = true,
  onToggleSchoolStatus,
  currentUser
}) => {
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <div id="about-us-view" className="space-y-8 pb-12">
      {/* Hero Welcome Banner with Highlighted Information Bubbles */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6 text-left">
          {/* Main Institution Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide shadow-inner">
            <School className="w-4 h-4 text-indigo-400" />
            <span>Government Approved • Secondary & Higher Secondary Education</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Nepal Rastriya Secondary School
            </h1>
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-emerald-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Nepal, Bagmati, Tarakeshwar 11</span>
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Welcome to Nepal Rastriya Secondary School (NRSS), located in Tarakeshwar-11, Bagmati Province. Under the visionary leadership of Principal Govinda Timalsina, our institution delivers quality holistic education, disciplined character building, and comprehensive academic development for all scholars.
          </p>

          {/* REQUESTED INFORMATION BUBBLES */}
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Institution Highlights & Status</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Bubble 1: Open 7am - 6pm (Synchronized with live School Open/Closed Status) */}
              <div
                id="bubble-school-hours"
                className={`px-4 py-2.5 rounded-2xl border shadow-lg transition-transform hover:scale-105 flex items-center gap-2.5 cursor-default ${
                  isSchoolOpen
                    ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30'
                    : 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-500/40 text-rose-300 shadow-rose-950/30'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSchoolOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      isSchoolOpen ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Campus Timings
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">
                    {isSchoolOpen ? 'Open 7:00 AM – 6:00 PM' : 'Closed (Off-Hours / Holiday)'}
                  </div>
                </div>
              </div>

              {/* Bubble 2: Academic Year 2083 */}
              <div
                id="bubble-academic-year"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-950/30 flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Current Session</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">Academic Year 2083</div>
                </div>
              </div>

              {/* Bubble 3: Total Students 600+ */}
              <div
                id="bubble-total-students"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-500/40 text-sky-300 shadow-lg shadow-sky-950/30 flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Enrolled Scholars</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">Total Students: 600+</div>
                </div>
              </div>

              {/* Bubble 4: Principal - Govinda Timalsina */}
              <div
                id="bubble-principal-govinda"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-950/30 flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Head of Institution</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">Principal: Govinda Timalsina</div>
                </div>
              </div>

              {/* Bubble 5: Location */}
              <div
                id="bubble-location-tag"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-700/80 text-slate-300 shadow-md flex items-center gap-2.5 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Municipality & Ward</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">Tarakeshwar-11, Bagmati</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/80">
            <button
              id="hero-btn-updates"
              type="button"
              onClick={onExploreUpdates}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <span>Read School Updates</span>
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-chat"
              type="button"
              onClick={onExploreChat}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <span>Join School Community Chat</span>
            </button>

            <button
              id="hero-btn-teachers"
              type="button"
              onClick={onExploreTeachers}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <span>Faculty & Staff Directory</span>
            </button>
          </div>
        </div>
      </section>

      {/* Leadership & Institutional Identity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Principal Govinda Timalsina Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center text-left shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Principal Logo / Crest Spot */}
              <div
                id="principal-logo-spot"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl sm:text-3xl border-2 border-amber-400/40 shadow-xl shadow-amber-600/20 shrink-0"
              >
                <School className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Executive Leadership</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Principal Govinda Timalsina
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  Head of School, Nepal Rastriya Secondary School
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                  <span>Tarakeshwar-11, Bagmati Province</span>
                  <span>•</span>
                  <span>Session 2083</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                isSchoolOpen
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isSchoolOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`} />
                {isSchoolOpen ? 'Active Administration' : 'Off-Hours Administration'}
              </span>
            </div>
          </div>
        </div>

        {/* Institution Identity Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950/50 border border-slate-800 flex flex-col justify-between text-center shadow-xl">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md">
              <School className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                School Creed & Motto
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                "ज्ञानम् परम् बलम्"
              </h3>
              <p className="text-xs text-slate-300 mt-1 italic">
                Knowledge is the Supreme Strength
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Serving the community of Tarakeshwar-11, Bagmati Province with quality education, cultural values, and modern scholastic opportunities.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Nepal Rastriya Secondary School • Ward No. 11, Tarakeshwar
          </div>
        </div>
      </section>

      {/* Academic Highlights & School Operations */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              School Overview & Facilities
            </h2>
            <p className="text-xs text-slate-400">
              Academic operations and institutional resources for Session 2083
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Operating Shifts */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Comprehensive Hours (7am - 6pm)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Campus gates open from 7:00 AM for early revision, morning practicals, core classroom instruction, and evening extracurricular coaching until 6:00 PM.
              </p>
            </div>
          </div>

          {/* Card 2: 600+ Student Community */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">600+ Active Scholars</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A vibrant student body across primary, lower secondary, and secondary faculties engaged in collaborative science labs, sports tournaments, and debate forums.
              </p>
            </div>
          </div>

          {/* Card 3: Academic Year 2083 */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Academic Year 2083 Calendar</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structured curriculum following the National Curriculum Framework with quarterly examinations, terminal assessments, sports week, and cultural exhibitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL SECTION: Location Details & Admin-Toggleable School Open/Closed Status */}
      <section
        id="section-institutional-location-status"
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl"
      >
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <MapPin className="w-4 h-4" />
            Institutional Location & Administration
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white">
            Nepal Rastriya Secondary School
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Tarakeshwar Municipality, Ward No. 11, Bagmati Province, Nepal
          </p>
          <div className="text-xs text-slate-400 space-y-1 pt-1">
            <div>
              <strong className="text-slate-200">Leadership:</strong> Principal Govinda Timalsina •{' '}
              <strong className="text-slate-200">Office Operating Hours:</strong> 7:00 AM – 6:00 PM
            </div>
            <div>
              <strong className="text-slate-200">Contact:</strong>{' '}
              <span className="text-emerald-400 font-semibold">+977 976-1487778 / 01-6612776</span> •{' '}
              <strong className="text-slate-200">Email:</strong>{' '}
              <span className="text-indigo-300 font-semibold">nrss014350469@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Live School Open / Closed Status Display & Admin Control Panel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div
            id="card-school-open-closed-status"
            className={`p-4 rounded-2xl border text-center transition-all ${
              isSchoolOpen
                ? 'bg-slate-950/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-950/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              School Open/Closed Status
            </div>

            <div
              className={`font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 mt-1 ${
                isSchoolOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isSchoolOpen ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Open (7:00 AM - 6:00 PM)</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Closed (Off-Hours / Holiday)</span>
                </>
              )}
            </div>

            <div className="text-[10px] text-slate-500 mt-1">
              {isSchoolOpen ? 'Campus open for classes & visits' : 'Campus currently closed to public'}
            </div>
          </div>

          {/* Admin Panel Toggle Switch for Teachers / Administrators */}
          {isTeacher && onToggleSchoolStatus && (
            <div
              id="admin-status-control-box"
              className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Control</span>
              </div>

              <button
                id="btn-admin-toggle-school-status"
                type="button"
                onClick={onToggleSchoolStatus}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md ${
                  isSchoolOpen
                    ? 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-rose-600/20'
                    : 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-emerald-600/20'
                }`}
                title="Toggle School Open/Closed Status for all users"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isSchoolOpen ? 'Set as Closed' : 'Set as Open'}</span>
              </button>

              <span className="text-[9px] text-indigo-300/80">
                Click to switch status in real-time
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
