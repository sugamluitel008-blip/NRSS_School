import React, { useState, useRef, useEffect } from 'react';
import { User, ChatRoom, ChatMessage } from '../types';
import { CHAT_ROOMS } from '../data/mockData';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  School,
  FolderSync,
  Megaphone,
  Lock,
  FileText,
  Download,
  ShieldCheck,
  X,
  Info,
  Users,
  CircleDot,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronLeft,
  Upload,
  ZoomIn,
  Pencil,
  Check,
  Settings,
  Palette,
  Trash2,
  AlertTriangle,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ChatTheme {
  id: string;
  name: string;
  dotColor: string;
  outerBg: string;
  sidebarBg: string;
  sidebarHeaderBg: string;
  sidebarBorder: string;
  chatAreaBg: string;
  chatPattern: string;
  chatHeaderBg: string;
  myBubbleBg: string;
  otherBubbleBg: string;
  inputBarBg: string;
  inputBoxBg: string;
  primaryAccent: string;
  badgeBg: string;
  textColor: string;
  subTextColor: string;
  isLight?: boolean;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: 'amber',
    name: 'Warm Espresso',
    dotColor: '#f59e0b',
    outerBg: 'bg-[#120e0b]',
    sidebarBg: 'bg-[#120e0b]',
    sidebarHeaderBg: 'bg-[#241c16]',
    sidebarBorder: 'border-[#382d25]',
    chatAreaBg: '#0c0806',
    chatPattern: '#292019',
    chatHeaderBg: 'bg-[#241c16]',
    myBubbleBg: 'bg-[#b45309]',
    otherBubbleBg: 'bg-[#241c16]',
    inputBarBg: 'bg-[#241c16]',
    inputBoxBg: 'bg-[#18120e]',
    primaryAccent: '#f59e0b',
    badgeBg: 'bg-[#1b140f]',
    textColor: 'text-white',
    subTextColor: 'text-amber-200/60'
  },
  {
    id: 'emerald',
    name: 'WhatsApp Emerald',
    dotColor: '#00a884',
    outerBg: 'bg-[#111b21]',
    sidebarBg: 'bg-[#111b21]',
    sidebarHeaderBg: 'bg-[#202c33]',
    sidebarBorder: 'border-[#222e35]',
    chatAreaBg: '#0b141a',
    chatPattern: '#1f2c34',
    chatHeaderBg: 'bg-[#202c33]',
    myBubbleBg: 'bg-[#005c4b]',
    otherBubbleBg: 'bg-[#202c33]',
    inputBarBg: 'bg-[#202c33]',
    inputBoxBg: 'bg-[#2a3942]',
    primaryAccent: '#00a884',
    badgeBg: 'bg-[#182229]',
    textColor: 'text-white',
    subTextColor: 'text-[#8696a0]'
  },
  {
    id: 'slate',
    name: 'Midnight Slate',
    dotColor: '#38bdf8',
    outerBg: 'bg-[#0b0f19]',
    sidebarBg: 'bg-[#0b0f19]',
    sidebarHeaderBg: 'bg-[#1e293b]',
    sidebarBorder: 'border-slate-800',
    chatAreaBg: '#070a12',
    chatPattern: '#1e293b',
    chatHeaderBg: 'bg-[#1e293b]',
    myBubbleBg: 'bg-[#2563eb]',
    otherBubbleBg: 'bg-[#1e293b]',
    inputBarBg: 'bg-[#1e293b]',
    inputBoxBg: 'bg-[#0f172a]',
    primaryAccent: '#38bdf8',
    badgeBg: 'bg-[#0f172a]',
    textColor: 'text-white',
    subTextColor: 'text-slate-400'
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    dotColor: '#a78bfa',
    outerBg: 'bg-[#0c0a1a]',
    sidebarBg: 'bg-[#0c0a1a]',
    sidebarHeaderBg: 'bg-[#1a1733]',
    sidebarBorder: 'border-[#2d2850]',
    chatAreaBg: '#080612',
    chatPattern: '#262247',
    chatHeaderBg: 'bg-[#1a1733]',
    myBubbleBg: 'bg-[#6366f1]',
    otherBubbleBg: 'bg-[#1a1733]',
    inputBarBg: 'bg-[#1a1733]',
    inputBoxBg: 'bg-[#110f22]',
    primaryAccent: '#a78bfa',
    badgeBg: 'bg-[#141226]',
    textColor: 'text-white',
    subTextColor: 'text-indigo-300/60'
  },
  {
    id: 'crimson',
    name: 'Crimson Rose',
    dotColor: '#fb7185',
    outerBg: 'bg-[#140a10]',
    sidebarBg: 'bg-[#140a10]',
    sidebarHeaderBg: 'bg-[#27131f]',
    sidebarBorder: 'border-[#3f1f33]',
    chatAreaBg: '#0d050a',
    chatPattern: '#2d1424',
    chatHeaderBg: 'bg-[#27131f]',
    myBubbleBg: 'bg-[#e11d48]',
    otherBubbleBg: 'bg-[#27131f]',
    inputBarBg: 'bg-[#27131f]',
    inputBoxBg: 'bg-[#190b14]',
    primaryAccent: '#fb7185',
    badgeBg: 'bg-[#1a0e16]',
    textColor: 'text-white',
    subTextColor: 'text-rose-300/60'
  },
  {
    id: 'nordic',
    name: 'Pure Charcoal',
    dotColor: '#e2e8f0',
    outerBg: 'bg-[#000000]',
    sidebarBg: 'bg-[#0a0a0a]',
    sidebarHeaderBg: 'bg-[#171717]',
    sidebarBorder: 'border-neutral-800',
    chatAreaBg: '#050505',
    chatPattern: '#262626',
    chatHeaderBg: 'bg-[#171717]',
    myBubbleBg: 'bg-[#262626]',
    otherBubbleBg: 'bg-[#171717]',
    inputBarBg: 'bg-[#171717]',
    inputBoxBg: 'bg-[#0a0a0a]',
    primaryAccent: '#f59e0b',
    badgeBg: 'bg-[#121212]',
    textColor: 'text-white',
    subTextColor: 'text-neutral-400'
  }
];

