import React from 'react';
import { Film, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { Movie } from '../types';
import { movieApi } from '../services/api';

interface MovieListProps {
  movies: Movie[];
  onDelete: () => void;
  isLoading: boolean;
}

export const MovieList: React.FC<MovieListProps> = ({ movies, onDelete, isLoading }) => {
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

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
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium">Loading movie library...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-black/5 bg-zinc-50/50">
        <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-600" />
          Movie Library ({movies.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Movie Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Path</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {movies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                  No movies found in storage.
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie.path} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Film className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-zinc-900">{movie.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{movie.path}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {formatSize(movie.size)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(movie.url, movie.path)}
                        className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Copy Streaming URL"
                      >
                        {copiedPath === movie.path ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={movie.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Open in Player"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(movie.path)}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
