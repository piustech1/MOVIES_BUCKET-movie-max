import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Folder, Loader2, Search, Info, ChevronRight } from 'lucide-react';
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
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.3em] mb-3">
            <Users className="w-4 h-4" />
            Ecosystem Assets
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">VJ Repository</h3>
          <p className="text-zinc-500 font-medium">Manage the system-defined Video Jockey directories. These act as the primary structural nodes for your content distribution network.</p>
        </div>
        
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-brand transition-colors" />
          <input 
            type="text"
            placeholder="Search VJ directories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-border-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-bold shadow-lg shadow-black/20"
          />
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Architecture Note</p>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            VJ management is currently synchronized with the server's hard-wired structure to ensure zero-latency routing and prevent orphaned bucket pointers.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center text-zinc-500">
          <Loader2 className="w-12 h-12 animate-spin mb-6 text-brand" />
          <p className="font-black text-xs uppercase tracking-[0.2em] animate-pulse">Initializing VJ Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVjs.map((vj, i) => (
            <motion.div
              key={vj.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col group cursor-default"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-border-dark flex items-center justify-center text-brand font-black text-xl group-hover:scale-110 group-hover:border-brand/30 transition-all shadow-xl">
                  {vj.name.charAt(3).toUpperCase() || vj.name.charAt(0).toUpperCase()}
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                  Online
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-1 group-hover:text-brand transition-colors capitalize">{vj.name}</h4>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Folder className="w-3 h-3 text-zinc-700" />
                  R2 Sector: /{sanitizeFolderName(vj.name)}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-border-dark flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol</span>
                    <span className="text-[11px] font-bold text-zinc-400">S3 Compliant</span>
                 </div>
                 <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600 hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!isLoading && filteredVjs.length === 0 && (
        <div className="py-20 text-center glass-card border-dashed">
          <p className="text-zinc-500 font-bold uppercase tracking-widest">No VJs found matching your search</p>
        </div>
      )}
    </div>
  );
};
