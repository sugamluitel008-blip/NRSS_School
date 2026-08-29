export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  studentId?: string;
  employeeId?: string;
  gradeOrDept?: string;
  dob?: string;
  isSuspended?: boolean;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  senderTitle?: string;
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image' | 'archive' | 'code';
    url?: string;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> user names array
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  logoUrl?: string;
  access: 'all' | 'teacher_only';
  unreadCount?: number;
  category: 'general' | 'faculty' | 'documents' | 'staff';
}

export interface SchoolUpdate {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  category: 'Academics' | 'Exams' | 'Events' | 'Holidays' | 'Sports' | 'Administration';
  priority: 'low' | 'medium' | 'urgent';
  date: string;
  time: string;
  pinned?: boolean;
  targetAudience?: 'All' | 'Students' | 'Faculty' | 'Parents';
  attachments?: { name: string; size: string; type?: string; url?: string }[];
  readBy?: string[];
}

export interface TeacherProfile {
  id: string;
  name: string;
  photo: string;
  dob: string;
  age: number;
  department: string;
  roleTitle: string;
  roleRank: number; // 1 = Head Administrator / Principal (Highest), 2 = Vice Principal / Dean, 3 = HOD, 4 = Senior Lecturer, 5 = Teacher / Instructor, 6 = Assistant Teacher, 7 = Staff
  qualification: string;
  email: string;
  phone: string;
  experience: string;
  rowGroup?: 1 | 2 | 3 | 4;
}

export interface TicketReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole | 'support';
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  subject: string;
  category: 'Academic Inquiries' | 'IT & Portal Access' | 'Campus Facilities' | 'Fee & Accounts' | 'Extracurricular' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  description: string;
  replies: TicketReply[];
}

export type ActiveTab = 'about' | 'chat' | 'updates' | 'routines' | 'contact' | 'staff-tools' | 'teachers';

export type AdminRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AdminRequest {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  department: string;
  employeeId: string;
  dob?: string;
  deviceId: string;
  deviceModel?: string;
  status: AdminRequestStatus;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CampusPhoto {
  id: string;
  url: string;
  title: string;
  description?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt?: number;
}

export interface ClassRoutine {
  id: string;
  grade: string; // e.g. "Grade 1", "Grade 2", "Grade 10", "Grade 11", "Grade 12"
  section: string; // e.g. "Sec A", "Sec B", "Sec C", "Science A", "Management"
  title: string; // e.g. "Grade 1 Sec A", "Grade 1 Sec B"
  shift?: string; // e.g. "Morning Shift (6:30 AM - 11:30 AM)" or "Day Shift (10:00 AM - 4:00 PM)"
  roomNo?: string; // e.g. "Room 101", "Science Wing 3"
  academicYear?: string; // e.g. "2083 B.S."
  imageUrl: string; // Direct image / converted high-res screenshot or visual timetable
  fileName?: string; // Original uploaded document filename
  fileType?: 'image' | 'pdf';
  notes?: string; // Class notes, break times, teacher allocations
  uploadedBy?: string;
  uploadedAt?: string;
  orderIndex: number;
  createdAt: number;
}


