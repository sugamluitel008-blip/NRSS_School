import { User, ChatRoom, ChatMessage, SchoolUpdate, TeacherProfile, SupportTicket } from '../types';

export const DEMO_STUDENTS: User[] = [
  {
    id: 'std_01',
    name: 'Sophia Chen',
    role: 'student',
    email: 'sophia.chen@student.academia.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    studentId: 'STD-2024-8841',
    gradeOrDept: 'Grade 11 - Advanced STEM',
    dob: '2008-04-14'
  },
  {
    id: 'std_02',
    name: 'Liam Vance',
    role: 'student',
    email: 'liam.vance@student.academia.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    studentId: 'STD-2024-9120',
    gradeOrDept: 'Grade 12 - Humanities Honors',
    dob: '2007-09-22'
  },
  {
    id: 'std_03',
    name: 'Amina Al-Mansoor',
    role: 'student',
    email: 'amina.m@student.academia.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    studentId: 'STD-2024-7732',
    gradeOrDept: 'Grade 10 - Science & Arts',
    dob: '2009-01-30'
  }
];

export const DEMO_TEACHERS: User[] = [
  {
    id: 'tch_01',
    name: 'Principal Govinda Timalsina',
    role: 'teacher',
    email: 'principal.govinda.timalsina@nrss.edu.np',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    employeeId: 'NRSS-FAC-1001',
    gradeOrDept: 'Principal / Head of Institution',
    dob: '1976-05-12'
  },
  {
    id: 'tch_02',
    name: 'Prof. Marcus Reed',
    role: 'teacher',
    email: 'm.reed@academia.edu',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    employeeId: 'FAC-1045',
    gradeOrDept: 'Head of Physics & Robotics',
    dob: '1981-11-03'
  },
  {
    id: 'tch_03',
    name: 'Mrs. Clara Bennett',
    role: 'teacher',
    email: 'c.bennett@academia.edu',
    avatar: 'https://images.unsplash.com/photo-1580894732484-905c105e1975?w=150&auto=format&fit=crop&q=80',
    employeeId: 'FAC-1082',
    gradeOrDept: 'Lead Mathematics Instructor',
    dob: '1984-08-19'
  }
];

