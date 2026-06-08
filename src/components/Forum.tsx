import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import React from 'react';
import { doc } from 'firebase/firestore';

interface ForumProps {
  postId: string | null;
  user: User;
  setPostId: (id: string | null) => void;
}

export function Forum({ postId, user, setPostId }: ForumProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

  useEffect(() => {
    const q = query(collection(db, 'forums'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'forums');
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      await addDoc(collection(db, 'forums'), {
        ...newPost,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        commentCount: 0
      });
      setShowCreate(false);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'forums');
    }
  };

  if (postId) {
    return <PostDetail postId={postId} user={user} onBack={() => setPostId(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-tkc-bg">
      {/* Forum Header */}
      <div className="p-8 border-b border-zinc-800 bg-tkc-sidebar/50">
        <div className="max-w-5xl mx-auto flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white">Infinity <span className="text-tkc-accent">Forums</span></h1>
            <p className="text-zinc-400 font-medium">Connect, share, and discuss with the community.</p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="tkc-button-primary px-6 h-12 font-bold shadow-lg shadow-tkc-accent/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Discussion
          </Button>
        </div>
      </div>

      {/* Forum Content */}
      <ScrollArea className="flex-1 p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="secondary" className="rounded-full px-6 bg-zinc-900 text-white border-zinc-800">
                <Clock className="w-4 h-4 mr-2" />
                Latest
              </Button>
              <Button variant="ghost" className="rounded-full px-6 text-zinc-500 hover:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input className="bg-zinc-900 border-zinc-800 pl-10 rounded-full h-10 text-sm" placeholder="Search discussions..." />
              </div>
            </div>

            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => setPostId(post.id)}
                className="cursor-pointer"
              >
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-tkc-accent/50 transition-all group rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-tkc-accent/10 text-tkc-accent border-tkc-accent/20 text-[10px] uppercase tracking-wider font-bold">
                            {post.category}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {post.createdAt?.seconds ? format(post.createdAt.seconds * 1000, 'MMM d, yyyy') : '...'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-tkc-accent transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-zinc-400 line-clamp-2 text-sm leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 border border-zinc-800">
                              <AvatarFallback className="text-[10px]">{post.authorName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-zinc-300">{post.authorName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs font-bold">{post.commentCount || 0}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Rules & Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-400">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-tkc-accent mt-1.5" />
                  <p className="font-medium">Be respectful to all members.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-tkc-accent mt-1.5" />
                  <p className="font-medium">No bullying or harassment.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-tkc-accent mt-1.5" />
                  <p className="font-medium">Keep personal info private.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Top Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['General', 'Gaming', 'School', 'Music', 'Advice'].map(cat => (
                  <Button key={cat} variant="ghost" className="w-full justify-between text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold text-xs uppercase tracking-wider">
                    {cat}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-500 border-zinc-700">12</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-tkc-card border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Start a Discussion</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="rounded-full">
                <Plus className="w-6 h-6 rotate-45" />
              </Button>
            </div>
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Title</label>
                <Input 
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  placeholder="What's on your mind?"
                  className="bg-zinc-950 border-zinc-800 h-12 text-lg font-bold rounded-xl focus:border-tkc-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['General', 'Gaming', 'School', 'Music', 'Advice'].map(cat => (
                    <Button
                      key={cat}
                      type="button"
                      variant={newPost.category === cat ? 'secondary' : 'outline'}
                      onClick={() => setNewPost({...newPost, category: cat})}
                      className={`rounded-full text-xs font-bold uppercase tracking-wider ${newPost.category === cat ? 'bg-tkc-accent text-white border-tkc-accent' : 'border-zinc-800 text-zinc-400'}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Content</label>
                <textarea 
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-100 focus:outline-none focus:border-tkc-accent transition-colors resize-none text-sm leading-relaxed"
                  placeholder="Tell us more..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="font-bold uppercase tracking-wider text-xs">Cancel</Button>
                <Button type="submit" className="tkc-button-primary px-8 font-bold uppercase tracking-wider text-xs h-11">Post Discussion</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PostDetail({ postId, user, onBack }: { postId: string, user: User, onBack: () => void }) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const unsubscribePost = onSnapshot(doc(db, 'forums', postId), (doc) => {
      setPost({ id: doc.id, ...doc.data() });
    });

    const q = query(collection(db, 'forums', postId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribePost();
      unsubscribeComments();
    };
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, 'forums', postId, 'comments'), {
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `forums/${postId}/comments`);
    }
  };

  if (!post) return null;

  return (
    <div className="h-full flex flex-col bg-tkc-bg">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-4 bg-tkc-sidebar/50">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-bold uppercase tracking-widest text-xs">Discussion</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-zinc-800">
                <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white">{post.authorName}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {post.createdAt?.seconds ? format(post.createdAt.seconds * 1000, 'MMM d, yyyy HH:mm') : '...'}
                </p>
              </div>
              <Badge className="ml-auto bg-tkc-accent/10 text-tkc-accent border-tkc-accent/20 text-[10px] uppercase tracking-wider font-bold">
                {post.category}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">{post.title}</h1>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg font-medium">
              {post.content}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-6 pb-20">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-tkc-accent" />
              Comments ({comments.length})
            </h3>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <Avatar className="w-8 h-8 border border-zinc-800">
                    <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-200">{comment.authorName}</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {comment.createdAt?.seconds ? format(comment.createdAt.seconds * 1000, 'HH:mm') : '...'}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <Avatar className="w-10 h-10 border border-zinc-800">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <textarea 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100 focus:outline-none focus:border-tkc-accent transition-colors resize-none text-sm font-medium"
                  placeholder="Write a comment..."
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()} className="tkc-button-primary px-6 font-bold uppercase tracking-wider text-xs h-10">
                    Post Comment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
