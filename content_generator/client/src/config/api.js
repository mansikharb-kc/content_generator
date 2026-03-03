// Central API base URL
// - In local dev: empty string → uses Vite's proxy (/api → http://127.0.0.1:8080)
// - In production: set VITE_API_URL to the full backend URL (e.g. https://your-server.vercel.app)
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://content-generator-1-4bmw.onrender.com';

export default API_BASE;
