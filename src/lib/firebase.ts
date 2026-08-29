import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, ChatMessage, ChatRoom, SchoolUpdate, SupportTicket, TicketReply, TeacherProfile, AdminRequest, AdminRequestStatus, CampusPhoto, ClassRoutine } from '../types';
import { CHAT_ROOMS, INITIAL_SCHOOL_UPDATES, INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { compressDataUrl } from './pdfHelper';

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId
});

// Initialize Firestore with specific database ID and robust auto-detect long polling connection settings
const customDatabaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true
}, customDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Safe background Firestore health check
async function checkFirestoreReadiness() {
  try {
    const metaRef = doc(db, 'school_meta', 'status');
    const snap = await getDoc(metaRef);
    if (!snap.exists()) {
      // Initialize meta doc quietly if absent
      await setDoc(metaRef, {
        portalName: 'NRSS Academy Portal',
        academicYear: '2083 B.S.',
        updatedAt: Date.now()
      }, { merge: true });
    }
  } catch (err: any) {
    // Non-blocking connection log
    console.debug('Firestore readiness notice:', err?.message || err);
  }
}
checkFirestoreReadiness();

// ==========================================
// AUTHENTICATION & USER PROFILE SERVICES
// ==========================================

// Helper to strip undefined fields so Firestore setDoc/addDoc/updateDoc never fails
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = sanitizeFirestoreData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

const LOCAL_STORAGE_USER_KEY = 'nrss_auth_active_user_id';

async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return btoa(password);
  }
}

export async function registerUserAccount(data: {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  gradeOrDept?: string;
  studentId?: string;
  employeeId?: string;
  dob?: string;
  avatar?: string;
}): Promise<User> {
  const cleanEmail = data.email.trim().toLowerCase();
  const defaultAvatar = data.role === 'student'
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

  let userId = '';

  try {
    // Attempt standard Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    userId = userCredential.user.uid;
  } catch (authErr: any) {
    // If Firebase Auth provider is disabled (e.g. auth/operation-not-allowed), use direct Cloud Firestore user registration
    if (authErr?.code === 'auth/operation-not-allowed' || authErr?.code === 'auth/configuration-not-found') {
      // Check if user already exists in Firestore users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      const existingUser = usersSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);
      if (existingUser) {
        throw new Error('This email address is already registered. Please sign in instead.');
      }
      userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    } else {
      throw authErr;
    }
  }

  const hashedPassword = await hashPassword(data.password);

  const userProfile: User = {
    id: userId,
    name: data.name.trim(),
    role: data.role,
    email: cleanEmail,
    avatar: data.avatar || defaultAvatar,
    gradeOrDept: data.gradeOrDept?.trim() || (data.role === 'student' ? 'Grade 11 - General' : 'Faculty Instructor'),
    ...(data.role === 'student' ? { studentId: data.studentId?.trim() || `STD-${Math.floor(1000 + Math.random() * 9000)}` } : {}),
    ...(data.role === 'teacher' ? { employeeId: data.employeeId?.trim() || `FAC-${Math.floor(1000 + Math.random() * 9000)}` } : {}),
    dob: data.dob || '2005-01-01'
  };

  // Persist user document to Firestore with undefined values stripped
  await setDoc(doc(db, 'users', userId), sanitizeFirestoreData({
    ...userProfile,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString()
  }));

  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, userId);
  } catch (e) {}

  return userProfile;
}

