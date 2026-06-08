import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Bell, X, CheckCheck, Inbox } from 'lucide-react';
import { format } from 'date-fns';

interface UserNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
}

export function UserNotificationsModal({ isOpen, onClose, uid }: UserNotificationsModalProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [uid]);

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach((notif) => {
      if (!notif.read) {
        const ref = doc(db, 'users', uid, 'notifications', notif.id);
        batch.update(ref, { read: true });
      }
    });
    await batch.commit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tkc-modal max-w-sm p-0 overflow-hidden border-zinc-800 bg-[#121212]">
        <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-tkc-accent" />
            <DialogTitle className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Notifications</DialogTitle>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all as read" className="h-8 w-8 text-zinc-500">
                <CheckCheck className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-500">
                <X className="w-5 h-5" />
             </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-8 space-y-4">
               <Inbox className="w-12 h-12 opacity-20" />
               <p className="text-sm font-bold text-center">No notifications yet!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 transition-colors ${notif.read ? 'bg-transparent' : 'bg-tkc-accent/5'}`}
                >
                  <p className={`text-sm leading-relaxed ${notif.read ? 'text-zinc-400' : 'text-zinc-100 font-medium'}`}>
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-zinc-600 mt-2 block font-bold">
                    {notif.createdAt?.seconds ? format(notif.createdAt.seconds * 1000, 'PPp') : 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
