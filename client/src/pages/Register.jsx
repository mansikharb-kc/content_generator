import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../config/api';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('approval');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/auth/register`, {
                name,
                email,
                password,
                role
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSuccess(`User ${res.data.user.name} created successfully as ${res.data.user.role}`);

            // Clear form
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('approval');

            // Optional: navigate back after delay
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
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

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[500px] relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary via-secondary to-primary p-[1px] mb-4 shadow-2xl shadow-primary/20"
                    >
                        <div className="w-full h-full bg-[#050510] rounded-[1.45rem] flex items-center justify-center">
                            <UserPlus size={24} className="text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create New User</h1>
                    <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Authorized Personnel Management</p>
                </div>

                <div className="bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative">
                    <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl mb-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 opacity-60">Identity Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['admin', 'marketing', 'approval'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${role === r
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border-white/5 text-muted hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 opacity-60">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 text-sm font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 opacity-60">Digital Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 text-sm font-medium"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 opacity-60">Secure Cipher</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 text-sm font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 opacity-60">Verify Cipher</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder:text-muted/30 text-sm font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-14 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                            <span className="relative">{loading ? 'Processing...' : 'Authorize User'}</span>
                            <ArrowRight size={14} className={`relative transition-transform duration-300 ${loading ? 'opacity-0' : 'group-hover:translate-x-1'}`} />
                        </button>
                    </form>

                    <div className="mt-8 text-center flex justify-center items-center gap-4">
                        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">Return Home</Link>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors">Admin Panel</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
