import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { X, Users } from 'lucide-react';
import { Button } from './ui/button';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export function UserListModal({ isOpen, onClose, isOwner }: UserListModalProps) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !isOwner) return;

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
  }, [isOpen, isOwner]);

  if (!isOwner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-sm p-0 overflow-hidden border-zinc-800 bg-[#121212]">
        <div className="flex flex-col h-[500px]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-400" />
                <DialogTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    Total Users: {users.length}
                </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border border-zinc-800">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold">{user.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-zinc-200 tracking-tight">{user.displayName || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
