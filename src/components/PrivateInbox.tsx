import React, { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Mail, CheckSquare, Trash2, X } from "lucide-react"

interface UserConversation {
  id: string;
  name: string;
  photo: string;
}

const initialConversations: UserConversation[] = [
  { id: 'system-conv-uid', name: 'System', photo: 'https://api.dicebear.com/7.x/bottts/svg?seed=System' },
  { id: 'bot-jin-uid', name: 'Jin', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jin' },
  { id: '1', name: 'Elvira', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elvira' },
  { id: '2', name: 'Barnabas', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Barnabas' },
];

interface PrivateInboxProps {
  onSelect: (uid: string) => void;
}

export function PrivateInbox({ onSelect }: PrivateInboxProps) {
  const [conversations, setConversations] = useState<UserConversation[]>(() => {
    const saved = localStorage.getItem('hiddenConversations');
    const hidden = saved ? JSON.parse(saved) : [];
    return initialConversations.filter(c => !hidden.includes(c.id));
  });
  const isTopStaff = true; 

  const deleteAllConversations = () => {
    const kept = conversations.filter(c => 
      c.id === 'bot-jin-uid' || (isTopStaff && c.id === 'system-conv-uid')
    );
    const deletedIds = conversations.map(c => c.id).filter(id => !kept.some(k => k.id === id));
    
    const saved = localStorage.getItem('hiddenConversations');
    const hidden = saved ? JSON.parse(saved) : [];
    localStorage.setItem('hiddenConversations', JSON.stringify([...hidden, ...deletedIds]));
    
    setConversations(kept);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the click to chat
    
    const saved = localStorage.getItem('hiddenConversations');
    const hidden = saved ? JSON.parse(saved) : [];
    localStorage.setItem('hiddenConversations', JSON.stringify([...hidden, id]));
    
    setConversations(conversations.filter(c => c.id !== id));
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.id === 'system-conv-uid') return -1;
    if (b.id === 'system-conv-uid') return 1;
    if (a.id === 'bot-jin-uid') return -1;
    if (b.id === 'bot-jin-uid') return 1;
    return 0;
  });

  return (
    <Popover>
      <PopoverTrigger className="group relative inline-flex items-center justify-center rounded-full p-2 text-zinc-100 hover:bg-zinc-800 transition-colors h-9 w-9">
        <Mail className="w-5 h-5" />
        {/* Notification dot if needed */}
        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-zinc-950" />
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[300px] bg-zinc-900/90 border-zinc-800 text-white rounded-2xl p-0 shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between border-b border-zinc-800/50">
          <span className="font-extrabold text-lg">Private</span>
          <div className="flex items-center gap-4">
            <CheckSquare className="w-5 h-5 text-zinc-100 cursor-pointer hover:text-white" />
            <Trash2 className="w-5 h-5 text-zinc-100 cursor-pointer hover:text-white" onClick={deleteAllConversations} />
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {sortedConversations.map((conv) => (
            <div 
              key={conv.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-zinc-700">
                  <AvatarImage src={conv.photo} />
                  <AvatarFallback>{conv.name[0]}</AvatarFallback>
                </Avatar>
                <span className={`font-extrabold ${conv.id === 'bot-jin-uid' ? 'text-yellow-500' : conv.id === 'system-conv-uid' ? 'text-red-500' : 'text-[#7b61ff]'}`}>{conv.name}</span>
              </div>
              {conv.id !== 'bot-jin-uid' && conv.id !== 'system-conv-uid' && (
                <button 
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {sortedConversations.length <= (isTopStaff ? 2 : 1) && (
            <div className="p-8 text-center text-zinc-500 text-sm italic">
              No private conversations yet
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
