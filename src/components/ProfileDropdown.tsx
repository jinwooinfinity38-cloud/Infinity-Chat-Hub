import { useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { WalletModal } from './WalletModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Settings, 
  Layers, 
  Wallet, 
  Smartphone, 
  LogOut, 
  Gem, 
  Check, 
  Edit3,
  ChevronRight,
  ChevronLeft,
  Crown,
  Flame,
  Zap,
  Diamond,
  Trophy,
  Medal,
  History,
  Palette,
  MessageSquare,
  UserSquare2,
  Volume2,
  Brush,
  Wind
} from 'lucide-react';

const getRankIcon = (rank: string) => {
  switch (rank) {
    case 'OS': return <Crown className="w-3.5 h-3.5 text-tkc-gold fill-tkc-gold" />;
    case 'X': return <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
    case 'S': return <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />;
    case 'A': return <Diamond className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />;
    case 'B': return <Trophy className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />;
    case 'C': return <Medal className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />;
    case 'D': return <Medal className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />;
    case 'E': return <History className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500" />;
    default: return <Gem className="w-3.5 h-3.5 text-tkc-ruby" />;
  }
};

interface ProfileDropdownProps {
  user: User;
  userData: any;
  onOpenEditProfile: () => void;
  onOpenThemes: () => void;
  onOpenCustomization: (type: 'username' | 'text' | 'bubbles') => void;
}

type MenuView = 'main' | 'settings' | 'level-info';

export function ProfileDropdown({ user, userData, onOpenEditProfile, onOpenThemes, onOpenCustomization }: ProfileDropdownProps) {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [view, setView] = useState<MenuView>('main');

  const resetView = () => {
    // Small delay to ensure the menu state reset doesn't flicker during close animation
    setTimeout(() => setView('main'), 200);
  };

  // Level Logic: 100 messages per level
  const totalMessages = userData?.totalMessages || 0;
  const currentLevel = userData?.level || 1;
  const nextLevel = currentLevel + 1;
  const currentLevelXp = totalMessages % 100;
  const progressPercent = (currentLevelXp / 100) * 100;

  return (
    <>
      <DropdownMenu onOpenChange={(open) => !open && resetView()}>
        <DropdownMenuTrigger className="relative cursor-pointer group outline-none bg-transparent border-none p-0">
          <div className="relative">
            <Avatar className="w-9 h-9 border border-zinc-700 bg-zinc-800 transition-transform group-hover:scale-105">
              <AvatarImage src={userData?.photoURL} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400">
                {userData?.displayName?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-950" />
          </div>
        </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[300px] bg-zinc-900/95 border-zinc-800 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
      >
        {view === 'main' ? (
          <>
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="w-[60px] h-[60px] border-2 border-zinc-800 bg-zinc-800 rounded-2xl overflow-hidden">
                <AvatarImage src={userData?.photoURL} />
                <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-600 font-bold">
                  {userData?.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col pt-0.5">
                <div className="flex items-center gap-1.5 text-white text-[11px] font-bold">
                  {getRankIcon(userData?.rank)}
                  <span className="opacity-90">{userData?.rank || 'USER'} RANK</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-extrabold tracking-tight text-white">{userData?.displayName || 'Shinazugawa'}</span>
                  <div className="bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border border-white/10 shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                  </div>
                </div>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditProfile();
                  }}
                  className="flex items-center gap-1.5 text-[#00a3ff] text-sm mt-1 hover:brightness-110 font-semibold transition-all p-0 focus:bg-transparent bg-transparent cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit profile</span>
                </DropdownMenuItem>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-0.5">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setView('settings');
                }}
                className="flex items-center justify-between py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Settings className="w-5 h-5 text-[#00a3ff]" />
                  <span className="font-semibold text-[15px]">Chat options</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setView('level-info');
                }}
                className="flex items-center justify-between py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Layers className="w-5 h-5 text-[#00d1ff]" />
                  <span className="font-semibold text-[15px]">Level info</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWalletOpen(true);
                }}
              >
                <Wallet className="w-5 h-5 text-[#00a3ff]" />
                <span className="font-semibold text-[15px]">Wallet</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-4 bg-zinc-800/50" />

            <div className="space-y-0.5">
              <DropdownMenuItem className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors">
                <Smartphone className="w-5 h-5 text-[#00a3ff]" />
                <span className="font-semibold text-[15px]">Add to home screen</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer text-zinc-100 transition-colors"
                onClick={() => auth.signOut()}
              >
                <LogOut className="w-5 h-5 text-[#00a3ff]" />
                <span className="font-semibold text-[15px]">Logout</span>
              </DropdownMenuItem>
            </div>
          </>
        ) : view === 'settings' ? (
          <>
            {/* Settings Submenu */}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setView('main');
              }}
              className="flex items-center gap-3 mb-4 -ml-1 focus:bg-transparent bg-transparent p-1 cursor-pointer w-fit rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight italic">Chat options</h2>
            </DropdownMenuItem>

            <div className="space-y-0.5">
              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenThemes();
                }}
              >
                <Brush className="w-5 h-5 text-[#00a3ff]" />
                <span className="font-semibold text-[15px]">Themes</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomization('username');
                }}
              >
                <Wind className="w-5 h-5 text-[#ff00e5]" />
                <span className="font-semibold text-[15px]">Username colour</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomization('text');
                }}
              >
                <MessageSquare className="w-5 h-5 text-[#ff4d00]" />
                <span className="font-semibold text-[15px]">Text colour</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl focus:bg-white/5 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomization('bubbles');
                }}
              >
                <UserSquare2 className="w-5 h-5 text-[#00ff9d]" />
                <span className="font-semibold text-[15px]">Chat bubbles</span>
              </DropdownMenuItem>
            </div>
          </>
        ) : (
          <>
            {/* Level Info Submenu */}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setView('main');
              }}
              className="flex items-center gap-3 mb-6 -ml-1 focus:bg-transparent bg-transparent p-1 cursor-pointer w-fit rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-zinc-400" />
              <h2 className="text-lg font-bold text-white">Level Info</h2>
            </DropdownMenuItem>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/40 rounded-3xl border border-white/5 shadow-inner mb-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-tkc-accent/30 flex items-center justify-center bg-tkc-accent/5">
                  <span className="text-4xl font-black text-white">{currentLevel}</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-tkc-accent text-[10px] font-black px-2 py-0.5 rounded-full text-black uppercase tracking-tighter">
                  Level
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Current Progress</p>
              <p className="text-white text-lg font-black tracking-tight">{currentLevelXp} <span className="text-zinc-600">/ 25 XP</span></p>
            </div>

            <div className="space-y-4 px-2">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Level {currentLevel}</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Level {nextLevel}</span>
                </div>
                <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00d1ff] to-[#00a3ff] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,163,255,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-zinc-950/50 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">Total XP</p>
                  <p className="text-sm font-black text-white">{totalMessages}</p>
                </div>
                <div className="bg-zinc-950/50 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">To Next</p>
                  <p className="text-sm font-black text-[#00d1ff]">{25 - currentLevelXp} XP</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                  Earn XP by chatting, staying active, and participating in the community!
                </p>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    <WalletModal 
      isOpen={isWalletOpen} 
      onClose={() => setIsWalletOpen(false)} 
      userData={userData}
      userEmail={user.email}
    />
    </>
  );
}