export async function signInUserAccount(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Attempt standard Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = userCredential.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const profile: User = {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || email.split('@')[0],
        role: data.role || 'student',
        email: data.email || fbUser.email || cleanEmail,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        gradeOrDept: data.gradeOrDept || 'Student',
        studentId: data.studentId,
        employeeId: data.employeeId,
        dob: data.dob
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, fbUser.uid);
      } catch (e) {}
      return profile;
    }
  } catch (authErr: any) {
    if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/invalid-credential') {
      throw new Error('Invalid password. Please try again.');
    }
    if (authErr?.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please register your account first.');
    }
    if (authErr?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
  }

  // Firestore direct fallback lookup
  const usersSnap = await getDocs(collection(db, 'users'));
  const userDocMatch = usersSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);

  if (!userDocMatch) {
    // Check if an admin application exists for this institutional email
    const reqsSnap = await getDocs(collection(db, 'admin_requests'));
    const adminReqMatch = reqsSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);

    if (adminReqMatch) {
      const reqData = adminReqMatch.data();
      const reqStatus = reqData.status || 'pending';

      if (reqStatus === 'pending') {
        const err: any = new Error('Your Faculty / Admin account application is currently in queue awaiting approval from school administration.');
        err.adminRequest = { id: adminReqMatch.id, ...reqData };
        throw err;
      } else if (reqStatus === 'rejected') {
        const reason = reqData.rejectionReason ? ` (Reason: "${reqData.rejectionReason}")` : '';
        const err: any = new Error(`Your Faculty / Admin account request was declined${reason}. Please contact +9779869400576 for assistance.`);
        err.adminRequest = { id: adminReqMatch.id, ...reqData };
        throw err;
      } else if (reqStatus === 'approved') {
        // If approved, check password and activate
        const inputHash = await hashPassword(pass);
        if (reqData.passwordHash && reqData.passwordHash !== inputHash && reqData.passwordHash !== pass) {
          throw new Error('Invalid password. Please try again.');
        }
        return await activateApprovedAdminOnDevice(adminReqMatch.id);
      }
    }

    throw new Error('No account found with this email. Please register your account first.');
  }

  const userData = userDocMatch.data();

  if (userData.isSuspended) {
    throw new Error('This account has been suspended by school administration. Please contact staff for assistance.');
  }

  const expectedHash = userData.passwordHash;
  const inputHash = await hashPassword(pass);

  if (expectedHash && expectedHash !== inputHash && expectedHash !== pass) {
    throw new Error('Invalid password. Please try again.');
  }

  const profile: User = {
    id: userDocMatch.id,
    name: userData.name || cleanEmail.split('@')[0],
    role: userData.role || 'student',
    email: userData.email || cleanEmail,
    avatar: userData.avatar || (userData.role === 'teacher'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
    gradeOrDept: userData.gradeOrDept || (userData.role === 'teacher' ? 'Faculty' : 'Grade 11'),
    studentId: userData.studentId,
    employeeId: userData.employeeId,
    dob: userData.dob
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, userDocMatch.id);
  } catch (e) {}

  return profile;
}

export async function signOutUserAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {}
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  } catch (e) {}
}

export const ADMIN_FORGOT_PIN = 'ADMINPaSS0';
export const STUDENT_FORGOT_PIN = 'STUDENTS100';

export async function resetUserPassword(params: {
  email: string;
  role: 'student' | 'teacher';
  pinCode: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const trimmedPin = params.pinCode.trim();

  // Validate security PIN according to portal type
  if (params.role === 'teacher') {
    if (trimmedPin !== ADMIN_FORGOT_PIN) {
      throw new Error('Invalid Admin Security PIN. Contact +9779869400576 For Password Reset.');
    }
  } else {
    if (trimmedPin !== STUDENT_FORGOT_PIN) {
      throw new Error('Invalid Student Security PIN code. Please enter the required student PIN (STUDENTS100).');
    }
  }

  if (params.newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const hashedPassword = await hashPassword(params.newPassword);
  let updated = false;

  // 1. Search for user in Firestore users collection
  const usersSnap = await getDocs(collection(db, 'users'));
  const userDocMatch = usersSnap.docs.find(d => {
    const data = d.data();
    return (data.email || '').toLowerCase() === cleanEmail && (data.role === params.role || !data.role);
  });

  if (userDocMatch) {
    await updateDoc(doc(db, 'users', userDocMatch.id), {
      passwordHash: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    updated = true;
  }

  // 2. Also check if there is an in-queue admin request for this email
  if (params.role === 'teacher') {
    const reqsSnap = await getDocs(collection(db, 'admin_requests'));
    const reqDocMatch = reqsSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);
    if (reqDocMatch) {
      await updateDoc(doc(db, 'admin_requests', reqDocMatch.id), {
        passwordHash: hashedPassword
      });
      updated = true;
    }
  }

  if (!updated) {
    throw new Error(`No ${params.role === 'teacher' ? 'Faculty / Admin' : 'Student'} account found with institutional email "${cleanEmail}". Please register or check for typos.`);
  }

  return {
    success: true,
    message: `Password successfully reset for ${cleanEmail}! You may now sign in using your new password.`
  };
}

export function subscribeToAuthProfile(callback: (user: User | null, loading: boolean) => void) {
  let hasResolved = false;

  const unsubscribeFb = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          hasResolved = true;
          callback({
            id: fbUser.uid,
            name: data.name || fbUser.email?.split('@')[0] || 'User',
            role: data.role || 'student',
            email: data.email || fbUser.email || '',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            gradeOrDept: data.gradeOrDept || 'Member',
            studentId: data.studentId,
            employeeId: data.employeeId,
            dob: data.dob
          }, false);
          return;
        }
      } catch (err) {
        console.error('Error fetching auth user profile:', err);
      }
    }

    // Check Local Storage persisted Firestore user session
    try {
      const cachedUserId = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (cachedUserId) {
        const userDocRef = doc(db, 'users', cachedUserId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          hasResolved = true;
          callback({
            id: cachedUserId,
            name: data.name || 'User',
            role: data.role || 'student',
            email: data.email || '',
            avatar: data.avatar || (data.role === 'teacher'
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
            gradeOrDept: data.gradeOrDept || 'Member',
            studentId: data.studentId,
            employeeId: data.employeeId,
            dob: data.dob
          }, false);
          return;
        }
      }
    } catch (err) {
      console.warn('Local session read error:', err);
    }

    if (!hasResolved) {
      callback(null, false);
    }
  });

  return () => {
    unsubscribeFb();
  };
}

