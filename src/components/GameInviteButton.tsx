import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from './ui/button';

export function GameInviteButton({ sessionId, text }: { sessionId: string, text: string }) {
  const [status, setStatus] = useState<'waiting' | 'full' | 'expired'>('waiting');

  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(doc(db, 'gameSessions', sessionId), (snap) => {
      if (!snap.exists()) {
        setStatus('expired');
        return;
      }
      const data = snap.data();
      if (data.status === 'expired') setStatus('expired');
      else if (data.players.length >= 2) setStatus('full');
      else setStatus('waiting');
    });
    return unsub;
  }, [sessionId]);

  const isDisabled = status !== 'waiting';

  return (
    <Button 
      className={`w-full font-black uppercase text-xs tracking-widest py-2 rounded-lg 
        ${isDisabled ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-400 hover:bg-yellow-500'} 
        text-black`}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled)
          window.dispatchEvent(new CustomEvent('join-game', { detail: { sessionId } }));
      }}
    >
      {isDisabled ? 'Link Expired/Full' : 'Join Game'}
    </Button>
  );
}
