import { useEffect } from 'react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const OWNER_EMAIL = "jinwooinfinity38@gmail.com";

export function useEconomy(user: any, userData: any) {
  useEffect(() => {
    if (!user || !userData) return;

    // Currency update every minute
    const currencyInterval = setInterval(async () => {
      const isOwner = user.email === OWNER_EMAIL;
      const userRef = doc(db, 'users', user.uid);

      const updates: any = {
        rubies: increment(isOwner ? 1000 : 15),
        crystals: increment(isOwner ? 500 : 5),
        timeOnlineMinutes: increment(1),
        lastActive: serverTimestamp()
      };

      if (isOwner) {
        updates.tokens = increment(100);
      }

      const currentMinutes = (userData?.timeOnlineMinutes || 0) + 1;
      if (currentMinutes >= 5 && (userData?.rank === 'User' || !userData?.rank)) {
        updates.rank = 'E';
      }

      try {
        await updateDoc(userRef, updates);
      } catch (err) {
        console.error('Failed to update currency:', err);
      }
    }, 60000); // 1 minute

    // XP update every 10 minutes
    const xpInterval = setInterval(async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          xp: increment(15)
        });
      } catch (err) {
        console.error('Failed to update XP:', err);
      }
    }, 600000); // 10 minutes

    return () => {
      clearInterval(currencyInterval);
      clearInterval(xpInterval);
    };
  }, [user, userData?.uid]);
}
