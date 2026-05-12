import React, { useState, useEffect } from 'react';
import { Upload, Film, Folder, Tag, Loader2, CheckCircle2, AlertCircle, Users, Zap, Shield, HelpCircle } from 'lucide-react';
import { movieApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { sanitizeFolderName } from '../lib/utils';

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
        if (data.length > 0) setVj(sanitizeFolderName(data[0].name));
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
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-700">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:border-orange-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>
            <Zap className="w-7 h-7 text-orange-500 fill-orange-500 relative z-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase glow-text">Payload Ingest</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest">
                <Shield className="w-2 h-2" /> Encrypted
              </div>
              <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">Ready for transmission signal</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-zinc-700 uppercase font-black tracking-[0.3em] mb-1">Module ID</span>
          <span className="text-xs font-mono font-black text-white bg-black px-3 py-1.5 border border-zinc-900 rounded-lg">R2-UPLOADER-ALPHA</span>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* File Selection Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div> Bitstream Source
              </label>
              <HelpCircle className="w-3 h-3 text-zinc-800 hover:text-zinc-500 transition-colors cursor-help" />
            </div>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl transition-all h-64 flex flex-col items-center justify-center gap-6 cursor-pointer p-8 group/drop ${
                isDragging 
                  ? 'border-orange-500 bg-orange-500/5 shadow-[0_0_50px_rgba(249,115,22,0.1)]' 
                  : 'border-zinc-900 bg-black/40 hover:border-zinc-800 hover:bg-zinc-900/10'
              }`}
            >
              <input
                type="file"
                accept=".mp4,.mkv,.webm,.avi"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                disabled={isUploading}
              />
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/drop:scale-110 ${isDragging ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/50' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <p className={`text-sm font-black tracking-tight uppercase ${file ? 'text-white font-mono break-all px-4' : 'text-zinc-600'}`}>
                  {file ? file.name : 'Inject media payload or click to browse'}
                </p>
                <div className="flex items-center justify-center gap-3 opacity-40">
                  <span className="w-4 h-[1px] bg-zinc-800"></span>
                  <p className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MiB` : 'EXT: MP4, MKV / MAX: 5GiB'}
                  </p>
                  <span className="w-4 h-[1px] bg-zinc-800"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div> Metadata Label
              </label>
              <div className="relative group/input">
                <Film className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within/input:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="ID: CONTENT_NAME..."
                  className="w-full pl-14 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-[13px] font-mono font-bold text-white placeholder:text-zinc-800 shadow-2xl"
                  required
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div> Sector
                </label>
                <div className="relative">
                  <Folder className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-[11px] font-mono font-black text-white appearance-none cursor-pointer uppercase tracking-[0.1em] disabled:opacity-50"
                    disabled={isUploading}
                  >
                    {FOLDERS.map(f => <option key={f} value={f} className="bg-zinc-950">{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div> Node (VJ)
                </label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <select
                    value={vj}
                    onChange={(e) => setVj(sanitizeFolderName(e.target.value))}
                    disabled={isLoadingVjs || vjs.length === 0 || isUploading}
                    className="w-full pl-14 pr-6 py-5 bg-black border border-zinc-900 rounded-2xl focus:outline-none focus:border-orange-500/50 transition-all text-[11px] font-mono font-black text-white appearance-none cursor-pointer uppercase tracking-[0.1em] disabled:opacity-50"
                  >
                    {isLoadingVjs ? (
                      <option>Syncing...</option>
                    ) : (
                      vjs.map(v => (
                        <option key={v.id} value={sanitizeFolderName(v.name)} className="bg-zinc-950">
                          {v.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-black border border-zinc-900 p-8 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-full bg-orange-500/5 skew-x-[-30deg] translate-x-32 group-hover:translate-x-0 transition-transform duration-1000"></div>
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-orange-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em]">Transmission Buffer</span>
                </div>
                <p className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">Streaming hash segments to R2 endpoint</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-4xl font-mono font-black text-white glow-text leading-none">{uploadProgress}%</span>
                <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest mt-1">Status: Writing</span>
              </div>
            </div>
            
            <div className="h-6 w-full bg-zinc-950 rounded-lg overflow-hidden p-1.5 border border-zinc-900 shadow-inner relative z-10">
              <motion.div 
                className="h-full bg-orange-600 rounded-sm shadow-[0_0_20px_#ea580c] relative"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: 'spring', bounce: 0, damping: 25 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]"></div>
              </motion.div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-6 rounded-2xl flex items-center gap-5 border ${
                status.type === 'success' 
                  ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                  : 'bg-red-500/5 text-red-400 border-red-500/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-1 opacity-60">System Message</p>
                <span className="text-[12px] font-bold uppercase tracking-wide leading-relaxed">{status.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !file || !movieName}
            className="w-full relative group transition-all active:scale-[0.99] disabled:active:scale-100"
          >
            <div className="absolute -inset-1 bg-orange-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-3xl -z-10 group-disabled:hidden"></div>
            <div className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-white flex items-center justify-center gap-6 shadow-2xl transition-all duration-500 group-hover:border-orange-500/50 group-disabled:opacity-50 group-disabled:cursor-not-allowed group-disabled:border-zinc-900 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-sm font-mono font-black uppercase tracking-[0.3em]">Processing Bitstream...</span>
                </>
              ) : (
                <>
                  <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-mono font-black uppercase tracking-[0.4em] group-hover:text-orange-500 transition-colors">Execute Sync Ingest</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