export async function updateUserProfileInDb(userId: string, updates: Partial<User>): Promise<User> {
  const userRef = doc(db, 'users', userId);
  const cleanData = sanitizeFirestoreData({
    ...updates,
    updatedAt: new Date().toISOString()
  });

  await setDoc(userRef, cleanData, { merge: true });

  const updatedDoc = await getDoc(userRef);
  const data = updatedDoc.data() || {};
  const updatedUser: User = {
    id: userId,
    name: data.name || updates.name || 'User',
    role: data.role || (updates.role as any) || 'student',
    email: data.email || updates.email || '',
    avatar: data.avatar || updates.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gradeOrDept: data.gradeOrDept || updates.gradeOrDept,
    studentId: data.studentId || updates.studentId,
    employeeId: data.employeeId || updates.employeeId,
    dob: data.dob || updates.dob
  };

  return updatedUser;
}

// ==========================================
// CHAT MESSAGES & ROOMS SERVICES
// ==========================================

export function subscribeToChatMessages(callback: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }

    const msgs: ChatMessage[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        roomId: data.roomId || 'school-main',
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        senderAvatar: data.senderAvatar,
        senderTitle: data.senderTitle,
        content: data.content,
        timestamp: data.timestamp,
        attachment: data.attachment,
        reactions: data.reactions || {}
      };
    });

    callback(msgs);
  });
}

export async function clearAllChatMessagesFromDb(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'chat_messages'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function clearRoomChatMessagesFromDb(roomId: string): Promise<void> {
  const q = query(collection(db, 'chat_messages'), where('roomId', '==', roomId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function sendChatMessageToDb(message: Omit<ChatMessage, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'chat_messages'), sanitizeFirestoreData({
    ...message,
    createdAt: Date.now()
  }));
  return docRef.id;
}

export async function toggleMessageReactionInDb(messageId: string, emoji: string, userName: string): Promise<void> {
  const msgDocRef = doc(db, 'chat_messages', messageId);
  const msgSnap = await getDoc(msgDocRef);
  if (!msgSnap.exists()) return;

  const data = msgSnap.data();
  const reactions = data.reactions || {};
  const userList: string[] = reactions[emoji] || [];

  const updatedList = userList.includes(userName)
    ? userList.filter((u: string) => u !== userName)
    : [...userList, userName];

  const updatedReactions = { ...reactions };
  if (updatedList.length > 0) {
    updatedReactions[emoji] = updatedList;
  } else {
    delete updatedReactions[emoji];
  }

  await updateDoc(msgDocRef, { reactions: updatedReactions });
}

export function subscribeToChatRooms(callback: (rooms: ChatRoom[]) => void) {
  const colRef = collection(db, 'chat_rooms');

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      const batch = writeBatch(db);
      CHAT_ROOMS.forEach((r) => {
        const docRef = doc(db, 'chat_rooms', r.id);
        batch.set(docRef, sanitizeFirestoreData(r));
      });
      await batch.commit();
      return;
    }

    const rooms: ChatRoom[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        logoUrl: data.logoUrl || undefined,
        access: data.access,
        unreadCount: data.unreadCount || 0,
        category: data.category
      };
    });

    callback(rooms);
  });
}

export async function updateChatRoomNameInDb(roomId: string, newName: string): Promise<void> {
  const roomRef = doc(db, 'chat_rooms', roomId);
  await updateDoc(roomRef, sanitizeFirestoreData({ name: newName.trim() }));
}

