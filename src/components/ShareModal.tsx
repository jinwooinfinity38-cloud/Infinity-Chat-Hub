import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Share2, Copy, Users, Zap, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const publicUrl = "https://ai.studio/apps/8c854565-acdc-46b0-a3d2-a5c97ef58836";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('App link copied to clipboard! 📋');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Infinity Chat',
          text: 'Join me on Infinity Chat - the ultimate social hangout!',
          url: publicUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="tkc-modal max-w-md p-0 overflow-hidden border-zinc-800 bg-[#0a0a0a]">
        <div className="relative h-40 bg-gradient-to-br from-[#7c3aed] to-[#00d1ff] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 mb-3 shadow-2xl">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-white text-xs font-black uppercase tracking-[0.2em] italic bg-black/40 px-3 py-1 rounded-full border border-white/10">
              Infinity Hub
            </div>
          </div>
        </div>

        <div className="p-8">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-black italic text-white tracking-tight uppercase">
              Invite <span className="text-tkc-accent">Friends</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-500 mt-2 font-medium">
              Share your digital universe. Growth starts with a single tap.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-2xl flex flex-col gap-4 shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Public Gateway</span>
                  <span className="text-sm font-mono text-zinc-400 truncate mt-1">ai.studio/apps/8c85...</span>
                </div>
                <Button 
                  onClick={handleCopy}
                  className="bg-zinc-900 border border-white/10 hover:bg-tkc-accent hover:text-white transition-all h-10 px-4 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-2 group hover:border-tkc-accent/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-tkc-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-tkc-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Social</h4>
                  <p className="text-[10px] text-zinc-600 mt-1">Multiplayer ready</p>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-2 group hover:border-tkc-ruby/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-tkc-ruby/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-tkc-ruby" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant</h4>
                  <p className="text-[10px] text-zinc-600 mt-1">No install needed</p>
                </div>
              </div>
            </div>

            <a 
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-zinc-950/50 hover:bg-zinc-900 rounded-2xl border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-zinc-600 group-hover:text-tkc-accent transition-colors" />
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Preview Landing Page</span>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-700" />
            </a>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 font-bold text-zinc-500 hover:text-white h-12"
              >
                Close
            </Button>
            <Button 
              onClick={handleShare}
              className="flex-[2] tkc-button-primary h-12 font-black uppercase tracking-widest text-xs italic shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Spread the vibe
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
