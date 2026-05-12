import React from 'react';
import { MovieUpload } from '../components/MovieUpload';
import { Upload, Zap, Shield, HardDrive, Cpu, Radio } from 'lucide-react';

interface UploadPageProps {
  onUploadSuccess: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-[60px] animate-pulse"></div>
          <div className="w-24 h-24 bg-zinc-950 border border-zinc-900 rounded-[30px] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/20"></div>
            <div className="absolute inset-2 border border-zinc-800/50 rounded-2xl animate-[spin_10s_linear_infinite]"></div>
            <Upload className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em]">Ingest Protocol</span>
          <h3 className="text-4xl font-black text-white tracking-tighter uppercase glow-text">Content Synchronization</h3>
          <p className="text-zinc-500 max-w-xl font-mono text-[11px] font-bold uppercase tracking-wider leading-relaxed mx-auto">
            Binary object ingestion module. Uploaded assets are partitioned by VJ identifier and streamed directly to the R2 storage cluster.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-orange-500/5 blur-3xl opacity-50 -z-10"></div>
        <MovieUpload onUploadSuccess={onUploadSuccess} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[30px] group hover:border-orange-500/20 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <HardDrive className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">Max Throughput</p>
              <p className="text-2xl font-black text-white font-mono tracking-tighter uppercase">5.0 GiB</p>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">Per-object binary ceiling limit</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[30px] group hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Radio className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">Storage Stack</p>
              <p className="text-2xl font-black text-white font-mono tracking-tighter uppercase">R2 Edge</p>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">S3-Compatible Object Store</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[30px] group hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">Integrity</p>
              <p className="text-2xl font-black text-white font-mono tracking-tighter uppercase">SHA-256</p>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">Hash-validated synchronization</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(249,115,22,0.03),transparent_60%)]"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-900 flex items-center justify-center animate-pulse">
            <Radio className="w-8 h-8 text-orange-500/40" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">Module Status: Active</p>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Edge network connectivity confirmed. Buffers cleared.</p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-black text-zinc-800 uppercase tracking-[0.5em] relative z-10 border border-zinc-900 px-6 py-3 rounded-full">
          Transmit Level: 94.2dB
        </div>
      </div>
    </div>
  );
};
