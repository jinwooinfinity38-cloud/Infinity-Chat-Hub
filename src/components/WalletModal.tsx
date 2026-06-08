import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { X, Gem, Target, CircleDollarSign } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  userEmail: string | null;
}

const OWNER_EMAIL = "jinwooinfinity38@gmail.com";

export function WalletModal({ isOpen, onClose, userData, userEmail }: WalletModalProps) {
  const isOwner = userEmail === OWNER_EMAIL;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-sm p-0 overflow-hidden border-zinc-800 bg-[#121212]">
        <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-950">
          <DialogTitle className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Wallet</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-500 uppercase mb-2">Ruby</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tkc-ruby/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-tkc-ruby" />
                </div>
                <span className="text-2xl font-black text-white">{userData?.rubies?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-500 uppercase mb-2">Crystal</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tkc-accent/20 rounded-xl flex items-center justify-center">
                  <Gem className="w-6 h-6 text-tkc-accent" />
                </div>
                <span className="text-2xl font-black text-white">{userData?.crystals?.toLocaleString() || 0}</span>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-500 uppercase mb-2">Tokens</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tkc-gold/20 rounded-xl flex items-center justify-center">
                    <CircleDollarSign className="w-6 h-6 text-tkc-gold" />
                  </div>
                  <span className="text-2xl font-black text-white">{userData?.tokens?.toLocaleString() || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
