import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';

export default function GenerateIdea() {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');


    const generate = async () => {
        setLoading(true);
        setError('');
        const count = location.state?.count || 10;
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await axios.post(`${API_BASE}/api/ideas/generate`, { count }, {
                headers,
                timeout: 120000
            });
            setIdeas(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error generating ideas');
        } finally {
            setLoading(false);
        }
    };


    const hasRun = useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            generate();
            hasRun.current = true;
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#050510] relative overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* 🛸 Hyper-Premium Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <main className="max-w-4xl mx-auto relative z-10 pb-24">
                <header className="flex items-center justify-between gap-4 mb-16">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white">Back</span>

                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase italic leading-none">{new Date().toLocaleDateString()}</h2>
                    </div>
                </header>

                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase italic leading-none mb-6"
                    >
                        Generating <span className="text-primary">New</span> Strategies

                    </motion.h1>


                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-[2rem] mb-12 text-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/5"
                    >
                        {error}
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8">
                        <div className="relative">
                            <RefreshCw className="animate-spin text-primary" size={64} />
                            <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse"></div>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="text-xl font-black italic text-white uppercase tracking-tighter">Synthesizing {location.state?.count || 10} Concepts...</p>

                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {ideas.map((idea, index) => {
                            const ideaId = idea.id || idea._id;
                            return (
                                <motion.div
                                    key={ideaId || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-3xl hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-500 cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate(`/idea/${ideaId}`)}
                                >
                                    <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-center gap-8">
                                        <h3 className="text-lg sm:text-xl font-black text-white italic uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity flex-1">
                                            {idea.content.split(' - ')[0]}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">View Node</span>
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted group-hover:text-white group-hover:border-white/20 transition-all">
                                                <Zap size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scanning line animation on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-center mt-20">
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="group relative h-16 px-12 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-4 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                        <Zap size={20} className="relative group-hover:animate-pulse" />
                        <span className="relative">Regenerate Strategies</span>

                    </button>
                </div>
            </main>
        </div>
    );
}
