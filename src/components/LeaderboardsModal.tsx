import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { 
  Trophy, 
  Star, 
  Medal, 
  ArrowLeft, 
  X, 
  ChevronRight,
  Gem,
  Gift,
  ThumbsUp,
  Zap,
  TrendingUp,
  Target,
  Diamond,
  Gamepad2
} from 'lucide-react';

interface LeaderboardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'xp' | 'level' | 'crystals' | 'rubies' | 'giftsSent' | 'likes' | 'totalGameScore';

const CATEGORIES = [
  { id: 'xp', label: 'Top XP', icon: Zap, color: 'bg-sky-500', field: 'xp' },
  { id: 'level', label: 'Top level', icon: Star, color: 'bg-yellow-500', field: 'level' },
  { id: 'crystals', label: 'Top Crystal', icon: Gem, color: 'bg-tkc-accent', field: 'crystals' },
  { id: 'rubies', label: 'Top Rubies', icon: Target, color: 'bg-tkc-ruby', field: 'rubies' },
  { id: 'giftsSent', label: 'Top gifts', icon: Gift, color: 'bg-tkc-gold', field: 'giftsSent' },
  { id: 'likes', label: 'Top likes', icon: ThumbsUp, color: 'bg-green-500', field: 'likes' },
  { id: 'totalGameScore', label: 'Total Game Score', icon: Gamepad2, color: 'bg-indigo-500', field: 'totalGameScore' },
];

export function LeaderboardsModal({ isOpen, onClose }: LeaderboardsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedCategory) return;

    const category = CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return;

    const q = query(
      collection(db, 'users'), 
      orderBy(category.field, 'desc'), 
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => !u.isBot); // Exclude bots
      setTopUsers(users);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-sm p-0 overflow-hidden border-zinc-800 bg-[#121212]">
        {!selectedCategory ? (
          <div className="flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Leaderboards</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    className="w-full justify-between h-14 hover:bg-zinc-800/50 rounded-xl px-4 group"
                    onClick={() => setSelectedCategory(cat.id as Category)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 ${cat.color} rounded-lg flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                        <cat.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-zinc-200">{cat.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-[600px]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="h-8 w-8 text-zinc-400">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="font-bold text-zinc-100">{activeCategory?.label}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 bg-zinc-900/30 flex gap-2 border-b border-zinc-800">
              <Button variant="outline" className="h-8 rounded-full bg-zinc-800 border-none text-[11px] font-bold px-4">Weekly</Button>
              <Button variant="ghost" className="h-8 rounded-full text-zinc-500 text-[11px] font-bold px-4">Monthly</Button>
              <Button variant="ghost" className="h-8 rounded-full text-zinc-500 text-[11px] font-bold px-4">All time</Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {topUsers.map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-6 flex justify-center">
                        {idx === 0 ? (
                          <div className="relative">
                            <span className="text-sm font-black text-tkc-gold">1</span>
                            <Medal className="w-8 h-8 text-tkc-gold absolute -top-2 -left-3 opacity-20" />
                          </div>
                        ) : idx === 1 ? (
                          <span className="text-sm font-black text-zinc-400 font-mono">2</span>
                        ) : idx === 2 ? (
                          <span className="text-sm font-black text-amber-600 font-mono">3</span>
                        ) : (
                          <span className="text-sm font-bold text-zinc-600 font-mono">{idx + 1}</span>
                        )}
                      </div>

                      <div className="relative">
                        <Avatar className="w-10 h-10 border border-zinc-800">
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold">{user.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        {idx < 3 && (
                           <div className="absolute -top-1 -right-1">
                             <TrendingUp className={`w-3 h-3 ${idx === 0 ? 'text-tkc-gold' : 'text-zinc-500'}`} />
                           </div>
                        )}
                      </div>

                      <span className="font-bold text-zinc-200 tracking-tight">{user.displayName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-zinc-100 font-mono">
                        {user[activeCategory?.field || 'xp']?.toLocaleString() || 0}
                      </span>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${activeCategory?.color}`}>
                         <activeCategory.icon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
