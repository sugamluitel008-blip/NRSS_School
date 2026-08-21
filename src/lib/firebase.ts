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
  getFirestore,
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
import { User, ChatMessage, ChatRoom, SchoolUpdate, SupportTicket, TicketReply, TeacherProfile } from '../types';
import { CHAT_ROOMS, INITIAL_SCHOOL_UPDATES, INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { getDocFromServer } from 'firebase/firestore';

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

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Test Firestore Connection
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'school_meta', 'status'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check:", error.message);
    }
  }
}
testFirestoreConnection();

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
    if (authErr?.code !== 'auth/operation-not-allowed' && authErr?.code !== 'auth/configuration-not-found') {
      // Re-throw genuine credential errors if auth is active
      if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential') {
        throw authErr;
      }
    }
  }

  // Firestore direct fallback lookup
  const usersSnap = await getDocs(collection(db, 'users'));
  const userDocMatch = usersSnap.docs.find(d => (d.data().email || '').toLowerCase() === cleanEmail);

  if (!userDocMatch) {
    throw new Error('No account found with this email. Please register your account first.');
  }

  const userData = userDocMatch.data();
  const expectedHash = userData.passwordHash;
  const inputHash = await hashPassword(pass);

  if (expectedHash && expectedHash !== inputHash && expectedHash !== pass) {
    throw new Error('Invalid password. Please check your credentials and try again.');
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
