import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../config/api';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(window.location.search);
    const initialError = queryParams.get('expired') ? 'Your session has expired. Please log in again.' : '';
    const [error, setError] = useState(initialError);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/api/auth/login`, {
                email,
                password
            });

            // Save token and user to localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Redirect to dashboard
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] relative overflow-hidden flex items-center justify-center p-4">
            {/* 🛸 Hyper-Premium Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-primary p-[1px] mb-6 shadow-2xl shadow-primary/20"
                    >
                        <div className="w-full h-full bg-[#050510] rounded-[1.95rem] flex items-center justify-center">
                            <LogIn size={32} className="text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-muted text-sm font-medium tracking-wide uppercase opacity-60">Intelligence for Architecture</p>
                </div>

                <div className="bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative">
                    <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold flex items-center gap-3"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Access Identity</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 font-medium"
                                    required
                                />
                                <div className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted">Secret Cipher</label>
                                <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline">Forgot?</span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 font-medium font-mono"
                                    required
                                />
                                <div className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-16 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                            <span className="relative">{loading ? 'Verifying...' : 'Initialize Session'}</span>
                            <ArrowRight size={16} className={`relative transition-transform duration-300 ${loading ? 'opacity-0' : 'group-hover:translate-x-1'}`} />
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-muted/50 text-[10px] font-bold uppercase tracking-widest">
                            Authorized Personnel Only
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-muted/40 transition-opacity hover:opacity-100 cursor-default">
                    &copy; 2026 Architectural Platform • Secured by Enterprise Node
                </p>
            </motion.div>
        </div>
    );
}
