import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { X, Plus, Send, Settings, User, Heart, MessageSquare, Paperclip, Smile } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NewsWallProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
  userData: any;
}

export function NewsWall({ isOpen, onClose, user, userData }: NewsWallProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postText, setPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleCreatePost = async () => {
    if (!postText.trim() || !user) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'news'), {
        text: postText,
        authorId: user.uid,
        authorName: userData?.displayName || user.displayName || 'Anonymous',
        authorPhoto: userData?.photoURL || user.photoURL,
        createdAt: serverTimestamp(),
        likes: 0,
        commentsCount: 0
      });
      setPostText('');
      setIsCreatingPost(false);
    } catch (error) {
      console.error("Error creating news post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#121212] border-none text-white max-w-4xl w-[95vw] h-[90vh] p-0 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">News panel</h2>
            <Button variant="ghost" size="icon" className="hover:bg-zinc-800 rounded-full" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Bar with Add Button */}
            <div className="p-4 flex items-center gap-4">
              <Button 
                className="bg-[#00a3ff] hover:bg-[#0082cc] text-white font-bold rounded-lg px-4 flex items-center gap-2"
                onClick={() => setIsCreatingPost(true)}
              >
                <div className="bg-white/20 rounded-full p-0.5">
                  <Plus className="w-4 h-4 fill-white text-[#00a3ff]" />
                </div>
                Add
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              {posts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-32 h-32 text-zinc-700 mb-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                       <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5S16.17 11 17 11zm-5 4c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                    </svg>
                  </div>
                  <p className="text-zinc-500 font-medium text-lg">There are no news posts to show</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 pb-20 max-w-2xl mx-auto">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                          {post.authorPhoto ? (
                            <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[15px]">{post.authorName}</h4>
                          <span className="text-[11px] text-zinc-500">
                            {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-100 text-[15px] leading-relaxed whitespace-pre-wrap">{post.text}</p>
                      <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors group">
                          <Heart className="w-5 h-5 group-hover:fill-current" />
                          <span className="text-sm font-bold">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-zinc-500 hover:text-tkc-accent transition-colors group">
                          <MessageSquare className="w-5 h-5 group-hover:fill-current" />
                          <span className="text-sm font-bold">{post.commentsCount}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create News Modal */}
      <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
        <DialogContent className="bg-[#1c1c1c] border-none text-white max-w-md w-[90vw] p-0 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold tracking-tight">Create a news post</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-zinc-800 rounded-full h-8 w-8 text-zinc-400 hover:text-white" 
                onClick={() => setIsCreatingPost(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-[#121212] rounded-2xl p-4 min-h-[200px] flex flex-col mb-4">
              <Textarea 
                placeholder="Type here..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-zinc-300 placeholder:text-zinc-600 resize-none text-[15px]"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="flex items-center justify-between mt-4">
                 <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
                    <Settings className="w-6 h-6" />
                 </Button>
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
                        <Smile className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
                        <Paperclip className="w-6 h-6" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-400 hover:text-white rounded-full"
                      onClick={handleCreatePost}
                      disabled={!postText.trim() || isPosting}
                    >
                        <Send className="w-6 h-6 fill-current" />
                    </Button>
                 </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
