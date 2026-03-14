import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Play, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onLogin: (password: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'greatdev') {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 orange-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand/40 mx-auto mb-8 relative group"
          >
            <Play className="w-10 h-10 text-white fill-white group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white/20 animate-pulse"></div>
          </motion.div>
          <h1 className="text-4xl font-black font-display text-white tracking-tight mb-3">MovieMax</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Access Portal</p>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand/20">
            <motion.div 
              className="h-full bg-brand shadow-[0_0_15px_rgba(249,115,22,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Authentication Key</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error ? 'text-red-500' : 'text-zinc-500 group-focus-within:text-brand'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter system password"
                  className={`w-full pl-12 pr-4 py-4 bg-zinc-900/50 border rounded-2xl focus:outline-none transition-all font-bold tracking-widest ${
                    error 
                      ? 'border-red-500/50 ring-4 ring-red-500/10' 
                      : 'border-border-dark focus:border-brand focus:ring-4 focus:ring-brand/10'
                  }`}
                  autoFocus
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1"
                >
                  Access Denied • Invalid Key
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full orange-gradient py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Initialize Session
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-zinc-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Management</span>
        </div>
      </motion.div>
    </div>
  );
};