export async function updateChatRoomDetailsInDb(roomId: string, updates: Partial<ChatRoom>): Promise<void> {
  const roomRef = doc(db, 'chat_rooms', roomId);
  await updateDoc(roomRef, sanitizeFirestoreData(updates));
}

// ==========================================
// SCHOOL UPDATES / ANNOUNCEMENTS SERVICES
// ==========================================

export function subscribeToSchoolUpdates(callback: (updates: SchoolUpdate[]) => void) {
  const q = query(collection(db, 'school_updates'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }

    const updates: SchoolUpdate[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        authorName: data.authorName,
        authorRole: data.authorRole,
        authorAvatar: data.authorAvatar,
        category: data.category,
        priority: data.priority,
        date: data.date,
        time: data.time,
        pinned: !!data.pinned,
        targetAudience: data.targetAudience || 'All',
        attachments: data.attachments || [],
        readBy: data.readBy || []
      };
    });

    callback(updates);
  });
}

export async function addSchoolUpdateToDb(updateData: Omit<SchoolUpdate, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'school_updates'), sanitizeFirestoreData({
    ...updateData,
    createdAt: Date.now()
  }));
  return docRef.id;
}

export async function updateSchoolUpdateInDb(id: string, fields: Partial<SchoolUpdate>): Promise<void> {
  const docRef = doc(db, 'school_updates', id);
  await updateDoc(docRef, sanitizeFirestoreData(fields));
}

export async function deleteSchoolUpdateFromDb(id: string): Promise<void> {
  const docRef = doc(db, 'school_updates', id);
  await deleteDoc(docRef);
}

export async function togglePinSchoolUpdateInDb(id: string, currentPinned: boolean): Promise<void> {
  const docRef = doc(db, 'school_updates', id);
  await updateDoc(docRef, { pinned: !currentPinned });
}

export async function clearAllSchoolUpdatesFromDb(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'school_updates'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ==========================================
// TEACHERS DIRECTORY SERVICES (HIERARCHICAL ROLE PERSISTENCE)
// ==========================================

export function subscribeToTeacherProfiles(callback: (teachers: TeacherProfile[]) => void) {
  const q = query(collection(db, 'teachers'), orderBy('roleRank', 'asc'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }

    const teachers: TeacherProfile[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        photo: data.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        dob: data.dob || '1985-01-01',
        age: Number(data.age) || 38,
        department: data.department || 'General Faculty',
        roleTitle: data.roleTitle || 'Faculty Member',
        roleRank: Number(data.roleRank) || 5,
        qualification: data.qualification || 'Master\'s Degree',
        email: data.email || 'faculty@nrss.edu.np',
        phone: data.phone || '+977-1-4412345',
        experience: data.experience || '5+ Years',
        rowGroup: data.rowGroup
      };
    });

    // Sort so higher hierarchy / lower roleRank stays at top (1 = Head Administrator, 2 = Principal/Dean, etc.)
    teachers.sort((a, b) => (a.roleRank - b.roleRank));

    callback(teachers);
  });
}

export async function addTeacherProfileToDb(profileData: Omit<TeacherProfile, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'teachers'), sanitizeFirestoreData({
    ...profileData,
    createdAt: Date.now()
  }));
  return docRef.id;
}

export async function updateTeacherProfileInDb(id: string, fields: Partial<TeacherProfile>): Promise<void> {
  const docRef = doc(db, 'teachers', id);
  await updateDoc(docRef, sanitizeFirestoreData(fields));
}

export async function deleteTeacherProfileFromDb(id: string): Promise<void> {
  const docRef = doc(db, 'teachers', id);
  await deleteDoc(docRef);
}

export async function clearAllTeacherProfilesFromDb(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'teachers'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ==========================================
// SUPPORT TICKETS SERVICES
// ==========================================

export function subscribeToSupportTickets(callback: (tickets: SupportTicket[]) => void) {
  const colRef = collection(db, 'support_tickets');

  return onSnapshot(colRef, (snapshot) => {
    const tickets: SupportTicket[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ticketNumber: data.ticketNumber || `ACAD-${docSnap.id.substring(0, 4)}`,
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userEmail: data.userEmail,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        description: data.description,
        replies: data.replies || []
      };
    });

    // Sort newest updatedAt or createdAt first
    tickets.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
    callback(tickets);
  });
}

