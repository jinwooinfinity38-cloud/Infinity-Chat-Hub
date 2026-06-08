import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { 
  X, 
  RotateCw, 
  Users, 
  User, 
  ShieldAlert, 
  Phone, 
  Search,
  Gem,
  Crown,
  Flame,
  Zap,
  Diamond,
  Medal,
  History,
  Smartphone,
  Infinity,
  ScrollText,
  ShieldCheck,
  ChevronRight,
  Castle,
  Sword,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface RoomUsersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const getRankIcon = (user: any) => {
  const rank = user.role === 'owner' ? 'Watcher' : user.rank;
  
  switch (rank) {
    case 'Watcher': return <Infinity className="w-4 h-4 text-sky-400" />;
    case 'Ruler': return <ScrollText className="w-4 h-4 text-tkc-gold" />;
    case 'Captain': return <Sword className="w-4 h-4 text-red-400" />;
    case 'Moderator': return <ShieldCheck className="w-4 h-4 text-green-400" />;
    case 'Trusted': return <Castle className="w-4 h-4 text-zinc-400" />;
    case 'OS': return <Crown className="w-4 h-4 text-tkc-gold fill-tkc-gold" />;
    case 'X': return <Flame className="w-4 h-4 text-red-500 fill-red-500" />;
    case 'S': return <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />;
    case 'A': return <Diamond className="w-4 h-4 text-sky-400 fill-sky-400" />;
    case 'B': return <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
    case 'C': return <Medal className="w-4 h-4 text-zinc-300 fill-zinc-300" />;
    case 'D': return <Medal className="w-4 h-4 text-amber-600 fill-amber-600" />;
    case 'E': return <History className="w-4 h-4 text-zinc-500 fill-zinc-500" />;
    default: return null;
  }
};

export function RoomUsersPanel({ isOpen, onClose, roomId }: RoomUsersPanelProps) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!roomId || !isOpen) return;

    // Users are considered "Online" if they are in this room and active within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // We query all users who were last in this room
    // In a real app, we might have a dedicated presence collection or a field for currentRoomId
    const q = query(
      collection(db, 'users'),
      where('currentRoomId', '==', roomId),
      limit(100)
    );

    const botQ = query(
      collection(db, 'users'),
      where('isBot', '==', true)
    );

    let roomUsers: any[] = [];
    let botUsers: any[] = [];

    const updateLists = () => {
      const allUsers = [...botUsers];
      roomUsers.forEach(u => {
        if (!allUsers.find(au => au.id === u.id)) {
          allUsers.push(u);
        }
      });
      
      // Ensure Jin is always present as a bot
      if (!allUsers.find(u => u.id === 'bot-jin-uid' || u.displayName === 'Jin')) {
        allUsers.push({
          id: 'bot-jin-uid',
          displayName: 'Jin',
          photoURL: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text y='.9em' font-size='80'>🎭</text></svg>`)}`,
          role: 'bot',
          isBot: true,
          rank: 'OS',
          level: 100,
          bio: 'Always online, always listening. 😎'
        });
      }
      
      const online = allUsers.filter((u: any) => {
        const lastActive = typeof u.lastActive?.toDate === 'function' ? u.lastActive.toDate() : null;
        const isActuallyOnline = (lastActive && lastActive > fiveMinutesAgo) || u.isBot === true;
        return isActuallyOnline;
      });

      const offline = allUsers.filter((u: any) => {
        const lastActive = typeof u.lastActive?.toDate === 'function' ? u.lastActive.toDate() : null;
        const isActuallyOffline = (!lastActive || lastActive <= fiveMinutesAgo) && u.isBot !== true;
        return isActuallyOffline;
      });

      setOnlineUsers(online);
      setOfflineUsers(offline);
    };

    const unsubscribeRoom = onSnapshot(q, (snapshot) => {
      roomUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateLists();
    });

    const unsubscribeBots = onSnapshot(botQ, (snapshot) => {
      botUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateLists();
    });

    return () => {
      unsubscribeRoom();
      unsubscribeBots();
    };
  }, [roomId, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile closing */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[85%] sm:w-[400px] bg-zinc-950/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header Icons */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white h-8 w-8">
                  <X className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-8 w-8">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:text-white h-9 w-9 bg-zinc-800/50 rounded-xl">
                  <Users className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-9 w-9">
                  <User className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-9 w-9">
                  <ShieldAlert className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-9 w-9">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-9 w-9">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Online Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Online</h3>
                    <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/30">
                      {onlineUsers.length}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {onlineUsers.map((u) => (
                      <UserItem key={u.id} user={u} isOnline={true} />
                    ))}
                  </div>
                </div>

                {/* Offline Section */}
                <div className="space-y-3">
                  <div className="px-1">
                    <h3 className="text-sm font-black text-zinc-500 uppercase tracking-wider">Offline</h3>
                  </div>
                  
                  <div className="space-y-1">
                    {offlineUsers.map((u) => (
                      <UserItem key={u.id} user={u} isOnline={false} />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UserItem({ user, isOnline }: { user: any, isOnline: boolean, key?: any }) {
  // Glow names based on level or rank for that "Cinnamon/Snowy" look from SS
  const hasGlow = user.level > 10 || ['OS', 'X', 'S'].includes(user.rank);
  const glowClass = hasGlow ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : '';
  
  // Random "Android" icon or "Location" icon placeholders from SS
  const showMobile = Math.random() > 0.6;

  return (
    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10 border border-white/10 rounded-2xl">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold">{user.displayName?.[0]}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950" />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-[15px] font-black tracking-tight transition-all group-hover:translate-x-0.5 ${isOnline ? 'text-white' : 'text-zinc-500'} ${glowClass}`}>
              {user.displayName}
            </span>
            {user.isBot && (
              <Badge className="bg-sky-500/20 text-sky-400 text-[8px] font-black px-1.5 py-0 border border-sky-500/30 h-3.5">
                BOT
              </Badge>
            )}
          </div>
          {user.bio && !isOnline && (
            <span className="text-[10px] text-zinc-600 font-bold uppercase truncate max-w-[150px]">
              {user.bio}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getRankIcon(user)}
        {showMobile && <Smartphone className="w-3.5 h-3.5 text-zinc-600" />}
        {/* Flag placeholder - I'll use a small colored box since I don't have country data */}
        <div className="w-4 h-3 bg-zinc-800 rounded-sm border border-white/5" />
      </div>
    </div>
  );
}
