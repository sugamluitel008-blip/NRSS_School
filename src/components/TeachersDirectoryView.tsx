import React, { useState } from 'react';
import { User, TeacherProfile } from '../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  PlusCircle,
  Pencil,
  Trash2,
  Crown,
  ShieldCheck,
  Briefcase,
  Layers,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeachersDirectoryViewProps {
  currentUser: User;
  teachers: TeacherProfile[];
  onAddTeacher: (teacher: Omit<TeacherProfile, 'id'>) => Promise<string> | void;
  onEditTeacher: (id: string, fields: Partial<TeacherProfile>) => Promise<void> | void;
  onDeleteTeacher: (id: string) => Promise<void> | void;
  onClearAllTeachers?: () => Promise<void> | void;
}

// Preset Role Hierarchy with explicit rank weights (1 = Topmost Executive, 8 = Support Staff)
export const ROLE_PRESETS = [
  { rank: 1, title: 'Head Administrator', tierName: 'Executive Authority (Top Tier)', badgeColor: 'from-amber-500 to-yellow-600 text-amber-950 border-amber-400' },
  { rank: 1, title: 'Chairman / Founder', tierName: 'Executive Authority (Top Tier)', badgeColor: 'from-amber-500 to-yellow-600 text-amber-950 border-amber-400' },
  { rank: 2, title: 'Principal', tierName: 'Institutional Head', badgeColor: 'from-indigo-500 to-purple-600 text-white border-indigo-400' },
  { rank: 2, title: 'Campus Director', tierName: 'Institutional Head', badgeColor: 'from-indigo-500 to-purple-600 text-white border-indigo-400' },
  { rank: 3, title: 'Vice Principal', tierName: 'Senior Administration', badgeColor: 'from-sky-500 to-blue-600 text-white border-sky-400' },
  { rank: 3, title: 'Academic Dean', tierName: 'Senior Administration', badgeColor: 'from-sky-500 to-blue-600 text-white border-sky-400' },
  { rank: 4, title: 'Head of Department (HOD)', tierName: 'Departmental Leadership', badgeColor: 'from-emerald-500 to-teal-600 text-white border-emerald-400' },
  { rank: 4, title: 'Program Coordinator', tierName: 'Departmental Leadership', badgeColor: 'from-emerald-500 to-teal-600 text-white border-emerald-400' },
  { rank: 5, title: 'Senior Lecturer', tierName: 'Senior Academic Faculty', badgeColor: 'from-violet-500 to-purple-600 text-white border-violet-400' },
  { rank: 6, title: 'Subject Teacher / Instructor', tierName: 'Teaching Faculty', badgeColor: 'from-slate-700 to-slate-800 text-slate-200 border-slate-600' },
  { rank: 7, title: 'Assistant Teacher / Lab Assistant', tierName: 'Junior Academic Staff', badgeColor: 'from-slate-800 to-slate-900 text-slate-300 border-slate-700' },
  { rank: 8, title: 'Administrative Staff / Counselor', tierName: 'Operations & Support', badgeColor: 'from-slate-800 to-slate-900 text-slate-400 border-slate-700' }
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
];

