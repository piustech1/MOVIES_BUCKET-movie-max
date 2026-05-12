import React from 'react';
import { Film, Trash2, ExternalLink, Copy, Check, Search, Filter, Hash, Activity, HardDrive, Shield } from 'lucide-react';
import { Movie } from '../types';
import { movieApi } from '../services/api';
import { sanitizeFolderName } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MovieListProps {
  movies: Movie[];
  onDelete: () => void;
  isLoading: boolean;
}

export const MovieList: React.FC<MovieListProps> = ({ movies, onDelete, isLoading }) => {
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleDelete = async (path: string) => {
    if (!window.confirm('IRREVERSIBLE ACTION: Confirm deletion of storage object?')) return;
    try {
      await movieApi.deleteMovie(path);
      onDelete();
    } catch (err) {
      alert('SYSTEM ERROR: Deletion protocol failed.');
    }
  };

  const copyToClipboard = (url: string, path: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0.00 MiB';
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} GiB` : `${mb.toFixed(2)} MiB`;
  };

  const filteredMovies = React.useMemo(() => {
    const search = sanitizeFolderName(searchQuery);
    return movies.filter(m => 
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.path || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && sanitizeFolderName(m.category).includes(search))
    );
  }, [movies, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#f97316]"></div>
          <div className="absolute inset-4 bg-orange-500/20 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-white font-mono font-black uppercase tracking-[0.4em] text-xs">Syncing Data Array</p>
          <p className="text-zinc-700 font-mono text-[9px] font-bold uppercase tracking-widest">Polling R2 Storage Buckets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sticky top-0 z-30 py-6 bg-[#050505]/90 backdrop-blur-xl -mx-6 px-6 border-b border-zinc-900">
        <div className="relative flex-1 max-w-2xl group">
          <div className="absolute inset-0 bg-orange-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text"
            placeholder="FILTER OBJECTS BY NAME, VJ OR PATH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-16 py-5 bg-black border border-zinc-900 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-sm font-mono font-bold text-white placeholder:text-zinc-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all transition-colors"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 px-5 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Selected Items</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-black text-orange-500">{filteredMovies.length}</span>
                <span className="text-[10px] font-mono text-zinc-800">/ {movies.length}</span>
              </div>
            </div>
            <div className="w-px h-6 bg-zinc-900"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Total Weight</span>
              <span className="text-sm font-mono font-black text-white">{formatSize(filteredMovies.reduce((a, b) => a + (b.size || 0), 0))}</span>
            </div>
          </div>
          
          <button className="flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-mono font-black text-zinc-500 hover:text-white hover:border-orange-500/30 transition-all">
            <Filter className="w-4 h-4" />
            SORT_ASC
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black border-b border-zinc-900">
                <th className="px-10 py-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-3">
                    <Hash className="w-3 h-3" /> Object ID & Metadata
                  </div>
                </th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-3">
                    <Activity className="w-3 h-3" /> Segment
                  </div>
                </th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-3 h-3" /> Storage Address
                  </div>
                </th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Shield className="w-3 h-3" /> Security
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredMovies.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={4} className="px-8 py-40 text-center">
                      <div className="flex flex-col items-center gap-8 max-w-sm mx-auto">
                        <div className="w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-center shadow-2xl relative overflow-hidden group/empty">
                          <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                          <Film className="w-10 h-10 text-zinc-900 relative z-10" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-white font-black text-xl tracking-tighter uppercase whitespace-nowrap glow-text">Zero Results Returned</p>
                          <p className="text-zinc-700 text-[10px] font-mono font-bold uppercase tracking-widest leading-relaxed">The query parameters provided yielded no matching objects in the primary array.</p>
                        </div>
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500/10 transition-all"
                          >
                            Reset System Buffer
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <motion.tr 
                      key={movie.path}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group transition-colors relative hover:bg-orange-500/[0.01]"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-orange-500/50 group-hover:scale-110 transition-all duration-500 relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/20"></div>
                             <Film className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="font-black text-white tracking-tight truncate group-hover:text-orange-500 transition-all uppercase text-[15px]">{movie.name}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">ID: {movie.path.split('/').pop()?.split('.')[0] || 'VOID'}</span>
                              <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                              <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">{formatSize(movie.size)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                           <div className="px-4 py-1.5 bg-black border border-zinc-900 rounded-lg group-hover:border-orange-500/30 transition-all">
                              <span className="text-[10px] font-mono font-black text-zinc-500 group-hover:text-orange-500 uppercase tracking-widest">
                                {movie.category || 'GENERAL_NODE'}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 group/path">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 group-hover/path:bg-orange-500 transition-colors"></div>
                           <code className="text-[11px] font-mono font-bold text-zinc-700 group-hover:text-zinc-400 transition-colors uppercase tracking-tight truncate max-w-md">
                             {movie.path}
                           </code>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 translate-x-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                          <button
                            onClick={() => copyToClipboard(movie.url, movie.path)}
                            className={`p-3.5 rounded-xl transition-all relative group/btn border ${
                              copiedPath === movie.path 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-black text-zinc-700 border-zinc-900 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5'
                            }`}
                          >
                            {copiedPath === movie.path ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <AnimatePresence>
                              {copiedPath === movie.path && (
                                <motion.span 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black text-[9px] font-mono font-black uppercase tracking-[0.2em] rounded-lg border border-zinc-800 whitespace-nowrap shadow-2xl z-50 text-emerald-500"
                                >
                                  PROTO_COPIED
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                          <a
                            href={movie.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 bg-black border border-zinc-900 text-zinc-700 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 rounded-xl transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(movie.path)}
                            className="p-3.5 bg-black border border-zinc-900 text-zinc-700 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-10 py-10 bg-zinc-950 rounded-[40px] border border-zinc-900 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(249,115,22,0.03),transparent_60%)]"></div>
         <div className="flex items-center gap-12 relative z-10">
            <div className="space-y-1">
               <span className="text-[10px] font-black font-mono text-zinc-700 uppercase tracking-widest">Aggregate Payload</span>
               <p className="text-2xl font-black text-white font-mono">{formatSize(movies.reduce((a, b) => a + (b.size || 0), 0))}</p>
            </div>
            <div className="w-px h-12 bg-zinc-900"></div>
            <div className="space-y-1">
               <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Logical Objects</span>
               <p className="text-2xl font-black text-orange-500 font-mono tracking-tighter">[{movies.length}]</p>
            </div>
         </div>
         <div className="max-w-md text-center md:text-right space-y-2 relative z-10">
           <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest">Operational Metadata</p>
           <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.1em] leading-relaxed">
             System index is synchronized with global edge cache via Cloudflare Workers. Direct R2 bucket polling is throttled for security.
           </p>
         </div>
      </div>
    </div>
  );
};
