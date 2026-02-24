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
                headers
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
        <div className="min-h-screen bg-background text-text p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{new Date().toLocaleDateString()}</h2>
                        <p className="text-xs text-muted">AI Generation Session</p>
                    </div>
                </header>

                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
                    >
                        Generating Your Next Big Idea
                    </motion.h1>
                    <p className="text-muted text-lg">Harnessing AI to fuel your creativity.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-center">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <RefreshCw className="animate-spin text-primary mb-4" size={48} />
                        <p className="text-xl font-bold animate-pulse">Synthesizing {location.state?.count || 10} Concepts...</p>
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
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => navigate(`/idea/${ideaId}`)}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">{idea.content.split(' - ')[0]}</h3>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">View Details</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-center mt-12">
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow disabled:opacity-50"
                    >
                        <Zap size={20} /> Regenerate Ideas
                    </button>
                </div>
            </div>
        </div>
    );
}
