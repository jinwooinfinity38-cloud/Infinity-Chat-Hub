import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { User, Globe, Calendar, CheckCircle } from 'lucide-react';

export function Registration({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    country: '',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#1f2c34] border-none shadow-2xl p-8 rounded-3xl">
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Join Infinity Chat</h2>
            
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-zinc-400" />
                  <Input 
                    placeholder="Enter your username" 
                    className="pl-10 bg-[#2a3942] border-none"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <Button className="w-full bg-[#00a884]" onClick={() => setStep(2)}>Next</Button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-zinc-400" />
                  <Input 
                    type="number"
                    placeholder="Enter your age" 
                    className="pl-10 bg-[#2a3942] border-none"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <Button className="w-full bg-[#00a884]" onClick={() => setStep(3)}>Next</Button>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-zinc-400 z-10" />
                  <Select onValueChange={(v) => setFormData({...formData, country: v})}>
                    <SelectTrigger className="pl-10 bg-[#2a3942] border-none">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ghana">Ghana</SelectItem>
                      <SelectItem value="nigeria">Nigeria</SelectItem>
                      <SelectItem value="kenya">Kenya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-[#00a884]" onClick={onComplete}>
                  <CheckCircle className="mr-2" /> Complete Registration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
