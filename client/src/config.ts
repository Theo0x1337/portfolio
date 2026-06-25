// Base URL for the API. Configure via VITE_API_BASE at build time to point at an
// external API (e.g. https://your-api.example.com/api). Otherwise it defaults to
// same-origin "/api" in production (frontend + serverless API on one Vercel
// domain) and to the local dev server during development.
export const API_BASE: string =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
