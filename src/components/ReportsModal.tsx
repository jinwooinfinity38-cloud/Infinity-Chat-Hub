"use client";

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { 
  AlertTriangle, 
  CheckCircle2,
  Trash2,
  MessageSquare,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: any;
}

export function ReportsModal({ isOpen, onClose, staffUser }: ReportsModalProps) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'reports'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleResolve = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved',
        resolvedBy: staffUser.displayName,
        resolvedAt: serverTimestamp()
      });
      toast.success("Report marked as resolved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve report");
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      toast.success("Report deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete report");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-zinc-800 text-white rounded-[32px] p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Staff Reports</DialogTitle>
              <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Admin Investigation Panel</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-8 pb-8">
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-[28px] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-zinc-700" />
                </div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">No active reports</span>
              </div>
            ) : (
              reports.map((report) => (
                <div 
                  key={report.id}
                  className={`p-6 rounded-[28px] border transition-all ${report.status === 'active' ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900/30 border-zinc-800/50 opacity-60'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${report.status === 'active' ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
                        <AlertTriangle className={`w-4 h-4 ${report.status === 'active' ? 'text-red-500' : 'text-zinc-500'}`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Reported User</span>
                        <span className="text-sm font-black text-white">{report.messageSenderName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Reporter</span>
                      <span className="text-xs font-bold text-white">{report.reporterName}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3 h-3 text-zinc-600" />
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Reported Content</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">"{report.messageText}"</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-4 text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString() : 'Recently'}
                        </span>
                      </div>
                      {report.status === 'resolved' && (
                        <div className="flex items-center gap-1.5 text-green-500/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Resolved by {report.resolvedBy}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {report.status === 'active' && (
                         <Button 
                           onClick={() => handleResolve(report.id)}
                           className="bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-xl px-4 py-1 h-9 text-xs font-black uppercase border border-green-500/20"
                         >
                           Resolve
                         </Button>
                       )}
                       <Button 
                         variant="ghost"
                         onClick={() => handleDelete(report.id)}
                         className="bg-zinc-800/30 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl px-3 py-1 h-9 border border-zinc-800/50"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
