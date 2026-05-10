import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { movieApi } from './services/api';
import { Movie } from './types';
import { Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { VJManagementPage } from './pages/VJManagementPage';
import { SecurityPage } from './pages/SecurityPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('moviemax_auth') === 'true';
  });

  const fetchMovies = async (delayMs: number = 0) => {
    if (!isAuthenticated) return;
    if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
    setIsLoading(true);
    try {
      const data = await movieApi.listMovies();
      setMovies(data);
      setError(null);
    } catch (err: any) {
      setError('Could not connect to the Movie Server. Please check your Worker configuration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [isAuthenticated]);

  const totalSize = movies.reduce((acc, movie) => acc + (movie.size || 0), 0);

  const handleLogin = async (password: string) => {
    const success = await movieApi.verifyAppPassword(password);
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('moviemax_auth', 'true');
    }
    return success;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('moviemax_auth');
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onRefresh={fetchMovies} totalSize={totalSize}>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-red-500/5 border border-red-500/20 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
              <Shield className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg font-black text-white tracking-tight uppercase mb-1">System Liaison Failure</h4>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">{error}</p>
            </div>
            <button 
              onClick={() => fetchMovies()}
              className="px-8 py-3 bg-red-500 text-white rounded-2xl text-xs font-black transition-all hover:bg-red-600 active:scale-95 shadow-xl shadow-red-500/20 uppercase tracking-[0.2em]"
            >
              Recalibrate
            </button>
          </motion.div>
        )}

        <Routes>
          <Route path="/" element={<DashboardPage movies={movies} isLoading={isLoading} />} />
          <Route path="/library" element={
            <LibraryPage 
              movies={movies} 
              onDelete={() => fetchMovies(1000)} 
              isLoading={isLoading} 
            />
          } />
          <Route path="/upload" element={<UploadPage onUploadSuccess={() => fetchMovies(2500)} />} />
          <Route path="/vjs" element={<VJManagementPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={
            <div className="glass-card p-12 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">System Settings</h3>
              <p className="text-zinc-500">Configure your Cloudflare Worker and R2 bucket credentials.</p>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
