import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
  subscribeToAllUsers,
  updateUserAccountInDb,
  changeUserPasswordInDb,
  toggleUserSuspensionInDb,
  deleteUserAccountInDb
} from '../lib/firebase';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Search,
  KeyRound,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  Filter,
  Check,
  Sparkles,
  ArrowLeft,
  Mail,
  Building,
  Calendar,
  AlertTriangle,
  UserX,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AllAccountsManagerProps {
  currentUser: User;
  onBack: () => void;
}

export const AllAccountsManager: React.FC<AllAccountsManagerProps> = ({
  currentUser,
  onBack
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'admin' | 'student'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Selected User for Edit Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('teacher');
  const [editGradeOrDept, setEditGradeOrDept] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Password Change Modal
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [quickPassword, setQuickPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((allUsers) => {
      setUsers(allUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showSuccess = (msg: string) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  const showError = (msg: string) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(null), 4500);
  };

  // Filter users by Category (Admin vs Student), Status, and Search Query
  const adminUsers = users.filter(u => u.role === 'teacher');
  const studentUsers = users.filter(u => u.role === 'student');

  const currentCategoryUsers = activeCategory === 'admin' ? adminUsers : studentUsers;

  const filteredUsers = currentCategoryUsers.filter((u) => {
    if (statusFilter === 'active' && u.isSuspended) return false;
    if (statusFilter === 'suspended' && !u.isSuspended) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.gradeOrDept && u.gradeOrDept.toLowerCase().includes(q)) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Edit Modal with user data
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditGradeOrDept(user.gradeOrDept || '');
    setEditIdNumber(user.studentId || user.employeeId || '');
    setEditAvatar(user.avatar || '');
    setNewPassword('');
  };

  // Save Account Changes
  const handleSaveAccountChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSaving(true);
      setFeedbackError(null);

      const updates: Partial<User> & { password?: string } = {
        name: editName.trim(),
        role: editRole,
        gradeOrDept: editGradeOrDept.trim() || undefined,
        avatar: editAvatar.trim() || undefined
      };

      if (editRole === 'student') {
        updates.studentId = editIdNumber.trim() || undefined;
      } else {
        updates.employeeId = editIdNumber.trim() || undefined;
      }

      if (newPassword.trim()) {
        if (newPassword.trim().length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        updates.password = newPassword.trim();
      }

      await updateUserAccountInDb(selectedUser.id, updates);
      showSuccess(`Account details for "${editName}" have been updated successfully.`);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Update user error:', err);
      showError(err?.message || 'Failed to update account.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Password Change Submit
  const handleQuickPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !quickPassword.trim()) return;

    try {
      setIsChangingPassword(true);
      setFeedbackError(null);
      await changeUserPasswordInDb(passwordModalUser.id, quickPassword.trim());
      showSuccess(`Password successfully updated for ${passwordModalUser.name}.`);
      setPasswordModalUser(null);
      setQuickPassword('');
    } catch (err: any) {
      console.error('Change password error:', err);
      showError(err?.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Toggle Account Suspension
  const handleToggleSuspension = async (user: User) => {
    try {
      const willSuspend = !user.isSuspended;
      await toggleUserSuspensionInDb(user.id, willSuspend);
      showSuccess(
        willSuspend
          ? `Account "${user.name}" has been suspended. User cannot log in.`
          : `Account "${user.name}" has been reactivated successfully.`
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, isSuspended: willSuspend } : null);
      }
    } catch (err: any) {
      console.error('Suspension toggle error:', err);
      showError(err?.message || 'Failed to toggle account suspension.');
    }
  };

  // Delete User Account
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      setFeedbackError(null);
      await deleteUserAccountInDb(userToDelete.id);
      showSuccess(`Account for "${userToDelete.name}" was permanently deleted.`);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Delete account error:', err);
      showError(err?.message || 'Failed to delete user account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="all-accounts-manager" className="space-y-6 animate-in fade-in duration-200">
      {/* Back and Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                All Accounts Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {users.length} Total Users
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage credentials, modify account profiles, reset passwords, or suspend/delete users.
            </p>
          </div>
        </div>

        {/* Global Statistics Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{adminUsers.length} Admin/Faculty</span>
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>{studentUsers.length} Students</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Category Tabs: Admin Account vs Student Account */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 self-start">
          <button
            type="button"
            id="tab-admin-accounts"
            onClick={() => setActiveCategory('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === 'admin'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Accounts ({adminUsers.length})</span>
          </button>

          <button
            type="button"
            id="tab-student-accounts"
            onClick={() => setActiveCategory('student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === 'student'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Accounts ({studentUsers.length})</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory === 'admin' ? 'faculty/admin' : 'students'} by name, email, ID...`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading accounts from cloud directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No accounts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No ${activeCategory === 'admin' ? 'faculty/admin' : 'student'} accounts match "${searchQuery}".`
              : `No ${activeCategory === 'admin' ? 'admin/faculty' : 'student'} accounts registered yet.`}
          </p>
        </div>
      ) : (
        /* Accounts Grid / List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => {
            const isMe = user.id === currentUser.id;
            const isSuspended = !!user.isSuspended;

            return (
              <div
                key={user.id}
                id={`account-card-${user.id}`}
                className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between gap-4 ${
                  isSuspended
                    ? 'bg-rose-950/15 border-rose-900/40 hover:border-rose-700/60'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar || (user.role === 'teacher'
                          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')}
                        alt={user.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                      {isSuspended && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-rose-600 text-white shadow">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">
                          {user.name}
                        </h4>
                        {isMe && (
                          <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Current Session
                          </span>
                        )}
                        {isSuspended ? (
                          <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          {user.gradeOrDept || (user.role === 'teacher' ? 'General Faculty' : 'Grade 11')}
                        </span>
                        {(user.studentId || user.employeeId) && (
                          <span className="font-mono text-slate-400">
                            ID: <strong className="text-slate-200">{user.studentId || user.employeeId}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Manage Details Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(user)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Manage & Edit</span>
                    </button>

                    {/* Quick Change Password */}
                    <button
                      type="button"
                      onClick={() => setPasswordModalUser(user)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Reset or change password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Password</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Suspend / Activate Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSuspension(user)}
                      disabled={isMe}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        isMe
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                          : isSuspended
                          ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800'
                      }`}
                      title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                    >
                      {isSuspended ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Unsuspend</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Suspend</span>
                        </>
                      )}
                    </button>

                    {/* Delete User Button */}
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      disabled={isMe}
                      className={`p-1.5 rounded-xl transition ${
                        isMe
                          ? 'opacity-30 cursor-not-allowed text-slate-600'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                      }`}
                      title={isMe ? 'Cannot delete current logged-in account' : 'Delete Account'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Full Account Management & Edit */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manage Account</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccountChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="teacher">Admin / Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {editRole === 'teacher' ? 'Faculty Department' : 'Grade / Class'}
                  </label>
                  <input
                    type="text"
                    value={editGradeOrDept}
                    onChange={(e) => setEditGradeOrDept(e.target.value)}
                    placeholder={editRole === 'teacher' ? 'e.g. Science & Tech' : 'e.g. Grade 11 Science'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {editRole === 'teacher' ? 'Employee ID' : 'Student ID'}
                  </label>
                  <input
                    type="text"
                    value={editIdNumber}
                    onChange={(e) => setEditIdNumber(e.target.value)}
                    placeholder={editRole === 'teacher' ? 'e.g. EMP-2083' : 'e.g. NRSS-1104'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Set New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Suspension Toggle Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {selectedUser.isSuspended ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-300">Account is Currently Suspended</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Account is Active</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Suspended users are blocked from logging into the portal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSuspension(selectedUser)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedUser.isSuspended
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {selectedUser.isSuspended ? 'Reactivate' : 'Suspend Account'}
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserToDelete(selectedUser)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Account Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Password Reset */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Change Password</h3>
                  <p className="text-xs text-slate-400">{passwordModalUser.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter New Password for {passwordModalUser.name} *
                </label>
                <input
                  type="password"
                  value={quickPassword}
                  onChange={(e) => setQuickPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || quickPassword.length < 6}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition"
                >
                  {isChangingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Set New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Account Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete the account for <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-rose-400 font-medium">
                This action is permanent and completely revokes portal access.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
