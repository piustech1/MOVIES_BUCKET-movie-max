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

  const filteredMovies = movies.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search movies by name or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-zinc-800 border border-border-dark rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/30 border-b border-border-dark">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Movie Asset</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Assigned VJ</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Storage Path</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">File Size</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              <AnimatePresence mode="popLayout">
                {filteredMovies.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                          <Film className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-medium italic">No movies found in this sector.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <motion.tr 
                      key={movie.path}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Film className="w-5 h-5 text-brand" />
                          </div>
                          <span className="font-bold text-white tracking-tight">{movie.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20">
                            {movie.category || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] bg-zinc-800/80 px-2.5 py-1 rounded-lg text-zinc-400 font-mono border border-border-dark">
                            {movie.path}
                          </code>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                          {formatSize(movie.size)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => copyToClipboard(movie.url, movie.path)}
                            className={`p-2.5 rounded-xl transition-all relative group/btn ${
                              copiedPath === movie.path 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-zinc-800 text-zinc-400 hover:text-brand hover:bg-brand/10'
                            }`}
                            title="Copy Streaming URL"
                          >
                            {copiedPath === movie.path ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-[10px] font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none border border-border-dark whitespace-nowrap">
                              {copiedPath === movie.path ? 'Copied!' : 'Copy Link'}
                            </span>
                          </button>
                          <a
                            href={movie.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                            title="Open in Player"
                          >
                            <ExternalLink className="w-4.5 h-4.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(movie.path)}
                            className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
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
    </div>
  );
};
