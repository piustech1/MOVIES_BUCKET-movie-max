import { Movie, MovieListResponse, UploadResponse } from '../types';

// In a real Cloudflare Worker deployment, this would be your worker URL
// For the preview, we'll use the local Express server which we'll set up to proxy/mock the R2 logic
const API_BASE = '/api'; 

export const movieApi = {
  async listMovies(): Promise<Movie[]> {
    const response = await fetch(`${API_BASE}/movies`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data: MovieListResponse = await response.json();
    return data.movies;
  },

  async uploadMovie(file: File, movieName: string, folder: string, category: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('movieName', movieName);
    formData.append('folder', folder);
    formData.append('category', category);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  },

  async deleteMovie(path: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/movie`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) throw new Error('Delete failed');
    const data = await response.json();
    return data.success;
  }
};
