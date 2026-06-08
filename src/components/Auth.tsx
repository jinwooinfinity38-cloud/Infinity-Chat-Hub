import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion } from 'motion/react';
import { MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Auth() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Welcome to Infinity Chat!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-tkc-bg p-4 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tkc-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tkc-ruby/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-tkc-card border-zinc-800 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-10">
            <div className="mx-auto w-20 h-20 bg-tkc-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-tkc-accent/20 rotate-3 group-hover:rotate-0 transition-transform">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tight text-white italic">
                Infinity<span className="text-tkc-accent">Chat</span>
              </CardTitle>
              <CardDescription className="text-zinc-400 text-base font-medium">
                The ultimate social hangout for everyone.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Moderated 24/7</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <Users className="w-5 h-5 text-tkc-accent" />
                <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Global Community</span>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold text-lg rounded-2xl transition-all active:scale-[0.98] shadow-xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google" />
              Join the Community
            </Button>

            <div className="space-y-4">
              <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                By joining, you agree to our <br />
                <span className="text-tkc-accent cursor-pointer hover:underline">Community Guidelines</span> & <span className="text-tkc-accent cursor-pointer hover:underline">Safety Rules</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
