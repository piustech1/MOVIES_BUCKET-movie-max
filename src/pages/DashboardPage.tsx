import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Film, HardDrive, Users, TrendingUp } from 'lucide-react';
import { Movie } from '../types';

interface DashboardPageProps {
  movies: Movie[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ movies }) => {
  const totalSize = movies.reduce((acc, m) => acc + (m.size || 0), 0);
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  };

  const stats = [
    { label: 'Total Movies', value: movies.length, icon: Film, color: 'text-brand', bg: 'bg-brand/10' },
    { label: 'Storage Used', value: formatSize(totalSize), icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-5 group hover:border-brand/30 transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-2xl">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-brand" />
            System Health
          </h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">CPU Usage</span>
                <span className="text-xs font-bold text-brand">24%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-brand h-full w-[24%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Memory</span>
                <span className="text-xs font-bold text-blue-400">42%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[42%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bandwidth</span>
                <span className="text-xs font-bold text-emerald-400">12%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[12%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
