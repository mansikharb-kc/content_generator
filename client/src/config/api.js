// Central API base URL — set VITE_API_URL in Vercel environment variables
// for production. Falls back to localhost for local dev.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
