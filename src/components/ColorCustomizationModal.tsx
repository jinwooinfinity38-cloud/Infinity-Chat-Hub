import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Palette, 
  Sparkles, 
  User, 
  MessageSquare, 
  Layout, 
  Check,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';

interface ColorCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  type: 'username' | 'text' | 'bubbles';
}

const COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Gray', value: '#94a3b8' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

const GRADIENTS = [
  { name: 'Sunset', value: 'linear-gradient(to right, #ff5f6d, #ffc371)' },
  { name: 'Ocean', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
  { name: 'Lush', value: 'linear-gradient(to right, #56ab2f, #a8e063)' },
  { name: 'Purple Haze', value: 'linear-gradient(to right, #7303c0, #03001e, #ec38bc)' },
  { name: 'Neon Night', value: 'linear-gradient(to right, #00f2fe, #4facfe)' },
  { name: 'Fire', value: 'linear-gradient(to right, #f12711, #f5af19)' },
  { name: 'Royal', value: 'linear-gradient(to right, #141e30, #243b55)' },
  { name: 'Mint', value: 'linear-gradient(to right, #00b09b, #96c93d)' },
];

export function ColorCustomizationModal({ isOpen, onClose, userData, type }: ColorCustomizationModalProps) {
  const [selectedColor, setSelectedColor] = useState(
    type === 'username' ? userData?.usernameColor || '#ffffff' :
    type === 'text' ? userData?.messageColor || '#ffffff' :
    userData?.bubbleColor || '#1f2937'
  );
  const [hasGlow, setHasGlow] = useState(
    type === 'username' ? userData?.usernameGlow || false :
    type === 'text' ? userData?.messageGlow || false :
    false
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {};
      if (type === 'username') {
        updateData.usernameColor = selectedColor;
        updateData.usernameGlow = hasGlow;
      } else if (type === 'text') {
        updateData.messageColor = selectedColor;
        updateData.messageGlow = hasGlow;
      } else {
        updateData.bubbleColor = selectedColor;
      }

      await updateDoc(doc(db, 'users', userData.uid), updateData);
      toast.success('Style updated! ✨');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update style');
    } finally {
      setIsSaving(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'username': return 'Username Style';
      case 'text': return 'Text Style';
      case 'bubbles': return 'Chat Bubbles';
      default: return 'Customization';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'username': return <User className="w-5 h-5 text-tkc-accent" />;
      case 'text': return <MessageSquare className="w-5 h-5 text-tkc-ruby" />;
      case 'bubbles': return <Layout className="w-5 h-5 text-green-500" />;
      default: return <Palette className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-md p-0 overflow-hidden border-zinc-800 bg-[#0a0a0a]">
        <DialogHeader className="p-6 border-b border-zinc-800 flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                {getIcon()}
             </div>
             <div>
                <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-white">
                  {getTitle()}
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Customize your appearance</p>
             </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Preview Section */}
          <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-tkc-accent/5 to-transparent opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 z-10">Live Preview</span>
            
            <div 
              className={`text-2xl font-black italic uppercase tracking-tighter transition-all duration-300 z-10 ${hasGlow ? 'blur-[0.5px]' : ''}`}
              style={{ 
                color: selectedColor.includes('gradient') ? 'transparent' : selectedColor,
                backgroundImage: selectedColor.includes('gradient') ? selectedColor : 'none',
                backgroundClip: selectedColor.includes('gradient') ? 'text' : 'border-box',
                textShadow: hasGlow ? `0 0 15px ${selectedColor.includes('gradient') ? '#00a3ff' : selectedColor}` : 'none'
              }}
            >
              {userData?.displayName || 'Username'}
            </div>

            {type === 'bubbles' && (
              <div 
                className="mt-4 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl border border-white/5 transition-all duration-300 z-10"
                style={{ backgroundColor: selectedColor, color: '#fff' }}
              >
                Sample Message Bubble
              </div>
            )}
          </div>

          <Tabs defaultValue="normal" className="w-full">
            {type !== 'bubbles' && (
              <TabsList className="w-full bg-zinc-900 border border-white/5 p-1 rounded-2xl mb-6">
                <TabsTrigger value="normal" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-tkc-accent data-[state=active]:text-white">Normal</TabsTrigger>
                <TabsTrigger value="gradient" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-tkc-ruby data-[state=active]:text-white">Gradients</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="normal" className="mt-0 space-y-6">
              <div className="grid grid-cols-6 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-full aspect-square rounded-xl border-2 transition-all relative group flex items-center justify-center ${
                      selectedColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && (
                      <Check className="w-4 h-4 text-white invert mix-blend-difference stroke-[4px]" />
                    )}
                  </button>
                ))}
              </div>

              {type !== 'bubbles' && (
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-white/5 group hover:border-tkc-accent/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-tkc-accent/10 rounded-lg flex items-center justify-center">
                      <Zap className={`w-4 h-4 ${hasGlow ? 'text-tkc-accent' : 'text-zinc-600'}`} />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-300 block">Glow Effect</span>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Add a neon aura</span>
                    </div>
                  </div>
                  <Switch 
                    checked={hasGlow} 
                    onCheckedChange={setHasGlow}
                    className="data-[state=checked]:bg-tkc-accent"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="gradient" className="mt-0">
               <div className="grid grid-cols-2 gap-3">
                  {GRADIENTS.map((grad) => (
                    <button
                      key={grad.value}
                      onClick={() => setSelectedColor(grad.value)}
                      className={`h-12 rounded-xl border-2 transition-all group flex items-center justify-center relative overflow-hidden ${
                        selectedColor === grad.value ? 'border-white scale-[1.02]' : 'border-transparent hover:scale-[1.01]'
                      }`}
                      style={{ backgroundImage: grad.value }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
                        {grad.name}
                      </span>
                      {selectedColor === grad.value && (
                        <div className="absolute top-1 right-1 bg-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5 text-black stroke-[4px]" />
                        </div>
                      )}
                    </button>
                  ))}
               </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 bg-zinc-900/20 border-t border-zinc-800 flex items-center justify-between gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-500 hover:text-white font-bold h-11"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1 bg-tkc-accent hover:opacity-90 text-white font-black uppercase tracking-widest text-xs h-11 rounded-xl shadow-[0_0_15px_rgba(0,163,255,0.2)]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Apply Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
