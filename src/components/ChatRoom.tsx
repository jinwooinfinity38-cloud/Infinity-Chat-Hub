import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ProfileDropdown } from './ProfileDropdown';
import { PrivateInbox } from './PrivateInbox';
import { MessageActions } from './MessageActions';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { 
  Send, 
  Smile, 
  Image as ImageIcon, 
  Shield, 
  MoreVertical, 
  MessageCircle, 
  Plus, 
  Mic, 
  Menu,
  PlayCircle,
  Mail,
  UserPlus, 
  Bell,
  Crown,
  Gem,
  Flame,
  Zap,
  Diamond,
  Medal,
  History,
  Infinity,
  ScrollText,
  ShieldCheck,
  Castle,
  Sword,
  Trophy,
  Flag,
  UserCircle,
  Gift
} from 'lucide-react';

const getRankIcon = (data: { rank: string, role?: string }) => {
  const rank = data.role === 'owner' ? 'Watcher' : data.rank;
  
  switch (rank) {
    case 'Watcher': return <Infinity className="w-3.5 h-3.5 text-sky-400" />;
    case 'Ruler': return <ScrollText className="w-3.5 h-3.5 text-tkc-gold" />;
    case 'Captain': return <Sword className="w-3.5 h-3.5 text-red-400" />;
    case 'Moderator': return <ShieldCheck className="w-3.5 h-3.5 text-green-400" />;
    case 'Trusted': return <Castle className="w-3.5 h-3.5 text-zinc-400" />;
    case 'OS': return <Crown className="w-3.5 h-3.5 text-tkc-gold fill-tkc-gold" />;
    case 'X': return <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
    case 'S': return <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />;
    case 'A': return <Diamond className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />;
    case 'B': return <Trophy className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />;
    case 'C': return <Medal className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />;
    case 'D': return <Medal className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />;
    case 'E': return <History className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500" />;
    default: return null;
  }
};
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { UserNotificationsModal } from './UserNotificationsModal';
import { UserListModal } from './UserListModal';
import { RoomUsersPanel } from './RoomUsersPanel';
import { StaffHierarchyModal } from './StaffHierarchyModal';
import { ReportsModal } from './ReportsModal';
import { GameInviteButton } from './GameInviteButton';
import { GoogleGenAI } from '@google/genai';
import React from 'react';
import { toast } from 'sonner';
import { useSound } from '../hooks/useSound';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatRoomProps {
  roomId: string | null;
  user: User;
  userData: any;
  onToggleSidebar: () => void;
  onOpenEditProfile: () => void;
  onOpenThemes: () => void;
  onOpenCustomization: (type: 'username' | 'text' | 'bubbles') => void;
  onViewUserProfile: (uid: string) => void;
  onDirectMessage: (uid: string) => void;
  onGiveTip: (uid: string, name: string) => void;
  hasNotifications: boolean;
  onClearNotifications: () => void;
}

