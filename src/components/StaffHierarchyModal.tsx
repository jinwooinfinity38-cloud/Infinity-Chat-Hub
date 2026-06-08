"use client";

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { 
  Trophy, 
  ChevronRight,
  Shield,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAFF_RANKS = ['Watcher', 'Ruler', 'Captain', 'Moderator'];

export function StaffHierarchyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [usersByRank, setUsersByRank] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(query(collection(db, 'users')));
        const grouped: Record<string, any[]> = {};
        
        usersSnap.docs.forEach(doc => {
          const data = doc.data();
          const rank = data.rank || 'User';
          // Only group if it's a staff rank
          if (STAFF_RANKS.includes(rank)) {
            if (!grouped[rank]) grouped[rank] = [];
            grouped[rank].push({ id: doc.id, ...data });
          }
        });
        
        setUsersByRank(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const renderRankSection = (rankTitle: string) => {
    const users = usersByRank[rankTitle] || [];
    if (users.length === 0) return null;

    return (
      <div key={rankTitle} className="mb-8">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            {rankTitle === 'Watcher' || rankTitle === 'Ruler' ? <Crown className="w-5 h-5 text-yellow-500" /> : <Shield className="w-5 h-5" />}
          </div>
          <h3 className="text-lg font-black tracking-tight text-white uppercase italic">{rankTitle} Rank</h3>
          <div className="flex-1 h-[1px] bg-zinc-800/50" />
          <span className="text-[10px] font-black text-zinc-500 tracking-widest">{users.length} STAFF</span>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {users.map((user) => (
            <div 
              key={user.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border border-white/10 rounded-xl">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-zinc-800 text-xs font-bold">{user.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white group-hover:translate-x-0.5 transition-transform">{user.displayName}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Level {user.level || 1}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-zinc-800 text-white rounded-[32px] p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Staff Hierarchy</DialogTitle>
              <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Official Administration Team</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-8 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Scanning Ranks...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {STAFF_RANKS.map(rank => renderRankSection(rank))}
              {Object.keys(usersByRank).length === 0 && (
                <div className="text-center py-20">
                  <p className="text-zinc-500 font-bold italic">No staff members currently active in these ranks.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
