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

  // VJ Management (Hardcoded)
  async listVjs(): Promise<{ id: number; name: string }[]> {
    const vjs = [
      'vj junior', 'vj ice p', 'vj Emmy', 'vj shan', 'vj mark', 
      'vj Uncle T', 'vj Mosco', 'vj Musa', 'vj jingo'
    ];
    return vjs.map((name, index) => ({ id: index + 1, name }));
  },

  async addVj(name: string): Promise<{ id: number; name: string }> {
    throw new Error('VJ management is now system-automated. Manual adding is disabled.');
  },

  async deleteVj(id: number): Promise<void> {
    throw new Error('VJ management is now system-automated. Manual deletion is disabled.');
  }
};
