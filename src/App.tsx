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
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('moviemax_auth') === 'true';
  });

  const fetchMovies = async () => {
    if (!isAuthenticated) return;
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

  const handleLogin = (password: string) => {
    if (password === 'greatdev') {
      setIsAuthenticated(true);
      localStorage.setItem('moviemax_auth', 'true');
    }
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
      <Layout onRefresh={fetchMovies}>
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Connection Error</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchMovies}
              className="px-5 py-2 bg-red-500 text-white rounded-xl text-xs font-black transition-all hover:bg-red-600 active:scale-95"
            >
              RETRY
            </button>
          </motion.div>
        )}

        <Routes>
          <Route path="/" element={<DashboardPage movies={movies} />} />
          <Route path="/library" element={
            <LibraryPage 
              movies={movies} 
              onDelete={fetchMovies} 
              isLoading={isLoading} 
            />
          } />
          <Route path="/upload" element={<UploadPage onUploadSuccess={fetchMovies} />} />
          <Route path="/security" element={
            <div className="glass-card p-12 text-center">
              <Shield className="w-16 h-16 text-brand mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Security Protocols</h3>
              <p className="text-zinc-500">All movie assets are encrypted and stored securely in Cloudflare R2.</p>
              <button 
                onClick={handleLogout}
                className="mt-8 px-6 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-border-dark"
              >
                Logout Session
              </button>
            </div>
          } />
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
