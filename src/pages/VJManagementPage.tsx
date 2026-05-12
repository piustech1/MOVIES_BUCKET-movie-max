import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Folder, Loader2, Search, Info, ChevronRight, Zap, Shield, Globe, Cpu } from 'lucide-react';
import { movieApi } from '../services/api';
import { sanitizeFolderName } from '../lib/utils';

export const VJManagementPage: React.FC = () => {
  const [vjs, setVjs] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredVjs = vjs.filter(vj => {
    const search = sanitizeFolderName(searchQuery);
    return sanitizeFolderName(vj.name).includes(search);
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.4em]">Node Network</span>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase glow-text">VJ Infrastructure</h3>
            </div>
          </div>
          <p className="text-zinc-500 font-mono text-xs font-bold leading-relaxed max-w-xl uppercase tracking-wider">
            Manage the logical distribution nodes. Each node represents a secure storage partition within the R2 bucket ecosystem.
          </p>
        </div>
        
        <div className="relative group flex-1 max-w-lg">
          <div className="absolute inset-0 bg-orange-500/5 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text"
            placeholder="FILTER NODES BY IDENTITY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-sm font-mono font-black text-white placeholder:text-zinc-800 shadow-2xl"
          />
        </div>
      </div>

      <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-full bg-orange-500/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-0 transition-transform duration-1000"></div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-orange-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.3em]">Operational Protocol</p>
            <p className="text-sm text-zinc-400 font-mono font-bold leading-relaxed max-w-3xl uppercase tracking-tighter">
              Identity nodes are synchronized via persistent storage buffers. Any modification to node identities requires a manual cache purge for global synchronization across the edge network.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-48 flex flex-col items-center justify-center space-y-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#f97316]"></div>
          </div>
          <p className="font-mono font-black text-[10px] text-zinc-700 uppercase tracking-[0.4em] animate-pulse">Initializing Connectivity Array...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVjs.map((vj, i) => (
            <motion.div
              key={vj.id}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 flex flex-col group relative overflow-hidden hover:border-orange-500/20 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-4">
                 <Globe className="w-4 h-4 text-zinc-900 group-hover:text-orange-500/20 transition-colors" />
              </div>
              
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-mono font-black text-2xl group-hover:scale-110 group-hover:border-orange-500/50 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/20"></div>
                  {vj.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-500 text-[9px] font-mono font-black uppercase tracking-[0.2em] rounded-lg border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5 fill-emerald-500" />
                  Active
                </div>
              </div>
              
              <div className="mb-10 space-y-2">
                <h4 className="text-2xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors uppercase grow-text">{vj.name}</h4>
                <div className="flex items-center gap-3">
                  <Folder className="w-3 h-3 text-zinc-800" />
                  <p className="text-[10px] text-zinc-700 font-mono font-black uppercase tracking-widest break-all">
                    ADDR: moviemax-r2://{sanitizeFolderName(vj.name)}
                  </p>
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="h-px bg-zinc-900 w-full"></div>
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <span className="text-[8px] font-mono font-black text-zinc-800 uppercase tracking-widest">Security Clearance</span>
                      <div className="flex items-center gap-2">
                         <Shield className="w-3 h-3 text-emerald-500/50" />
                         <span className="text-[11px] font-mono font-black text-zinc-500 uppercase tracking-tight italic">Level 4 Node</span>
                      </div>
                   </div>
                   <button className="w-12 h-12 flex items-center justify-center bg-black border border-zinc-900 rounded-xl group-hover:border-orange-500/30 group-hover:text-orange-500 text-zinc-800 transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!isLoading && filteredVjs.length === 0 && (
        <div className="py-32 text-center bg-zinc-950/50 rounded-[40px] border border-dashed border-zinc-900">
          <p className="text-zinc-800 font-mono font-black uppercase tracking-[0.4em] text-xs">Access Refused: No Nodes Match Criteria</p>
        </div>
      )}
    </div>
  );
};
