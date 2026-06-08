import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

export function SnakeGame({ onWin }: { onWin: (score: number) => void }) {
  const GRID_SIZE = 20;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout>(null!);

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    setSnake((prev) => {
      const newHead = {
        x: (prev[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (prev[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake]);

  const resetGame = () => {
    if (score > 100) onWin(score);
    setSnake(INITIAL_SNAKE);
    setFood({ x: 5, y: 5 });
    setDirection({ x: 0, y: -1 });
    setIsGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full max-w-[400px]">
        <div className="flex items-center gap-2">
           <Trophy className="w-5 h-5 text-tkc-accent" />
           <span className="font-black text-xl">{score}</span>
        </div>
        {isGameOver && (
          <Button onClick={resetGame} variant="ghost" className="bg-tkc-accent text-white gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
        )}
      </div>

      <div 
        className="grid bg-zinc-900 border-4 border-zinc-800 rounded-xl overflow-hidden"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: 'min(90vw, 400px)',
          height: 'min(90vw, 400px)'
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div 
              key={i} 
              className={`w-full h-full rounded-[2px] ${
                isHead ? 'bg-tkc-accent' : 
                isSnake ? 'bg-tkc-accent/40' : 
                isFood ? 'bg-tkc-ruby animate-pulse' : 
                'bg-transparent'
              }`}
            />
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <Button size="icon" className="bg-zinc-800" onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })}>↑</Button>
        <div />
        <Button size="icon" className="bg-zinc-800" onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })}>←</Button>
        <Button size="icon" className="bg-zinc-800" onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })}>↓</Button>
        <Button size="icon" className="bg-zinc-800" onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })}>→</Button>
      </div>
    </div>
  );
}