export const TeachersDirectoryView: React.FC<TeachersDirectoryViewProps> = ({
  currentUser,
  teachers,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onClearAllTeachers
}) => {
  const isAdmin = currentUser.role === 'teacher';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherProfile | null>(null);

  // Management Modals State
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TeacherProfile | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRoleTitle, setFormRoleTitle] = useState('Head Administrator');
  const [formRoleRank, setFormRoleRank] = useState(1);
  const [formDepartment, setFormDepartment] = useState('Executive Leadership');
  const [formPhoto, setFormPhoto] = useState(AVATAR_PRESETS[1]);
  const [formDob, setFormDob] = useState('1980-05-15');
  const [formAge, setFormAge] = useState<number>(44);
  const [formQualification, setFormQualification] = useState('Ph.D. in Educational Leadership');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+977-9800000000');
  const [formExperience, setFormExperience] = useState('15+ Years');

  const departmentsList = [
    'All',
    'Executive Leadership',
    'Science & Physics',
    'Mathematics',
    'Computer Science & IT',
    'Humanities & Social Sciences',
    'Languages & Literature',
    'Arts & Athletics',
    'Administration & Operations'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto calculate age from DOB
  const handleDobChange = (dobStr: string) => {
    setFormDob(dobStr);
    try {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let ageCalc = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageCalc--;
      }
      if (!isNaN(ageCalc) && ageCalc > 0 && ageCalc < 100) {
        setFormAge(ageCalc);
      }
    } catch {
      // Keep existing age
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProfile(null);
    setFormName('');
    setFormRoleTitle('Head Administrator');
    setFormRoleRank(1);
    setFormDepartment('Executive Leadership');
    setFormPhoto(AVATAR_PRESETS[1]);
    setFormDob('1980-05-15');
    setFormAge(44);
    setFormQualification('Ph.D. in Educational Leadership');
    setFormEmail('administrator@nrss.edu.np');
    setFormPhone('+977-9800000000');
    setFormExperience('15+ Years');
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (teacher: TeacherProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfile(teacher);
    setFormName(teacher.name);
    setFormRoleTitle(teacher.roleTitle);
    setFormRoleRank(teacher.roleRank || 5);
    setFormDepartment(teacher.department);
    setFormPhoto(teacher.photo);
    setFormDob(teacher.dob);
    setFormAge(teacher.age);
    setFormQualification(teacher.qualification);
    setFormEmail(teacher.email);
    setFormPhone(teacher.phone);
    setFormExperience(teacher.experience);
    setShowAddEditModal(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTeacherId(id);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      roleTitle: formRoleTitle.trim(),
      roleRank: Number(formRoleRank) || 5,
      department: formDepartment.trim(),
      photo: formPhoto.trim() || AVATAR_PRESETS[0],
      dob: formDob.trim() || '1985-01-01',
      age: Number(formAge) || 38,
      qualification: formQualification.trim() || 'Master\'s Degree',
      email: formEmail.trim() || 'faculty@nrss.edu.np',
      phone: formPhone.trim() || '+977-1-4412345',
      experience: formExperience.trim() || '5+ Years'
    };

    if (editingProfile) {
      await onEditTeacher(editingProfile.id, payload);
      showToast(`Updated profile for ${payload.name}`);
    } else {
      await onAddTeacher(payload);
      showToast(`Added ${payload.name} (${payload.roleTitle}) to faculty directory`);
    }

    setShowAddEditModal(false);
    setEditingProfile(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacherId) return;
    await onDeleteTeacher(deletingTeacherId);
    setDeletingTeacherId(null);
    showToast('Faculty profile removed from directory.');
  };

  // Sort: bigger role (smaller roleRank number: 1, 2, 3...) stays at TOP, smaller role (6, 7, 8...) stays DOWN
  const sortedTeachers = [...teachers].sort((a, b) => {
    const rankA = a.roleRank ?? 5;
    const rankB = b.roleRank ?? 5;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return a.name.localeCompare(b.name);
  });

  // Filter based on search and department
  const filteredTeachers = sortedTeachers.filter(teacher => {
    const matchesDept = selectedDept === 'All' || teacher.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Role Rank Badge Display Helper
  const getRoleBadge = (rank: number, title: string) => {
    if (rank === 1) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border border-amber-300 shadow-md flex items-center gap-1">
          <Crown className="w-3 h-3 fill-slate-950" />
          Top Leadership • Rank 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          Executive Head • Rank 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
          <Award className="w-3 h-3 text-sky-400" />
          Senior Admin • Rank 3
        </span>
      );
    }
    if (rank === 4) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-emerald-400" />
          Head of Dept • Rank 4
        </span>
      );
    }
    if (rank === 5) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
          Senior Lecturer • Rank 5
        </span>
      );
    }
    if (rank === 6) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Faculty Teacher • Rank 6
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
        Staff • Rank {rank}
      </span>
    );
  };

  return (
    <div id="teachers-directory-view" className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Administrative Controls */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Users className="w-4 h-4" />
            <span>NRSS Faculty & Administration Hierarchy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Teachers Name and Photo Directory
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {isAdmin
              ? 'Admin Portal: Manage faculty profiles with designated hierarchical roles (Head Administrator, Principal, HODs, Teachers). Higher roles automatically rank at the top.'
              : 'Official faculty directory of National Rhododendron Secondary School. Structured by leadership and academic roles.'}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium">
              Total Faculty: <strong className="text-white">{teachers.length}</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/50 text-amber-300 font-medium flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Leadership: <strong>{teachers.filter(t => (t.roleRank || 5) <= 2).length}</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 font-medium">
              Faculty / Instructors: <strong>{teachers.filter(t => (t.roleRank || 5) > 2).length}</strong>
            </span>
          </div>
        </div>

        {/* Admin Perks: Add Profile & Clean Directory Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && (
            <>
              <button
                id="btn-add-teacher-profile"
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Faculty Profile</span>
              </button>

              {teachers.length > 0 && onClearAllTeachers && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 font-medium text-xs border border-slate-700 transition flex items-center gap-1.5"
                  title="Clear all faculty profiles"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          {['All', 'Executive Leadership', 'Science & Physics', 'Mathematics', 'Computer Science & IT', 'Humanities'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="input-search-faculty"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty name, role, or qualification..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Directory Grid / Hierarchy Listing */}
      {filteredTeachers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Faculty Directory is Clean</div>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {teachers.length === 0
                ? isAdmin
                  ? 'No faculty profiles added yet. As an Administrator, you can add profiles with assigned hierarchical roles (Head Administrator, Principal, HODs, Teachers).'
                  : 'The faculty directory is currently being prepared by the administration. Check back soon for updated profiles.'
                : 'No faculty members match your active filter or search query.'}
            </p>
          </div>

          {isAdmin && teachers.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 inline-flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First Faculty Profile</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredTeachers.map((teacher) => {
            const isTopLeadership = (teacher.roleRank || 5) <= 2;

            return (
              <motion.div
                key={teacher.id}
                id={`teacher-card-${teacher.id}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => setSelectedTeacherModal(teacher)}
                className={`group rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition duration-200 shadow-xl cursor-pointer relative overflow-hidden ${
                  isTopLeadership
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/50 hover:border-indigo-400 shadow-indigo-500/10'
                    : 'bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Admin Quick Action Controls on Hover */}
                {isAdmin && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(teacher, e)}
                      className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Edit Profile"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenDeleteModal(teacher.id, e)}
                      className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Hierarchy Rank Indicator Badge */}
                <div className="mb-2.5">
                  {getRoleBadge(teacher.roleRank || 5, teacher.roleTitle)}
                </div>

                {/* Teacher Photo */}
                <div className="relative mb-3">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg transition duration-300 ${
                      isTopLeadership
                        ? 'border-2 border-amber-400/80 shadow-amber-500/10'
                        : 'border-2 border-slate-700 group-hover:border-indigo-400/80'
                    }`}
                  >
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-indigo-300 border border-indigo-500/40 shadow">
                    {teacher.experience ? teacher.experience.split(' ')[0] : '5+'} Yrs
                  </span>
                </div>

                {/* Name */}
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition leading-snug tracking-tight">
                  {teacher.name}
                </h4>

                {/* Designation / Role Title */}
                <p className="text-[11px] font-semibold text-indigo-300 mt-0.5 line-clamp-1">
                  {teacher.roleTitle}
                </p>

                {/* DOB & Age Section */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" /> DOB:
                    </span>
                    <span className="font-semibold text-slate-200">{teacher.dob}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Age:
                    </span>
                    <span className="font-semibold text-emerald-300 font-mono">{teacher.age} yrs</span>
                  </div>
                </div>

                {/* Department Tag */}
                <div className="mt-2.5 w-full">
                  <span className="inline-block w-full py-1 px-2 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 truncate">
                    {teacher.department}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT FACULTY PROFILE (ADMIN PERK)             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {editingProfile ? 'Edit Faculty Profile' : 'Add Faculty Profile & Role'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Higher hierarchical roles (Head Administrator, Principal) rank at the top
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditModal(false);
                    setEditingProfile(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name & Title *
                  </label>
                  <input
                    id="input-teacher-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Govinda Timalsina or Dr. Eleanor Vance"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Role Designation & Hierarchy Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Role Designation Preset
                    </label>
                    <select
                      value={formRoleTitle}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        setFormRoleTitle(selectedVal);
                        const match = ROLE_PRESETS.find(r => r.title === selectedVal);
                        if (match) {
                          setFormRoleRank(match.rank);
                          if (match.rank === 1 || match.rank === 2) {
                            setFormDepartment('Executive Leadership');
                          }
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {ROLE_PRESETS.map((preset) => (
                        <option key={preset.title} value={preset.title}>
                          {preset.title} ({preset.tierName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hierarchy Rank (1 = Topmost) *
                    </label>
                    <select
                      value={formRoleRank}
                      onChange={(e) => setFormRoleRank(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Rank 1 • Head Administrator / Chairman (Top Tier)</option>
                      <option value={2}>Rank 2 • Principal / Campus Director</option>
                      <option value={3}>Rank 3 • Vice Principal / Academic Dean</option>
                      <option value={4}>Rank 4 • Head of Department (HOD)</option>
                      <option value={5}>Rank 5 • Senior Lecturer / Faculty</option>
                      <option value={6}>Rank 6 • Subject Teacher / Instructor</option>
                      <option value={7}>Rank 7 • Assistant Teacher / Lab Assistant</option>
                      <option value={8}>Rank 8 • Administrative & Support Staff</option>
                    </select>
                  </div>
                </div>

                {/* Custom Role Title Option */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Role Title (if applicable)
                  </label>
                  <input
                    type="text"
                    value={formRoleTitle}
                    onChange={(e) => setFormRoleTitle(e.target.value)}
                    placeholder="e.g. Head Administrator / Chief Academic Officer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Department & Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Executive Leadership">Executive Leadership</option>
                      <option value="Science & Physics">Science & Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science & IT">Computer Science & IT</option>
                      <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                      <option value="Languages & Literature">Languages & Literature</option>
                      <option value="Arts & Athletics">Arts & Athletics</option>
                      <option value="Administration & Operations">Administration & Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Academic Qualification
                    </label>
                    <input
                      type="text"
                      value={formQualification}
                      onChange={(e) => setFormQualification(e.target.value)}
                      placeholder="e.g. Ph.D., M.Sc. Physics, M.Ed."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* DOB, Age, and Experience */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={formDob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      value={formExperience}
                      onChange={(e) => setFormExperience(e.target.value)}
                      placeholder="e.g. 15+ Years"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Photo Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="text"
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    placeholder="Image URL or choose a preset below"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">Presets:</span>
                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((presetUrl, idx) => (
                        <img
                          key={idx}
                          src={presetUrl}
                          alt={`Preset ${idx}`}
                          onClick={() => setFormPhoto(presetUrl)}
                          referrerPolicy="no-referrer"
                          className={`w-7 h-7 rounded-lg object-cover cursor-pointer border transition ${
                            formPhoto === presetUrl ? 'border-indigo-400 scale-110 ring-2 ring-indigo-500/50' : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@nrss.edu.np"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+977-9800000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEditModal(false);
                      setEditingProfile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-faculty-profile"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingProfile ? 'Save Profile Changes' : 'Publish Profile to Directory'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {deletingTeacherId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Remove Faculty Profile?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to remove this educator from the public faculty directory?
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTeacherId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20"
                >
                  Remove Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: CLEAR ALL CONFIRMATION                             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Clear All Faculty Profiles?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  This will remove all faculty profiles and reset the directory to a completely clean state.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onClearAllTeachers) {
                      await onClearAllTeachers();
                      setShowClearConfirmModal(false);
                      showToast('Directory wiped to clean state.');
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: PROFILE DETAIL VIEW                                */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedTeacherModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Faculty Profile Information</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTeacherModal(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={selectedTeacherModal.photo}
                  alt={selectedTeacherModal.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
                />
                <div>
                  <h4 className="text-base font-bold text-white">
                    {selectedTeacherModal.name}
                  </h4>
                  <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                    {selectedTeacherModal.roleTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedTeacherModal.department}
                  </p>
                  <div className="mt-1">
                    {getRoleBadge(selectedTeacherModal.roleRank || 5, selectedTeacherModal.roleTitle)}
                  </div>
                </div>
              </div>

              {/* Biographical Details */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Date of Birth</span>
                  <span className="font-semibold text-slate-200">{selectedTeacherModal.dob}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Age</span>
                  <span className="font-semibold text-emerald-300">{selectedTeacherModal.age} Years Old</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Academic Qualification</span>
                  <span className="font-medium text-slate-200">{selectedTeacherModal.qualification}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Teaching Experience</span>
                  <span className="font-medium text-slate-200">{selectedTeacherModal.experience}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{selectedTeacherModal.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{selectedTeacherModal.phone}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      const t = selectedTeacherModal;
                      setSelectedTeacherModal(null);
                      handleOpenEditModal(t, e);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTeacherModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
