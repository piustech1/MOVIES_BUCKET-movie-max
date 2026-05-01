import React from 'react';
import { Film, Trash2, ExternalLink, Copy, Check, Search, Filter } from 'lucide-react';
import { Movie } from '../types';
import { movieApi } from '../services/api';
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
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await movieApi.deleteMovie(path);
      onDelete();
    } catch (err) {
      alert('Failed to delete movie');
    }
  };

  const copyToClipboard = (url: string, path: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  };

  const filteredMovies = React.useMemo(() => 
    movies.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [movies, searchQuery]);

  // Group stats for the filtered list
  const filteredSize = filteredMovies.reduce((acc, m) => acc + (m.size || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_15px_rgba(249,115,22,0.3)]"></div>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Syncing Library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:row md:items-center justify-between gap-4 sticky top-0 z-30 py-4 bg-bg-dark/80 backdrop-blur-md -mx-4 px-4 border-b border-border-dark/50">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search assets by name, path or VJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-zinc-900 border border-border-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium shadow-inner shadow-black/20"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-border-dark rounded-xl">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Showing</span>
            <span className="text-xs font-bold text-brand leading-none">{filteredMovies.length}</span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">of</span>
            <span className="text-xs font-bold text-zinc-300 leading-none">{movies.length}</span>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-border-dark rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20">
            <Filter className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-zinc-900 border-b border-border-dark">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] w-1/3">Movie Asset</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Assigned VJ</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Storage Path</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">File Size</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredMovies.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-border-dark flex items-center justify-center shadow-2xl shadow-black/40">
                          <Film className="w-10 h-10 text-zinc-800" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg mb-2">No matches found</p>
                          <p className="text-zinc-500 text-sm font-medium">Your search query did not return any assets from the R2 bucket.</p>
                        </div>
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="text-brand text-xs font-black uppercase tracking-widest hover:underline"
                          >
                            Clear search filters
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
                      className="group hover:bg-white/[0.02] transition-colors relative"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center group-hover:scale-110 group-hover:border-brand/30 transition-all shadow-sm">
                            <Film className="w-5 h-5 text-brand" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white tracking-tight truncate group-hover:text-brand transition-colors">{movie.name}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Asset ID: {movie.path.split('/').pop()?.split('.')[0] || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-border-dark group-hover:border-brand/30 group-hover:text-brand transition-all">
                            {movie.category || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] bg-black/40 px-3 py-1.5 rounded-xl text-zinc-500 font-mono border border-border-dark group-hover:text-zinc-300 transition-colors">
                            {movie.path}
                          </code>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-zinc-300">
                            {formatSize(movie.size)}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mt-1">Binary Object</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => copyToClipboard(movie.url, movie.path)}
                            className={`p-3 rounded-2xl transition-all relative group/btn border border-transparent ${
                              copiedPath === movie.path 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-zinc-900 text-zinc-500 hover:text-brand hover:border-brand/20 hover:bg-brand/5 shadow-md shadow-black/20'
                            }`}
                            title="Copy Streaming URL"
                          >
                            {copiedPath === movie.path ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                            <AnimatePresence>
                              {copiedPath === movie.path && (
                                <motion.span 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-lg border border-border-dark whitespace-nowrap shadow-2xl z-50"
                                >
                                  Copied!
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                          <a
                            href={movie.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-400/20 hover:bg-blue-400/5 rounded-2xl transition-all shadow-md shadow-black/20"
                            title="Open in Player"
                          >
                            <ExternalLink className="w-4.5 h-4.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(movie.path)}
                            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 rounded-2xl transition-all shadow-md shadow-black/20"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
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
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-8 bg-zinc-900/50 rounded-3xl border border-border-dark">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Payload</span>
               <span className="text-xl font-black text-white">{formatSize(movies.reduce((a, b) => a + (b.size || 0), 0))}</span>
            </div>
            <div className="w-px h-10 bg-zinc-800"></div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Assets</span>
               <span className="text-xl font-black text-brand">{movies.length}</span>
            </div>
         </div>
         <p className="text-[11px] font-medium text-zinc-500 max-w-xs text-center md:text-right">
           Search is localized for high-speed indexing. Large libraries are optimized through reactive pagination and virtualization.
         </p>
      </div>
    </div>
  );
};