export async function createSupportTicketInDb(ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<string> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const ticketNumber = `ACAD-${Math.floor(8000 + Math.random() * 1999)}`;

  const docRef = await addDoc(collection(db, 'support_tickets'), sanitizeFirestoreData({
    ...ticketData,
    ticketNumber,
    createdAt: now,
    updatedAt: now,
    replies: []
  }));
  return docRef.id;
}

export async function addTicketReplyInDb(ticketId: string, reply: TicketReply): Promise<void> {
  const docRef = doc(db, 'support_tickets', ticketId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentReplies: TicketReply[] = data.replies || [];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  await updateDoc(docRef, {
    replies: [...currentReplies, sanitizeFirestoreData(reply)],
    updatedAt: now
  });
}

export async function updateSupportTicketStatusInDb(ticketId: string, newStatus: SupportTicket['status']): Promise<void> {
  const docRef = doc(db, 'support_tickets', ticketId);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: now
  });
}

export async function closeSupportTicketInDb(ticketId: string): Promise<void> {
  await updateSupportTicketStatusInDb(ticketId, 'Closed');
}

export async function deleteSupportTicketInDb(ticketId: string): Promise<void> {
  const docRef = doc(db, 'support_tickets', ticketId);
  await deleteDoc(docRef);
}

// ==========================================
// ALL ACCOUNTS MANAGEMENT (FACULTY & STUDENTS)
// ==========================================

export function subscribeToAllUsers(callback: (users: User[]) => void) {
  const colRef = collection(db, 'users');

  return onSnapshot(colRef, (snapshot) => {
    const users: User[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Anonymous User',
        role: data.role || 'student',
        email: data.email || '',
        avatar: data.avatar || (data.role === 'teacher'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
        gradeOrDept: data.gradeOrDept || (data.role === 'teacher' ? 'General Faculty' : 'Grade 11'),
        studentId: data.studentId,
        employeeId: data.employeeId,
        dob: data.dob,
        isSuspended: !!data.isSuspended,
        createdAt: data.createdAt
      };
    });

    // Sort by name or role
    users.sort((a, b) => a.name.localeCompare(b.name));
    callback(users);
  });
}

export async function updateUserAccountInDb(
  userId: string,
  updates: Partial<User> & { password?: string }
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const dataToUpdate: any = { ...updates };

  if (updates.password && updates.password.trim()) {
    dataToUpdate.passwordHash = await hashPassword(updates.password.trim());
    delete dataToUpdate.password;
  }

  await updateDoc(userRef, sanitizeFirestoreData(dataToUpdate));
}

export async function changeUserPasswordInDb(userId: string, newPasswordPlain: string): Promise<void> {
  if (newPasswordPlain.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const passwordHash = await hashPassword(newPasswordPlain.trim());
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { passwordHash });
}

export async function toggleUserSuspensionInDb(userId: string, isSuspended: boolean): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isSuspended });
}

export async function deleteUserAccountInDb(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
}

// ==========================================
// GLOBAL SCHOOL METADATA SERVICES
// ==========================================

export function subscribeToSchoolStatus(callback: (isOpen: boolean) => void) {
  const docRef = doc(db, 'school_meta', 'status');

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(!!docSnap.data().isSchoolOpen);
    } else {
      // Set default open status
      setDoc(docRef, { isSchoolOpen: true, updatedAt: new Date().toISOString() });
      callback(true);
    }
  });
}

export async function toggleSchoolStatusInDb(newIsOpen: boolean): Promise<void> {
  const docRef = doc(db, 'school_meta', 'status');
  await setDoc(docRef, { isSchoolOpen: newIsOpen, updatedAt: new Date().toISOString() }, { merge: true });
}

// ==========================================
// ADMIN ACCOUNT QUEUE & APPROVAL SERVICES
// ==========================================

export const LOCAL_STORAGE_PENDING_ADMIN_KEY = 'nrss_pending_admin_req_id';
export const LOCAL_STORAGE_DEVICE_ID_KEY = 'nrss_device_client_id';

export function getDeviceFingerprint(): { deviceId: string; deviceModel: string } {
  let deviceId = '';
  try {
    deviceId = localStorage.getItem(LOCAL_STORAGE_DEVICE_ID_KEY) || '';
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(LOCAL_STORAGE_DEVICE_ID_KEY, deviceId);
    }
  } catch (e) {
    deviceId = `dev_${Date.now()}_temp`;
  }

  let deviceModel = 'Web Browser';
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) deviceModel = 'Apple iOS Device';
    else if (/Android/i.test(ua)) deviceModel = 'Android Mobile Phone';
    else if (/Macintosh|Mac OS/i.test(ua)) deviceModel = 'macOS Desktop / Laptop';
    else if (/Windows/i.test(ua)) deviceModel = 'Windows PC';
    else if (/Linux/i.test(ua)) deviceModel = 'Linux Workstation';
  }

  return { deviceId, deviceModel };
}

