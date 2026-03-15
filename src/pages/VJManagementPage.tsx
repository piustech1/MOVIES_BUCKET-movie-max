import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { movieApi } from '../services/api';

export const VJManagementPage: React.FC = () => {
  const [vjs, setVjs] = useState<{ id: number; name: string }[]>([]);
  const [newVj, setNewVj] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVjs = async () => {
    setIsLoading(true);
    try {
      const data = await movieApi.listVjs();
      setVjs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVjs();
  }, []);

  const handleAddVj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVj.trim()) return;

    setIsAdding(true);
    setError(null);
    try {
      await movieApi.addVj(newVj.trim());
      setNewVj('');
      fetchVjs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteVj = async (id: number) => {
    if (!confirm('Are you sure you want to delete this VJ? Movies associated with this VJ will remain but their VJ tag will be orphaned.')) return;
    try {
      await movieApi.deleteVj(id);
      fetchVjs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">VJ Management</h3>
          <p className="text-zinc-500">View the list of system-defined Video Jockeys (VJs) used for grouping movies.</p>
        </div>
        <div className="px-5 py-2 bg-brand/10 border border-brand/20 rounded-xl">
          <span className="text-xs font-black text-brand uppercase tracking-widest">{vjs.length} System VJs</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border-dark bg-zinc-800/20">
            <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Available VJs</h4>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand" />
              <p className="font-bold text-xs uppercase tracking-widest">Loading VJs...</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {vjs.map((vj, i) => (
                <motion.div
                  key={vj.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 flex items-center justify-between group hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-border-dark flex items-center justify-center text-brand font-black text-xs">
                      {vj.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{vj.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">System Folder</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-zinc-900 border border-border-dark rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Active
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
