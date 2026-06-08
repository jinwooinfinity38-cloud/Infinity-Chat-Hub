    "use client";

    import { 
      Dialog, 
      DialogContent, 
    } from './ui/dialog';
    import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
    import { Badge } from './ui/badge';
    import { Button } from './ui/button';
    import { Separator } from './ui/separator';
    import { 
      Calendar, 
      Shield, 
      Target,
      Star, 
      Gem,
      Heart,
      MessageSquare,
      UserPlus,
      ThumbsUp,
      Gift,
      Crown,
      Flame,
      Zap,
      Diamond,
      Medal,
      Trophy,
      History,
      Infinity,
      ScrollText,
      ShieldCheck,
      Castle,
      Sword,
      Globe,
      Smile,
      X
    } from 'lucide-react';

    const getRankIcon = (data: { rank: string, role?: string }) => {
      const rank = data.role === 'owner' ? 'Watcher' : data.rank;
      
      switch (rank) {
        case 'Watcher': return <Infinity className="w-5 h-5 text-sky-400" />;
        case 'Ruler': return <ScrollText className="w-5 h-5 text-tkc-gold" />;
        case 'Captain': return <Sword className="w-5 h-5 text-red-400" />;
        case 'Moderator': return <ShieldCheck className="w-5 h-5 text-green-400" />;
        case 'Trusted': return <Castle className="w-5 h-5 text-zinc-400" />;
        case 'OS': return <Crown className="w-5 h-5 text-tkc-gold fill-tkc-gold" />;
        case 'X': return <Flame className="w-5 h-5 text-red-500 fill-red-500" />;
        case 'S': return <Zap className="w-5 h-5 text-purple-400 fill-purple-400" />;
        case 'A': return <Diamond className="w-5 h-5 text-sky-400 fill-sky-400" />;
        case 'B': return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
        case 'C': return <Medal className="w-5 h-5 text-zinc-300 fill-zinc-300" />;
        case 'D': return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
        case 'E': return <History className="w-5 h-5 text-zinc-500 fill-zinc-500" />;
        default: return null;
      }
    };
    import { format } from 'date-fns';
    import { db } from '../lib/firebase';
    import { doc, updateDoc, increment } from 'firebase/firestore';
    import { toast } from 'sonner';

    interface ProfileModalProps {
      isOpen: boolean;
      onClose: () => void;
      userData: any;
      viewerId?: string;
      onOpenEditProfile: () => void;
    }

    export function ProfileModal({ isOpen, onClose, userData, viewerId, onOpenEditProfile }: ProfileModalProps) {
      if (!userData) return null;

      const handleLike = async () => {
        if (!viewerId) return;
        if (viewerId === userData.uid) {
          toast.error("You cannot like your own profile!");
          return;
        }

        try {
          const userRef = doc(db, 'users', userData.uid);
          await updateDoc(userRef, {
            likes: increment(1)
          });
          toast.success(`You liked ${userData.displayName}'s profile!`);
        } catch (err) {
          console.error(err);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="tkc-modal max-w-md p-0 overflow-y-auto max-h-[90vh] border-zinc-800 bg-[#121212]">
            {/* Close Button Top Right */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors group"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Cover Image Placeholder */}
            <div className="h-40 bg-gradient-to-r from-tkc-accent to-tkc-ruby relative">
              {userData.bannerURL && (
                <img src={userData.bannerURL} className="w-full h-full object-cover opacity-80" alt="" />
              )}
              <div className="absolute inset-0 bg-black/20" />
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-10">
                <Avatar className="w-32 h-32 border-8 border-[#121212] shadow-2xl rounded-full">
                  <AvatarImage src={userData.photoURL} />
                  <AvatarFallback className="text-3xl bg-zinc-800 text-zinc-600 font-bold rounded-full">{userData.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-green-500 border-4 border-[#121212] rounded-full" />
              </div>
            </div>

            <div className="pt-20 p-8 space-y-8 flex flex-col items-center">
              <div className="flex flex-col items-center text-center">
                <Badge className="bg-tkc-accent/10 text-tkc-accent border-tkc-accent/20 px-4 py-1 font-black mb-3">
                  {userData.role === 'owner' ? 'WATCHER' : (userData.rank || 'USER')} • LVL {userData.level || 1}
                </Badge>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                  {userData.displayName}
                  {getRankIcon({ rank: userData.rank, role: userData.role })}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase">ID: {userData.uid.slice(0, 8)}</p>
                  <div className="flex items-center gap-1 text-green-500 font-black text-xs">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{userData.likes || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userData.age && (
                  <Badge variant="outline" className="bg-zinc-900/50 border-white/5 text-zinc-400 px-3 py-1.5 rounded-lg font-bold">
                    {userData.age} Years Old
                  </Badge>
                )}
                {userData.country && (
                  <Badge variant="outline" className="bg-zinc-900/50 border-white/5 text-zinc-400 px-3 py-1.5 rounded-lg font-bold flex gap-1.5 items-center">
                    <Globe className="w-3 h-3 text-sky-400" />
                    {userData.country}
                  </Badge>
                )}
                {userData.relationship && (
                  <Badge variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg font-bold flex gap-1.5 items-center">
                    <Heart className="w-3 h-3 fill-rose-400" />
                    {userData.relationship}
                  </Badge>
                )}
              </div>

              {userData.mood && (
                <div className="bg-tkc-accent/5 border border-tkc-accent/10 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tkc-accent/10 flex items-center justify-center flex-shrink-0">
                    <Smile className="w-5 h-5 text-tkc-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Vibe</span>
                    <span className="text-sm font-bold text-zinc-200">{userData.mood}</span>
                  </div>
                </div>
              )}

              {userData.bio && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">About Me</label>
                  <p className="text-zinc-400 text-sm leading-relaxed bg-zinc-950/50 p-4 rounded-2xl border border-white/5 italic">
                    "{userData.bio}"
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Teen since {userData.createdAt?.seconds ? format(userData.createdAt.seconds * 1000, 'MMMM yyyy') : 'Recently'}</span>
                </div>
              </div>

              <Separator className="bg-zinc-800/50" />

              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3 w-full">
                  {viewerId !== userData.uid ? (
                    <>
                      <Button className="flex-1 bg-tkc-accent hover:opacity-90 text-white font-bold h-11" onClick={handleLike}>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Like Profile
                      </Button>
                      <Button variant="ghost" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold h-11">
                        <Gift className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-800 text-zinc-400 font-bold h-11 hover:bg-zinc-900"
                      onClick={() => {
                        onClose();
                        onOpenEditProfile();
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-zinc-600 hover:text-white font-black uppercase tracking-widest text-[10px] h-8"
                  onClick={onClose}
                >
                  Leave Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