export async function createAdminAccountRequest(data: {
  name: string;
  email: string;
  password: string;
  department?: string;
  employeeId?: string;
  dob?: string;
}): Promise<AdminRequest> {
  const cleanEmail = data.email.trim().toLowerCase();

  // 1. Check if an active user already exists with this email
  const usersSnap = await getDocs(collection(db, 'users'));
  const existingUser = usersSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);
  if (existingUser) {
    throw new Error('An account is already registered with this institutional email. Please sign in instead.');
  }

  // 2. Check if a pending admin request already exists with this email
  const reqsSnap = await getDocs(collection(db, 'admin_requests'));
  const existingPending = reqsSnap.docs.find(
    d => (d.data().email || '').toLowerCase() === cleanEmail && d.data().status === 'pending'
  );
  if (existingPending) {
    const existingData = existingPending.data();
    try {
      localStorage.setItem(LOCAL_STORAGE_PENDING_ADMIN_KEY, existingPending.id);
    } catch (e) {}
    throw new Error('An admin account application is already queued for this email and awaiting approval from administrators.');
  }

  const { deviceId, deviceModel } = getDeviceFingerprint();
  const requestId = `adm_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = await hashPassword(data.password);
  const nowIso = new Date().toISOString();

  const newRequest: AdminRequest = {
    id: requestId,
    name: data.name.trim(),
    email: cleanEmail,
    passwordHash: passwordHash,
    department: data.department?.trim() || 'Academic Administration',
    employeeId: data.employeeId?.trim() || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
    dob: data.dob || '1990-01-01',
    deviceId: deviceId,
    deviceModel: deviceModel,
    status: 'pending',
    requestedAt: nowIso
  };

  await setDoc(doc(db, 'admin_requests', requestId), sanitizeFirestoreData(newRequest));

  try {
    localStorage.setItem(LOCAL_STORAGE_PENDING_ADMIN_KEY, requestId);
  } catch (e) {}

  return newRequest;
}

export function subscribeToAdminRequests(callback: (requests: AdminRequest[]) => void) {
  const colRef = collection(db, 'admin_requests');

  return onSnapshot(colRef, (snapshot) => {
    const list: AdminRequest[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || 'Faculty Applicant',
        email: data.email || '',
        passwordHash: data.passwordHash,
        department: data.department || 'Faculty',
        employeeId: data.employeeId || 'FAC-000',
        dob: data.dob,
        deviceId: data.deviceId || '',
        deviceModel: data.deviceModel || 'Mobile Device',
        status: (data.status as AdminRequestStatus) || 'pending',
        requestedAt: data.requestedAt || new Date().toISOString(),
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        rejectionReason: data.rejectionReason
      };
    });

    list.sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''));
    callback(list);
  });
}

export function subscribeToDeviceAdminRequest(
  requestId: string,
  callback: (req: AdminRequest | null) => void
) {
  if (!requestId) {
    callback(null);
    return () => {};
  }

  const docRef = doc(db, 'admin_requests', requestId);
  return onSnapshot(docRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    const req: AdminRequest = {
      id: snap.id,
      name: data.name || 'Faculty Applicant',
      email: data.email || '',
      passwordHash: data.passwordHash,
      department: data.department || 'Faculty',
      employeeId: data.employeeId || 'FAC-000',
      dob: data.dob,
      deviceId: data.deviceId || '',
      deviceModel: data.deviceModel || 'Mobile Device',
      status: (data.status as AdminRequestStatus) || 'pending',
      requestedAt: data.requestedAt || new Date().toISOString(),
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
      rejectionReason: data.rejectionReason
    };
    callback(req);
  });
}

export async function approveAdminRequestInDb(requestId: string, adminName: string): Promise<void> {
  const reqRef = doc(db, 'admin_requests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) {
    throw new Error('Admin request not found in queue.');
  }

  const reqData = reqSnap.data();
  const nowIso = new Date().toISOString();

  // 1. Update the request status to approved
  await updateDoc(reqRef, {
    status: 'approved',
    approvedBy: adminName || 'Principal Administrator',
    approvedAt: nowIso
  });

  // 2. Provision / activate the Admin User Profile in `users` collection
  const userId = `usr_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const userProfile: User = {
    id: userId,
    name: reqData.name,
    role: 'teacher',
    email: reqData.email,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    gradeOrDept: reqData.department || 'Faculty Administration',
    employeeId: reqData.employeeId || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
    dob: reqData.dob || '1990-01-01'
  };

  await setDoc(doc(db, 'users', userId), sanitizeFirestoreData({
    ...userProfile,
    passwordHash: reqData.passwordHash || '',
    createdAt: nowIso,
    approvedBy: adminName
  }));
}

