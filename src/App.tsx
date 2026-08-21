import React, { useState, useEffect } from 'react';
import { User, ActiveTab, ChatRoom, ChatMessage, SchoolUpdate, SupportTicket, TeacherProfile } from './types';
import {
  subscribeToAuthProfile,
  signOutUserAccount,
  updateUserProfileInDb,
  subscribeToChatMessages,
  sendChatMessageToDb,
  toggleMessageReactionInDb,
  clearRoomChatMessagesFromDb,
  clearAllChatMessagesFromDb,
  subscribeToChatRooms,
  updateChatRoomNameInDb,
  updateChatRoomDetailsInDb,
  subscribeToSchoolUpdates,
  addSchoolUpdateToDb,
  updateSchoolUpdateInDb,
  deleteSchoolUpdateFromDb,
  togglePinSchoolUpdateInDb,
  clearAllSchoolUpdatesFromDb,
  subscribeToSupportTickets,
  createSupportTicketInDb,
  addTicketReplyInDb,
  updateSupportTicketStatusInDb,
  subscribeToSchoolStatus,
  toggleSchoolStatusInDb,
  subscribeToTeacherProfiles,
  addTeacherProfileToDb,
  updateTeacherProfileInDb,
  deleteTeacherProfileFromDb,
  clearAllTeacherProfilesFromDb
} from './lib/firebase';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AboutUsView } from './components/AboutUsView';
import { SchoolChatView } from './components/SchoolChatView';
import { SchoolUpdatesView } from './components/SchoolUpdatesView';
import { TeachersDirectoryView } from './components/TeachersDirectoryView';
import { ContactUsView } from './components/ContactUsView';
import { EditProfileModal } from './components/EditProfileModal';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Auth State synchronized with Firebase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Navigation State (defaults to 'about')
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cloud-synced state from Firestore
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [updates, setUpdates] = useState<SchoolUpdate[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSchoolOpen, setIsSchoolOpen] = useState<boolean>(true);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthProfile((user, loading) => {
      setCurrentUser(user);
      setAuthLoading(loading);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Firestore Real-time Collections
  useEffect(() => {
    const unsubMessages = subscribeToChatMessages((incomingMessages) => {
      setMessages(incomingMessages);
    });

    const unsubRooms = subscribeToChatRooms((incomingRooms) => {
      setChatRooms(incomingRooms);
    });

    const unsubUpdates = subscribeToSchoolUpdates((incomingUpdates) => {
      setUpdates(incomingUpdates);
    });

    const unsubTeachers = subscribeToTeacherProfiles((incomingTeachers) => {
      setTeachers(incomingTeachers);
    });

    const unsubTickets = subscribeToSupportTickets((incomingTickets) => {
      setTickets(incomingTickets);
    });

    const unsubStatus = subscribeToSchoolStatus((status) => {
      setIsSchoolOpen(status);
    });

    return () => {
      unsubMessages();
      unsubRooms();
      unsubUpdates();
      unsubTeachers();
      unsubTickets();
      unsubStatus();
    };
  }, []);

  // Reset scroll position on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('about');
  };

  const handleLogout = async () => {
    try {
      await signOutUserAccount();
      setCurrentUser(null);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // User Profile Update Handler (Name, Avatar/Logo, Dept/Grade, Custom ID, DOB) -> Firestore
  const handleSaveProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = await updateUserProfileInDb(currentUser.id, updates);
    setCurrentUser(updated);
  };

  // Helper for 12-hour timestamp formatting
  const getFormattedCurrentTime = (): string => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  // Chat Message Handler -> Firestore
  const handleSendMessage = async (
    roomId: string,
    content: string,
    attachment?: {
      name: string;
      size: string;
      type: 'pdf' | 'doc' | 'image' | 'archive' | 'code';
      url?: string;
    }
  ) => {
    if (!currentUser) return;

    const currentTime = getFormattedCurrentTime();

    await sendChatMessageToDb({
      roomId: roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      senderTitle: currentUser.gradeOrDept,
      content: content,
      timestamp: currentTime,
      attachment: attachment,
      reactions: {}
    });
  };

  // Group / Channel Rename & Details/Logo Handler for Admins -> Firestore
  const handleRenameRoom = async (roomId: string, newName: string) => {
    if (!currentUser || currentUser.role !== 'teacher' || !newName.trim()) return;
    await updateChatRoomNameInDb(roomId, newName.trim());
  };

  const handleUpdateChatRoom = async (roomId: string, updates: Partial<ChatRoom>) => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    await updateChatRoomDetailsInDb(roomId, updates);
  };

  // Chat Wiping Handlers for Admins/Teachers -> Firestore
  const handleWipeRoomMessages = async (roomId: string) => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    await clearRoomChatMessagesFromDb(roomId);
  };

  const handleWipeAllChatMessages = async () => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    await clearAllChatMessagesFromDb();
  };

  // Add Emoji Reaction Handler -> Firestore
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    await toggleMessageReactionInDb(messageId, emoji, currentUser.name);
  };

  // School Updates Handlers -> Firestore
  const handleAddUpdate = async (newUpdateData: Omit<SchoolUpdate, 'id' | 'date' | 'time'>) => {
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeFormatted = today.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    await addSchoolUpdateToDb({
      ...newUpdateData,
      date: dateFormatted,
      time: timeFormatted
    });
  };

  const handleEditUpdate = async (id: string, updatedFields: Partial<SchoolUpdate>) => {
    await updateSchoolUpdateInDb(id, updatedFields);
  };

  const handleDeleteUpdate = async (id: string) => {
    await deleteSchoolUpdateFromDb(id);
  };

  const handleTogglePinUpdate = async (id: string) => {
    const item = updates.find(u => u.id === id);
    if (!item) return;
    await togglePinSchoolUpdateInDb(id, !!item.pinned);
  };

  const handleClearAllUpdates = async () => {
    await clearAllSchoolUpdatesFromDb();
  };

  // Faculty & Teachers Directory Handlers -> Firestore
  const handleAddTeacher = async (newTeacherData: Omit<TeacherProfile, 'id'>) => {
    return await addTeacherProfileToDb(newTeacherData);
  };

  const handleEditTeacher = async (id: string, updatedFields: Partial<TeacherProfile>) => {
    await updateTeacherProfileInDb(id, updatedFields);
  };

  const handleDeleteTeacher = async (id: string) => {
    await deleteTeacherProfileFromDb(id);
  };

  const handleClearAllTeachers = async () => {
    await clearAllTeacherProfilesFromDb();
  };

  // Support Ticket Handlers -> Firestore
  const handleCreateTicket = async (
    newTicketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'replies'>
  ) => {
    await createSupportTicketInDb(newTicketData);
  };

  const handleAddTicketReply = async (ticketId: string, replyContent: string) => {
    if (!currentUser) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content: replyContent,
      timestamp: 'Just now'
    };

    await addTicketReplyInDb(ticketId, newReply);
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    await updateSupportTicketStatusInDb(ticketId, newStatus);
  };

  const handleToggleSchoolStatus = async () => {
    await toggleSchoolStatusInDb(!isSchoolOpen);
  };

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-medium text-slate-400">Loading NRSS Academy Cloud Portal...</p>
      </div>
    );
  }

  // If user is not logged in, display the Firebase Auth / Login Gateway
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div
      id="school-portal-root"
      className={`bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        activeTab === 'chat'
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-screen'
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        activeTab={activeTab}
      />

      {/* Expandable Navigation Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        updatesCount={updates.filter(u => u.priority === 'urgent').length}
      />

      {/* User Profile Edit & Logo Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <EditProfileModal
            currentUser={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>

      {/* Main Content View with Smooth Transitions */}
      <main
        className={`w-full mx-auto ${
          activeTab === 'chat'
            ? 'flex-1 min-h-0 max-w-7xl px-2 sm:px-4 py-2 overflow-hidden flex flex-col'
            : 'flex-1 max-w-7xl px-4 sm:px-6 py-6'
        }`}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AboutUsView
                onExploreChat={() => setActiveTab('chat')}
                onExploreUpdates={() => setActiveTab('updates')}
                onExploreTeachers={() => setActiveTab('teachers')}
                isSchoolOpen={isSchoolOpen}
                onToggleSchoolStatus={handleToggleSchoolStatus}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="h-full w-full flex-1 min-h-0 overflow-hidden flex flex-col"
            >
              <SchoolChatView
                currentUser={currentUser}
                messages={messages}
                rooms={chatRooms}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
                onRenameRoom={handleRenameRoom}
                onUpdateRoom={handleUpdateChatRoom}
                onWipeRoomMessages={handleWipeRoomMessages}
                onWipeAllMessages={handleWipeAllChatMessages}
                onSendMessage={handleSendMessage}
                onAddReaction={handleAddReaction}
              />
            </motion.div>
          )}

          {activeTab === 'updates' && (
            <motion.div
              key="updates-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SchoolUpdatesView
                currentUser={currentUser}
                updates={updates}
                onAddUpdate={handleAddUpdate}
                onEditUpdate={handleEditUpdate}
                onDeleteUpdate={handleDeleteUpdate}
                onTogglePinUpdate={handleTogglePinUpdate}
                onClearAllUpdates={handleClearAllUpdates}
              />
            </motion.div>
          )}

          {activeTab === 'teachers' && (
            <motion.div
              key="teachers-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TeachersDirectoryView
                currentUser={currentUser}
                teachers={teachers}
                onAddTeacher={handleAddTeacher}
                onEditTeacher={handleEditTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onClearAllTeachers={handleClearAllTeachers}
              />
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ContactUsView
                currentUser={currentUser}
                tickets={tickets}
                onCreateTicket={handleCreateTicket}
                onAddTicketReply={handleAddTicketReply}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
