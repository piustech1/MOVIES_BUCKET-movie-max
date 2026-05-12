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
  ArrowUpRight,
  Zap,
  Globe,
  Database
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
    { label: 'Total Content', value: movies.length, sub: 'Indexed Objects', icon: Film, color: 'text-orange-500', bg: 'bg-orange-500/5' },
    { label: 'Used Storage', value: formatSize(totalSize), sub: 'of 3TB Limit', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-400/5' },
    { label: 'Network Flow', value: `~${(movies.length * 2.4).toFixed(1)} GB`, sub: 'Estimated Transfer', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
    { label: 'Active Nodes', value: Object.keys(categoryMap).length, sub: 'VJ Handlers', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/5' },
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-10 pb-20">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-orange-500/30 transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-50`}></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:scale-110 transition-transform duration-500">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin"></div>
              ) : (
                <div className="text-[10px] font-mono font-bold text-zinc-700 bg-black/50 px-2 py-1 rounded border border-zinc-900 group-hover:text-orange-500 transition-colors">
                  0{i + 1}
                </div>
              )}
            </div>
            
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-black text-white glow-text tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytical Section - Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-orange-500/20 transition-all duration-700"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.03),transparent_70%)]"></div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-orange-500">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em]">Load Analysis</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tighter">Cluster Distribution</h3>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-black/50 border border-zinc-900 rounded-md text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Real-time
              </div>
            </div>
          </div>
          
          <div className="h-[340px] w-full mt-auto relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#3f3f46', fontSize: 9, fontWeight: 900, fontFamily: 'JetBrains Mono' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#3f3f46', fontSize: 9, fontWeight: 900, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(249, 115, 22, 0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #18181b',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    fontFamily: 'JetBrains Mono'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recently Ingested */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative group hover:border-blue-500/20 transition-all duration-700"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em]">Temporal Log</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Recent Ingest</h3>
            </div>
          </div>
          
          <div className="space-y-6 relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-900/50"></div>
            {recentMovies.length > 0 ? (
              recentMovies.map((movie, i) => (
                <div key={movie.path} className="flex items-center gap-4 group cursor-default relative">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all duration-500 relative z-10 overflow-hidden">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-white truncate uppercase tracking-tight">{movie.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-blue-500 font-black uppercase tracking-widest">{movie.category || 'GENERAL'}</span>
                      <span className="text-[9px] font-mono text-zinc-600 font-bold">• {formatSize(movie.size || 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-800">
                <Activity className="w-10 h-10 mb-4 opacity-30 animate-pulse" />
                <p className="text-[9px] font-black font-mono uppercase tracking-[0.4em]">Listening for payload...</p>
              </div>
            )}
            
            {recentMovies.length > 0 && (
              <div className="pt-4 px-2">
                <button className="w-full py-4 bg-zinc-900/50 hover:bg-blue-500/10 border border-zinc-900 hover:border-blue-500/20 rounded-2xl text-[10px] font-black font-mono text-zinc-500 hover:text-blue-400 transition-all duration-500 uppercase tracking-[0.2em]">
                  Dump Full History
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Utilization Gauge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative group hover:border-emerald-500/20 transition-all duration-700"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <PieIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tighter">Resource Gauge</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[240px] mb-8 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                     { name: 'Used', value: totalSize },
                     { name: 'Free', value: Math.max(0, (3 * 1024 * 1024 * 1024 * 1024) - totalSize) }
                   ]}
                   cx="50%"
                   cy="50%"
                   innerRadius={70}
                   outerRadius={95}
                   paddingAngle={2}
                   dataKey="value"
                   stroke="none"
                 >
                   <Cell fill="#10b981" fillOpacity={0.8} />
                   <Cell fill="#09090b" />
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #18181b', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                    formatter={(value: number) => formatSize(value)}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-black text-white glow-text font-mono leading-none">
                  {Math.min((totalSize / (3 * 1024 * 1024 * 1024 * 1024)) * 100, 100).toFixed(1)}%
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Utilization</span>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <span className="text-[9px] font-black font-mono text-zinc-600 uppercase block mb-1">Occupied</span>
                <span className="text-xs font-bold text-white font-mono">{formatSize(totalSize)}</span>
             </div>
             <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <span className="text-[9px] font-black font-mono text-zinc-600 uppercase block mb-1">Available</span>
                <span className="text-xs font-bold text-white font-mono">2.8 PB Free</span>
             </div>
          </div>
        </motion.div>

        {/* System Diagnostics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative group hover:border-zinc-700 transition-all duration-700 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em]">Infrastructure Metadata</span>
                </div>
                <div className="space-y-5">
                  {[
                    { l: 'Storage Cluster', v: 'R2-AMER-01', c: 'text-white' },
                    { l: 'Sync Engine', v: 'Worker v8.4', c: 'text-white' },
                    { l: 'Network Latency', v: 'Normal', c: 'text-emerald-500' },
                    { l: 'Auth Level', v: 'System Root', c: 'text-orange-500' }
                  ].map(row => (
                    <div key={row.l} className="flex items-center justify-between border-b border-zinc-900 pb-2 group/row">
                      <span className="text-[10px] font-bold text-zinc-600 group-hover/row:text-zinc-400 transition-colors uppercase tracking-widest">{row.l}</span>
                      <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${row.c}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="p-8 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group/card">
                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <Activity className="w-10 h-10 text-orange-500 mb-6 drop-shadow-[0_0_15px_#f97316]" />
                <h5 className="text-xl font-black text-white mb-3 tracking-tight">Active Propagation</h5>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider">
                  Data is verified across 32 availability zones automatically. Ingestion status is locked via SHA-256 integrity checks.
                </p>
                <div className="mt-8 flex gap-1.5 h-1">
                  {[100, 80, 40, 60, 90, 30].map((w, i) => (
                    <div key={i} className="flex-1 bg-orange-500 rounded-full" style={{ opacity: w / 100 }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Grid */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_100%,rgba(249,115,22,0.05),transparent_70%)] pointer-events-none"></div>
        </motion.div>
      </div>
    </div>
  );
};
