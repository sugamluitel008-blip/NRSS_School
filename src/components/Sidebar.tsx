import React from 'react';
import { ActiveTab, User } from '../types';
import {
  Info,
  MessageSquare,
  Bell,
  Users,
  Headphones,
  X,
  School,
  GraduationCap,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserCheck,
  Camera,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User;
  onLogout: () => void;
  onOpenProfileModal?: () => void;
  updatesCount?: number;
  chatCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenProfileModal,
  updatesCount = 0
}) => {
  const isStudent = currentUser.role === 'student';

  const navItems = [
    {
      id: 'about' as ActiveTab,
      label: 'About Us',
      icon: Info,
      badge: null
    },
    {
      id: 'chat' as ActiveTab,
      label: 'School Chat',
      icon: MessageSquare,
      badge: null
    },
    {
      id: 'updates' as ActiveTab,
      label: 'School Updates',
      icon: Bell,
      badge: updatesCount > 0 ? `${updatesCount} New` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'teachers' as ActiveTab,
      label: 'Teachers Name and Photo',
      icon: Users,
      badge: null
    },
    {
      id: 'contact' as ActiveTab,
      label: 'Contact Us',
      icon: Headphones,
      badge: null
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            id="app-navigation-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">NRSS Academy</h2>
                    <p className="text-[11px] text-slate-400">Navigation Menu</p>
                  </div>
                </div>

                <button
                  id="btn-close-sidebar"
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Status Tag */}
              <div className={`mt-3.5 px-3 py-2 rounded-xl border flex items-center justify-between ${
                isStudent 
                  ? 'bg-indigo-950/40 border-indigo-800/60' 
                  : 'bg-emerald-950/40 border-emerald-800/60'
              }`}>
                <div className="flex items-center gap-2">
                  {isStudent ? (
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={`text-xs font-semibold ${isStudent ? 'text-indigo-300' : 'text-emerald-300'}`}>
                    {isStudent ? 'Student Account' : 'Faculty Account'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Options List */}
            <nav className="p-3 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : (item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'}`} />
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer User Info & Logout */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
              <button
                id="btn-sidebar-edit-profile"
                type="button"
                onClick={() => {
                  if (onOpenProfileModal) {
                    onOpenProfileModal();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition group text-left"
                title="Click to Edit Profile Name & Logo"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 group-hover:border-indigo-400 transition"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow">
                      <Camera className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] text-indigo-400 font-normal group-hover:underline">Edit</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentUser.gradeOrDept || (isStudent ? 'Student' : 'Faculty')}
                    </div>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700/60 transition shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
              </button>

              <button
                id="btn-sidebar-logout"
                type="button"
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/40 transition flex items-center justify-center gap-2 text-xs font-semibold"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Account</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
