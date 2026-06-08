/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, limit, orderBy, where, increment } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { Auth } from './components/Auth';
import { Registration } from './components/Registration';
import { Sidebar } from './components/Sidebar';
import { ChatRoom } from './components/ChatRoom';
import { Forum } from './components/Forum';
import { PrivateChat } from './components/PrivateChat';
import { RoomListModal } from './components/RoomListModal';
import { ProfileModal } from './components/ProfileModal';
import { LeaderboardsModal } from './components/LeaderboardsModal';
import { RankStoreModal } from './components/RankStoreModal';
import { ArcadeModal } from './components/ArcadeModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ThemeModal } from './components/ThemeModal';
import { ColorCustomizationModal } from './components/ColorCustomizationModal';
import { FriendsWall } from './components/FriendsWall';
import { NewsWall } from './components/NewsWall';
import { StaffNotificationModal } from './components/StaffNotificationModal';
import { ShareModal } from './components/ShareModal';
import { useEconomy } from './hooks/useEconomy';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Users, 
  Loader2, 
  Bell, 
  Gamepad2, 
  Trophy, 
  MessageCircle,
  Home,
  LayoutGrid,
  Crown,
  Star,
  ChevronRight,
  Shield,
  Menu
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { seedInitialRooms, seedChatBot } from './lib/seed';
import { format, differenceInCalendarDays } from 'date-fns';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'forum' | 'private' | 'news' | 'games' | 'leaderboards'>('rooms');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [visitChecked, setVisitChecked] = useState(false);
  
  // Modal States
  const [isRoomListOpen, setIsRoomListOpen] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [isFriendsWallOpen, setIsFriendsWallOpen] = useState(false);
  const [isNewsWallOpen, setIsNewsWallOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewingUserData, setViewingUserData] = useState<any>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [customizationType, setCustomizationType] = useState<'username' | 'text' | 'bubbles'>('username');
  const [isLeaderboardsOpen, setIsLeaderboardsOpen] = useState(false);
  const [isRankStoreOpen, setIsRankStoreOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const handleRegistrationComplete = () => {
    setIsRegistering(false);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidthValue = windowWidth < 640 ? 64 : 80;

  const handleViewProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setViewingUserData({ ...userDoc.data(), uid });
        setIsProfileOpen(true);
      } else {
        toast.error("User profile not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  const handleDirectMessage = (uid: string) => {
    if (uid === user?.uid) {
      toast.error("You cannot message yourself!");
      return;
    }
    // We navigate to private tab and set the target user ID as the "chatId"
    // The PrivateChat component should handle finding/creating the chat
    setActiveTab('private');
    setSelectedId(uid);
  };

  const handleGiveTip = async (targetUid: string, targetName: string) => {
    if (targetUid === user?.uid) {
      toast.error("You cannot tip yourself!");
      return;
    }
    if ((userData?.rubies || 0) < 10) {
      toast.error("You need at least 10 Rubies to send a gift!");
      return;
    }

    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // Subtract from sender
      batch.update(doc(db, 'users', user!.uid), {
        rubies: increment(-10),
        giftsSent: increment(1)
      });
      
      // Add to receiver
      batch.update(doc(db, 'users', targetUid), {
        rubies: increment(10),
        giftsReceived: increment(1)
      });

      // Add notification for receiver
      const notifRef = doc(collection(db, 'users', targetUid, 'notifications'));
      batch.set(notifRef, {
        message: `${userData?.displayName || 'Someone'} sent you a gift of 10 Rubies! 🎁`,
        read: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      toast.success(`Sent 10 Rubies to ${targetName}! 🎁`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send gift");
    }
  };

  // Hook for economy logic
  useEconomy(user, userData);

  useEffect(() => {
    if (!user || !userData || visitChecked) return;

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const lastVisit = userData.lastVisitDate;
    
    if (lastVisit === todayStr) {
      setVisitChecked(true);
      return;
    }

    const lastVisitDate = lastVisit ? new Date(lastVisit) : null;
    const diff = lastVisitDate ? differenceInCalendarDays(today, lastVisitDate) : null;
    
    let newStreak = (userData.dailyVisitStreak || 0);
    
    if (diff === 1) {
      newStreak += 1;
    } else if (diff !== null && diff > 1) {
      newStreak = 1; // Reset to 1 if more than a day passed
    } else if (diff === null) {
      newStreak = 1; // First visit ever counted
    }

    const updates: any = {
      lastVisitDate: todayStr,
      dailyVisitStreak: newStreak,
    };

    if (newStreak >= 7 && (userData.rank === 'User' || userData.rank === 'E')) {
      updates.rank = 'D';
    }

    updateDoc(doc(db, 'users', user.uid), updates).catch(console.error);
    setVisitChecked(true);
  }, [user, userData, visitChecked]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          setIsRegistering(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    // Attempt to seed rooms if authenticated
    seedInitialRooms().catch(err => console.warn('Seeding failed (likely already seeded or permission denied):', err));
    seedChatBot().catch(err => console.warn('Bot seeding failed:', err));

    const userDoc = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        const isOwner = user.email === "jinwooinfinity38@gmail.com";
        console.log('Attempting to create user doc for:', user.uid);
        setDoc(userDoc, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous Teen',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: isOwner ? 'owner' : 'user',
          xp: 0,
          level: 1,
          rubies: 100,
          crystals: 10,
          tokens: 0,
          totalMessages: 0,
          likes: 0,
          giftsSent: 0,
          giftsReceived: 0,
          rank: isOwner ? 'Watcher' : 'User',
          totalGameScore: 0,
          timeOnlineMinutes: 0,
          dailyVisitStreak: 0,
          lastVisitDate: '',
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        }).catch(err => {
          console.error('Failed to create user doc for:', user.uid, 'Error:', err);
        });
      }
    }, (err) => {
      console.error('User data subscription error:', err);
    });

    // Auto-select Infinity Room or first room
    const roomsQuery = query(collection(db, 'rooms'), limit(20));
    const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
      if (!selectedId && !snapshot.empty) {
        const infinityRoom = snapshot.docs.find(doc => doc.data().name === 'Infinity Room');
        setSelectedId(infinityRoom ? infinityRoom.id : snapshot.docs[0].id);
      }
    });

    // Listen for global notifications
    const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setHasNotifications(true);
      }
    });

    // Listen for personal notifications
    const personalNotificationsQuery = query(
      collection(db, 'users', user.uid, 'notifications'), 
      where('read', '==', false),
      limit(1)
    );
    const unsubscribePersonalNotifications = onSnapshot(personalNotificationsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setHasNotifications(true);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeRooms();
      unsubscribeNotifications();
      unsubscribePersonalNotifications();
    };
  }, [user, selectedId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-tkc-bg text-white">
        <Loader2 className="w-8 h-8 animate-spin text-tkc-accent" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (isRegistering) {
    return <Registration onComplete={handleRegistrationComplete} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-tkc-bg text-zinc-100 overflow-hidden font-sans">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Stationary Menu Buttons */}
        <div className="absolute top-0 left-0 h-14 w-14 flex items-center justify-center z-[100] pointer-events-auto">
           <Button variant="ghost" size="icon" className="text-zinc-100" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
             <Menu className="w-6 h-6" />
           </Button>
        </div>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: sidebarWidthValue }}
              exit={{ width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="z-40 h-full flex-shrink-0 overflow-hidden bg-black"
            >
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId} 
                user={user}
                userData={userData}
                onOpenRoomList={() => setIsRoomListOpen(true)}
                onOpenArcade={() => setIsArcadeOpen(true)}
                onOpenFriendsWall={() => setIsFriendsWallOpen(true)}
                onOpenNewsWall={() => setIsNewsWallOpen(true)}
                onOpenLeaderboards={() => setIsLeaderboardsOpen(true)}
                onOpenStaffPanel={() => setIsStaffModalOpen(true)}
                onOpenRankStore={() => setIsRankStoreOpen(true)}
                onOpenShare={() => setIsShareOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="flex-1 relative overflow-hidden bg-tkc-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedId || '')}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full w-full"
            >
              {activeTab === 'rooms' && (
                <ChatRoom 
                  roomId={selectedId} 
                  user={user} 
                  userData={userData} 
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  onOpenEditProfile={() => setIsEditProfileOpen(true)}
                  onOpenThemes={() => setIsThemesOpen(true)}
                  onOpenCustomization={(type) => {
                    setCustomizationType(type);
                    setIsCustomizationOpen(true);
                  }}
                  onViewUserProfile={handleViewProfile}
                  onDirectMessage={handleDirectMessage}
                  onGiveTip={handleGiveTip}
                  hasNotifications={hasNotifications}
                  onClearNotifications={() => setHasNotifications(false)}
                />
              )}
              {activeTab === 'forum' && (
                <Forum postId={selectedId} user={user} setPostId={setSelectedId} />
              )}
              {activeTab === 'private' && (
                <PrivateChat chatId={selectedId} user={user} />
              )}
              {activeTab === 'news' && (
                <div className="p-8 max-w-4xl mx-auto space-y-8 overflow-y-auto h-full">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      <Bell className="w-8 h-8 text-tkc-accent" />
                      Community News
                    </h2>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { title: 'New VIP Features!', date: '2 hours ago', content: 'We just added custom chat colors for all Super VIP members. Check them out in settings!', icon: Crown, color: 'text-tkc-gold' },
                      { title: 'Weekly Leaderboard Reset', date: '1 day ago', content: 'The weekly XP leaderboard has been reset. Congratulations to our top 3 teens!', icon: Trophy, color: 'text-tkc-accent' },
                      { title: 'Welcome New Moderators', date: '3 days ago', content: 'Please welcome our newest moderators to the team. Be kind and follow the rules!', icon: Shield, color: 'text-red-400' },
                    ].map((news, i) => (
                      <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-tkc-accent/30 transition-all group cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center ${news.color}`}>
                            <news.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-lg group-hover:text-tkc-accent transition-colors">{news.title}</h3>
                              <span className="text-xs text-zinc-500">{news.date}</span>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed">{news.content}</p>
                            <div className="flex items-center gap-1 mt-4 text-xs font-bold text-tkc-accent uppercase tracking-wider">
                              Read More <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'games' && (
                <div className="p-8 flex flex-col items-center justify-center h-full text-zinc-500">
                  <Gamepad2 className="w-12 h-12 mb-4 opacity-20" />
                  <h2 className="text-xl font-bold text-zinc-300">Teen Arcade</h2>
                  <p>Open the arcade from the sidebar to play!</p>
                  <Button 
                    className="mt-6 bg-tkc-accent hover:bg-tkc-accent/80 text-white font-bold rounded-xl"
                    onClick={() => setIsArcadeOpen(true)}
                  >
                    Launch Arcade
                  </Button>
                </div>
              )}
              {activeTab === 'leaderboards' && (
                <div className="p-8 flex flex-col items-center justify-center h-full text-zinc-500">
                  <Trophy className="w-12 h-12 mb-4 opacity-20" />
                  <h2 className="text-xl font-bold text-zinc-300">Leaderboards</h2>
                  <p>Who is the top teen?</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <RoomListModal 
        isOpen={isRoomListOpen} 
        onClose={() => setIsRoomListOpen(false)} 
        onSelectRoom={(id) => {
          setSelectedId(id);
          setActiveTab('rooms');
        }}
        selectedRoomId={selectedId}
      />

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        userData={viewingUserData}
        viewerId={user?.uid}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userData={userData}
      />

      <ThemeModal
        isOpen={isThemesOpen}
        onClose={() => setIsThemesOpen(false)}
        userData={userData}
      />

      <ColorCustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        userData={userData}
        type={customizationType}
      />

      <LeaderboardsModal 
        isOpen={isLeaderboardsOpen} 
        onClose={() => setIsLeaderboardsOpen(false)} 
      />

      <RankStoreModal
        isOpen={isRankStoreOpen}
        onClose={() => setIsRankStoreOpen(false)}
        userData={userData}
        user={user}
      />

      <StaffNotificationModal 
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        user={user}
      />

      <ArcadeModal 
        isOpen={isArcadeOpen}
        onClose={() => setIsArcadeOpen(false)}
        user={user}
        userData={userData}
      />

      <FriendsWall 
        isOpen={isFriendsWallOpen}
        onClose={() => setIsFriendsWallOpen(false)}
        user={user}
        userData={userData}
      />

      <NewsWall 
        isOpen={isNewsWallOpen}
        onClose={() => setIsNewsWallOpen(false)}
        user={user}
        userData={userData}
      />

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}
