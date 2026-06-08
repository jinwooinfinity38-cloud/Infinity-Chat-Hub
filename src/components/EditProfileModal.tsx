"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
} from './ui/dialog';
import { 
  X, 
  Camera, 
  Eye, 
  Star, 
  ThumbsUp, 
  PlayCircle,
  ChevronRight,
  User,
  Heart,
  Mail,
  Key,
  MessageSquare,
  Smile,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  Search,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cambodia", "Cameroon", "Canada", "Cape Verde", "Chad", "Chile", "China", "Colombia", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export function EditProfileModal({ isOpen, onClose, userData }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'more'>('account');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    bio: userData?.bio || '',
    age: userData?.age || '',
    country: userData?.country || '',
    mood: userData?.mood || '',
    relationship: userData?.relationship || 'Single',
  });

  useEffect(() => {
    setFormData({
      displayName: userData?.displayName || '',
      bio: userData?.bio || '',
      age: userData?.age || '',
      country: userData?.country || '',
      mood: userData?.mood || '',
      relationship: userData?.relationship || 'Single',
    });
  }, [userData]);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  if (!userData) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast.success("Profile updated successfully! ✨");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large! Max 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, {
          [type === 'avatar' ? 'photoURL' : 'bannerURL']: base64
        });
        toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} updated!`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update image.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden border-zinc-800 bg-black text-white rounded-[32px] h-[90vh] flex flex-col">
        {/* Top Action Bar */}
        <div className="shrink-0 p-4 flex items-center justify-between z-20 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-800/80 backdrop-blur-md flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-black">{userData.level || 0}</span>
            </div>
            <div className="bg-zinc-800/80 backdrop-blur-md flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5">
              <ThumbsUp className="w-4 h-4 text-sky-400 fill-sky-400" />
              <span className="text-xs font-black">{userData.likes || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-tkc-accent text-white px-4 py-1.5 rounded-full text-xs font-black hover:bg-tkc-accent/80 transition-all disabled:opacity-50"
            >
              {isSaving ? 'SAVING...' : 'SAVE'}
            </button>
            <button 
              onClick={onClose}
              className="bg-zinc-800/80 backdrop-blur-md p-2 rounded-full border border-white/5 hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Banner with Profile Pic */}
          <div className="relative pb-8 flex flex-col items-center">
            <div className="absolute inset-x-0 -top-12 h-64 bg-gradient-to-b from-zinc-800/50 to-black z-0">
              {userData.bannerURL && (
                <img src={userData.bannerURL} className="w-full h-full object-cover opacity-60" alt="" />
              )}
              <div className="absolute inset-0 bg-black/20" />
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="absolute top-16 right-4 bg-black/40 p-2 rounded-full border border-white/10 hover:bg-black/60 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative z-10 space-y-4 flex flex-col items-center mt-20">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-black shadow-2xl rounded-full">
                  <AvatarImage src={userData.photoURL} />
                  <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-600 font-bold rounded-full">
                    {userData.displayName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <div className="bg-zinc-900 border border-white/10 p-2.5 rounded-full">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </button>
                <div 
                  className="absolute bottom-1 right-2 bg-zinc-700 border-2 border-black p-1.5 rounded-full cursor-pointer hover:bg-zinc-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-rose-400 uppercase tracking-tighter mb-1">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  <span>Super VIP</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{formData.displayName || 'Unnamed User'}</h2>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-4 px-6 mb-4 sticky top-0 z-10 bg-black/80 backdrop-blur-xl py-2">
            <button 
              onClick={() => setActiveTab('account')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'account' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('more')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'more' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Settings
            </button>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-12 space-y-6">
            {activeTab === 'account' ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-tkc-accent transition-colors" />
                    <input 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      placeholder="Set username..."
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-tkc-accent/50 focus:bg-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Age</label>
                    <Popover>
                      <PopoverTrigger>
                        <div className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold flex items-center justify-between text-zinc-400 hover:text-white transition-colors cursor-pointer">
                          <span>{formData.age ? `${formData.age} Years Old` : 'Set Age'}</span>
                          <ChevronDown className="w-4 h-4 text-zinc-600" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-2 bg-zinc-950 border-zinc-800 rounded-2xl shadow-2xl">
                        <ScrollArea className="h-48">
                          <div className="space-y-1">
                            {[13, 14, 15, 16, 17, 18, 19, 20].map((age) => (
                              <button
                                key={age}
                                onClick={() => setFormData({...formData, age: age.toString()})}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${formData.age === age.toString() ? 'bg-tkc-accent text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                              >
                                {age}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Country</label>
                    <Popover>
                      <PopoverTrigger>
                        <div className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold flex items-center justify-between text-zinc-400 hover:text-white transition-colors overflow-hidden cursor-pointer">
                          <span className="truncate">{formData.country || 'Select Country'}</span>
                          <ChevronDown className="w-4 h-4 text-zinc-600" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0 bg-zinc-950 border-zinc-800 rounded-2xl shadow-2xl overflow-hidden" side="bottom" align="end">
                        <div className="p-3 bg-zinc-950 border-b border-zinc-800">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <input 
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-tkc-accent/50 transition-all"
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-64">
                          <div className="p-2 space-y-0.5">
                            {filteredCountries.map((country) => (
                              <button
                                key={country}
                                onClick={() => {
                                  setFormData({...formData, country});
                                  setCountrySearch('');
                                }}
                                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${formData.country === country ? 'bg-tkc-accent/20 text-tkc-accent' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                              >
                                {country}
                                {formData.country === country && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Current Mood</label>
                  <div className="relative group">
                    <Smile className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-tkc-accent transition-colors" />
                    <input 
                      value={formData.mood}
                      onChange={(e) => setFormData({...formData, mood: e.target.value})}
                      placeholder="What's your vibe today?"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-tkc-accent/50 focus:bg-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">About Me</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-5 w-4 h-4 text-zinc-600 group-focus-within:text-tkc-accent transition-colors" />
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Describe yourself..."
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-tkc-accent/50 focus:bg-zinc-900 transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Relationship Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Single', 'In Love', 'Broken', 'Taken', 'Secret'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFormData({...formData, relationship: status})}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${formData.relationship === status ? 'bg-tkc-accent/20 border-tkc-accent text-tkc-accent' : 'bg-zinc-900/30 border-white/5 text-zinc-500'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <MenuButton icon={Mail} label="Update Email" />
                <MenuButton icon={Key} label="Security Center" />
                <MenuButton icon={Star} label="Privacy Controls" />
                <MenuButton icon={ShieldCheck} label="Identity Verification" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Hidden Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, 'avatar')} 
        />
        <input 
          type="file" 
          ref={bannerInputRef} 
          hidden 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, 'banner')} 
        />
        </DialogContent>
    </Dialog>
  );
}

function MenuButton({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-900 transition-all group border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
        <span className="font-bold text-[15px] text-zinc-100">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />
    </button>
  );
}
