import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Play, Shield, Database, Settings, Menu, X, LayoutDashboard, HardDrive, Upload, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  onRefresh: () => void;
  totalSize: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, onRefresh, totalSize }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  const usagePercentage = Math.min((totalSize / (1024 * 1024 * 1024 * 1024)) * 100, 100);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Movie Library', icon: Database },
    { to: '/upload', label: 'Upload Content', icon: Upload },
    { to: '/vjs', label: 'VJ Management', icon: Users },
    { to: '/security', label: 'Security', icon: Shield },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-4 mb-12 px-2">
        <Link to="/" className="flex items-center gap-4">
          <div className="w-12 h-12 orange-gradient rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
            <Play className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight leading-none text-white">MovieMax</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Admin Portal</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsDrawerOpen(false)}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all group
              ${isActive 
                ? 'bg-brand/10 text-brand border border-brand/20 shadow-lg shadow-brand/5' 
                : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-100'}
            `}
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-6 bg-zinc-800/30 rounded-3xl border border-border-dark group hover:border-brand/30 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Worker Status</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        </div>
        <p className="text-sm font-semibold mb-4">Cloudflare R2 Storage</p>
        <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${usagePercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-brand h-full shadow-[0_0_12px_rgba(249,115,22,0.4)]"
          />
        </div>
        <p className="text-[10px] text-zinc-500 mt-3 text-center font-medium">
          {formatSize(totalSize)} / 1TB Used
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-dark text-zinc-100 font-sans selection:bg-brand/30 selection:text-brand">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border-dark bg-card-dark/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-lg font-bold font-display tracking-tight text-white">MovieMax</h1>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Navigation Drawer (Mobile) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card-dark border-r border-border-dark z-50 lg:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 orange-gradient rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                  <h1 className="text-xl font-bold font-display tracking-tight text-white">MovieMax</h1>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-card-dark border-r border-border-dark hidden lg:flex flex-col p-8">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 p-6 md:p-10 lg:p-14 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-[0.3em] mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
              Live Management
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white tracking-tight">
              Control Center
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-dark bg-zinc-800 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <button 
              onClick={onRefresh}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-border-dark rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              Refresh Data
            </button>
          </div>
        </header>

        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Background Accents */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-brand/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
};
