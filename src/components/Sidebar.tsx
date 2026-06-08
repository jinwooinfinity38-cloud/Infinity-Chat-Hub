import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Home,
  Radio,
  Newspaper,
  Dices,
  Medal,
  Gem,
  Bell,
  LogOut,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: 'rooms' | 'forum' | 'private' | 'news' | 'games' | 'leaderboards';
  setActiveTab: (tab: 'rooms' | 'forum' | 'private' | 'news' | 'games' | 'leaderboards') => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  user: User;
  userData: any;
  onOpenRoomList: () => void;
  onOpenArcade: () => void;
  onOpenFriendsWall: () => void;
  onOpenNewsWall: () => void;
  onOpenLeaderboards: () => void;
  onOpenStaffPanel: () => void;
  onOpenRankStore: () => void;
  onOpenShare: () => void;
}

interface NavItem {
  id: string;
  icon: any;
  label: string;
  color?: string;
  action?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, selectedId, setSelectedId, user, userData, onOpenRoomList, onOpenArcade, onOpenFriendsWall, onOpenNewsWall, onOpenLeaderboards, onOpenStaffPanel, onOpenRankStore, onOpenShare }: SidebarProps) {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomsData);
      if (!selectedId && roomsData.length > 0 && activeTab === 'rooms') {
        setSelectedId(roomsData[0].id);
      }
    });
    return () => unsubscribe();
  }, [activeTab, selectedId, setSelectedId]);

  const isStaff = userData?.role === 'admin' || userData?.role === 'staff' || userData?.uid === 'OWNER_UID'; 
  const isOwner = user?.email === 'jinwooinfinity38@gmail.com';
  const isDev = window.location.hostname.includes('ais-dev');

  const navItems: NavItem[] = [
    { id: 'rooms', icon: Home, label: 'Home' },
    { id: 'wifi', icon: Radio, label: 'Vibes' },
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'games', icon: Dices, label: 'Arcade' },
    { id: 'leaderboards', icon: Medal, label: 'Leaderboard' },
    { id: 'rankStore', icon: Gem, label: 'Rank Palace', color: 'text-tkc-accent' },
  ];

  if (isStaff) {
    navItems.push({ id: 'staff_notifications', icon: Bell, label: 'Staff Alerts', color: 'text-tkc-ruby' });
  }

  // Add Share icon for owner
  if (isOwner) {
    navItems.push({ id: 'share', icon: Share2, label: 'Share Link', color: 'text-[#00d1ff]' });
  }

  return (
    <div className="w-16 sm:w-20 h-full bg-black border-r border-zinc-900 flex flex-col items-center py-4 gap-4 z-40">
      {/* Spacer for the stationary menu button */}
      <div className="h-10 sm:h-12" />
      
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-xl transition-all relative group ${
            activeTab === item.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
          onClick={() => {
            if (item.action) {
              item.action();
            } else if (item.id === 'staff_notifications') {
              onOpenStaffPanel();
            } else if (item.id === 'rooms') {
              onOpenRoomList();
            } else if (item.id === 'games') {
              onOpenArcade();
            } else if (item.id === 'wifi') {
              onOpenFriendsWall();
            } else if (item.id === 'news') {
              onOpenNewsWall();
            } else if (item.id === 'leaderboards') {
              onOpenLeaderboards();
            } else if (item.id === 'rankStore') {
              onOpenRankStore();
            } else if (item.id === 'share') {
              onOpenShare();
            } else {
              setActiveTab(item.id as any);
            }
          }}
        >
          <item.icon className={`w-6 h-6 ${item.color || ''}`} />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-zinc-800">
            {item.label}
          </div>

          {activeTab === item.id && (
            <motion.div 
              layoutId="active-indicator"
              className="absolute -left-0 w-1 h-6 bg-white rounded-r-full"
            />
          )}
        </Button>
      ))}

      <div className="mt-auto flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
          onClick={() => auth.signOut()}
        >
          <LogOut className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
