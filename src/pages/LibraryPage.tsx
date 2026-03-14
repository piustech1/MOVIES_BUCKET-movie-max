import React from 'react';
import { MovieList } from '../components/MovieList';
import { Movie } from '../types';

interface LibraryPageProps {
  movies: Movie[];
  onDelete: () => void;
  isLoading: boolean;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ movies, onDelete, isLoading }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Movie Assets</h3>
          <p className="text-sm text-zinc-500">Manage and monitor your stored movie files.</p>
        </div>
        <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl">
          <span className="text-xs font-black text-brand uppercase tracking-widest">{movies.length} Total Assets</span>
        </div>
      </div>
      
      <MovieList 
        movies={movies} 
        onDelete={onDelete} 
        isLoading={isLoading} 
      />
    </div>
  );
};
