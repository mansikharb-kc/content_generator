// Central API base URL — set VITE_API_BASE in Vercel environment variables
// for production. Falls back to localhost for local dev.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export default API_BASE;