export const PRESET_CHAT_LOGOS = [
  {
    id: 'crest_official',
    name: 'NRSS Official Seal',
    url: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=300&auto=format&fit=crop&q=80',
    category: 'Official'
  },
  {
    id: 'academic_shield',
    name: 'Academic Excellence Shield',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&auto=format&fit=crop&q=80',
    category: 'Academics'
  },
  {
    id: 'stem_tech',
    name: 'Science & Robotics Lab',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80',
    category: 'STEM'
  },
  {
    id: 'faculty_lounge',
    name: 'Executive Faculty Seal',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&auto=format&fit=crop&q=80',
    category: 'Faculty'
  },
  {
    id: 'notices_bulletin',
    name: 'Official Broadcast & Notices',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=80',
    category: 'Notices'
  },
  {
    id: 'library_docs',
    name: 'Institutional Archives & Docs',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80',
    category: 'Resources'
  },
  {
    id: 'sports_athletics',
    name: 'NRSS Sports & Athletics',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&auto=format&fit=crop&q=80',
    category: 'Sports'
  },
  {
    id: 'arts_culture',
    name: 'Arts & Cultural Heritage',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80',
    category: 'Arts'
  }
];

export const PRESET_EMOJIS = [
  '🏫', '🎓', '📚', '🔬', '🛡️', '⚡', '🏆', '📢', '💬', '🔒', '📂', '🌟', '🎖️', '💡', '🪐', '🎯', '👨‍🏫', '👩‍🎓', '💻', '🎨'
];

interface SchoolChatViewProps {
  currentUser: User;
  messages: ChatMessage[];
  rooms?: ChatRoom[];
  onOpenProfileModal?: () => void;
  onRenameRoom?: (roomId: string, newName: string) => void;
  onUpdateRoom?: (roomId: string, updates: Partial<ChatRoom>) => void;
  onWipeRoomMessages?: (roomId: string) => void;
  onWipeAllMessages?: () => void;
  onSendMessage: (
    roomId: string,
    content: string,
    attachment?: {
      name: string;
      size: string;
      type: 'pdf' | 'doc' | 'image' | 'archive' | 'code';
      url?: string;
    }
  ) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
}

