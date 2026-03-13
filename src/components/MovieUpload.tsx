import React, { useState } from 'react';
import { Upload, Film, Folder, Tag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { movieApi } from '../services/api';

interface MovieUploadProps {
  onUploadSuccess: () => void;
}

const FOLDERS = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Series'];
const CATEGORIES = ['Hollywood', 'Bollywood', 'Anime', 'Documentary'];

export const MovieUpload: React.FC<MovieUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [movieName, setMovieName] = useState('');
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-fill movie name from file name (without extension)
      if (!movieName) {
        setMovieName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !movieName) return;

    setIsUploading(true);
    setStatus(null);

    try {
      await movieApi.uploadMovie(file, movieName, folder, category);
      setStatus({ type: 'success', message: 'Movie uploaded successfully!' });
      setFile(null);
      setMovieName('');
      onUploadSuccess();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload movie' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-semibold text-zinc-900">Upload New Movie</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <Film className="w-4 h-4" /> Video File
            </label>
            <div className="relative">
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
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
              >
                <span className="text-zinc-500 truncate">
                  {file ? file.name : 'Click to select video (MP4, MKV, WEBM)'}
                </span>
              </label>
            </div>
          </div>

          {/* Movie Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Movie Name
            </label>
            <input
              type="text"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              placeholder="Enter movie title"
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <Folder className="w-4 h-4" /> Storage Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file || !movieName}
          className="w-full md:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading Movie...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Start Upload
            </>
          )}
        </button>
      </form>
    </div>
  );
};
