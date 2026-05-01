import React, { useState, useEffect } from 'react';
import { Upload, Film, Folder, Tag, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { movieApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface MovieUploadProps {
  onUploadSuccess: () => void;
}

const FOLDERS = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Series'];

export const MovieUpload: React.FC<MovieUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [movieName, setMovieName] = useState('');
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [vj, setVj] = useState('');
  const [vjs, setVjs] = useState<{ id: number; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingVjs, setIsLoadingVjs] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchVjs = async () => {
      try {
        const data = await movieApi.listVjs();
        setVjs(data);
        if (data.length > 0) setVj(data[0].name);
      } catch (err) {
        console.error('Failed to fetch VJs', err);
      } finally {
        setIsLoadingVjs(false);
      }
    };
    fetchVjs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!movieName) {
        setMovieName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!movieName) {
        setMovieName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !movieName) return;

    setIsUploading(true);
    setUploadProgress(0);
    setStatus(null);

    try {
      await movieApi.uploadMovie(
        file, 
        movieName, 
        folder, 
        vj || 'General',
        (progress) => setUploadProgress(progress)
      );
      setStatus({ type: 'success', message: 'Payload successfully synchronized with R2 storage.' });
      setFile(null);
      setMovieName('');
      setUploadProgress(0);
      onUploadSuccess();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Transmission failure detected.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-10 border border-border-dark/50 shadow-2xl relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -z-10"></div>
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Upload className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">Payload Source</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
              Secure Ingestion Active
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-border-dark rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          Version 2.4.1
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* File Selection Area */}
          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Film className="w-4 h-4 text-brand" /> Content Selection
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl transition-all h-48 flex flex-col items-center justify-center gap-4 cursor-pointer p-6 ${
                isDragging 
                  ? 'border-brand bg-brand/5 shadow-[0_0_30px_rgba(249,115,22,0.1)]' 
                  : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30'
              }`}
            >
              <input
                type="file"
                accept=".mp4,.mkv,.webm,.avi"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isUploading}
              />
              <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-brand text-white shadow-xl shadow-brand/40' : 'bg-zinc-800 text-zinc-500'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className={`font-bold text-sm ${file ? 'text-white' : 'text-zinc-500'}`}>
                  {file ? file.name : 'Drop video here or click to browse'}
                </p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'MP4, MKV up to 5GB'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand" /> Asset Label
              </label>
              <input
                type="text"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                placeholder="Name of the content..."
                className="w-full px-6 py-4 bg-zinc-900 border border-border-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white font-bold placeholder:text-zinc-600 shadow-inner shadow-black/20"
                required
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Folder className="w-4 h-4 text-brand" /> Genre
                </label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-900 border border-border-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white font-bold appearance-none cursor-pointer shadow-inner shadow-black/20 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {FOLDERS.map(f => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand" /> Curator (VJ)
                </label>
                <select
                  value={vj}
                  onChange={(e) => setVj(e.target.value)}
                  disabled={isLoadingVjs || vjs.length === 0 || isUploading}
                  className="w-full px-6 py-4 bg-zinc-900 border border-border-dark rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white font-bold appearance-none cursor-pointer shadow-inner shadow-black/20 disabled:opacity-50"
                >
                  {isLoadingVjs ? (
                    <option>Syncing...</option>
                  ) : (
                    vjs.map(v => <option key={v.id} value={v.name} className="bg-zinc-900">{v.name}</option>)
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 bg-zinc-900/50 p-6 rounded-3xl border border-border-dark"
          >
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Transmission Status</span>
              </div>
              <span className="text-lg font-black text-white">{uploadProgress}%</span>
            </div>
            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden p-1 border border-zinc-800 shadow-inner">
              <motion.div 
                className="h-full bg-brand rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: 'spring', bounce: 0, damping: 20 }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-1">
              <span>Streaming Payload to R2 Bucket</span>
              <span>AES-256 Protocol</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-2xl flex items-center gap-4 ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
              <span className="text-sm font-bold uppercase tracking-wide leading-relaxed">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isUploading || !file || !movieName}
          className="w-full relative group transition-all"
        >
          <div className="absolute -inset-1 bg-brand opacity-25 blur-lg group-hover:opacity-40 transition-opacity rounded-3xl -z-10 group-disabled:hidden"></div>
          <div className="w-full h-16 orange-gradient text-white rounded-2xl font-black flex items-center justify-center gap-4 shadow-2xl group-active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-brand/30 transition-all uppercase tracking-widest text-sm">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Initialize Ingestion
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};