export async function rejectAdminRequestInDb(requestId: string, adminName: string, reason?: string): Promise<void> {
  const reqRef = doc(db, 'admin_requests', requestId);
  const nowIso = new Date().toISOString();

  await updateDoc(reqRef, {
    status: 'rejected',
    approvedBy: adminName,
    approvedAt: nowIso,
    rejectionReason: reason || 'Information could not be verified by Administration.'
  });
}

export async function cancelAdminRequestInDb(requestId: string): Promise<void> {
  const reqRef = doc(db, 'admin_requests', requestId);
  try {
    await deleteDoc(reqRef);
  } catch (e) {}

  try {
    localStorage.removeItem(LOCAL_STORAGE_PENDING_ADMIN_KEY);
  } catch (e) {}
}

export async function activateApprovedAdminOnDevice(requestId: string): Promise<User> {
  const reqRef = doc(db, 'admin_requests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) {
    throw new Error('Admin request not found.');
  }

  const reqData = reqSnap.data();
  if (reqData.status !== 'approved') {
    throw new Error('This request has not been approved by an administrator yet.');
  }

  // Find the created user document in users collection
  const usersSnap = await getDocs(collection(db, 'users'));
  const userDoc = usersSnap.docs.find(d => (d.data().email || '').toLowerCase() === reqData.email.toLowerCase());

  if (!userDoc) {
    throw new Error('User record was not found. Please contact the administrator.');
  }

  const userData = userDoc.data();
  const profile: User = {
    id: userDoc.id,
    name: userData.name || reqData.name,
    role: 'teacher',
    email: userData.email || reqData.email,
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    gradeOrDept: userData.gradeOrDept || reqData.department,
    employeeId: userData.employeeId || reqData.employeeId,
    dob: userData.dob || reqData.dob
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, userDoc.id);
    localStorage.removeItem(LOCAL_STORAGE_PENDING_ADMIN_KEY);
  } catch (e) {}

  return profile;
}

// ==========================================
// CAMPUS & SCHOOL SHOWCASE PHOTOS SERVICES
// ==========================================

export const INITIAL_CAMPUS_PHOTOS: CampusPhoto[] = [
  {
    id: 'campus-1',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80',
    title: 'N.R. College & Secondary School Academic Complex',
    description: 'Main administrative and classroom wing at Tarakeshwor-11 Nepaltar'
  },
  {
    id: 'campus-2',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    title: 'Central Research Library & Study Hall',
    description: 'Comprehensive academic resources and quiet study spaces'
  },
  {
    id: 'campus-3',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    title: 'Modern Science & Computer Laboratories',
    description: 'Practical training with state-of-the-art laboratory facilities'
  },
  {
    id: 'campus-4',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80',
    title: 'Interactive Classrooms & Lecture Halls',
    description: 'Spacious classrooms with modern multimedia teaching aids'
  },
  {
    id: 'campus-5',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80',
    title: 'Faculty Mentorship & Practical Learning',
    description: 'Experienced educators guiding student holistic development'
  },
  {
    id: 'campus-6',
    url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?auto=format&fit=crop&w=1600&q=80',
    title: 'Student Activities & Sports Grounds',
    description: 'Extracurricular events, athletics, and dynamic student life'
  }
];

export function subscribeToCampusPhotos(callback: (photos: CampusPhoto[]) => void) {
  const colRef = collection(db, 'campus_photos');
  const q = query(colRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      // Seed default photos if collection is empty
      try {
        const batch = writeBatch(db);
        INITIAL_CAMPUS_PHOTOS.forEach((photo, idx) => {
          const docRef = doc(db, 'campus_photos', photo.id);
          batch.set(docRef, sanitizeFirestoreData({
            ...photo,
            createdAt: Date.now() + idx
          }));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Seeding campus photos fallback:', err);
      }
      callback(INITIAL_CAMPUS_PHOTOS);
      return;
    }

    const photos: CampusPhoto[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        url: data.url || '',
        title: data.title || 'N.R. College Campus',
        description: data.description || '',
        uploadedBy: data.uploadedBy,
        uploadedAt: data.uploadedAt,
        createdAt: data.createdAt
      };
    });

    callback(photos);
  }, (error) => {
    console.warn('Error subscribing to campus photos, falling back to defaults:', error);
    callback(INITIAL_CAMPUS_PHOTOS);
  });
}

