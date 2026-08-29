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
  Mail,
  GraduationCap,
  ShieldCheck,
  Power,
  Globe,
  ArrowRight
} from 'lucide-react';
import { User, CampusPhoto } from '../types';
import { CampusGallery } from './CampusGallery';

interface AboutUsViewProps {
  onExploreChat: () => void;
  onExploreUpdates: () => void;
  onExploreTeachers: () => void;
  onOpenAdminQueue?: () => void;
  pendingAdminRequestsCount?: number;
  isSchoolOpen?: boolean;
  onToggleSchoolStatus?: () => void;
  currentUser?: User | null;
  campusPhotos?: CampusPhoto[];
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  onExploreChat,
  onExploreUpdates,
  onExploreTeachers,
  isSchoolOpen = true,
  onToggleSchoolStatus,
  currentUser,
  campusPhotos
}) => {
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <div id="about-us-view" className="space-y-8 pb-12 text-left">
      {/* 1. HERO INSTITUTION BANNER */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-7 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <School className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[240px] sm:max-w-none">N.R. College & Nepal Rastriya Secondary School</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Est. 2063 B.S.</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              N.R. College
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-base font-semibold text-emerald-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Tarakeshwor-11, Nepaltar, Kathmandu, Nepal</span>
            </div>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2 sm:pt-3">
            <button
              id="hero-btn-updates"
              type="button"
              onClick={onExploreUpdates}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <span>School & College Updates</span>
              <BookOpen className="w-4 h-4" />
            </button>

            <a
              id="hero-btn-official-website"
              href="https://nrcollege.edu.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition flex items-center gap-2 shadow-md"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Official Website (nrcollege.edu.np)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL INTRODUCTION SECTION (Exact Requested Content) */}
      <section className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <BookOpen className="w-4 h-4" />
          <span>Institutional Overview</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          INTRODUCTION
        </h2>

        <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
          <p className="bg-slate-950/60 border-l-4 border-emerald-500 p-4 sm:p-5 rounded-r-2xl text-slate-200 text-xs sm:text-sm md:text-base">
            N.R. college is an institution of higher education that ensures the intelectual professional advancement manifested through morality based on strength and synthesis for reverent ethical, social unity, integrity and holistic development. This college was established in 2063 B.S. It is located at the north of Kathmandu city at Tarakeshwor-11, Nepaltar, Kathmandu. It is run by a team of highly qualified, trained, enthusiastic and dedicated teachers. Its motto is to achieve academic excellence for the advancement of knowledge to face challenges in the practical life.
          </p>
        </div>

        {/* Highlighted Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">Established</div>
            <div className="text-sm sm:text-base font-extrabold text-white">2063 B.S.</div>
            <div className="text-[11px] text-slate-400">Higher Education & Schooling</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-400">Location</div>
            <div className="text-sm sm:text-base font-extrabold text-white">Tarakeshwor-11</div>
            <div className="text-[11px] text-slate-400">Nepaltar, Kathmandu, Nepal</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">Core Values</div>
            <div className="text-sm sm:text-base font-extrabold text-white">Ethical & Unity</div>
            <div className="text-[11px] text-slate-400">Integrity & Holistic Growth</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-400">Our Faculty</div>
            <div className="text-sm sm:text-base font-extrabold text-white">Qualified Staff</div>
            <div className="text-[11px] text-slate-400">Trained, Dedicated Teachers</div>
          </div>
        </div>
      </section>

      {/* 3. OBJECTIVES SECTION (Exact Requested Content) */}
      <section id="section-objectives" className="p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Compass className="w-4 h-4" />
          <span>Mission & Strategic Goals</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            OBJECTIVES
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Core institutional aims guiding academic governance and community development at N.R. College:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3 sm:gap-4 transition hover:border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
              1
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              To provide quality education to those students who cannot afford high expenses in private colleges.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3 sm:gap-4 transition hover:border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
              2
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              To provide educational programmes of the highest quality to produce motivated and competent citizens who can contribute to the development of the nation.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3 sm:gap-4 transition hover:border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              To encourage students from backward and indigenous communities and other under privileged groups.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3 sm:gap-4 transition hover:border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
              4
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              To create human resources imparting locally and globally relevant education.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-3 sm:gap-4 transition hover:border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-xs sm:text-sm shrink-0 mt-0.5">
              5
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              To develop positive attitude and impart moral values in the students.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AUTO-SWIPING CAMPUS PHOTO SHOWCASE */}
      <section id="section-campus-photos">
        <CampusGallery photos={campusPhotos} />
      </section>

      {/* 5. INSTITUTIONAL MOTTO & LEADERSHIP */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Institutional Motto Card */}
        <div className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Institutional Motto & Purpose
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                "Academic Excellence for Advancement of Knowledge"
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Empowering students with practical problem-solving capability, ethical values, and dynamic intellectual skills to face real-world challenges with confidence.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            N.R. College & Nepal Rastriya Secondary School • Nepaltar
          </div>
        </div>

        {/* Administration & Leadership */}
        <div className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Academic Administration
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                Principal Govinda Timalsina
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Guided by experienced educators committed to student-oriented learning, research development, and accessible higher education for the community.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Session 2083</span>
            <span className="text-emerald-400 font-semibold">Tarakeshwar-11</span>
          </div>
        </div>
      </section>

      {/* 6. LOCATION, OPERATING HOURS & CAMPUS STATUS BAR */}
      <section
        id="section-institutional-location-status"
        className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 shadow-xl"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <MapPin className="w-4 h-4" />
            <span>Campus Location & Contact</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white">
            N.R. College / Nepal Rastriya Secondary School
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Tarakeshwar Municipality-11, Nepaltar, Kathmandu, Nepal
          </p>
          <div className="text-xs text-slate-400 space-y-0.5 pt-1">
            <div>
              <strong className="text-slate-300">Timings:</strong> 7:00 AM – 6:00 PM •{' '}
              <strong className="text-slate-300">Website:</strong>{' '}
              <a
                href="https://nrcollege.edu.np/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:underline"
              >
                https://nrcollege.edu.np/
              </a>
            </div>
            <div>
              <strong className="text-slate-300">Contact:</strong>{' '}
              <span className="text-emerald-400 font-semibold">+977 976-1487778 / 01-6612776</span> •{' '}
              <strong className="text-slate-300">Email:</strong>{' '}
              <span className="text-indigo-300 font-semibold">nrss014350469@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Live Campus Status & Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div
            id="card-school-open-closed-status"
            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all ${
              isSchoolOpen
                ? 'bg-slate-950/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-950/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Campus Status
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

            <div className="text-[10px] text-slate-500 mt-0.5">
              {isSchoolOpen ? 'Campus active for academic sessions' : 'Campus currently closed'}
            </div>
          </div>

          {/* Admin Control Switch for Teachers */}
          {isTeacher && onToggleSchoolStatus && (
            <div
              id="admin-status-control-box"
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Toggle</span>
              </div>

              <button
                id="btn-admin-toggle-school-status"
                type="button"
                onClick={onToggleSchoolStatus}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                  isSchoolOpen
                    ? 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-rose-600/20'
                    : 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-emerald-600/20'
                }`}
                title="Toggle Campus Open/Closed Status in real-time"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isSchoolOpen ? 'Set as Closed' : 'Set as Open'}</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
