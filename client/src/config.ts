// Base URL for the API. Configure via VITE_API_BASE at build time
// (e.g. https://your-api.example.com/api). Falls back to the local dev server.
export const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:5000/api';
