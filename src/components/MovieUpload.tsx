import React, { useState, useEffect } from 'react';
import { Upload, Film, Folder, Tag, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { movieApi } from '../services/api';

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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!movieName) {
        setMovieName(selectedFile.name.replace(/\.[^/.]+$/, ""));
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
      // Repurposing 'category' as 'vj' in the API call
      await movieApi.uploadMovie(
        file, 
        movieName, 
        folder, 
        vj || 'General',
        (progress) => setUploadProgress(progress)
      );
      setStatus({ type: 'success', message: 'Movie uploaded successfully!' });
      setFile(null);
      setMovieName('');
      setUploadProgress(0);
      onUploadSuccess();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload movie' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-brand" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Upload New Movie</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* File Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Film className="w-3.5 h-3.5" /> Video File
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".mp4,.mkv,.webm"
                onChange={handleFileChange}
                className="hidden"
                id="movie-file"
                required
              />
              <label
                htmlFor="movie-file"
                className="flex items-center justify-center w-full px-5 py-4 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer group-hover:border-brand/50 group-hover:bg-brand/5 transition-all"
              >
                <span className="text-zinc-400 truncate font-medium">
                  {file ? file.name : 'Select MP4, MKV, or WEBM'}
                </span>
              </label>
            </div>
          </div>

          {/* Movie Name */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Movie Name
            </label>
            <input
              type="text"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              placeholder="Enter movie title"
              className="w-full px-5 py-4 bg-zinc-800/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white placeholder:text-zinc-600"
              required
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" /> Storage Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-800/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white appearance-none cursor-pointer"
            >
              {FOLDERS.map(f => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
            </select>
          </div>

          {/* VJ Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Assigned VJ
            </label>
            <div className="relative">
              <select
                value={vj}
                onChange={(e) => setVj(e.target.value)}
                disabled={isLoadingVjs || vjs.length === 0}
                className="w-full px-5 py-4 bg-zinc-800/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-white appearance-none cursor-pointer disabled:opacity-50"
              >
                {isLoadingVjs ? (
                  <option>Loading VJs...</option>
                ) : vjs.length === 0 ? (
                  <option>No VJs available</option>
                ) : (
                  vjs.map(v => <option key={v.id} value={v.name} className="bg-zinc-900">{v.name}</option>)
                )}
              </select>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">Uploading to R2...</p>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{uploadProgress}%</p>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full orange-gradient transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {status && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span className="text-sm font-bold">{status.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file || !movieName}
          className="w-full md:w-auto px-10 py-4 orange-gradient text-white rounded-2xl font-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand/20"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              Upload Movie
            </>
          )}
        </button>
      </form>
    </div>
  );
};
