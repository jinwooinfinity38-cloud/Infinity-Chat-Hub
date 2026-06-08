import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function RPSBattle({ sessionId, user, userData, onGameOver }: any) {
  const [session, setSession] = useState<any>(null);
  const [myChoice, setMyChoice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'gameSessions', sessionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSession(data);
        
        if (!data.gameState) {
          updateDoc(doc(db, 'gameSessions', sessionId), {
            gameState: {
              p1Health: 3,
              p2Health: 3,
              p1Choice: null,
              p2Choice: null,
              round: 1,
              status: 'playing',
              lastResult: null
            }
          });
        }

        // Logic to process round once both chose
        if (data.gameState?.p1Choice && data.gameState?.p2Choice) {
          processRound(data);
        }
      }
    });
    return unsub;
  }, [sessionId]);

  const processRound = async (data: any) => {
    if (data.hostId !== user.uid) return; // Only host processes logic to avoid double updates
    
    setTimeout(async () => {
      const { p1Choice, p2Choice, p1Health, p2Health, round } = data.gameState;
      let newP1Health = p1Health;
      let newP2Health = p2Health;
      let result = '';

      if (p1Choice === p2Choice) {
        result = "It's a draw!";
      } else if (
        (p1Choice === 'rock' && p2Choice === 'scissors') ||
        (p1Choice === 'paper' && p2Choice === 'rock') ||
        (p1Choice === 'scissors' && p2Choice === 'paper')
      ) {
        newP2Health -= 1;
        result = `${data.players[0].name} wins round!`;
      } else {
        newP1Health -= 1;
        result = `${data.players[1].name} wins round!`;
      }

      const winner = newP1Health <= 0 ? data.players[1].name : (newP2Health <= 0 ? data.players[0].name : null);
      
      await updateDoc(doc(db, 'gameSessions', sessionId), {
        'gameState.p1Choice': null,
        'gameState.p2Choice': null,
        'gameState.p1Health': newP1Health,
        'gameState.p2Health': newP2Health,
        'gameState.round': round + 1,
        'gameState.lastResult': result,
        'gameState.status': winner ? 'finished' : 'playing',
        'winner': winner
      });

      if (winner) {
         onGameOver(newP1Health <= 0 ? data.players[1] : data.players[0]);
      }
    }, 2000);
  };

  const makeChoice = async (choice: string) => {
    if (!session || session.gameState?.status !== 'playing') return;
    const isP1 = user.uid === session.hostId;
    if (isP1 && session.gameState.p1Choice) return;
    if (!isP1 && session.gameState.p2Choice) return;

    setMyChoice(choice);
    await updateDoc(doc(db, 'gameSessions', sessionId), {
      [`gameState.${isP1 ? 'p1Choice' : 'p2Choice'}`]: choice
    });
  };

  if (!session || !session.gameState) return <div>Ready to battle...</div>;

  const isP1 = user.uid === session.hostId;
  const h1 = session.gameState.p1Health;
  const h2 = session.gameState.p2Health;
  const waiting = (isP1 && !session.gameState.p1Choice) || (!isP1 && !session.gameState.p2Choice);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-12">
        <HealthBar name={session.players[0].name} health={h1} active={isP1} color="tkc-accent" />
        <div className="text-xl font-black text-zinc-700 self-center">VS</div>
        <HealthBar name={session.players[1]?.name || '?'} health={h2} active={!isP1} color="tkc-ruby" />
      </div>

      <div className="text-center mb-8 h-8">
         <span className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {session.gameState.lastResult || `ROUND ${session.gameState.round}`}
         </span>
      </div>

      {session.gameState.status === 'playing' ? (
        <div className="flex gap-4">
          <ChoiceBtn label="ROCK" icon="🪨" value="rock" onSelect={makeChoice} active={myChoice === 'rock'} disabled={!waiting} />
          <ChoiceBtn label="PAPER" icon="📄" value="paper" onSelect={makeChoice} active={myChoice === 'paper'} disabled={!waiting} />
          <ChoiceBtn label="SCISSORS" icon="✂️" value="scissors" onSelect={makeChoice} active={myChoice === 'scissors'} disabled={!waiting} />
        </div>
      ) : (
        <div className="text-3xl font-black text-green-500 animate-bounce">
           {session.winner} WINS BATTLE!
        </div>
      )}

      {waiting && (
        <p className="mt-8 text-tkc-accent animate-pulse font-bold uppercase text-[10px] tracking-widest">Select your weapon!</p>
      )}
      {!waiting && session.gameState.status === 'playing' && (
        <p className="mt-8 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Waiting for opponent...</p>
      )}
    </div>
  );
}

function HealthBar({ name, health, color }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
       <span className="text-sm font-black">{name}</span>
       <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-8 h-2 rounded-full ${i < health ? `bg-${color}` : 'bg-zinc-800'}`} />
          ))}
       </div>
    </div>
  );
}

function ChoiceBtn({ label, icon, value, onSelect, active, disabled }: any) {
  return (
    <button 
      className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
        active ? 'border-tkc-accent bg-tkc-accent/10 shadow-[0_0_20px_rgba(0,163,255,0.2)]' : 
        disabled ? 'border-zinc-800 bg-zinc-900/50 opacity-50 grayscale cursor-not-allowed' : 
        'border-zinc-800 bg-zinc-900 hover:border-zinc-600 active:scale-95'
      }`}
      onClick={() => onSelect(value)}
      disabled={disabled}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </button>
  );
}
