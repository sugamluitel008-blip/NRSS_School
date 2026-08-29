import React from 'react';
import { User, ActiveTab } from '../types';
import { Menu, School, GraduationCap, ShieldCheck, LogOut, UserCheck, Camera } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onOpenProfileModal?: () => void;
  onOpenAdminQueue?: () => void;
  onNavigateToStaffTools?: () => void;
  pendingAdminRequestsCount?: number;
  unreadCount?: number;
  activeTab: ActiveTab;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleSidebar,
  onLogout,
  onOpenProfileModal,
  onOpenAdminQueue,
  onNavigateToStaffTools,
  pendingAdminRequestsCount = 0,
  activeTab
}) => {
  const isStudent = currentUser.role === 'student';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'about':
        return 'About Us';
      case 'staff-tools':
        return 'Staff Tools & Approvals';
      case 'chat':
        return 'School Chat';
      case 'updates':
        return 'School Updates';
      case 'teachers':
        return 'Teachers Directory';
      case 'contact':
        return 'Contact Us & Support';
      default:
        return 'Portal';
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle & School Branding */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            id="btn-sidebar-toggle"
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-indigo-600/90 text-slate-200 hover:text-white border border-slate-700/80 transition flex items-center gap-2 shadow-sm group shrink-0"
            title="Open Sidebar Navigation"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-4 h-4 text-indigo-400 group-hover:text-white transition" />
            <span className="text-xs font-semibold hidden md:inline">Menu</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  NRSS Academy
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 font-normal">|</span>
                <span className="hidden sm:inline text-xs font-semibold text-slate-300 truncate">
                  {getPageTitle()}
                </span>
              </div>
              <div className="text-[11px] text-indigo-300 font-medium hidden md:block">
                National Rhododendron Secondary School
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Client Badge */}
        <div className="hidden lg:flex items-center">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border ${
            isStudent
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}>
            {isStudent ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>USER CLIENT (Student)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ADMIN CLIENT (Faculty & Staff)</span>
              </>
            )}
          </div>
        </div>

        {/* Right: User Info Capsule & Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Staff Tools Button (Visible for Faculty / Admins) */}
          {!isStudent && (
            <button
              id="btn-navbar-staff-tools"
              type="button"
              onClick={onNavigateToStaffTools || onOpenAdminQueue}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 text-xs font-semibold transition ${
                activeTab === 'staff-tools'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : pendingAdminRequestsCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Open Staff Tools & Faculty Approvals"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'staff-tools' ? 'text-white' : pendingAdminRequestsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">Staff Tools</span>
              {pendingAdminRequestsCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                  {pendingAdminRequestsCount}
                </span>
              ) : (
                <span className="hidden md:inline text-[10px] text-slate-400 font-normal">
                  (0)
                </span>
              )}
            </button>
          )}

          <button
            id="btn-navbar-profile"
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition text-left group"
            title="Click to Edit Profile & Logo"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 group-hover:border-indigo-400 transition"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow opacity-80 group-hover:opacity-100 transition">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-indigo-400 font-normal group-hover:underline">Edit</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentUser.gradeOrDept || (isStudent ? 'Student' : 'Faculty')}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            id="btn-navbar-logout"
            type="button"
            onClick={onLogout}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition border border-slate-800 hover:border-rose-900/40 flex items-center gap-1.5 text-xs"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
