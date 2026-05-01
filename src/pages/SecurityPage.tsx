import React, { useState } from 'react';
import { Shield, Lock, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { movieApi } from '../services/api';
import { motion } from 'motion/react';

export const SecurityPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsUpdating(true);
    setStatus(null);

    try {
      const result = await movieApi.updateAppPassword(newPassword);
      if (result.success) {
        setStatus({ type: 'success', message: 'App password updated successfully! Use your new password for future logins on this device.' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', message: 'Failed to update password' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/10 mb-4">
          <Shield className="w-10 h-10 text-brand" />
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight">Security Settings</h3>
        <p className="text-zinc-500 max-w-md">
          Manage your administrative access. Changing the password will update the authentication key across the entire system.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>
          <h4 className="text-xl font-bold text-white">Change Admin Password</h4>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-border-dark rounded-2xl focus:border-brand focus:outline-none text-white font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-border-dark rounded-2xl focus:border-brand focus:outline-none text-white font-medium transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {status && (
            <div className={`p-5 rounded-2xl flex items-center gap-4 ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating || !newPassword || !confirmPassword}
            className="w-full orange-gradient py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-brand/20"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating System Password...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Update Admin Password
              </>
            )}
          </button>
        </form>
      </motion.div>

      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-border-dark">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white mb-1">Local Security Lock</h5>
            <p className="text-xs text-zinc-500 leading-relaxed">
              This password locks the MovieMax dashboard in your browser. It keeps your management portal private even if your URL is discovered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
