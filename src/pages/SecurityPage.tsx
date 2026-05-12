import React, { useState } from 'react';
import { Shield, Lock, Key, Loader2, CheckCircle2, AlertCircle, Fingerprint, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { movieApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export const SecurityPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'CRITICAL: PASSWORD MISMATCH DETECTED' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'PROTOCOL ERROR: MINIMUM COMPLEXITY NOT MET' });
      return;
    }

    setIsUpdating(true);
    setStatus(null);

    try {
      const result = await movieApi.updateAppPassword(newPassword);
      if (result.success) {
        setStatus({ type: 'success', message: 'SECURITY OVERRIDE COMPLETE: AUTHENTICATION KEY ROTATED' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', message: 'OVERRIDE FAILED: CORE SECURITY DENIED ACCESS' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'UNEXPECTED SIGNAL INTERFERENCE DETECTED' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-[60px] animate-pulse"></div>
          <div className="w-24 h-24 bg-zinc-950 border border-zinc-900 rounded-[30px] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/20"></div>
            <Fingerprint className="w-10 h-10 text-orange-500 animate-[pulse_3s_infinite]" />
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em]">Security Matrix</span>
          <h3 className="text-4xl font-black text-white tracking-tighter uppercase glow-text">Admin Credentials</h3>
          <p className="text-zinc-500 max-w-lg font-mono text-[11px] font-bold uppercase tracking-wider leading-relaxed">
            Authorized personnel only. Rotating the administrative key affects all logical nodes and prevents unauthorized ingress into the management ecosystem.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-10 md:p-14 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-full bg-orange-500/[0.02] skew-x-[-15deg] translate-x-32 pointer-events-none"></div>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-black border border-zinc-900 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
            <Lock className="w-6 h-6 text-zinc-700 relative z-10" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.3em]">Protocol Alpha</p>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Credential Rotation</h4>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div> New Private Key
              </label>
              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="NEW_SECRET_PHRASE"
                  className="w-full pl-14 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:border-orange-500/50 focus:outline-none text-white font-mono font-bold text-sm tracking-widest placeholder:text-zinc-900 shadow-2xl transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div> Verify Secret
              </label>
              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="CONFIRM_SECRET"
                  className="w-full pl-14 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:border-orange-500/50 focus:outline-none text-white font-mono font-bold text-sm tracking-widest placeholder:text-zinc-900 shadow-2xl transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-6 rounded-2xl flex items-center gap-6 border ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                    : 'bg-red-500/5 text-red-500 border-red-500/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[9px] font-mono font-black uppercase tracking-[0.3em] mb-1 opacity-60">System Notification</p>
                  <span className="text-[11px] font-mono font-black uppercase tracking-widest leading-relaxed">{status.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isUpdating || !newPassword || !confirmPassword}
            className="w-full relative group transition-all"
          >
            <div className="absolute -inset-1 bg-orange-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-3xl -z-10 group-disabled:hidden"></div>
            <div className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-white flex items-center justify-center gap-6 shadow-2xl transition-all duration-500 group-hover:border-orange-500/50 group-disabled:opacity-50 group-disabled:cursor-not-allowed group-disabled:border-zinc-900 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {isUpdating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-sm font-mono font-black uppercase tracking-[0.3em]">Overriding Protocols...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span className="text-sm font-mono font-black uppercase tracking-[0.4em] group-hover:text-orange-500 transition-colors">Execute Key Rotation</span>
                </>
              )}
            </div>
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[30px] bg-zinc-950 border border-zinc-900 group hover:border-orange-500/20 transition-all duration-500">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-900 flex items-center justify-center shrink-0 group-hover:border-orange-500/30 transition-all">
              <Shield className="w-5 h-5 text-zinc-800 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">Edge Protection</h5>
              <p className="text-[11px] font-bold text-zinc-600 uppercase leading-relaxed tracking-wider">
                Rotation of keys triggers a rolling session expiration across all authenticated client browsers on the network.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[30px] bg-zinc-950 border border-zinc-900 group hover:border-blue-500/20 transition-all duration-500">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-900 flex items-center justify-center shrink-0 group-hover:border-blue-500/30 transition-all">
              <Cpu className="w-5 h-5 text-zinc-800 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">Hardware Hash</h5>
              <p className="text-[11px] font-bold text-zinc-600 uppercase leading-relaxed tracking-wider">
                Credentials are hashed using SHA-256 with repeated salting to prevent dictionary-based ingress attempts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