export async function addCampusPhotoToDb(photoData: Omit<CampusPhoto, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'campus_photos'), sanitizeFirestoreData({
    ...photoData,
    createdAt: photoData.createdAt || Date.now()
  }));
  return docRef.id;
}

export async function deleteCampusPhotoFromDb(id: string): Promise<void> {
  const docRef = doc(db, 'campus_photos', id);
  await deleteDoc(docRef);
}

export async function resetCampusPhotosInDb(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'campus_photos'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  INITIAL_CAMPUS_PHOTOS.forEach((photo, idx) => {
    const docRef = doc(db, 'campus_photos', photo.id);
    batch.set(docRef, sanitizeFirestoreData({
      ...photo,
      createdAt: Date.now() + idx
    }));
  });
  await batch.commit();
}

// ==========================================
// CLASS ROUTINES (GRADES 1-12) SERVICES
// ==========================================

export function subscribeToClassRoutines(callback: (routines: ClassRoutine[]) => void) {
  const colRef = collection(db, 'class_routines');
  const q = query(colRef, orderBy('orderIndex', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const routines: ClassRoutine[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        grade: data.grade || 'Grade 1',
        section: data.section || 'Sec A',
        title: data.title || `${data.grade || 'Grade 1'} ${data.section || 'Sec A'}`,
        shift: data.shift || 'Morning Shift',
        roomNo: data.roomNo || '',
        academicYear: data.academicYear || '2083 B.S.',
        imageUrl: data.imageUrl || '',
        fileName: data.fileName,
        fileType: data.fileType || 'image',
        notes: data.notes || '',
        uploadedBy: data.uploadedBy || 'Faculty',
        uploadedAt: data.uploadedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : (data.createdAt || Date.now()),
        createdAt: data.createdAt || Date.now()
      };
    });

    // Sort by orderIndex ascending (newest added stay in relative order requested)
    routines.sort((a, b) => a.orderIndex - b.orderIndex);
    callback(routines);
  }, (error) => {
    console.warn('Error subscribing to class routines:', error);
    callback([]);
  });
}

export async function addClassRoutineToDb(routineData: Omit<ClassRoutine, 'id'>): Promise<string> {
  let optimizedImageUrl = routineData.imageUrl;
  if (optimizedImageUrl && optimizedImageUrl.startsWith('data:image/') && optimizedImageUrl.length > 400000) {
    try {
      optimizedImageUrl = await compressDataUrl(optimizedImageUrl, 450000);
    } catch (e) {
      console.warn('Image optimization fallback:', e);
    }
  }

  const docRef = await addDoc(collection(db, 'class_routines'), sanitizeFirestoreData({
    ...routineData,
    imageUrl: optimizedImageUrl,
    createdAt: routineData.createdAt || Date.now(),
    orderIndex: typeof routineData.orderIndex === 'number' ? routineData.orderIndex : Date.now()
  }));
  return docRef.id;
}

export async function updateClassRoutineInDb(id: string, updates: Partial<ClassRoutine>): Promise<void> {
  const sanitizedUpdates: Partial<ClassRoutine> = { ...updates };
  if (sanitizedUpdates.imageUrl && sanitizedUpdates.imageUrl.startsWith('data:image/') && sanitizedUpdates.imageUrl.length > 400000) {
    try {
      sanitizedUpdates.imageUrl = await compressDataUrl(sanitizedUpdates.imageUrl, 450000);
    } catch (e) {
      console.warn('Image optimization fallback:', e);
    }
  }

  const docRef = doc(db, 'class_routines', id);
  await updateDoc(docRef, sanitizeFirestoreData(sanitizedUpdates));
}

export async function deleteClassRoutineFromDb(id: string): Promise<void> {
  const docRef = doc(db, 'class_routines', id);
  await deleteDoc(docRef);
}

export async function reorderClassRoutinesInDb(items: { id: string; orderIndex: number }[]): Promise<void> {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const docRef = doc(db, 'class_routines', item.id);
    batch.update(docRef, { orderIndex: item.orderIndex });
  });
  await batch.commit();
}


