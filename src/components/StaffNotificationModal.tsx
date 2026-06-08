import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Bell, Send } from 'lucide-react';

interface StaffNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function StaffNotificationModal({ isOpen, onClose, user }: StaffNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'staff' | 'members' | 'users'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        type: target,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast.success(`Notification sent to ${target}!`);
      setTitle('');
      setMessage('');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-900 text-white sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-tkc-ruby/20 rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-tkc-ruby" />
          </div>
          <DialogTitle className="text-2xl font-black italic uppercase italic">Send Notification</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium italic">
            Broadcast an alert to the selected group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 italic">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-zinc-500">Target Group</Label>
            <Select onValueChange={(val: any) => setTarget(val)} defaultValue="all">
              <SelectTrigger className="bg-zinc-900 border-zinc-800 rounded-xl h-12 focus:ring-tkc-ruby/50">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="all">All Teens</SelectItem>
                <SelectItem value="members">VIP Members</SelectItem>
                <SelectItem value="staff">Staff Only</SelectItem>
                <SelectItem value="users">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-italic">
            <Label className="text-xs uppercase font-bold text-zinc-500 italic">Alert Title</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="System Maintenance, Event Alert, etc."
              className="bg-zinc-900 border-zinc-800 rounded-xl h-12 focus-visible:ring-tkc-ruby/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-zinc-500 italic">Message Content</Label>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do they need to know?"
              className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[120px] focus-visible:ring-tkc-ruby/50 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-xs italic">Cancel</Button>
          <Button 
            onClick={handleSend} 
            disabled={isLoading} 
            className="rounded-xl font-bold uppercase text-xs px-8 bg-tkc-ruby hover:bg-tkc-ruby/80 text-white shadow-lg shadow-tkc-ruby/20 italic"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Confirm Broadcast'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
