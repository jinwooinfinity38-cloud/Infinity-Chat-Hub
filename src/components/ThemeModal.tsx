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
import { Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

const THEME_CATEGORIES = [
  {
    id: 'rain-forests',
    name: 'Rain Forests',
    themes: [
      {
        id: 'forest-1',
        name: 'Mossy Sanctuary',
        url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'forest-2',
        name: 'Tropical Vibe',
        url: 'https://images.unsplash.com/photo-1583000292271-455b89ebc37a?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'forest-3',
        name: 'Jungle Falls',
        url: 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'forest-4',
        name: 'Misty Canopy',
        url: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=2000'
      }
    ]
  },
  {
    id: 'waterfalls',
    name: 'Waterfalls',
    themes: [
      {
        id: 'fall-1',
        name: 'Celestial Drops',
        url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'fall-2',
        name: 'Hidden Oasis',
        url: 'https://images.unsplash.com/photo-1508433957232-4607b7a3fb23?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'fall-3',
        name: 'Azure Cascade',
        url: 'https://images.unsplash.com/photo-1495914264619-a169b1834241?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'fall-4',
        name: 'Eternal Mist',
        url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=2000'
      }
    ]
  },
  {
    id: 'flowers',
    name: 'Flowers',
    themes: [
      {
        id: 'flower-1',
        name: 'Pastel Bloom',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'flower-2',
        name: 'Spring Whisper',
        url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'flower-3',
        name: 'Sun-Kissed Petals',
        url: 'https://images.unsplash.com/photo-1469259948000-fa2f8d7df513?auto=format&fit=crop&q=80&w=2000'
      },
      {
        id: 'flower-4',
        name: 'Wild Flora',
        url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=2000'
      }
    ]
  }
];

export function ThemeModal({ isOpen, onClose, userData }: ThemeModalProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(userData?.chatBackgroundId || 'forest-1');
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectTheme = async (categoryIndex: number, themeIndex: number) => {
    const theme = THEME_CATEGORIES[categoryIndex].themes[themeIndex];
    setSelectedThemeId(theme.id);
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        chatBackground: theme.url,
        chatBackgroundId: theme.id
      });
      toast.success('Theme updated! ✨');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update theme');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-lg p-0 overflow-hidden border-zinc-800 bg-[#0a0a0a]">
        <DialogHeader className="p-6 border-b border-zinc-800 flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-tkc-accent/10 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-tkc-accent" />
             </div>
             <div>
                <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-white">
                  Chat Themes
                </DialogTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Personalize your vibe</p>
             </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {THEME_CATEGORIES.map((category, catIdx) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-tkc-ruby" />
                  {category.name}
                </h3>
                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                  {category.themes.length} THEMES
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {category.themes.map((theme, themeIdx) => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTheme(catIdx, themeIdx)}
                    className={`relative group h-32 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedThemeId === theme.id 
                        ? 'border-tkc-accent shadow-[0_0_15px_rgba(0,163,255,0.3)]' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={theme.url} 
                      alt={theme.name}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-black text-white/90 truncate uppercase tracking-tight">
                        {theme.name}
                      </span>
                      {selectedThemeId === theme.id && (
                        <div className="bg-tkc-accent p-1 rounded-full">
                          <Check className="w-3 h-3 text-black stroke-[4px]" />
                        </div>
                      )}
                    </div>

                    {isSaving && selectedThemeId === theme.id && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                         <div className="w-4 h-4 border-2 border-tkc-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
             <p className="text-[10px] text-zinc-500 leading-relaxed italic text-center">
               New categories and themes are added every week. Stay tuned for more vibes! 🌈
             </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/20 border-t border-zinc-800 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-bold h-11"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
