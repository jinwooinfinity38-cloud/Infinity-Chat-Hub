import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, getDocs, getDoc } from 'firebase/firestore';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { X, Gamepad2, Users, User, Trophy, Play, Info, AlertTriangle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { SnakeGame } from './Games/SnakeGame';
import { Game2048 } from './Games/Game2048';
import { MatchFour } from './Games/MatchFour';
import { TicTacToePro } from './Games/TicTacToePro';
import { RPSBattle } from './Games/RPSBattle';

interface Game {
  id: string;
  name: string;
  description: string;
  players: 1 | 2;
  icon: string;
  category: string;
}

const GAMES: Game[] = [
  { id: 'match-four', name: 'Match Four', description: 'Classic strategy: Connect 4 of your coins in a row to win!', players: 2, icon: '🔴', category: 'Strategy' },
  { id: 'tic-tac-toe-pro', name: 'Tic-Tac-Toe Pro', description: '5x5 Grid. Get 4 in a row! More space, more challenge.', players: 2, icon: '❌', category: 'Mind' },
  { id: 'rps-battle', name: 'RPS Battle', description: 'Rock Paper Scissors but with health points. Survival of the fittest!', players: 2, icon: '✂️', category: 'Action' },
  { id: 'snake', name: 'Snake', description: 'Eat to grow, but don\'t hit the walls or yourself!', players: 1, icon: '🐍', category: 'Arcade' },
  { id: '2048', name: '2048', description: 'Swipe to merge tiles and reach the 2048 tile!', players: 1, icon: '🔢', category: 'Puzzle' },
];

export function ArcadeModal({ isOpen, onClose, user, userData }: { isOpen: boolean, onClose: () => void, user: any, userData: any }) {
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    const handleJoin = async (e: any) => {
      const { sessionId } = e.detail;
      const sessionRef = doc(db, 'gameSessions', sessionId);
      const roomsQuery = query(collection(db, 'rooms'), where('name', '==', 'Infinity Room'));
      const roomsSnap = await getDocs(roomsQuery);
      
      onSnapshot(sessionRef, async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        
        if (data.status === 'expired') {
          toast.error("Invitation expired!");
          return;
        }

        if (data.players.length >= 2 && !data.players.find((p: any) => p.uid === user.uid)) {
          toast.error("⚠️ The game is full ⚠️");
          return;
        }

        if (!data.players.find((p: any) => p.uid === user.uid)) {
          // Join the game
          await updateDoc(sessionRef, {
            players: [...data.players, { uid: user.uid, name: userData?.displayName || user.displayName || 'Guest' }],
            status: 'playing'
          });
        }

        setActiveSession({ id: sessionId, gameId: data.gameId, mode: 'multi', role: data.hostId === user.uid ? 'host' : 'guest' });
      });
    };

    window.addEventListener('join-game', handleJoin as any);
    return () => window.removeEventListener('join-game', handleJoin as any);
  }, [user, userData]);

  const startSinglePlayer = (game: Game) => {
    setActiveSession({ gameId: game.id, mode: 'single' });
  };

  const startMultiplayer = async (game: Game) => {
    if (!user) return;

    try {
      const sessionRef = await addDoc(collection(db, 'gameSessions'), {
        gameId: game.id,
        gameName: game.name,
        hostId: user.uid,
        hostName: userData?.displayName || user.displayName || 'Guest',
        status: 'waiting',
        players: [{ uid: user.uid, name: userData?.displayName || user.displayName || 'Guest' }],
        createdAt: serverTimestamp(),
      });

      const roomsQuery = query(collection(db, 'rooms'), where('name', '==', 'Infinity Room'));
      const roomsSnap = await getDocs(roomsQuery);
      let targetRoomId = roomsSnap.empty ? 'all' : roomsSnap.docs[0].id;

      await addDoc(collection(db, `rooms/${targetRoomId}/messages`), {
        text: `${userData?.displayName || user.displayName} has started a game of ${game.name}, click the link below to join`,
        senderId: 'SYSTEM',
        senderName: 'Arcade System',
        type: 'game_invite',
        gameSessionId: sessionRef.id,
        gameName: game.name,
        createdAt: serverTimestamp(),
      });

      toast.success("Game invite sent to chat!");
      setActiveSession({ id: sessionRef.id, gameId: game.id, mode: 'multi', role: 'host' });

      // Handle expiration
      setTimeout(async () => {
        const docRef = doc(db, 'gameSessions', sessionRef.id);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data().status === 'waiting') {
           await updateDoc(docRef, { status: 'expired' });
           toast.error("Invitation expired - no one joined.");
           setActiveSession((prev: any) => prev?.id === sessionRef.id ? null : prev);
        }
      }, 15000);

    } catch (err) {
      console.error("Error starting game:", err);
      toast.error("Failed to start game.");
    }
  };

  const postGameResult = async (result: any) => {
    if (!user) return;
    const roomsQuery = query(collection(db, 'rooms'), where('name', '==', 'Infinity Room'));
    const roomsSnap = await getDocs(roomsQuery);
    let targetRoomId = roomsSnap.empty ? 'all' : roomsSnap.docs[0].id;

    if (activeSession.mode === 'single') {
       // Accumulate score
       if (typeof result === 'number') {
         await updateDoc(doc(db, 'users', user.uid), {
           totalGameScore: (userData?.totalGameScore || 0) + result
         });
       }
    } else if (sessionData) {
       let text = "";
       if (result === 'draw') {
          text = `GAME OVER: Draw in ${activeSession.gameId}! ${sessionData.players[0].name} and ${sessionData.players[1].name} are both legends.`;
       } else {
          text = `GAME OVER: ${result.name} WON ${activeSession.gameId}! Better luck next time ${sessionData.players.find((p: any) => p.uid !== result.uid)?.name || 'Opponent'}.`;
          
          // Add points for the winner if it's the current user
          if (result.uid === user.uid) {
            await updateDoc(doc(db, 'users', user.uid), {
              totalGameScore: (userData?.totalGameScore || 0) + 100
            });
          }
       }

       await addDoc(collection(db, `rooms/${targetRoomId}/messages`), {
         text,
         senderId: 'SYSTEM',
         senderName: 'Arcade System',
         type: 'game_result',
         result: result === 'draw' ? 'draw' : { 
           winner: result.name, 
           loser: sessionData.players.find((p: any) => p.uid !== result.uid)?.name || 'Opponent' 
         },
         createdAt: serverTimestamp(),
       });
    }
    setActiveSession(null);
  };

  const [sessionData, setSessionData] = useState<any>(null);
  useEffect(() => {
    if (activeSession?.id && activeSession.mode === 'multi') {
      const unsub = onSnapshot(doc(db, 'gameSessions', activeSession.id), (snap) => {
        setSessionData(snap.data());
      });
      return unsub;
    }
  }, [activeSession]);

  if (activeSession) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black border-none text-white max-w-5xl w-[95vw] h-[90vh] p-0 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
           <div className="h-full flex flex-col relative bg-zinc-950">
              <div className="absolute top-4 right-4 z-50">
                  <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-zinc-800" onClick={() => setActiveSession(null)}>
                    <X className="w-5 h-5" />
                  </Button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-4">
                 {activeSession.gameId === 'snake' && <SnakeGame onWin={postGameResult} />}
                 {activeSession.gameId === '2048' && <Game2048 onWin={postGameResult} />}
                 {activeSession.gameId === 'match-four' && <MatchFour sessionId={activeSession.id} user={user} userData={userData} onGameOver={postGameResult} />}
                 {activeSession.gameId === 'tic-tac-toe-pro' && <TicTacToePro sessionId={activeSession.id} user={user} userData={userData} onGameOver={postGameResult} />}
                 {activeSession.gameId === 'rps-battle' && <RPSBattle sessionId={activeSession.id} user={user} userData={userData} onGameOver={postGameResult} />}
                 
                 {activeSession.mode === 'multi' && sessionData?.status === 'waiting' && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                       <div className="w-20 h-20 rounded-full border-4 border-tkc-accent border-t-transparent animate-spin mb-4" />
                       <h2 className="text-2xl font-black">Waiting for opponent...</h2>
                       <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Expires in 15s</p>
                    </div>
                 )}
              </div>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-zinc-800 text-white max-w-4xl w-[95vw] h-[90vh] p-0 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-tkc-accent/20 p-2 rounded-xl">
              <Gamepad2 className="w-6 h-6 text-tkc-accent" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Teen Arcade</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Compete. Win. Dominate.</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {GAMES.map((game) => (
              <div 
                key={game.id} 
                className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden transition-all hover:border-tkc-accent hover:shadow-[0_0_20px_rgba(0,163,255,0.1)]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{game.icon}</div>
                    <Badge className={game.players === 2 ? "bg-tkc-ruby text-white" : "bg-tkc-accent text-white"}>
                      {game.players === 2 ? <Users className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {game.players} Player
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-tkc-accent transition-colors">{game.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    {game.description}
                  </p>

                  <div className="flex gap-2">
                    {game.players === 2 ? (
                      <Button 
                        className="flex-1 bg-tkc-ruby hover:bg-tkc-ruby/80 text-white font-bold rounded-xl gap-2"
                        onClick={() => startMultiplayer(game)}
                      >
                        <Users className="w-4 h-4" />
                        Find Opponent
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 bg-tkc-accent hover:bg-tkc-accent/80 text-white font-bold rounded-xl gap-2"
                        onClick={() => startSinglePlayer(game)}
                      >
                        <Play className="w-4 h-4" />
                        Play Now
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Decorative background number/icon */}
                <div className="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] pointer-events-none font-black italic">
                   {game.id.split('-')[0].slice(0, 1).toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/80 border border-dashed border-zinc-700 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="bg-zinc-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
               <Trophy className="w-8 h-8 text-zinc-600" />
            </div>
            <h4 className="text-xl font-bold mb-2">Arcade Rewards</h4>
            <p className="text-zinc-500 text-sm max-w-sm">Win games to climb the global leaderboard and earn exclusive Rubies & Badges for your profile.</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function GameLoader({ session, user, userData, onClose }: any) {
  // This will render the actual game based on gameId
  // For now a placeholder
  return (
    <div className="h-full flex flex-col relative bg-zinc-950">
       <div className="absolute top-4 right-4 z-50">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white hover:bg-zinc-800" onClick={onClose}>
             <X className="w-5 h-5" />
          </Button>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Gamepad2 className="w-16 h-16 text-tkc-accent animate-bounce mb-6" />
          <h2 className="text-3xl font-black mb-2">Game Starting...</h2>
          <p className="text-zinc-500">Connecting to {session.gameId} hub</p>
          
          {session.mode === 'multi' && (
            <div className="mt-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 max-w-md w-full">
               <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-tkc-accent"></div>
                    <span className="mt-2 text-sm font-bold">{userData.displayName}</span>
                  </div>
                  <div className="text-2xl font-black text-zinc-700">VS</div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center">
                       <Users className="w-6 h-6 text-zinc-600 animate-pulse" />
                    </div>
                    <span className="mt-2 text-sm text-zinc-600 font-bold">Waiting...</span>
                  </div>
               </div>
               <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest bg-black/40 py-2 rounded-lg">
                  Invitation expires in 15 seconds
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
