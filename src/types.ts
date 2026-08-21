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
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  description: string;
  replies: TicketReply[];
}

export type ActiveTab = 'about' | 'chat' | 'updates' | 'teachers' | 'contact';
