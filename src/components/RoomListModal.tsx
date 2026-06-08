import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, Globe, Pin, Shield, X, Search } from 'lucide-react';

interface RoomListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  selectedRoomId: string | null;
}

export function RoomListModal({ isOpen, onClose, onSelectRoom, selectedRoomId }: RoomListModalProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'rooms'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomsData);
    });
    return () => unsubscribe();
  }, []);

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-none text-white max-w-md w-[95vw] h-[85vh] p-0 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold">Room list</h2>
          <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-4 py-6">
          <div className="relative">
            <Input 
              placeholder="Search" 
              className="bg-[#2a2a2a] border-none rounded-xl h-12 pl-4 text-zinc-300 placeholder:text-zinc-500 focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-2 pb-4">
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                className="w-full flex items-start gap-4 p-4 hover:bg-zinc-800/50 transition-colors group relative"
                onClick={() => {
                  onSelectRoom(room.id);
                  onClose();
                }}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-[#2a2a2a] rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                  {room.name === 'Depression room' ? (
                    <div className="bg-black w-full h-full flex items-center justify-center text-[10px] text-zinc-500 text-center p-1 italic leading-tight uppercase font-black">I'm BROKEN</div>
                  ) : room.name === 'Complaint Room' ? (
                    <div className="bg-[#002b3b] w-full h-full flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-cyan-400 rotate-45 transform -translate-y-1" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                  <h3 className="font-bold text-[15px] text-white leading-tight mb-1">{room.name}</h3>
                  <p className="text-[13px] text-zinc-400 leading-snug line-clamp-3 mb-1.5 whitespace-pre-wrap">
                    {room.description}
                  </p>
                  
                  <div className="flex items-center gap-1.5">
                    {room.isPrivate ? (
                      <div className="bg-cyan-500 rounded-full p-0.5">
                        <Shield className="w-3 h-3 text-white fill-current" />
                      </div>
                    ) : (
                      <div className="bg-cyan-500 rounded-full p-0.5">
                        <Globe className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                    {room.isPinned && (
                      <div className="bg-green-500 rounded-full p-0.5">
                        <Pin className="w-3 h-3 text-white fill-current rotate-45" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Counter */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-1.5">
                  <span className="text-lg font-bold text-white">
                    {Math.floor(Math.random() * 20)}
                  </span>
                  <Users className="w-5 h-5 text-zinc-600 fill-zinc-600/20" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
