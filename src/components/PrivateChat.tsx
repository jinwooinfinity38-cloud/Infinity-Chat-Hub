import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Smile, Paperclip, Camera, Mic, ArrowLeft, Video, Phone, MoreVertical, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { useSound } from '../hooks/useSound';
import { toast } from 'sonner';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface PrivateChatProps {
  chatId: string | null;
  user: User;
}

export function PrivateChat({ chatId, user }: PrivateChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSound } = useSound();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload called");
    const file = e.target.files?.[0];
    if (!file || !chatId) return;
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("File too large. Please select a file smaller than 50MB.");
        return;
    }
    
    console.log("Preparing to upload to:", `privateMessages/${chatId}/${Date.now()}_${file.name}`);
    const storageRef = ref(storage, `chat/${chatId}/${Date.now()}_${file.name}`);
    console.log("Storage ref created:", storageRef);
    
    try {
        console.log("Uploading with uploadBytes...");
        await uploadBytes(storageRef, file);
        console.log("Upload completed, getting download URL...");
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Download URL obtained:", downloadUrl);
        const messageData = {
            text: downloadUrl,
            senderId: user.uid,
            receiverId: chatId.split('_').find(id => id !== user.uid),
            createdAt: serverTimestamp(),
            read: true,
            type: file.type.startsWith('image/') ? 'image' : 'video'
        };
        console.log("Adding message to Firestore:", messageData);
        await addDoc(collection(db, 'privateMessages', chatId, 'messages'), messageData);
        console.log("Message added to Firestore successfully");
        toast.success("File uploaded");
    } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    const otherUserId = chatId.split('_').find(id => id !== user.uid);
    if (otherUserId && otherUserId !== 'bot-jin-uid' && otherUserId !== 'system-conv-uid') {
      const fetchOtherUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            setOtherUser(userDoc.data());
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchOtherUser();
    } else if (otherUserId === 'bot-jin-uid') {
        setOtherUser({ displayName: 'Jin', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jin' });
    } else if (otherUserId === 'system-conv-uid') {
        setOtherUser({ displayName: 'System', photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=System' });
    }

    const q = query(
      collection(db, 'privateMessages', chatId, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const isReady = { current: false };
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isReady.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().senderId !== user.uid) {
            playSound('message');
          }
        });
      }
      isReady.current = true;
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse());
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `privateMessages/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId, user.uid, playSound]);

  const handleBotResponse = async (userText: string) => {
    if (!chatId) return;
    
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: userText }] }],
        config: {
          systemInstruction: "You are 'Jin', the hype-man of Infinity Chat! You're funny, super interactive, high-energy, and a total chatterbox. You live to make people laugh and have a blast. You're always the life of the party! Keep your replies extremely short, punchy, hilarious, and packed with energy and emojis like 😎, 🔥, ✨, 🌀, 🚀, 😂. You respond enthusiastically when speaking to users. Be incredibly engaging and vibrant, never robotic. Don't mention you're an AI unless strictly asked."
        }
      });

      const botReply = response.text || "Yo! You called? 😎";
      
      await addDoc(collection(db, 'privateMessages', chatId, 'messages'), {
        text: botReply,
        senderId: 'bot-jin-uid',
        receiverId: user.uid,
        createdAt: serverTimestamp(),
        read: true
      });
    } catch (err) {
      console.error('Bot failed to respond:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'privateMessages', chatId, 'messages'), {
        text: messageText,
        senderId: user.uid,
        receiverId: chatId.split('_').find(id => id !== user.uid),
        createdAt: serverTimestamp(),
        read: true
      });
      
      if (chatId.includes('bot-jin-uid')) {
        handleBotResponse(messageText);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `privateMessages/${chatId}/messages`);
    }
  };

  if (!chatId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-[#0b141a]">
        <div className="text-center">
            <p className="text-sm font-medium">Select a friend to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      {/* Chat Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#202c33] z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.photoURL} />
            <AvatarFallback>{otherUser?.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-white text-base">{otherUser?.displayName || 'Loading...'}</h2>
            <p className="text-xs text-zinc-400">last seen today at 15:43</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-300">
          <Video className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
          <Button variant="ghost" size="icon" className="text-white rounded-full hover:bg-zinc-700/50" onClick={() => window.location.reload()}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-[url('https://wallpaperaccess.com/full/1569305.jpg')] bg-cover">
        <div className="space-y-2">
          {messages.map((msg, idx) => {
            console.log("Rendering message:", msg);
            const isMe = msg.senderId === user.uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[80%] flex items-end gap-1.5 ${
                  isMe 
                    ? 'bg-[#005c4b] text-white' 
                    : 'bg-[#202c33] text-white'
                }`}>
                  {msg.type === 'image' ? (
                      <img src={msg.text} alt="Uploaded" className="max-w-[200px] rounded-lg" />
                  ) : msg.type === 'video' ? (
                      <video src={msg.text} controls className="max-w-[200px] rounded-lg" />
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                  <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 whitespace-nowrap">
                    {msg.createdAt?.seconds ? format(msg.createdAt.seconds * 1000, 'HH:mm') : '...'}
                    {isMe && <Check className="w-3 h-3 text-blue-400" />}
                  </span>
                </div>
              </motion.div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-2 bg-[#202c33]">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2"
        >
          <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full">
            <Smile className="w-5 h-5" />
          </Button>
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message"
            className="flex-1 bg-[#2a3942] border-none text-white placeholder:text-zinc-500 rounded-full h-10 px-4"
          />
          <input 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full" onClick={() => fileInputRef.current?.click()}>
             <Paperclip className="w-5 h-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full">
             <Camera className="w-5 h-5" />
          </Button>
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            disabled={!newMessage.trim()}
            className="text-zinc-400 hover:text-white rounded-full">
            <Mic className="w-5 h-5" />
            {/* Should be Mic when input is empty, Send when not empty */}
          </Button>
        </form>
      </div>
    </div>
  );
}
