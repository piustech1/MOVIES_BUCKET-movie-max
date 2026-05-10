import React from 'react';
import { motion } from 'motion/react';
import { 
  Film, 
  HardDrive, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  PieChart as PieIcon,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Movie } from '../types';
import { sanitizeFolderName } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardPageProps {
  movies: Movie[];
  isLoading?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ movies, isLoading }) => {
  const totalSize = movies.reduce((acc, m) => acc + (m.size || 0), 0);
  const avgSize = movies.length > 0 ? totalSize / movies.length : 0;
  
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      const gb = mb / 1024;
      return gb > 1024 ? `${(gb / 1024).toFixed(2)} TB` : `${gb.toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  // Group by category (VJ)
  const categoryMap = movies.reduce((acc, movie) => {
    const rawCat = movie.category || 'General';
    const cat = sanitizeFolderName(rawCat);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 VJs

  const recentMovies = [...movies]
    .sort((a, b) => {
      const dateA = a.uploaded ? new Date(a.uploaded).getTime() : 0;
      const dateB = b.uploaded ? new Date(b.uploaded).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const stats = [
    { label: 'Total Content', value: movies.length, sub: 'Movies Uploaded', icon: Film, color: 'text-brand', bg: 'bg-brand/10' },
    { label: 'Storage Used', value: formatSize(totalSize), sub: 'of 3TB Limit', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Avg Asset Size', value: formatSize(avgSize), sub: 'Per Movie', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Active VJs', value: Object.keys(categoryMap).length, sub: 'Contributors', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group hover:border-brand/30 transition-all cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-brand/20 border-t-brand animate-spin"></div>
              ) : (
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytical Section - Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-brand" />
                VJ Distribution
              </h3>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Movies per assigned folder</p>
            </div>
            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 border border-border-dark">
              ANALYSIS
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recently Ingested */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Ingestion
            </h3>
          </div>
          <div className="space-y-6">
            {recentMovies.length > 0 ? (
              recentMovies.map((movie, i) => (
                <div key={movie.path} className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{movie.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-brand uppercase tracking-tighter">{movie.category || 'VJ General'}</span>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">• {formatSize(movie.size || 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <Activity className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Recent Data</p>
              </div>
            )}
            
            {recentMovies.length > 0 && (
              <button className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all border border-border-dark uppercase tracking-widest">
                View All Activity
              </button>
            )}
          </div>
        </motion.div>

        {/* Storage Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 lg:col-span-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Utilization Insight</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-[200px] mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                     { name: 'Used', value: totalSize },
                     { name: 'Free', value: Math.max(0, (3 * 1024 * 1024 * 1024 * 1024) - totalSize) }
                   ]}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   <Cell fill="#f97316" />
                   <Cell fill="#27272a" />
                 </Pie>
                 <Tooltip 
                    contentStyle={{ borderRadius: '12px', backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    formatter={(value: number) => formatSize(value)}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">
                  {Math.min((totalSize / (3 * 1024 * 1024 * 1024 * 1024)) * 100, 100).toFixed(1)}%
                </span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Used</span>
             </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand"></div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Occupied</span>
              </div>
              <span className="text-xs font-bold text-white">{formatSize(totalSize)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available</span>
              </div>
              <span className="text-xs font-bold text-white">{formatSize(Math.max(0, (3 * 1024 * 1024 * 1024 * 1024) - totalSize))}</span>
            </div>
          </div>
        </motion.div>

        {/* System Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 glass-card p-8 flex flex-col justify-between"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-black text-brand uppercase tracking-[0.2em] mb-6">Server Infrastructure</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Storage Region</span>
                  <span className="text-xs font-black text-white px-3 py-1 bg-zinc-800 rounded-lg">CLOUDFLARE R2</span>
                </div>
                <div className="flex items-center justify-between group">
                   <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Latency</span>
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Optimized</span>
                   </div>
                </div>
                <div className="flex items-center justify-between group">
                   <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Access Level</span>
                   <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Admin Restricted</span>
                </div>
              </div>
            </div>
            
            <div className="bg-brand/5 rounded-3xl p-6 border border-brand/10 backdrop-blur-sm self-center">
              <TrendingUp className="w-10 h-10 text-brand mb-4" />
              <h5 className="text-lg font-bold text-white mb-2">Network Health</h5>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Your MovieMax server is operating on global edge infrastructure. Performance is automatically distributed across 300+ locations.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-1 flex-1 bg-brand rounded-full"></div>
                <div className="h-1 flex-1 bg-brand rounded-full opacity-60"></div>
                <div className="h-1 flex-1 bg-brand rounded-full opacity-30"></div>
                <div className="h-1 flex-1 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