export const CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'school-main',
    name: '🏫 General School Chat',
    description: 'Open communication hall for students, prefects, and teachers.',
    icon: 'School',
    access: 'all',
    category: 'general'
  },
  {
    id: 'faculty-lounge',
    name: '🔒 Faculty & Staff Lounge',
    description: 'Private discussions, department deliberations, and staff coordination.',
    icon: 'ShieldAlert',
    access: 'teacher_only',
    category: 'faculty'
  },
  {
    id: 'doc-transfer',
    name: '📂 Document & Resource Transfer',
    description: 'Direct syllabus exchange, exam paper rubrics, lesson plans, and files.',
    icon: 'FolderSync',
    access: 'teacher_only',
    category: 'documents'
  },
  {
    id: 'admin-urgent',
    name: '📢 Staff Coordination & Alerts',
    description: 'Campus operations, event supervision roster, and schedule updates.',
    icon: 'Megaphone',
    access: 'teacher_only',
    category: 'staff'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // General School Room (for students + teachers)
  {
    id: 'msg_01',
    roomId: 'school-main',
    senderId: 'tch_01',
    senderName: 'Principal Govinda Timalsina',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Principal',
    content: 'Good morning NRSS students and faculty! A gentle reminder that the Inter-School Science & Tech Fair submissions close this Friday at 4:00 PM.',
    timestamp: '8:30 am',
    reactions: { '👏': ['Liam Vance', 'Sophia Chen'], '💡': ['Amina Al-Mansoor'] }
  },
  {
    id: 'msg_02',
    roomId: 'school-main',
    senderId: 'std_01',
    senderName: 'Sophia Chen',
    senderRole: 'student',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Grade 11 - STEM',
    content: 'Namaste Principal Timalsina, will the main robotics lab stay open after 5:00 PM on Thursday for project testing?',
    timestamp: '8:35 am'
  },
  {
    id: 'msg_03',
    roomId: 'school-main',
    senderId: 'tch_02',
    senderName: 'Prof. Marcus Reed',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Physics Dept Head',
    content: 'Yes Sophia, I will be supervising Lab 304 until 6:30 PM this Thursday. All registered teams are welcome to calibrate their hardware.',
    timestamp: '8:42 am',
    reactions: { '🔥': ['Sophia Chen', 'Liam Vance', 'Amina Al-Mansoor'] }
  },
  {
    id: 'msg_04',
    roomId: 'school-main',
    senderId: 'std_02',
    senderName: 'Liam Vance',
    senderRole: 'student',
    senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Grade 12',
    content: 'Thank you Prof. Reed! Our autonomous solar rover prototype is ready for the track tests.',
    timestamp: '8:50 am'
  },

  // Faculty Lounge (Teachers only)
  {
    id: 'msg_f01',
    roomId: 'faculty-lounge',
    senderId: 'tch_01',
    senderName: 'Principal Govinda Timalsina',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Principal',
    content: 'Colleagues, the midterm curriculum moderation meeting is scheduled for tomorrow at 3:30 PM in Conference Room A.',
    timestamp: '4:15 pm'
  },
  {
    id: 'msg_f02',
    roomId: 'faculty-lounge',
    senderId: 'tch_03',
    senderName: 'Mrs. Clara Bennett',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1580894732484-905c105e1975?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Math Department',
    content: 'Noted Principal Timalsina. The Mathematics department has compiled all diagnostic question banks ready for peer review.',
    timestamp: '4:30 pm',
    reactions: { '👍': ['Principal Govinda Timalsina', 'Prof. Marcus Reed'] }
  },

  // Document Transfer Room (Teachers only)
  {
    id: 'msg_d01',
    roomId: 'doc-transfer',
    senderId: 'tch_02',
    senderName: 'Prof. Marcus Reed',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Physics Dept',
    content: 'Sharing the revised Grade 11 & 12 Physics Lab Rubric & Safety Protocols PDF for the upcoming trimester.',
    timestamp: '7:45 am',
    attachment: {
      name: 'AP_Physics_Lab_Rubric_2026_Final.pdf',
      size: '2.8 MB',
      type: 'pdf'
    }
  },
  {
    id: 'msg_d02',
    roomId: 'doc-transfer',
    senderId: 'tch_03',
    senderName: 'Mrs. Clara Bennett',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1580894732484-905c105e1975?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Math Department',
    content: 'Here is the master spreadsheet containing calculus mock exam score distributions across all sets.',
    timestamp: '9:10 am',
    attachment: {
      name: 'Calculus_Mock_Analytics_Q1.xlsx',
      size: '1.4 MB',
      type: 'doc'
    }
  },

  // Staff Coordination (Teachers only)
  {
    id: 'msg_a01',
    roomId: 'admin-urgent',
    senderId: 'tch_01',
    senderName: 'Principal Govinda Timalsina',
    senderRole: 'teacher',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderTitle: 'Principal',
    content: 'Please verify that morning assembly arrangements and Session 2083 attendance registers are updated before 2nd period today.',
    timestamp: '7:15 am'
  }
];

