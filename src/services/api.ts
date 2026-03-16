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

  async uploadMovie(
    file: File, 
    movieName: string, 
    category: string, // This is the 'folder' in the UI (Action, Comedy, etc.)
    vj: string,       // This is the 'folder' parameter for the Worker (vj-emmy, etc.)
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    // 1. Get a Presigned URL from the Worker
    // The Worker expects 'folder' (the VJ) and 'movieName'
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fullMovieName = `${movieName}${extension}`;
    
    const presignResponse = await fetch(`${API_BASE}/presign?movieName=${encodeURIComponent(fullMovieName)}&folder=${encodeURIComponent(vj)}&contentType=${encodeURIComponent(file.type)}`, {
      headers: { 'X-Auth-Key': 'greatdev' }
    });

    if (!presignResponse.ok) {
      const err = await presignResponse.json();
      throw new Error(err.error || 'Failed to get upload authorization');
    }

    const { uploadUrl, key } = await presignResponse.json();

    // 2. Upload directly to R2 using the Presigned URL
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, path: key } as any);
        } else {
          reject(new Error(`R2 Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during direct R2 upload. Check your R2 CORS settings.'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
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