export const SchoolChatView: React.FC<SchoolChatViewProps> = ({
  currentUser,
  messages,
  rooms = CHAT_ROOMS,
  onOpenProfileModal,
  onRenameRoom,
  onUpdateRoom,
  onWipeRoomMessages,
  onWipeAllMessages,
  onSendMessage,
  onAddReaction
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const allRooms = rooms && rooms.length > 0 ? rooms : CHAT_ROOMS;

  // For students: ONLY 1 single chat ('school-main' - Admin & User Chat)
  // For teachers/admins: All channels with selectable sections
  const accessibleRooms: ChatRoom[] = isTeacher
    ? allRooms
    : allRooms.filter(r => r.id === 'school-main');

  const [activeRoomId, setActiveRoomId] = useState<string>('school-main');
  const [adminSectionFilter, setAdminSectionFilter] = useState<'student' | 'admin'>('student');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showInputEmojiTray, setShowInputEmojiTray] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; name: string } | null>(null);

  // Chat Custom Theme State (Defaults to Warm Espresso)
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('nrss_chat_theme') || 'amber';
  });
  const [showThemeModal, setShowThemeModal] = useState(false);

  const activeTheme = CHAT_THEMES.find(t => t.id === selectedThemeId) || CHAT_THEMES[0];

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    localStorage.setItem('nrss_chat_theme', themeId);
    setShowThemeModal(false);
  };

  // Accurate Display Time Helper (converts to e.g. "12:01 am", "9:00 pm")
  const cleanDisplayTime = (timestamp?: string): string => {
    if (!timestamp) return '12:00 pm';
    if (timestamp.toLowerCase().includes('just now')) {
      return new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    }
    let cleaned = timestamp.replace(/^Today at\s*/i, '').replace(/^Yesterday at\s*/i, '').trim();
    cleaned = cleaned.replace(/\s*(AM|PM)\b/i, (m) => ' ' + m.trim().toLowerCase());
    return cleaned;
  };

  // Admin Room Settings & Logo Customizer Modal State
  const [roomSettingsModal, setRoomSettingsModal] = useState<ChatRoom | null>(null);
  const [editRoomNameInput, setEditRoomNameInput] = useState('');
  const [editRoomDescInput, setEditRoomDescInput] = useState('');
  const [editLogoUrlInput, setEditLogoUrlInput] = useState('');
  const [editIconInput, setEditIconInput] = useState('');
  const [logoTab, setLogoTab] = useState<'preset' | 'upload' | 'url' | 'emoji'>('preset');
  const [isSavingRoomSettings, setIsSavingRoomSettings] = useState(false);

  // Admin Chat Wiping Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeScope, setWipeScope] = useState<'current' | 'all'>('current');
  const [isWipingMessages, setIsWipingMessages] = useState(false);

  // Attached file state (supports real uploaded photos and files with data URLs)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image' | 'archive' | 'code';
    url?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const roomLogoInputRef = useRef<HTMLInputElement>(null);

  // Filtered rooms in sidebar
  const displayedRooms = accessibleRooms.filter(room => {
    if (isTeacher) {
      if (adminSectionFilter === 'student') {
        if (room.access === 'teacher_only') return false;
      } else if (adminSectionFilter === 'admin') {
        if (room.access !== 'teacher_only') return false;
      }
    }
    if (searchQuery.trim()) {
      return (
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Active room data
  const currentRoom = accessibleRooms.find(r => r.id === activeRoomId) || accessibleRooms[0];
  const currentRoomMessages = messages.filter(m => m.roomId === currentRoom.id);

  // In-chat filtered messages
  const filteredMessages = inChatSearchQuery.trim()
    ? currentRoomMessages.filter(
        m =>
          m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(inChatSearchQuery.toLowerCase())
      )
    : currentRoomMessages;

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoomMessages.length, activeRoomId]);

  // Open Room Settings & Logo Modal
  const handleOpenRoomSettings = (room: ChatRoom) => {
    setRoomSettingsModal(room);
    setEditRoomNameInput(room.name);
    setEditRoomDescInput(room.description || '');
    setEditLogoUrlInput(room.logoUrl || '');
    setEditIconInput(room.icon || 'School');
    setLogoTab(room.logoUrl ? (room.logoUrl.startsWith('data:') ? 'upload' : 'preset') : 'preset');
  };

  // Handle Room Logo File Upload
  const handleRoomLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditLogoUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save Room Name, Description & Logo
  const handleSaveRoomSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomSettingsModal || !editRoomNameInput.trim()) return;

    setIsSavingRoomSettings(true);
    try {
      if (onUpdateRoom) {
        await onUpdateRoom(roomSettingsModal.id, {
          name: editRoomNameInput.trim(),
          description: editRoomDescInput.trim(),
          logoUrl: editLogoUrlInput.trim() || undefined,
          icon: editIconInput.trim() || 'School'
        });
      } else if (onRenameRoom) {
        await onRenameRoom(roomSettingsModal.id, editRoomNameInput.trim());
      }
      setRoomSettingsModal(null);
    } catch (err) {
      console.error('Failed to update room settings:', err);
    } finally {
      setIsSavingRoomSettings(false);
    }
  };

  // Execute Chat Wiping
  const handleConfirmWipe = async () => {
    setIsWipingMessages(true);
    try {
      if (wipeScope === 'current') {
        if (onWipeRoomMessages) {
          await onWipeRoomMessages(currentRoom.id);
        }
      } else {
        if (onWipeAllMessages) {
          await onWipeAllMessages();
        }
      }
      setShowWipeModal(false);
    } catch (err) {
      console.error('Failed to wipe messages:', err);
    } finally {
      setIsWipingMessages(false);
    }
  };

  // Handle Photo File Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: 'image',
        url: reader.result as string
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Document File Selection
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let fileType: 'pdf' | 'doc' | 'archive' = 'doc';
    if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
      fileType = 'archive';
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: fileType,
        url: reader.result as string
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: isImg ? 'image' : file.name.endsWith('.pdf') ? 'pdf' : 'doc',
        url: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    onSendMessage(currentRoom.id, inputText.trim(), attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
    setShowInputEmojiTray(false);
    setShowAttachMenu(false);
  };

  const handleDownloadFile = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) {
      alert(`Preparing institutional download for: ${fileName || 'Document'}`);
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'NRSS_Document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSenderColor = (name: string, role: string) => {
    if (role === 'teacher') return 'text-amber-400';
    const colors = [
      'text-emerald-400',
      'text-sky-400',
      'text-indigo-400',
      'text-teal-400',
      'text-rose-400',
      'text-violet-400'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const getLastMessage = (roomId: string) => {
    const roomMsgs = messages.filter(m => m.roomId === roomId);
    if (roomMsgs.length === 0) return null;
    return roomMsgs[roomMsgs.length - 1];
  };

  const renderRoomAvatar = (room: ChatRoom, sizeClass: string = 'w-11 h-11', iconSizeClass: string = 'w-5 h-5') => {
    const isUserAdminGroup = room.id === 'school-main';

    if (room.logoUrl) {
      return (
        <img
          src={room.logoUrl}
          alt={room.name}
          className={`${sizeClass} rounded-full object-cover shadow-md border`}
          style={{ borderColor: `${activeTheme.primaryAccent}60` }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to gradient icon on image error
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shadow-md ${
          isUserAdminGroup
            ? 'bg-gradient-to-tr from-emerald-600 to-teal-700'
            : room.id === 'faculty-lounge'
            ? 'bg-gradient-to-tr from-amber-600 to-orange-700'
            : room.id === 'doc-transfer'
            ? 'bg-gradient-to-tr from-sky-600 to-indigo-700'
            : 'bg-gradient-to-tr from-indigo-600 to-purple-700'
        }`}
      >
        {isUserAdminGroup ? (
          <School className={iconSizeClass} />
        ) : room.id === 'faculty-lounge' ? (
          <Lock className={iconSizeClass} />
        ) : room.id === 'doc-transfer' ? (
          <FolderSync className={iconSizeClass} />
        ) : (
          <Megaphone className={iconSizeClass} />
        )}
      </div>
    );
  };

  const quickEmojis = ['👍', '❤️', '👏', '🙏', '🔥', '💡', '✅', '🎉'];

  return (
    <div id="whatsapp-school-chat-view" className="h-full w-full flex-1 min-h-0 flex flex-col">
      {/* Hidden File Input Pickers */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocSelect}
        accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.txt,.zip,.rar"
        className="hidden"
      />
      <input
        type="file"
        ref={roomLogoInputRef}
        onChange={handleRoomLogoFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Screen-Fitted Container */}
      <div className={`h-full w-full flex-1 min-h-0 ${activeTheme.outerBg} rounded-2xl sm:rounded-3xl border ${activeTheme.sidebarBorder} shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors duration-300`}>
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: Chat List & Admin Selectable Tabs           */}
        {/* ========================================================= */}
        <aside
          className={`w-full md:w-80 lg:w-96 ${activeTheme.sidebarBg} border-r ${activeTheme.sidebarBorder} flex flex-col shrink-0 h-full min-h-0 transition-colors duration-300 ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Profile & Header */}
          <div className={`px-4 py-3 ${activeTheme.sidebarHeaderBg} flex items-center justify-between border-b ${activeTheme.sidebarBorder} shrink-0`}>
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="flex items-center gap-3 text-left hover:opacity-90 group transition p-1 -ml-1 rounded-xl"
              title="Click to Edit Profile & Logo"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border group-hover:scale-105 transition"
                  style={{ borderColor: `${activeTheme.primaryAccent}60` }}
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] shadow opacity-70 group-hover:opacity-100 transition"
                  style={{ backgroundColor: activeTheme.primaryAccent }}
                >
                  <Camera className="w-2 h-2" />
                </div>
              </div>
              <div>
                <div className={`text-xs sm:text-sm font-bold ${activeTheme.textColor} flex items-center gap-1.5`}>
                  <span className="truncate max-w-[130px] sm:max-w-[150px] group-hover:underline">{currentUser.name}</span>
                  <span className="text-[10px] opacity-70 font-normal group-hover:opacity-100" style={{ color: activeTheme.primaryAccent }}>Edit</span>
                </div>
                <div className={`text-[10px] ${activeTheme.subTextColor} flex items-center gap-1.5 font-medium`}>
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: activeTheme.dotColor }}
                  />
                  <span>Online</span>
                </div>
              </div>
            </button>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className={`p-2 rounded-full hover:bg-white/10 ${activeTheme.subTextColor} hover:${activeTheme.textColor} transition flex items-center gap-1 text-xs`}
                title="Change Chat Theme"
              >
                <Palette className="w-4 h-4" style={{ color: activeTheme.primaryAccent }} />
                <span className="hidden sm:inline text-[10px] font-semibold">{activeTheme.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* ADMIN SELECTABLE SECTIONS (Visible for Admin/Teachers: Student Chat vs Admin Chat) */}
          {isTeacher ? (
            <div className={`px-3 pt-2.5 pb-2.5 ${activeTheme.sidebarBg} border-b ${activeTheme.sidebarBorder} space-y-1.5 shrink-0`}>
              <div className={`flex items-center justify-between text-[10px] font-bold ${activeTheme.subTextColor} uppercase tracking-wider px-1`}>
                <span className="flex items-center gap-1" style={{ color: activeTheme.primaryAccent }}>
                  <ShieldCheck className="w-3 h-3" />
                  Staff Categories
                </span>
                <span className="text-[9px] font-semibold" style={{ color: activeTheme.primaryAccent }}>Admin Mode</span>
              </div>

              {/* Selectable Category Tabs: Student Chat & Admin Chat */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAdminSectionFilter('student');
                    if (currentRoom.access === 'teacher_only') {
                      const studentRoom = accessibleRooms.find(r => r.access !== 'teacher_only');
                      if (studentRoom) setActiveRoomId(studentRoom.id);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminSectionFilter === 'student'
                      ? 'text-slate-950 shadow-md font-extrabold'
                      : `${activeTheme.sidebarHeaderBg} ${activeTheme.subTextColor} hover:${activeTheme.textColor}`
                  }`}
                  style={adminSectionFilter === 'student' ? { backgroundColor: activeTheme.primaryAccent } : {}}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Student Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminSectionFilter('admin');
                    if (currentRoom.access !== 'teacher_only') {
                      const adminRoom = accessibleRooms.find(r => r.access === 'teacher_only');
                      if (adminRoom) setActiveRoomId(adminRoom.id);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminSectionFilter === 'admin'
                      ? 'text-slate-950 shadow-md font-extrabold'
                      : `${activeTheme.sidebarHeaderBg} ${activeTheme.subTextColor} hover:${activeTheme.textColor}`
                  }`}
                  style={adminSectionFilter === 'admin' ? { backgroundColor: activeTheme.primaryAccent } : {}}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Chat</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`px-4 py-2.5 ${activeTheme.badgeBg} border-b ${activeTheme.sidebarBorder} flex items-center justify-between text-xs ${activeTheme.subTextColor} shrink-0`}>
              <div className="flex items-center gap-2">
                <School className="w-4 h-4" style={{ color: activeTheme.primaryAccent }} />
                <span className={`font-semibold ${activeTheme.textColor} text-xs`}>School Community Chat</span>
              </div>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium border"
                style={{
                  color: activeTheme.primaryAccent,
                  backgroundColor: `${activeTheme.primaryAccent}18`,
                  borderColor: `${activeTheme.primaryAccent}30`
                }}
              >
                Active
              </span>
            </div>
          )}

          {/* Search Bar */}
          <div className={`p-2.5 ${activeTheme.sidebarBg} shrink-0`}>
            <div className={`relative flex items-center ${activeTheme.inputBoxBg} rounded-xl px-3 py-2 focus-within:ring-1 border ${activeTheme.sidebarBorder}`} style={{ '--tw-ring-color': activeTheme.primaryAccent } as React.CSSProperties}>
              <Search className={`w-3.5 h-3.5 ${activeTheme.subTextColor} shrink-0`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className={`w-full bg-transparent text-xs ${activeTheme.textColor} placeholder:${activeTheme.subTextColor} px-2 focus:outline-none`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`${activeTheme.subTextColor} hover:${activeTheme.textColor}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className={`flex-1 min-h-0 overflow-y-auto divide-y ${activeTheme.sidebarBorder}/60 custom-scrollbar`}>
            {displayedRooms.length === 0 ? (
              <div className={`p-6 text-center ${activeTheme.subTextColor} text-xs`}>
                No chats found for this filter.
              </div>
            ) : (
              displayedRooms.map(room => {
                const isActive = room.id === activeRoomId;
                const lastMsg = getLastMessage(room.id);

                return (
                  <div
                    key={room.id}
                    className={`w-full group flex items-center transition relative ${
                      isActive
                        ? activeTheme.sidebarHeaderBg
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRoomId(room.id);
                        setMobileChatOpen(true);
                        setShowInChatSearch(false);
                      }}
                      className="flex-1 px-3.5 py-3 flex items-center gap-3 text-left min-w-0"
                    >
                      {/* Chat Avatar with Custom Logo support */}
                      <div className="relative shrink-0">
                        {renderRoomAvatar(room, 'w-11 h-11', 'w-5 h-5')}
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                          style={{
                            backgroundColor: activeTheme.dotColor,
                            borderColor: activeTheme.isLight ? '#ffffff' : '#111b21'
                          }}
                        />
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 truncate">
                            <h4 className={`text-xs sm:text-sm font-semibold ${activeTheme.textColor} truncate`}>
                              {room.name}
                            </h4>
                          </div>
                          <span className={`text-[10px] ${activeTheme.subTextColor} shrink-0 font-medium`}>
                            {cleanDisplayTime(lastMsg?.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-[11px] ${activeTheme.subTextColor} truncate pr-2 flex items-center gap-1`}>
                            {lastMsg ? (
                              <>
                                <span className={`font-semibold ${activeTheme.textColor}`}>
                                  {lastMsg.senderId === currentUser.id ? 'You' : lastMsg.senderName.split(' ')[0]}:
                                </span>{' '}
                                <span className="truncate">{lastMsg.content || (lastMsg.attachment ? `[${lastMsg.attachment.type.toUpperCase()}] ${lastMsg.attachment.name}` : '')}</span>
                              </>
                            ) : (
                              <span className="italic">{room.description}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Admin Settings & Logo Customizer Quick Trigger */}
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenRoomSettings(room);
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition p-2 mr-2 ${activeTheme.subTextColor} hover:text-amber-300 hover:bg-white/10 rounded-lg`}
                        title="Edit Channel & Logo (Admin)"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Student Footer Note */}
          {!isTeacher && (
            <div className={`p-3 ${activeTheme.badgeBg} border-t ${activeTheme.sidebarBorder} text-[11px] ${activeTheme.subTextColor} flex items-center gap-2.5 shrink-0`}>
              <Info className="w-4 h-4 shrink-0" style={{ color: activeTheme.primaryAccent }} />
              <span>
                You are in the <strong className={activeTheme.textColor}>School Community</strong> channel with teachers and students.
              </span>
            </div>
          )}
        </aside>

        {/* ========================================================= */}
        {/* RIGHT MAIN PANE: WhatsApp Active Conversation Canvas      */}
        {/* ========================================================= */}
        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 flex flex-col h-full min-h-0 relative transition-colors duration-300 overflow-hidden"
          style={{ backgroundColor: activeTheme.chatAreaBg }}
        >
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm border-2 border-dashed flex flex-col items-center justify-center text-white space-y-2 pointer-events-none" style={{ borderColor: activeTheme.primaryAccent }}>
              <div className="w-16 h-16 rounded-2xl border flex items-center justify-center animate-bounce" style={{ backgroundColor: `${activeTheme.primaryAccent}20`, borderColor: activeTheme.primaryAccent, color: activeTheme.primaryAccent }}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold" style={{ color: activeTheme.primaryAccent }}>Drop file or photo here</div>
              <div className="text-xs text-slate-400">Instantly attach to send in NRSS Chat</div>
            </div>
          )}

          {/* WhatsApp Chat Header */}
          <header className={`px-4 py-2 ${activeTheme.chatHeaderBg} border-b ${activeTheme.sidebarBorder} flex items-center justify-between z-10 shrink-0 transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              {/* Mobile Back to Chat List */}
              <button
                type="button"
                onClick={() => setMobileChatOpen(false)}
                className={`md:hidden p-1 -ml-1 ${activeTheme.subTextColor} hover:${activeTheme.textColor} rounded-full`}
                title="Back to Chats"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Chat Avatar (clickable for Admins to change logo) */}
              <div className="relative group/avatar">
                {renderRoomAvatar(currentRoom, 'w-9 h-9', 'w-4 h-4')}
                <span
                  className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2"
                  style={{
                    backgroundColor: activeTheme.dotColor,
                    borderColor: activeTheme.isLight ? '#ffffff' : '#202c33'
                  }}
                />
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => handleOpenRoomSettings(currentRoom)}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition flex items-center justify-center text-white text-[9px]"
                    title="Change Channel Logo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Chat Title & Admin Actions */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs sm:text-sm font-bold ${activeTheme.textColor} flex items-center gap-1.5 truncate`}>
                    <span>{currentRoom.name}</span>
                  </h3>

                  {/* Admin Channel & Logo Edit Quick Button */}
                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => handleOpenRoomSettings(currentRoom)}
                      className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition flex items-center gap-1 text-[10px] font-medium"
                      title="Edit Channel Logo & Name"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline text-[9px] text-amber-300">Edit Logo</span>
                    </button>
                  )}
                </div>

                <p className={`text-[10px] ${activeTheme.subTextColor} truncate max-w-[200px] sm:max-w-md`}>
                  {currentRoom.id === 'school-main'
                    ? 'Principal Govinda Timalsina, Faculty, and students'
                    : currentRoom.description}
                </p>
              </div>
            </div>

            {/* WhatsApp Header Actions: Chat Wipe, Search, Theme & Channel Settings */}
            <div className={`flex items-center gap-1 ${activeTheme.subTextColor}`}>
              {/* Teacher/Admin Chat Wiping Action */}
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    setWipeScope('current');
                    setShowWipeModal(true);
                  }}
                  className="p-2 rounded-full hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition flex items-center gap-1 text-xs"
                  title="Wipe Chat Messages (Teacher/Admin)"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span className="hidden lg:inline text-[10px] font-bold text-rose-400">Wipe Chat</span>
                </button>
              )}

              {/* In-Chat Search */}
              <button
                type="button"
                onClick={() => setShowInChatSearch(prev => !prev)}
                className={`p-2 rounded-full hover:bg-white/10 transition ${
                  showInChatSearch ? 'bg-white/15' : `hover:${activeTheme.textColor}`
                }`}
                style={showInChatSearch ? { color: activeTheme.primaryAccent } : {}}
                title="Search messages in this chat"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Switcher */}
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className={`p-2 rounded-full hover:bg-white/10 transition hover:${activeTheme.textColor}`}
                title="Change Chat Theme"
              >
                <Palette className="w-4 h-4" style={{ color: activeTheme.primaryAccent }} />
              </button>

              {/* Channel Settings & Logo Modal */}
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleOpenRoomSettings(currentRoom)}
                  className="p-2 rounded-full hover:bg-white/10 hover:text-amber-300 transition"
                  title="Channel Settings & Custom Logo (Admin)"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* In-Chat Search Bar Dropdown */}
          {showInChatSearch && (
            <div className={`px-3 py-1.5 ${activeTheme.badgeBg} border-b ${activeTheme.sidebarBorder} flex items-center gap-2 text-xs shrink-0`}>
              <Search className="w-3.5 h-3.5" style={{ color: activeTheme.primaryAccent }} />
              <input
                type="text"
                value={inChatSearchQuery}
                onChange={e => setInChatSearchQuery(e.target.value)}
                placeholder="Search messages in this conversation..."
                className={`flex-1 bg-transparent ${activeTheme.textColor} placeholder:${activeTheme.subTextColor} focus:outline-none text-xs`}
                autoFocus
              />
              {inChatSearchQuery && (
                <button
                  type="button"
                  onClick={() => setInChatSearchQuery('')}
                  className={`${activeTheme.subTextColor} hover:${activeTheme.textColor}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* CHAT MESSAGES BODY with Customizable Theme Wallpaper      */}
          {/* ========================================================= */}
          <div
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 relative custom-scrollbar transition-colors duration-300"
            style={{
              backgroundColor: activeTheme.chatAreaBg,
              backgroundImage: `radial-gradient(${activeTheme.chatPattern} 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          >
            {/* WhatsApp E2EE / Group Notice Badge */}
            <div className="flex justify-center my-1">
              <div className={`max-w-md px-3 py-1 rounded-lg ${activeTheme.badgeBg} border ${activeTheme.sidebarBorder} text-center text-[10px] text-amber-300 shadow-sm flex items-center justify-center gap-1.5`}>
                <span>
                  {currentRoom.id === 'school-main'
                    ? `🏫 ${currentRoom.name}: Faculty, students & administration communicate here.`
                    : `🔒 ${currentRoom.name}: Visible only to verified faculty.`}
                </span>
              </div>
            </div>

            {/* Date Pill Badge */}
            {filteredMessages.length > 0 && (
              <div className="flex justify-center my-2">
                <span className={`px-2.5 py-0.5 rounded-md ${activeTheme.badgeBg} text-[9px] font-bold ${activeTheme.subTextColor} uppercase tracking-wider shadow border ${activeTheme.sidebarBorder}`}>
                  Today
                </span>
              </div>
            )}

            {/* Empty State for Clean / Wiped Room */}
            {filteredMessages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="relative mb-3">
                  {renderRoomAvatar(currentRoom, 'w-16 h-16', 'w-8 h-8')}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      backgroundColor: activeTheme.dotColor,
                      borderColor: activeTheme.isLight ? '#ffffff' : '#111b21'
                    }}
                  />
                </div>
                <h4 className={`text-sm font-bold ${activeTheme.textColor}`}>
                  {currentRoom.name}
                </h4>
                <p className={`text-xs ${activeTheme.subTextColor} mt-1 max-w-xs`}>
                  {currentRoom.description || 'Clean conversation channel. Send a message to get started!'}
                </p>

                {/* Quick Starters */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md">
                  {[
                    '👋 Good morning everyone!',
                    '📚 Welcome to NRSS Academy portal',
                    '📅 Check latest school announcements'
                  ].map((starter, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSendMessage(currentRoom.id, starter)}
                      className={`px-3 py-1.5 rounded-xl ${activeTheme.badgeBg} hover:bg-white/15 border ${activeTheme.sidebarBorder} text-[11px] ${activeTheme.textColor} transition`}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Bubbles */}
            {filteredMessages.map(msg => {
              const isMe = msg.senderId === currentUser.id;
              const senderColor = getSenderColor(msg.senderName, msg.senderRole);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[75%] rounded-2xl px-3 py-2 shadow-md relative text-left transition ${
                      isMe
                        ? `${activeTheme.myBubbleBg} text-white rounded-tr-none`
                        : `${activeTheme.otherBubbleBg} ${activeTheme.textColor} rounded-tl-none border ${activeTheme.sidebarBorder}`
                    }`}
                  >
                    {/* Group Sender Header */}
                    {!isMe && (
                      <div className="flex items-center justify-between gap-2 pb-0.5 mb-1 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${senderColor}`}>
                            {msg.senderName}
                          </span>
                        </div>
                        {msg.senderTitle && (
                          <span className="text-[9px] opacity-70">
                            {msg.senderTitle}
                          </span>
                        )}
                      </div>
                    )}

                    {/* PHOTO ATTACHMENT DISPLAY */}
                    {msg.attachment && msg.attachment.type === 'image' && (
                      <div className="mb-2 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                        <div className="relative group/img">
                          <img
                            src={msg.attachment.url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'}
                            alt={msg.attachment.name}
                            className="w-full max-h-60 sm:max-h-72 object-cover rounded-xl cursor-pointer hover:opacity-95 transition"
                            onClick={() =>
                              setPreviewImageModal({
                                url: msg.attachment?.url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
                                name: msg.attachment?.name || 'School Photo'
                              })
                            }
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2 pointer-events-none">
                            <span className="px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" /> Click to enlarge
                            </span>
                          </div>
                        </div>

                        <div className="p-1.5 bg-black/20 flex items-center justify-between text-[10px] text-slate-300">
                          <span className="truncate max-w-[180px]">{msg.attachment.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(msg.attachment?.url, msg.attachment?.name)}
                            className="text-emerald-400 hover:text-emerald-300 p-1 flex items-center gap-1 font-semibold"
                            title="Download Image"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT ATTACHMENT DISPLAY */}
                    {msg.attachment && msg.attachment.type !== 'image' && (
                      <div className="mb-2 p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                            {msg.attachment.type === 'pdf' ? (
                              <FileText className="w-4 h-4 text-red-400" />
                            ) : msg.attachment.type === 'doc' ? (
                              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                            ) : (
                              <FolderSync className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="text-xs font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                              {msg.attachment.name}
                            </div>
                            <div className="text-[10px] opacity-70">
                              {msg.attachment.size} • {msg.attachment.type.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(msg.attachment?.url, msg.attachment?.name)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white shrink-0"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Text Message Content */}
                    {msg.content && (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                        {msg.content}
                      </p>
                    )}

                    {/* Timestamp & Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                      <span>{cleanDisplayTime(msg.timestamp)}</span>
                      {isMe && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>

                    {/* Message Emoji Reaction Tray */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/10">
                        {Object.entries(msg.reactions).map(([emoji, userList]) => {
                          const users = Array.isArray(userList) ? userList : [];
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => onAddReaction(msg.id, emoji)}
                              className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition ${
                                users.includes(currentUser.name)
                                  ? 'bg-white/20 border-white/40 text-white font-bold'
                                  : 'bg-black/20 border-white/10 text-white/80'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[9px]">{users.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar on Hover */}
                  <div className="flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition px-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                        className={`p-1 rounded-full hover:bg-white/10 ${activeTheme.subTextColor} text-[10px]`}
                        title="React with Emoji"
                      >
                        <Smile className="w-3 h-3" />
                      </button>

                      {showEmojiPicker === msg.id && (
                        <div className={`absolute bottom-full ${isMe ? 'right-0' : 'left-0'} mb-1 p-1 bg-[#202c33] border border-[#2a3942] rounded-full shadow-2xl flex items-center gap-1 z-30`}>
                          {quickEmojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                onAddReaction(msg.id, emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="p-1 hover:scale-125 transition text-xs"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================= */}
          {/* CHAT INPUT BAR                                            */}
          {/* ========================================================= */}
          <footer className={`p-2 sm:p-3 ${activeTheme.inputBarBg} border-t ${activeTheme.sidebarBorder} shrink-0 transition-colors duration-300 relative`}>
            
            {/* Attachment Staged Preview Pill */}
            {attachedFile && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2 min-w-0">
                  {attachedFile.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-semibold truncate max-w-[200px] sm:max-w-md">{attachedFile.name}</span>
                  <span className="text-[10px] opacity-70">({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              
              {/* Emoji Tray Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowInputEmojiTray(prev => !prev)}
                  className={`p-2 rounded-full hover:bg-white/10 ${activeTheme.subTextColor} hover:${activeTheme.textColor} transition`}
                  title="Emoji Tray"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {showInputEmojiTray && (
                  <div className={`absolute bottom-full left-0 mb-2 p-2 ${activeTheme.sidebarHeaderBg} border ${activeTheme.sidebarBorder} rounded-2xl shadow-2xl z-30 grid grid-cols-6 gap-1 w-56`}>
                    {[...quickEmojis, '🎓', '📚', '🔬', '🛡️', '⚡', '🏆', '📢', '💬', '🌟', '🎯', '🔥', '💡'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText(prev => prev + emoji);
                          setShowInputEmojiTray(false);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-base hover:scale-125 transition text-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachment Paperclip Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(prev => !prev)}
                  className={`p-2 rounded-full hover:bg-white/10 ${activeTheme.subTextColor} hover:${activeTheme.textColor} transition`}
                  title="Attach Photo or Document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {showAttachMenu && (
                  <div className={`absolute bottom-full left-0 mb-2 p-2 ${activeTheme.sidebarHeaderBg} border ${activeTheme.sidebarBorder} rounded-2xl shadow-2xl z-30 flex flex-col gap-1 w-44`}>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold ${activeTheme.textColor} hover:bg-white/10 flex items-center gap-2.5 text-left`}
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Photos & Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold ${activeTheme.textColor} hover:bg-white/10 flex items-center gap-2.5 text-left`}
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Document & PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className={`flex-1 ${activeTheme.inputBoxBg} rounded-2xl px-4 py-2 border ${activeTheme.sidebarBorder} focus-within:ring-1`} style={{ '--tw-ring-color': activeTheme.primaryAccent } as React.CSSProperties}>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${currentRoom.name}...`}
                  className={`w-full bg-transparent text-xs sm:text-sm ${activeTheme.textColor} placeholder:${activeTheme.subTextColor} focus:outline-none`}
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedFile}
                className="p-2.5 rounded-full text-slate-950 font-bold transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                style={{ backgroundColor: activeTheme.primaryAccent }}
                title="Send Message"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </footer>
        </section>
      </div>

      {/* ========================================================= */}
      {/* THEME PICKER MODAL                                        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showThemeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#202c33] border border-[#2a3942] rounded-2xl w-full max-w-lg p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2a3942]">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" style={{ color: activeTheme.primaryAccent }} />
                  <div>
                    <h3 className="text-sm font-bold text-white">Chat Themes & Wallpaper</h3>
                    <p className="text-[10px] text-[#8696a0]">Choose your preferred theme</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="p-1 rounded-lg text-[#8696a0] hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHAT_THEMES.map(theme => {
                  const isSelected = theme.id === selectedThemeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-2.5 rounded-xl border text-left transition relative flex flex-col gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-[#2a3942] ring-2 ring-emerald-500/40'
                          : 'border-[#2a3942] hover:border-slate-500 bg-[#111b21]'
                      }`}
                    >
                      <div
                        className="w-full h-14 rounded-lg p-1.5 flex flex-col justify-between overflow-hidden shadow-inner border border-white/10"
                        style={{ backgroundColor: theme.chatAreaBg }}
                      >
                        <div
                          className="self-start text-[8px] px-2 py-0.5 rounded-lg rounded-tl-none text-white truncate max-w-[80%]"
                          style={{ backgroundColor: theme.dotColor }}
                        >
                          Hi there!
                        </div>
                        <div
                          className="self-end text-[8px] px-2 py-0.5 rounded-lg rounded-tr-none text-white truncate max-w-[80%]"
                          style={{ backgroundColor: theme.primaryAccent }}
                        >
                          Hello!
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: theme.dotColor }}
                          />
                          <span className="text-xs font-semibold text-white truncate">{theme.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#2a3942] hover:bg-[#374248] text-xs font-semibold text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADMIN CHAT WIPE CONFIRMATION MODAL                        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#202c33] border border-rose-900/40 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2a3942]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Wipe Chat Messages</h3>
                    <p className="text-[10px] text-rose-300/80">Faculty / Admin Permission Verified</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  className="p-1 rounded-lg text-[#8696a0] hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300">Permanent Action Warning:</strong>
                  <p className="mt-0.5 text-[11px] text-rose-200/90 leading-relaxed">
                    Wiping chat messages will permanently remove conversation history and media attachments from the Cloud Firestore database for all students and faculty.
                  </p>
                </div>
              </div>

              {/* Wipe Scope Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Wipe Scope:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      wipeScope === 'current'
                        ? 'border-rose-500 bg-rose-950/30'
                        : 'border-[#2a3942] bg-[#111b21] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="wipeScope"
                        checked={wipeScope === 'current'}
                        onChange={() => setWipeScope('current')}
                        className="accent-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">Wipe Current Channel Only</div>
                        <div className="text-[10px] text-slate-400">
                          Clear messages in "{currentRoom.name}" ({currentRoomMessages.length} messages)
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      wipeScope === 'all'
                        ? 'border-rose-500 bg-rose-950/30'
                        : 'border-[#2a3942] bg-[#111b21] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="wipeScope"
                        checked={wipeScope === 'all'}
                        onChange={() => setWipeScope('all')}
                        className="accent-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-rose-300">Wipe All School Chat Channels</div>
                        <div className="text-[10px] text-slate-400">
                          Clear messages across all channels ({messages.length} total messages)
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a3942]">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  disabled={isWipingMessages}
                  className="px-4 py-2 rounded-xl bg-[#2a3942] hover:bg-[#374248] text-xs font-semibold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWipe}
                  disabled={isWipingMessages}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-900/30 disabled:opacity-50"
                >
                  {isWipingMessages ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Wiping Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Confirm & Wipe</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADMIN CHANNEL SETTINGS & CHAT LOGO CUSTOMIZER MODAL       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {roomSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#202c33] border border-[#2a3942] rounded-2xl w-full max-w-lg p-5 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2a3942]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Channel Settings & Custom Logo</h3>
                    <p className="text-[10px] text-[#8696a0]">Administrator logo customization</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomSettingsModal(null)}
                  className="p-1 rounded-lg text-[#8696a0] hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Preview of Current Chat Logo */}
              <div className="p-3.5 rounded-2xl bg-[#111b21] border border-[#2a3942] flex items-center gap-4">
                <div className="relative">
                  {editLogoUrlInput ? (
                    <img
                      src={editLogoUrlInput}
                      alt="Channel Logo Preview"
                      className="w-16 h-16 rounded-full object-cover shadow-xl border-2"
                      style={{ borderColor: activeTheme.primaryAccent }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl border-2 bg-gradient-to-tr from-indigo-600 to-purple-700"
                      style={{ borderColor: activeTheme.primaryAccent }}
                    >
                      <School className="w-8 h-8" />
                    </div>
                  )}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      backgroundColor: activeTheme.dotColor,
                      borderColor: '#111b21'
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Live Preview</span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {editRoomNameInput || roomSettingsModal.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {editRoomDescInput || roomSettingsModal.description || 'Institutional Discussion Channel'}
                  </p>
                  {editLogoUrlInput && (
                    <button
                      type="button"
                      onClick={() => setEditLogoUrlInput('')}
                      className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 underline font-medium"
                    >
                      Remove custom logo
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Selection Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Select or Add Chat Logo:
                </label>

                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#111b21] border border-[#2a3942] text-xs">
                  <button
                    type="button"
                    onClick={() => setLogoTab('preset')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      logoTab === 'preset' ? 'bg-[#2a3942] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Presets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoTab('upload')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      logoTab === 'upload' ? 'bg-[#2a3942] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoTab('url')}
                    className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      logoTab === 'url' ? 'bg-[#2a3942] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Image URL</span>
                  </button>
                </div>

                {/* Tab 1: Preset School Logos */}
                {logoTab === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_CHAT_LOGOS.map(preset => {
                      const isSelected = editLogoUrlInput === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setEditLogoUrlInput(preset.url)}
                          className={`p-2 rounded-xl border text-left transition flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400'
                              : 'border-[#2a3942] bg-[#111b21] hover:border-slate-500'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 rounded-full object-cover shadow border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] font-semibold text-slate-300 text-center truncate w-full">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Upload Image File */}
                {logoTab === 'upload' && (
                  <div className="space-y-2">
                    <div
                      onClick={() => roomLogoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#2a3942] hover:border-amber-400/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#111b21] transition text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-white">Click to Upload Chat Logo</div>
                      <div className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG • Instant Base64 preview</div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Direct HTTPS Image URL */}
                {logoTab === 'url' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={editLogoUrlInput}
                        onChange={e => setEditLogoUrlInput(e.target.value)}
                        placeholder="https://example.com/school-crest.png"
                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Paste any public HTTPS image link to use as the channel logo.
                    </p>
                  </div>
                )}
              </div>

              {/* Channel Name & Description Form */}
              <form onSubmit={handleSaveRoomSettings} className="space-y-3 pt-2 border-t border-[#2a3942]">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Channel / Group Name
                  </label>
                  <input
                    type="text"
                    value={editRoomNameInput}
                    onChange={e => setEditRoomNameInput(e.target.value)}
                    placeholder="Enter channel name..."
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description & Topic
                  </label>
                  <input
                    type="text"
                    value={editRoomDescInput}
                    onChange={e => setEditRoomDescInput(e.target.value)}
                    placeholder="Enter channel description..."
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRoomSettingsModal(null)}
                    disabled={isSavingRoomSettings}
                    className="px-4 py-2 rounded-xl bg-[#2a3942] hover:bg-[#374248] text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editRoomNameInput.trim() || isSavingRoomSettings}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition flex items-center gap-1.5 disabled:opacity-50 shadow-md"
                  >
                    {isSavingRoomSettings ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Logo & Channel</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* FULLSCREEN IMAGE LIGHTBOX MODAL                           */}
      {/* ========================================================= */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Modal Header */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                {previewImageModal.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDownloadFile(previewImageModal.url, previewImageModal.name)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" /> Download Photo
              </button>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Image */}
          <div className="flex-1 flex items-center justify-center p-2 max-h-[80vh]">
            <img
              src={previewImageModal.url}
              alt={previewImageModal.name}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Modal Footer */}
          <div className="text-xs text-slate-400 text-center">
            Nepalese Army Resource & Science School (NRSS) • Secure Media Preview
          </div>
        </div>
      )}
    </div>
  );
};