export const INITIAL_SCHOOL_UPDATES: SchoolUpdate[] = [
  {
    id: 'upd_01',
    title: 'Welcome to Academic Session 2083 & Commencement Guidelines',
    content: 'On behalf of the administration and faculty, welcome to Academic Session 2083 at National Rhododendron Secondary School (NRSS). Regular morning assembly starts promptly at 8:45 AM. Students must adhere strictly to the prescribed dress code and carry their academic planners. Please download the official session calendar below.',
    authorName: 'Principal Govinda Timalsina',
    authorRole: 'Principal & Head of School',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: 'Academics',
    priority: 'urgent',
    date: 'August 18, 2026',
    time: '8:00 am',
    pinned: true,
    targetAudience: 'All',
    attachments: [
      { name: 'NRSS_Academic_Calendar_2083.pdf', size: '1.4 MB' },
      { name: 'Student_Code_of_Conduct_2083.pdf', size: '920 KB' }
    ]
  },
  {
    id: 'upd_02',
    title: 'First Terminal Examination Schedule & Practical Routine Published',
    content: 'The official schedule for the upcoming First Terminal Examinations across Grades 8, 9, 10, 11, and 12 has been published. Practical lab assessments will be conducted prior to written exams. Admit cards will be distributed through class teachers starting next Monday.',
    authorName: 'Vice Principal K. R. Sharma',
    authorRole: 'Examination Controller',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Exams',
    priority: 'urgent',
    date: 'August 15, 2026',
    time: '10:30 am',
    pinned: true,
    targetAudience: 'Students',
    attachments: [
      { name: 'First_Terminal_Exam_Routine_2083.pdf', size: '2.1 MB' }
    ]
  },
  {
    id: 'upd_03',
    title: 'Annual STEM & Robotics Exhibition 2026 Registration Open',
    content: 'National Rhododendron Secondary School invites student innovators from Grades 8 through 12 to submit project abstracts for our Annual Science, Technology, and Robotics Expo. Projects focusing on renewable energy, automated robotics, and software solutions will be eligible for inter-school honors.',
    authorName: 'Prof. Marcus Reed',
    authorRole: 'Head of Science & Technology',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    category: 'Events',
    priority: 'medium',
    date: 'August 12, 2026',
    time: '11:15 am',
    pinned: false,
    targetAudience: 'Students',
    attachments: [
      { name: 'STEM_Expo_Guidelines_and_Form.pdf', size: '1.8 MB' }
    ]
  },
  {
    id: 'upd_04',
    title: 'Inter-House Sports Meet & Football Tournament Trials',
    content: 'House captains and sports coaches will conduct selection trials for Football, Basketball, Volleyball, and Track & Field this Thursday and Friday afternoon on the school ground. Interested scholars must report in physical education kits.',
    authorName: 'Coach David Miller',
    authorRole: 'Director of Athletics',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'Events',
    priority: 'medium',
    date: 'August 10, 2026',
    time: '3:45 pm',
    pinned: false,
    targetAudience: 'Students'
  },
  {
    id: 'upd_05',
    title: 'Parent-Teacher Conference (PTM) & Digital Gradebook Access',
    content: 'The First Term Parent-Teacher Conference is scheduled for this coming Saturday from 9:00 AM to 2:00 PM. Parents can meet respective subject teachers to review diagnostic assessments and academic progress.',
    authorName: 'Mrs. Clara Bennett',
    authorRole: 'Senior Academic Coordinator',
    authorAvatar: 'https://images.unsplash.com/photo-1580894732484-905c105e1975?w=150&auto=format&fit=crop&q=80',
    category: 'Academics',
    priority: 'low',
    date: 'August 05, 2026',
    time: '9:00 am',
    pinned: false,
    targetAudience: 'Parents'
  }
];

// Clean state for faculty directory (Admins create and manage profiles directly in Firestore)
export const TEACHERS_DIRECTORY: TeacherProfile[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_001',
    ticketNumber: 'ACAD-8041',
    userId: 'std_01',
    userName: 'Sophia Chen',
    userRole: 'student',
    userEmail: 'sophia.chen@student.academia.edu',
    subject: 'Request for Physics Lab 304 Access Keycard Re-issuance',
    category: 'Campus Facilities',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-03-23 09:15 AM',
    updatedAt: '2026-03-23 10:30 AM',
    description: 'My magnetic lab keycard was demagnetized during locker repairs yesterday. I need replacement access for the robotics preparation before Thursday afternoon.',
    replies: [
      {
        id: 'rep_1',
        authorId: 'tch_01',
        authorName: 'Helpdesk Admin (David)',
        authorRole: 'support',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Hi Sophia, your replacement RFID card has been encoded. You can collect it from the Security Desk in Building B between 12:00 PM and 2:00 PM today.',
        timestamp: '2026-03-23 10:30 AM'
      }
    ]
  },
  {
    id: 'tkt_002',
    ticketNumber: 'ACAD-8042',
    userId: 'std_02',
    userName: 'Liam Vance',
    userRole: 'student',
    userEmail: 'liam.vance@student.academia.edu',
    subject: 'Digital Library JSTOR Single Sign-On Access Issue',
    category: 'IT & Portal Access',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-03-24 08:20 AM',
    updatedAt: '2026-03-24 08:20 AM',
    description: 'When trying to download history research papers on JSTOR using the institutional proxy, it displays an authorization token timeout.',
    replies: []
  },
  {
    id: 'tkt_003',
    ticketNumber: 'ACAD-7998',
    userId: 'tch_02',
    userName: 'Prof. Marcus Reed',
    userRole: 'teacher',
    userEmail: 'm.reed@academia.edu',
    subject: 'Projector HDMI Audio Interface in Lecture Hall 2',
    category: 'IT & Portal Access',
    priority: 'High',
    status: 'Resolved',
    createdAt: '2026-03-21 02:00 PM',
    updatedAt: '2026-03-22 09:00 AM',
    description: 'The ceiling projector HDMI port had intermittent signal loss during the morning physics seminar.',
    replies: [
      {
        id: 'rep_2',
        authorId: 'support_admin',
        authorName: 'IT Operations Team',
        authorRole: 'support',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'The switchbox and HDMI 2.1 cable have been replaced and tested. All 4K video feeds and audio lines are operating stably.',
        timestamp: '2026-03-22 09:00 AM'
      }
    ]
  }
];
