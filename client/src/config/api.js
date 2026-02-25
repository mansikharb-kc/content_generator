// Central API base URL — set VITE_API_URL or VITE_API_BASE in Vercel
// for production. Falls back to localhost for local dev.
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export default API_BASE;
