import React from 'react';
import { MovieUpload } from '../components/MovieUpload';
import { Upload } from 'lucide-react';

interface UploadPageProps {
  onUploadSuccess: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 orange-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/30 mx-auto mb-6">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight">Upload New Content</h3>
        <p className="text-zinc-500 max-w-md mx-auto">
          Add new movie assets to your Cloudflare R2 storage. Supports MP4, MKV, and other common video formats.
        </p>
      </div>

      <div className="glass-card p-10">
        <MovieUpload onUploadSuccess={onUploadSuccess} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-800/30 border border-border-dark text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Max File Size</p>
          <p className="text-lg font-bold text-white">2 GB</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-800/30 border border-border-dark text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Target Storage</p>
          <p className="text-lg font-bold text-white">R2 Bucket</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-800/30 border border-border-dark text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Encryption</p>
          <p className="text-lg font-bold text-white">AES-256</p>
        </div>
      </div>
    </div>
  );
};
