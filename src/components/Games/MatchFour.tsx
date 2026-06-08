import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

export function MatchFour({ sessionId, user, userData, onGameOver }: any) {
  const [session, setSession] = useState<any>(null);
  const rows = 6;
  const cols = 7;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'gameSessions', sessionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSession(data);
        
        // Initial state for MatchFour
        if (!data.gameState) {
          updateDoc(doc(db, 'gameSessions', sessionId), {
            gameState: {
              board: Array(rows).fill(null).map(() => Array(cols).fill(0)),
              turnId: data.hostId,
              status: 'playing'
            }
          });
        }
      }
    });
    return unsub;
  }, [sessionId]);

  const dropCoin = async (colIndex: number) => {
    if (!session || session.gameState?.status !== 'playing') return;
    if (session.gameState.turnId !== user.uid) {
      toast.error("It's not your turn!");
      return;
    }

    const newBoard = JSON.parse(JSON.stringify(session.gameState.board));
    let dropped = false;
    for (let r = rows - 1; r >= 0; r--) {
      if (newBoard[r][colIndex] === 0) {
        newBoard[r][colIndex] = user.uid === session.hostId ? 1 : 2;
        dropped = true;
        break;
      }
    }

    if (!dropped) return;

    // Check winner
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

  const checkWinner = (b: number[][]) => {
    // Horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 3; c++) {
        if (b[r][c] !== 0 && b[r][c] === b[r][c+1] && b[r][c] === b[r][c+2] && b[r][c] === b[r][c+3]) return b[r][c];
      }
    }
    // Vertical
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols; c++) {
        if (b[r][c] !== 0 && b[r][c] === b[r+1][c] && b[r][c] === b[r+2][c] && b[r][c] === b[r+3][c]) return b[r][c];
      }
    }
    // Diagonal
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols - 3; c++) {
        if (b[r][c] !== 0 && b[r][c] === b[r+1][c+1] && b[r][c] === b[r+2][c+2] && b[r][c] === b[r+3][c+3]) return b[r][c];
        if (b[r][c+3] !== 0 && b[r][c+3] === b[r+1][c+2] && b[r][c+3] === b[r+2][c+1] && b[r][c+3] === b[r+3][c]) return b[r][c+3];
      }
    }
    return null;
  };

  const isDraw = (b: number[][]) => b[0].every(cell => cell !== 0);

  if (!session || !session.gameState) return <div>Loading board...</div>;

  const isMyTurn = session.gameState.turnId === user.uid;
  const p1 = session.players[0];
  const p2 = session.players[1];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-[350px] mb-8">
        <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${session.gameState.turnId === p1.uid ? 'border-tkc-accent bg-tkc-accent/10 shadow-[0_0_15px_rgba(0,163,255,0.2)]' : 'border-transparent'}`}>
           <div className={`w-12 h-12 rounded-full border-2 ${session.gameState.turnId === p1.uid ? 'border-tkc-accent' : 'border-zinc-800'} overflow-hidden`}>
              <div className="w-full h-full bg-red-500 rounded-full scale-75 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" />
           </div>
           <span className="text-xs font-black">{p1.name}</span>
        </div>

        <div className="text-xl font-black text-zinc-700">VS</div>

        <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${session.gameState.turnId === p2?.uid ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-transparent'}`}>
           <div className={`w-12 h-12 rounded-full border-2 ${session.gameState.turnId === p2?.uid ? 'border-yellow-400' : 'border-zinc-800'} overflow-hidden`}>
              {p2 ? <div className="w-full h-full bg-yellow-400 rounded-full scale-75 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" /> : <div className="w-full h-full bg-zinc-800 animate-pulse" />}
           </div>
           <span className="text-xs font-black">{p2?.name || 'Waiting...'}</span>
        </div>
      </div>

      <div className="bg-zinc-900 p-3 rounded-3xl border-8 border-zinc-800 shadow-2xl relative">
        <div className="grid grid-cols-7 gap-2">
          {session.gameState.board.map((row: any, r: number) => row.map((cell: any, c: number) => (
            <div 
              key={`${r}-${c}`} 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer"
              onClick={() => dropCoin(c)}
            >
               {cell === 1 && <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full shadow-lg transition-all animate-bounce" />}
               {cell === 2 && <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full shadow-lg transition-all animate-bounce" />}
            </div>
          )))}
        </div>
        
        {/* Turn indicator */}
        <div className="absolute -bottom-16 left-0 right-0 text-center">
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
    </div>
  );
}
