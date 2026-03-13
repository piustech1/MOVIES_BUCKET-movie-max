import { useState, useEffect } from 'react';
import { MovieUpload } from './components/MovieUpload';
import { MovieList } from './components/MovieList';
import { movieApi } from './services/api';
import { Movie } from './types';
import { Play, Shield, Database, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const data = await movieApi.listMovies();
      setMovies(data);
      setError(null);
    } catch (err: any) {
      setError('Could not connect to the Movie Server. Please check your R2 configuration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-black/5 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Play className="w-6 h-6 text-emerald-400 fill-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MovieMax</h1>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium transition-all">
            <Database className="w-5 h-5" />
            Movie Library
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-medium transition-all">
            <Shield className="w-5 h-5" />
            Security
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="mt-auto p-4 bg-zinc-900 rounded-2xl text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Storage Status</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Cloudflare R2</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[45%]"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-zinc-900 mb-2">Movie Server Dashboard</h2>
            <p className="text-zinc-500">Manage your Cloudflare R2 storage and streaming links.</p>
          </header>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">Connection Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button 
                onClick={fetchMovies}
                className="ml-auto px-4 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-bold transition-all"
              >
                RETRY
              </button>
            </div>
          )}

          <MovieUpload onUploadSuccess={fetchMovies} />
          
          <MovieList 
            movies={movies} 
            onDelete={fetchMovies} 
            isLoading={isLoading} 
          />
        </motion.div>
      </main>
    </div>
  );
}