export function ChatRoom({ 
  roomId, 
  user, 
  userData, 
  onToggleSidebar, 
  onOpenEditProfile,
  onOpenThemes,
  onOpenCustomization,
  onViewUserProfile,
  onDirectMessage,
  onGiveTip,
  hasNotifications, 
  onClearNotifications 
}: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isUsersPanelOpen, setIsUsersPanelOpen] = useState(false);
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [isStaffHierarchyModalOpen, setIsStaffHierarchyModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [activeReportsCount, setActiveReportsCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userDataRef = useRef(userData);
  const { playSound } = useSound();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload called");
    const file = e.target.files?.[0];
    if (!file || !roomId) return;
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("File too large. Please select a file smaller than 50MB.");
        return;
    }
    
    console.log("Preparing to upload to:", `rooms/${roomId}/${Date.now()}_${file.name}`);
    const storageRef = ref(storage, `chat/${roomId}/${Date.now()}_${file.name}`);
    console.log("Storage ref created:", storageRef);
    
    try {
        console.log("Uploading with uploadBytes...");
        await uploadBytes(storageRef, file);
        console.log("Upload completed, getting download URL...");
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Download URL obtained:", downloadUrl);
        const messageData = {
            text: downloadUrl,
            senderId: user.uid,
            senderName: userData?.displayName || user.displayName,
            senderPhoto: userData?.photoURL || user.photoURL,
            senderLevel: userData?.level || 1,
            senderRank: userData?.rank || 'User',
            senderRole: userData?.role || 'user',
            createdAt: serverTimestamp(),
            type: file.type.startsWith('image/') ? 'image' : 'video'
        };
        console.log("Adding message to Firestore:", messageData);
        await addDoc(collection(db, 'rooms', roomId, 'messages'), messageData);
        console.log("Message added to Firestore successfully");
        toast.success("File uploaded");
    } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed: " + (error as Error).message);
    }
  };

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const isStaff = ['Watcher', 'Ruler', 'Captain', 'Moderator'].includes(userData?.rank || '');

  useEffect(() => {
    if (!isStaff) return;

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeCount = snapshot.docs.filter(doc => doc.data().status === 'active').length;
      setActiveReportsCount(activeCount);
    });

    return () => unsubscribe();
  }, [isStaff]);

  // Separate presence updates so they only run when the user's profile document is fully loaded.
  useEffect(() => {
    if (!roomId || !user || !userData) return;

    const userRef = doc(db, 'users', user.uid);
    if (userData.currentRoomId !== roomId) {
      updateDoc(userRef, { currentRoomId: roomId }).catch(err => console.error('Presence update failed:', err));
    }
  }, [roomId, user, userData]);

  useEffect(() => {
    if (!roomId || !user) return;

    // Fetch room info
    const fetchRoom = async () => {
      try {
        const roomDoc = await getDoc(doc(db, 'rooms', roomId));
        if (roomDoc.exists()) {
          setRoomInfo(roomDoc.data());
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoom();

    // Listen for messages
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const isReady = { current: false };
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isReady.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().type === 'system') {
            playSound('alert');
          }
        });
      }
      isReady.current = true;
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Reverse to maintain chronological order in the UI
      setMessages(msgs.reverse());
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/messages`);
    });

    return () => {
      unsubscribe();
      // Clear presence if user leaves
    };
  }, [roomId, user, playSound]);

  const handleListUsers = async () => {
    setIsUserListModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    const messageText = newMessage;
    setNewMessage('');

    // Handle Staff Command
    if (messageText === '/Staff' && userData?.role === 'owner') {
      setIsStaffHierarchyModalOpen(true);
      return;
    }

    // Handle Clear Command
    if (messageText === '/clear' && ['Watcher', 'Ruler'].includes(userData?.rank || '')) {
      handleClearRoom();
      return;
    }

    // Handle Users Command
    if (messageText === '/Users') {
      handleListUsers();
      return;
    }

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: messageText,
        senderId: user.uid,
        senderName: userData?.displayName || user.displayName,
        senderPhoto: userData?.photoURL || user.photoURL,
        senderLevel: userData?.level || 1,
        senderRank: userData?.rank || 'User',
        senderRole: userData?.role || 'user',
        usernameColor: userData?.usernameColor || '#ffffff',
        usernameGlow: userData?.usernameGlow || false,
        messageColor: userData?.messageColor || '#ffffff',
        messageGlow: userData?.messageGlow || false,
        bubbleColor: userData?.bubbleColor || 'transparent',
        createdAt: serverTimestamp(),
        type: 'text'
      });

      // Level / Stats logic
      const userRef = doc(db, 'users', user.uid);
      const totalMessagesCount = (userData?.totalMessages || 0) + 1;
      const currentLevel = userData?.level || 1;
      const newLevel = Math.floor(totalMessagesCount / 100) + 1;
      const updates: any = {};
      
      if (newLevel > currentLevel) {
        updates.totalMessages = totalMessagesCount;
        updates.level = newLevel;
        console.log("Leveling up:", currentLevel, "to", newLevel);
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        console.log("User document updated with:", updates);
      }

      // Bot Trigger Logic
      if (messageText.toLowerCase().includes('jin')) {
        handleBotResponse(messageText);
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/messages`);
    }
  };

  const handleBotResponse = async (userText: string) => {
    if (!roomId) return;
    
    console.log('Jin is thinking about:', userText);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: userText }] }],
        config: {
          systemInstruction: "You are 'Jin', the hype-man of Infinity Chat! You're funny, super interactive, high-energy, and a total chatterbox. You live to make people laugh and have a blast. You're always the life of the party! Keep your replies extremely short, punchy, hilarious, and packed with energy and emojis like 😎, 🔥, ✨, 🌀, 🚀, 😂. You respond enthusiastically when someone mentions your name 'Jin'. Be incredibly engaging and vibrant, never robotic. Don't mention you're an AI unless strictly asked."
        }
      });

      const botReply = response.text || "Yo! You called? 😎";
      
      // Data URL for 🎭
      const emojiSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text y='.9em' font-size='80'>🎭</text></svg>`;
      const emojiDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(emojiSvg)}`;

      // Post Jin's reply after a short delay for realism
      setTimeout(async () => {
        try {
          await addDoc(collection(db, 'rooms', roomId, 'messages'), {
            text: botReply,
            senderId: 'bot-jin-uid',
            senderName: 'Jin',
            senderPhoto: emojiDataUrl,
            senderLevel: 100,
            senderRank: 'OS',
            senderRole: 'bot',
            senderRankIcon: 'OS',
            createdAt: serverTimestamp(),
            type: 'text'
          });
          console.log('Jin replied successfully');
        } catch (error) {
          console.error('Failed to post Jin\'s message:', error);
        }
      }, 2500);

    } catch (err) {
      console.error('Bot failed to respond:', err);
    }
  };

  const handleReport = async (msg: any) => {
    try {
      await addDoc(collection(db, 'reports'), {
        messageId: msg.id,
        messageText: msg.text,
        messageSenderId: msg.senderId,
        messageSenderName: msg.senderName,
        reporterId: user.uid,
        reporterName: userData?.displayName || user.displayName,
        status: 'active',
        createdAt: serverTimestamp()
      });
      toast.success("Message reported to staff");
    } catch (err) {
      console.error(err);
      toast.error("Failed to report message");
    }
  };

  const handleClearRoom = async () => {
    if (!roomId) return;
    
    try {
      const q = query(collection(db, 'rooms', roomId, 'messages'), limit(500));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.info("Room is already clear");
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Announce clearance
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: `${userData?.displayName || user.displayName} has cleared the room`,
        senderId: 'SYSTEM',
        senderName: 'System',
        senderPhoto: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
        createdAt: serverTimestamp(),
        type: 'system'
      });
      
      toast.success("Room cleared successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear room");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!roomId) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomId, 'messages', messageId));
      toast.success("Message deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message");
    }
  };

  if (!roomId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-tkc-bg">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
          <MessageCircle className="w-10 h-10 text-tkc-accent" />
        </div>
        <p className="text-lg font-medium">Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-tkc-bg overflow-hidden">
      {/* Chat Header */}
      <div className="h-14 shrink-0 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10" /> 
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <PrivateInbox onSelect={onDirectMessage} />
          <Button variant="ghost" size="icon" className="text-zinc-100 h-9 w-9">
            <UserPlus className="w-5 h-5 text-zinc-100" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-100 h-9 w-9 relative"
            onClick={() => {
              onClearNotifications();
              setIsNotifModalOpen(true);
            }}
          >
            <Bell className="w-5 h-5 text-zinc-100" />
            {hasNotifications && (
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950" />
            )}
          </Button>
          {isStaff && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-9 w-9 relative transition-all duration-500 ${activeReportsCount > 0 ? 'bg-red-500/10 animate-pulse outline outline-2 outline-red-500/20' : 'text-zinc-100'}`}
              onClick={() => setIsReportsModalOpen(true)}
            >
              <Flag className={`w-5 h-5 ${activeReportsCount > 0 ? 'text-red-500 fill-red-500' : 'text-zinc-100'}`} />
              {activeReportsCount > 0 && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full animate-ping" />
              )}
            </Button>
          )}
          <ProfileDropdown 
            user={user} 
            userData={userData} 
            onOpenEditProfile={onOpenEditProfile} 
            onOpenThemes={onOpenThemes} 
            onOpenCustomization={onOpenCustomization}
          />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={userData?.chatBackground || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000"} 
            alt="chat background" 
            className="w-full h-full object-cover grayscale-[0.3]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-4 sm:p-6 space-y-4 max-w-5xl">
          {messages.map((msg, idx) => {
            console.log("Rendering message:", msg);
            if (msg.type === 'system') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start my-8"
                >
                  <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
                      {msg.text}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-start gap-3 mb-4 group/msg"
              >
                <div className="w-11 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar className="w-11 h-11 border border-white/10 shadow-lg cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={msg.senderPhoto} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">{msg.senderName?.[0]}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-zinc-800 text-zinc-200">
                      <DropdownMenuItem 
                        className="cursor-pointer focus:bg-tkc-accent focus:text-white font-bold"
                        onClick={() => onViewUserProfile(msg.senderId)}
                      >
                        <UserCircle className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer focus:bg-tkc-accent focus:text-white font-bold"
                        onClick={() => onDirectMessage(msg.senderId)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Direct Message
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer focus:bg-tkc-accent focus:text-white font-bold"
                        onClick={() => onGiveTip(msg.senderId, msg.senderName)}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Send Gift
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-500 focus:text-white focus:bg-red-600 font-black"
                        onClick={() => handleReport(msg)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        REPORT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 pt-1">
                      {getRankIcon({ rank: msg.senderRank, role: msg.senderRole })}
                      <span 
                        className={`text-[17px] font-extrabold tracking-tight italic transition-all duration-500 ${msg.usernameGlow ? 'blur-[0.3px]' : ''}`}
                        style={{ 
                          color: msg.usernameColor?.includes('gradient') ? 'transparent' : (msg.usernameColor || '#f3f3f3'),
                          backgroundImage: msg.usernameColor?.includes('gradient') ? msg.usernameColor : 'none',
                          backgroundClip: msg.usernameColor?.includes('gradient') ? 'text' : 'border-box',
                          textShadow: msg.usernameGlow ? `0 0 10px ${msg.usernameColor?.includes('gradient') ? '#00a3ff' : msg.usernameColor}` : 'none'
                        }}
                      >
                        {msg.senderName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] text-zinc-400/80 bg-zinc-900/40 px-2 py-0.5 rounded-md font-medium">
                        {msg.createdAt?.seconds ? format(msg.createdAt.seconds * 1000, 'dd/MM HH:mm') : '...'}
                      </span>
                      <MessageActions 
                        onReport={() => handleReport(msg)} 
                        onDelete={() => handleDeleteMessage(msg.id)}
                        isStaff={isStaff}
                      />
                    </div>
                  </div>

                  {msg.replyTo && (
                    <div className="bg-black/60 border-l-[3px] border-sky-400/50 rounded-2xl p-4 mb-3 flex gap-4 max-w-md backdrop-blur-md">
                       <Avatar className="w-12 h-12 rounded-xl shrink-0 overflow-hidden border border-white/5">
                        <AvatarImage src={msg.replyTo.senderPhoto} className="object-cover" />
                        <AvatarFallback>{msg.replyTo.senderName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex flex-col justify-center">
                        <div className="text-[14px] font-extrabold text-zinc-100 mb-0.5">{msg.replyTo.senderName}</div>
                        <div className="text-[13px] text-zinc-300 line-clamp-2 leading-tight">{msg.replyTo.text}</div>
                      </div>
                    </div>
                  )}

                   <MessageActions 
                     onReport={() => handleReport(msg)}
                     onDelete={() => handleDeleteMessage(msg.id)}
                     isStaff={isStaff}
                   >
                    {msg.type === 'game_invite' ? (
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl max-w-sm space-y-3">
                        <div className="text-[14px] text-zinc-300">
                          {msg.text.split('join')[0]}join
                        </div>
                        <GameInviteButton sessionId={msg.gameSessionId} text={msg.text} />
                      </div>
                    ) : msg.type === 'game_result' ? (
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl max-w-md space-y-2">
                         <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Match Report</span>
                         </div>
                         <div className="text-[18px] font-bold leading-tight">
                            {msg.result === 'draw' ? (
                               <div className="flex flex-wrap gap-2 text-yellow-400">
                                  <span>DRAW:</span>
                                  <span className="bg-yellow-400 text-black px-2 rounded-md">{msg.text.split('!')[1].split('and')[0].trim()}</span>
                                  <span>and</span>
                                  <span className="bg-yellow-400 text-black px-2 rounded-md">{msg.text.split('and')[1].split('are')[0].trim()}</span>
                               </div>
                            ) : (
                               <div className="flex flex-wrap gap-2">
                                  <span className="text-zinc-400">GAME OVER:</span>
                                  <span className="bg-green-500 text-black px-2 rounded-md">{msg.result.winner}</span>
                                  <span className="text-zinc-500 italic">DOMINATED</span>
                                  <span className="bg-red-500 text-black px-2 rounded-md">{msg.result.loser}</span>
                               </div>
                            )}
                         </div>
                      </div>
                    ) : msg.type === 'image' ? (
                        <img src={msg.text} alt="Uploaded" className="max-w-[200px] rounded-lg mt-2" />
                    ) : msg.type === 'video' ? (
                        <video src={msg.text} controls className="max-w-[200px] rounded-lg mt-2" />
                    ) : (
                      <div 
                        className={`text-[17px] leading-[1.4] bg-transparent cursor-pointer active:opacity-70 transition-all duration-500 ${msg.messageGlow ? 'blur-[0.3px]' : ''}`}
                        style={{ 
                          color: msg.messageColor?.includes('gradient') ? 'transparent' : (msg.messageColor || '#f8f8f8'),
                          backgroundImage: msg.messageColor?.includes('gradient') ? msg.messageColor : 'none',
                          backgroundClip: msg.messageColor?.includes('gradient') ? 'text' : 'border-box',
                          textShadow: msg.messageGlow ? `0 0 10px ${msg.messageColor?.includes('gradient') ? '#00a3ff' : msg.messageColor}` : 'none'
                        }}
                      >
                        {msg.text}
                      </div>
                    )}
                  </MessageActions>
                </div>
              </motion.div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 shrink-0 bg-zinc-950 border-t border-zinc-900 pb-2">
        <div className="max-w-5xl mx-auto space-y-4">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-3 py-1.5 border border-zinc-800"
          >
            <input 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()}>
              <Plus className="w-5 h-5 transition-transform hover:rotate-90" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white h-8 w-8 rounded-full">
              <Smile className="w-5 h-5" />
            </Button>
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type here..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-600 h-9 text-[15px]"
            />
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white h-8 w-8 rounded-full">
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              disabled={!newMessage.trim()}
              className="text-white h-8 w-8 rounded-full disabled:opacity-30"
            >
              <Send className="w-5 h-5 rotate-0" />
            </Button>
          </form>

          <div className="flex items-center justify-end px-2 py-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsUsersPanelOpen(true)}
              className="text-white hover:bg-zinc-800 rounded-full w-11 h-11"
            >
              <Menu className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
      
      <UserNotificationsModal 
        isOpen={isNotifModalOpen} 
        onClose={() => setIsNotifModalOpen(false)} 
        uid={user.uid}
      />
      
      <UserListModal 
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        isOwner={userData?.role === 'owner'}
      />

      <RoomUsersPanel 
        isOpen={isUsersPanelOpen}
        onClose={() => setIsUsersPanelOpen(false)}
        roomId={roomId}
      />

      <StaffHierarchyModal 
        isOpen={isStaffHierarchyModalOpen}
        onClose={() => setIsStaffHierarchyModalOpen(false)}
      />

      {isStaff && (
        <ReportsModal 
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
          staffUser={userData}
        />
      )}
    </div>
  );
}
