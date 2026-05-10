import { Movie, MovieListResponse, UploadResponse } from '../types';
import { sanitizeFolderName } from '../lib/utils';

// The external Cloudflare Worker URL provided by the user
const API_BASE = 'https://moviemax-worker.piustechdevoff.workers.dev'; 

const getAuthHeaders = () => ({
  'X-Auth-Key': 'greatdev', // Fixed Worker Key
  'Content-Type': 'application/json'
});

export const movieApi = {
  // App Security Management
  async verifyAppPassword(password: string): Promise<boolean> {
    const savedPassword = localStorage.getItem('moviemax_sys_pass') || 'greatdev';
    return password === savedPassword;
  },

  async updateAppPassword(newPassword: string): Promise<{ success: boolean }> {
    localStorage.setItem('moviemax_sys_pass', newPassword);
    return { success: true };
  },

  async listMovies(): Promise<Movie[]> {
    const response = await fetch(`${API_BASE}/movies?t=${Date.now()}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data: MovieListResponse = await response.json();
    
    // Normalize categories for consistency
    return data.movies.map(movie => ({
      ...movie,
      category: movie.category ? sanitizeFolderName(movie.category) : undefined
    }));
  },

  async uploadMovie(
    file: File, 
    movieName: string, 
    category: string, // This is the 'folder' in the UI (Action, Comedy, etc.)
    vj: string,       // This is the 'folder' parameter for the Worker (vj-emmy, etc.)
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    console.log('[Upload] Starting upload process for:', movieName);
    console.log('[Upload] File size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('[Upload] Content-Type:', file.type);
    
    // 1. Get a Presigned URL from the Worker
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fullMovieName = `${movieName}${extension}`;
    const sanitizedVj = sanitizeFolderName(vj);
    
    console.log('[Upload] Original Folder:', vj);
    console.log('[Upload] Sanitized Folder:', sanitizedVj);

    const presignParams = new URLSearchParams({
      movieName: fullMovieName,
      folder: sanitizedVj,
      category: category,
      contentType: file.type
    });

    console.log('[Upload] Requesting presigned URL from:', `${API_BASE}/presign?${presignParams.toString()}`);

    const presignResponse = await fetch(`${API_BASE}/presign?${presignParams.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!presignResponse.ok) {
      const err = await presignResponse.json();
      console.error('[Upload] Presign failed:', err);
      throw new Error(err.error || 'Failed to get upload authorization from Worker');
    }

    const { uploadUrl, key } = await presignResponse.json();
    console.log('[Upload] Presigned URL received!');
    console.log('[Upload] Storage Key (R2 Path):', key);
    console.log('[Upload] Presigned URL (First 100 chars):', uploadUrl.substring(0, 100) + '...');

    // 2. Upload directly to R2 using the Presigned URL
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      console.log('[Upload] Initializing XMLHttpRequest for PUT request');

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        console.log('[Upload] XHR Load Event Triggered');
        console.log('[Upload] HTTP Status Code:', xhr.status);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('[Upload] SUCCESS: R2 confirmed receipt of payload.');
          resolve({ success: true, path: key } as any);
        } else {
          console.error('[Upload] FAILURE: R2 rejected the payload.');
          const responseBody = xhr.responseText;
          console.error('[Upload] Error body from R2:', responseBody);
          const errorMessage = `Upload failed: R2 returned status ${xhr.status}. ${responseBody.substring(0, 200)}`;
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', (event) => {
        console.error('[Upload] XHR Error Event:', event);
        console.error('[Upload] This often means a CORS error. Ensure the R2 bucket allows PUT from this origin.');
        reject(new Error('Network error during direct R2 upload. Check browser console for CORS details.'));
      });

      xhr.addEventListener('abort', () => {
        console.warn('[Upload] XHR Abort Event');
        reject(new Error('Upload interrupted.'));
      });

      xhr.open('PUT', uploadUrl);
      
    // Ensure Content-Type is logged and sent correctly
    const contentType = file.type || 'video/mp4'; 
    console.log('[Upload] Setting Request Header: Content-Type =', contentType);
    xhr.setRequestHeader('Content-Type', contentType);
    
    console.log('[Upload] Dispatching binary payload to R2...');
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
      'vj-junior', 'vj-ice-p', 'vj-emmy', 'vj-shan', 'vj-mark', 
      'vj-uncle-t', 'vj-mosco', 'vj-musa', 'vj-jingo'
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
