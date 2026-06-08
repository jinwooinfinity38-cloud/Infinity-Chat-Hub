import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

export function Game2048({ onWin }: { onWin: (score: number) => void }) {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initBoard = () => {
    let newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandom(newBoard);
    addRandom(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  };

  const addRandom = (b: number[][]) => {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      b[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  useEffect(() => {
    initBoard();
  }, []);

  const move = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;
    let newBoard = JSON.parse(JSON.stringify(board));
    let moved = false;

    // Implementation of 2048 move logic...
    // To keep it simple, I'll use a helper for shift/merge
    const shift = (row: number[]) => {
      let filtered = row.filter(x => x !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          setScore(s => s + filtered[i]);
          if (filtered[i] === 2048) onWin(score + filtered[i]);
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    };

    if (dir === 'LEFT') {
      for (let r = 0; r < 4; r++) newBoard[r] = shift(newBoard[r]);
    } else if (dir === 'RIGHT') {
      for (let r = 0; r < 4; r++) newBoard[r] = shift([...newBoard[r]].reverse()).reverse();
    } else if (dir === 'UP') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        let newCol = shift(col);
        for (let r = 0; r < 4; r++) newBoard[r][c] = newCol[r];
      }
    } else if (dir === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        let newCol = shift([...col].reverse()).reverse();
        for (let r = 0; r < 4; r++) newBoard[r][c] = newCol[r];
      }
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      addRandom(newBoard);
      setBoard(newBoard);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('UP');
      if (e.key === 'ArrowDown') move('DOWN');
      if (e.key === 'ArrowLeft') move('LEFT');
      if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [board, gameOver]);

  const COLORS: { [key: number]: string } = {
    0: 'bg-zinc-800',
    2: 'bg-zinc-200 text-zinc-800',
    4: 'bg-zinc-300 text-zinc-800',
    8: 'bg-orange-300 text-white',
    16: 'bg-orange-500 text-white',
    32: 'bg-orange-600 text-white',
    64: 'bg-orange-700 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-tkc-accent text-white',
    2048: 'bg-tkc-ruby text-white shadow-[0_0_20px_rgba(255,0,0,0.4)]',
  };

  return (
    <div className="flex flex-col items-center">
       <div className="mb-6 flex items-center justify-between w-full max-w-[320px]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score</span>
          <span className="font-black text-2xl leading-none">{score}</span>
        </div>
        <Button onClick={initBoard} variant="ghost" className="bg-zinc-900 text-zinc-400 hover:text-white rounded-xl gap-2 border border-zinc-800">
           <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-zinc-900 p-2 rounded-2xl border-4 border-zinc-800">
        {board.map((row, r) => row.map((val, c) => (
          <div 
            key={`${r}-${c}`} 
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-100 ${COLORS[val] || 'bg-tkc-ruby'}`}
          >
            {val !== 0 && val}
          </div>
        )))}
      </div>

      <p className="mt-6 text-zinc-500 text-xs font-bold uppercase tracking-widest">Use Arrow Keys to Merge Tiles</p>
    </div>
  );
}
