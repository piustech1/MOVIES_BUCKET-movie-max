import { Movie, MovieListResponse, UploadResponse } from '../types';

// The external Cloudflare Worker URL provided by the user
const API_BASE = 'https://moviemax-worker.piustechdevoff.workers.dev'; 

const getAuthHeaders = () => ({
  'X-Auth-Key': 'greatdev', // Using the master key
  'Content-Type': 'application/json'
});

export const movieApi = {
  async listMovies(): Promise<Movie[]> {
    const response = await fetch(`${API_BASE}/movies`, {
      headers: { 'X-Auth-Key': 'greatdev' }
    });
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
      headers: { 'X-Auth-Key': 'greatdev' },
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
      headers: getAuthHeaders(),
      body: JSON.stringify({ path }),
    });

    if (!response.ok) throw new Error('Delete failed');
    const data = await response.json();
    return data.success;
  },

  // VJ Management (Local API)
  async listVjs(): Promise<{ id: number; name: string }[]> {
    const response = await fetch('/api/vjs', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch VJs');
    return response.json();
  },

  async addVj(name: string): Promise<{ id: number; name: string }> {
    const response = await fetch('/api/vjs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add VJ');
    }
    return response.json();
  },

  async deleteVj(id: number): Promise<void> {
    const response = await fetch(`/api/vjs/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete VJ');
  }
};
