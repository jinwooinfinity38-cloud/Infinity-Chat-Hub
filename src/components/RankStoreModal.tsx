import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  X, 
  Crown, 
  Flame, 
  Zap, 
  Diamond, 
  Trophy, 
  Medal, 
  CheckCircle2, 
  History,
  AlertCircle,
  Gem,
  CircleDollarSign,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface RankStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  user: any;
}

const RANKS = [
  { id: 'E', label: 'E Rank', icon: History, color: 'text-zinc-500', bg: 'bg-zinc-500/10', cost: '5 Min Online', automatic: true },
  { id: 'D', label: 'D Rank', icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', cost: '7 Day Streak', automatic: true },
  { id: 'C', label: 'C Rank', icon: Medal, color: 'text-zinc-300', bg: 'bg-zinc-300/10', cost: 10000, currency: 'rubies', colorHex: '#00d1ff' },
  { id: 'B', label: 'B Rank', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', cost: 30000, currency: 'rubies', colorHex: '#ffae00' },
  { id: 'A', label: 'A Rank', icon: Diamond, color: 'text-sky-400', bg: 'bg-sky-400/10', cost: 5000, currency: 'crystals', colorHex: '#0070ff' },
  { id: 'S', label: 'S Rank', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', cost: 25000, currency: 'crystals', colorHex: '#b100ff' },
  { id: 'X', label: 'X Rank', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', cost: 500, currency: 'tokens', colorHex: '#ff0040' },
  { id: 'OS', label: 'OS Rank', icon: Crown, color: 'text-tkc-gold', bg: 'bg-tkc-gold/10', cost: 'Coming soon', currency: 'tokens', comingSoon: true, colorHex: '#ffd700' },
];

export function RankStoreModal({ isOpen, onClose, userData, user }: RankStoreModalProps) {
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedRank || !userData) return;
    
    const cost = selectedRank.cost;
    const currency = selectedRank.currency;
    const currentBalance = userData[currency] || 0;

    if (currentBalance < cost) {
      toast.error(`Inadequate ${currency}! You need ${cost - currentBalance} more.`);
      setIsConfirming(false);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [currency]: increment(-cost),
        rank: selectedRank.id
      });

      toast.success(`Welcome to ${selectedRank.label}!`);
      setIsConfirming(false);
      setSelectedRank(null);
    } catch (err) {
      console.error(err);
      toast.error("Purchase failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyIcon = (type: string) => {
    if (type === 'rubies') return <Target className="w-4 h-4 text-tkc-ruby" />;
    if (type === 'crystals') return <Gem className="w-4 h-4 text-tkc-accent" />;
    if (type === 'tokens') return <CircleDollarSign className="w-4 h-4 text-tkc-gold" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-sm p-0 overflow-hidden border-zinc-800 bg-[#0a0a0a]">
        <DialogHeader className="p-4 border-b border-zinc-800/50 flex flex-row items-center justify-between bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Diamond className="w-5 h-5 text-sky-400" />
            <DialogTitle className="text-sm font-black text-zinc-100 uppercase tracking-[0.2em]">Rank Palace</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4 space-y-4">
            <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50 flex items-center justify-between mb-2">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Status</span>
                  <span className="text-lg font-black text-white italic tracking-tighter">{userData?.rank || 'USER'}</span>
               </div>
               <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                     <Target className="w-4 h-4 text-tkc-ruby mb-1" />
                     <span className="text-xs font-black">{userData?.rubies || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <Gem className="w-4 h-4 text-tkc-accent mb-1" />
                     <span className="text-xs font-black">{userData?.crystals || 0}</span>
                  </div>
               </div>
            </div>

            <div className="grid gap-2">
              {RANKS.map((rank) => (
                <motion.div
                  key={rank.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative overflow-hidden p-4 rounded-2xl border transition-all cursor-pointer group ${
                    userData?.rank === rank.id 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700/50'
                  } ${rank.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (rank.automatic || rank.comingSoon || userData?.rank === rank.id) return;
                    setSelectedRank(rank);
                    setIsConfirming(true);
                  }}
                >
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${rank.bg} flex items-center justify-center shadow-inner`}>
                        <rank.icon className={`w-6 h-6 ${rank.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-base font-black italic tracking-tighter ${rank.color}`}>{rank.label}</span>
                        <div className="flex items-center gap-1.5">
                           {!rank.automatic && !rank.comingSoon && getCurrencyIcon(rank.currency as string)}
                           <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            {typeof rank.cost === 'number' ? rank.cost.toLocaleString() : rank.cost}
                           </span>
                        </div>
                      </div>
                    </div>
                    {userData?.rank === rank.id ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : rank.comingSoon ? (
                      <span className="text-[9px] font-black bg-zinc-800 px-2 py-1 rounded text-zinc-500 uppercase tracking-tighter">SOON</span>
                    ) : (
                      <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-sky-400 underline underline-offset-4">PURCHASE</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative Glow */}
                  <div 
                    className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px] opacity-10 rounded-full"
                    style={{ backgroundColor: rank.colorHex || '#555' }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <AnimatePresence>
          {isConfirming && selectedRank && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-center p-6 border-t border-zinc-800"
            >
              <div className="text-center space-y-6 max-w-[280px]">
                <div className={`w-20 h-20 rounded-2xl ${selectedRank.bg} flex items-center justify-center mx-auto mb-4 border border-white/5`}>
                  <selectedRank.icon className={`w-10 h-10 ${selectedRank.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Confirm Purchase?</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Elevate to <span className={selectedRank.color}>{selectedRank.label}</span> for <span className="text-zinc-200 font-bold">{selectedRank.cost.toLocaleString()} {selectedRank.currency}</span>?
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    className="w-full h-12 bg-white hover:bg-zinc-100 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg ring-2 ring-white/20 active:scale-[0.98] transition-transform"
                    onClick={handlePurchase}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "CONFIRM PURCAHSE"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 text-zinc-500 hover:text-white font-bold uppercase tracking-widest text-[10px] rounded-xl"
                    onClick={() => {
                      setIsConfirming(false);
                      setSelectedRank(null);
                    }}
                    disabled={loading}
                  >
                    CANCEL MISSION
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
