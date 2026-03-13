export interface Movie {
  name: string;
  path: string;
  url: string;
  size?: number;
  uploaded?: string;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
  error?: string;
}

export interface MovieListResponse {
  movies: Movie[];
}
