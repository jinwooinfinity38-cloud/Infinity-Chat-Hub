import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function TicTacToePro({ sessionId, user, userData, onGameOver }: any) {
  const [session, setSession] = useState<any>(null);
  const size = 5;
  const winCount = 4;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'gameSessions', sessionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSession(data);
        
        if (!data.gameState) {
          updateDoc(doc(db, 'gameSessions', sessionId), {
            gameState: {
              board: Array(size * size).fill(0),
              turnId: data.hostId,
              status: 'playing'
            }
          });
        }
      }
    });
    return unsub;
  }, [sessionId]);

  const makeMove = async (index: number) => {
    if (!session || session.gameState?.status !== 'playing') return;
    if (session.gameState.turnId !== user.uid) {
      toast.error("It's not your turn!");
      return;
    }
    if (session.gameState.board[index] !== 0) return;

    const newBoard = [...session.gameState.board];
    newBoard[index] = user.uid === session.hostId ? 1 : 2;

    const winner = checkWinner(newBoard);
    const nextTurn = session.gameState.turnId === session.players[0].uid ? session.players[1].uid : session.players[0].uid;

    await updateDoc(doc(db, 'gameSessions', sessionId), {
      'gameState.board': newBoard,
      'gameState.turnId': winner ? null : nextTurn,
      'gameState.status': winner || isDraw(newBoard) ? 'finished' : 'playing',
      'winner': winner ? (winner === 1 ? session.players[0].name : session.players[1].name) : null,
      'isDraw': isDraw(newBoard) && !winner
    });

    if (winner || isDraw(newBoard)) {
      onGameOver(winner ? (winner === 1 ? session.players[0] : session.players[1]) : 'draw');
    }
  };

  const checkWinner = (b: number[]) => {
    const grid = [];
    for (let i = 0; i < size; i++) grid.push(b.slice(i * size, (i + 1) * size));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) continue;
        const p = grid[r][c];
        // Horizontal
        if (c <= size - winCount && grid[r].slice(c, c+winCount).every(v => v === p)) return p;
        // Vertical
        if (r <= size - winCount) {
          let winV = true;
          for (let i = 0; i < winCount; i++) if (grid[r+i][c] !== p) winV = false;
          if (winV) return p;
        }
        // Diagonal
        if (r <= size - winCount && c <= size - winCount) {
          let winD = true;
          for (let i = 0; i < winCount; i++) if (grid[r+i][c+i] !== p) winD = false;
          if (winD) return p;
        }
        if (r <= size - winCount && c >= winCount - 1) {
          let winD2 = true;
          for (let i = 0; i < winCount; i++) if (grid[r+i][c-i] !== p) winD2 = false;
          if (winD2) return p;
        }
      }
    }
    return null;
  };

  const isDraw = (b: number[]) => b.every(cell => cell !== 0);

  if (!session || !session.gameState) return <div>Loading grid...</div>;

  const isMyTurn = session.gameState.turnId === user.uid;
  const p1 = session.players[0];
  const p2 = session.players[1];

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[350px] mb-8">
        <PlayerAvatar player={p1} active={session.gameState.turnId === p1.uid} color="tkc-accent" label="X" />
        <div className="text-xl font-black text-zinc-700 self-center">VS</div>
        <PlayerAvatar player={p2} active={session.gameState.turnId === p2?.uid} color="yellow-400" label="O" />
      </div>

      <div className="grid grid-cols-5 gap-2 bg-zinc-900 p-2 rounded-2xl border-4 border-zinc-800">
        {session.gameState.board.map((cell: any, i: number) => (
          <div 
            key={i} 
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-black transition-all ${
              cell === 0 ? 'bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer' : 
              cell === 1 ? 'bg-tkc-accent text-white shadow-[0_0_15px_rgba(0,163,255,0.3)] animate-in zoom-in' : 
              'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-in zoom-in'
            }`}
            onClick={() => makeMove(i)}
          >
            {cell === 1 && 'X'}
            {cell === 2 && 'O'}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
         {session.gameState.status === 'playing' ? (
           <span className={`text-sm font-black uppercase tracking-widest ${isMyTurn ? 'text-tkc-accent animate-pulse' : 'text-zinc-600'}`}>
             {isMyTurn ? "Your Turn!" : `Waiting for ${session.gameState.turnId === p1.uid ? p1.name : p2.name}`}
           </span>
         ) : (
           <span className="text-xl font-black uppercase tracking-widest text-green-500">
             {session.winner ? `${session.winner} Wins!` : "It's a Draw!"}
           </span>
         )}
      </div>
    </div>
  );
}

function PlayerAvatar({ player, active, color, label }: any) {
  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${active ? `border-${color} bg-${color}/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]` : 'border-transparent'}`}>
       <div className={`w-12 h-12 rounded-xl border-2 ${active ? `border-${color}` : 'border-zinc-800'} flex items-center justify-center bg-zinc-900 font-black text-xl`}>
          {player ? <span className={`text-${color}`}>{label}</span> : <div className="w-4 h-4 rounded-full bg-zinc-800 animate-pulse" />}
       </div>
       <span className="text-xs font-black">{player?.name || '...'}</span>
    </div>
  );
}
