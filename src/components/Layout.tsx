import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Play, Shield, Database, Settings, Menu, X, LayoutDashboard, HardDrive, Upload, Users, Activity, Box } from 'lucide-react';
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

  const usagePercentage = Math.min((totalSize / (3 * 1024 * 1024 * 1024 * 1024)) * 100, 100);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/library', label: 'Terminal', icon: Activity },
    { to: '/upload', label: 'Ingest', icon: Upload },
    { to: '/vjs', label: 'Nodes', icon: Box },
    { to: '/security', label: 'Vault', icon: Shield },
    { to: '/settings', label: 'System', icon: Settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full scanline">
      <div className="mb-12 px-2">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl group-hover:border-orange-500/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Play className="w-6 h-6 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none text-white glow-text uppercase">MovieMax</h1>
            <p className="text-[9px] font-black text-zinc-600 font-mono uppercase tracking-[0.3em] mt-1 text-white/40">v2.5.0-stable</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1 flex-1 relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-900 -z-10"></div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsDrawerOpen(false)}
            className={({ isActive }) => `
              w-full flex items-center gap-4 px-4 py-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all group relative
              ${isActive 
                ? 'text-orange-500 bg-orange-500/5 border border-orange-500/10' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-900 text-zinc-600 group-hover:text-zinc-400'}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-6 bg-zinc-900/40 rounded-3xl border border-zinc-900/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-widest">Protocol</span>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Cloudflare R2</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Online</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 font-bold uppercase">
            <span>Storage load</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden p-0.5 border border-zinc-900 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="bg-orange-600 h-full rounded-full shadow-[0_0_15px_#ea580c]"
            />
          </div>
          <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-zinc-900">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wide">Payload size</span>
              <span className="text-[10px] font-mono text-white font-bold">{formatSize(totalSize)}</span>
            </div>
            <HardDrive className="w-3 h-3 text-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-orange-500/30 selection:text-orange-500">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-orange-900/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-white uppercase glow-text">MMX</h1>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6 text-zinc-400" />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-black border-r border-zinc-900 z-50 lg:hidden flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6 text-orange-500 fill-orange-500" />
                  <h1 className="text-xl font-black text-white glow-text uppercase">MMX</h1>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-black border-r border-zinc-900 hidden lg:flex flex-col p-10 z-40">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 relative min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-20">
          <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md">
                  <span className="text-[10px] font-black font-mono text-orange-500 uppercase tracking-[0.2em]">Live Ingestion</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Sync Active
                </div>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none glow-text">
                Mission Control
              </h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black">Authorized by</span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">Super Administrator</span>
              </div>
              <button 
                onClick={onRefresh}
                className="group relative transition-all active:scale-95"
              >
                <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 shadow-2xl">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-xs font-black font-mono uppercase tracking-[0.2em] text-white">Rescan Array</span>
                </div>
              </button>
            </div>
          </header>

          <div className="relative">
            {children}
          </div>
        </div>

        {/* Footer info */}
        <footer className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-12 mt-20 border-t border-zinc-900 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em]">
            System Architecture: Cloudflare Workers + R2
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em]">
            © 2026 MMX Operations Group
          </div>
        </footer>
      </main>
    </div>
  );
};
