import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback((type: 'message' | 'alert') => {
    const soundUrls = {
      message: 'https://actions.google.com/sounds/v1/notifications/chime.ogg',
      alert: 'https://actions.google.com/sounds/v1/notifications/warning.ogg'
    };
    
    const audio = new Audio(soundUrls[type]);
    audio.play().catch(e => console.error("Error playing sound:", e));
  }, []);

  return { playSound };
};
