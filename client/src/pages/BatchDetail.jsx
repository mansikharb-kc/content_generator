import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowLeft, Eye, Copy,
    CheckCheck, LayoutDashboard, Loader2, RotateCcw,
    MessageSquare
} from 'lucide-react';
import API_BASE from '../config/api';

export default function BatchDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [feedback, setFeedback] = useState('');

    const [isRegenerating, setIsRegenerating] = useState(false);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/api/ideas/batch/${id}`, { headers: getAuthHeader() });
            setBatch(res.data);
        } catch (e) {
            console.error(e);
            alert("Failed to load batch results.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!batch) return;
        setIsRegenerating(true);
        try {
            const res = await axios.post(
                `${API_BASE}/api/ideas/generate`,
                {
                    count: batch.ideas.length,
                    personas: batch.personas,
                    topic: batch.topic,
                    feedback: feedback
                },
                { headers: getAuthHeader() }
            );

            // Navigate to the new results page
            navigate(`/batch/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert("Regeneration failed. Try again later.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleCopy = (ideaId, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(ideaId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } })
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!batch) return null;

    return (
        <div className="min-h-screen bg-background text-text font-sans">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        <span className="font-bold text-white text-sm sm:text-base">Batch Analysis Results</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* ── BATCH STRATEGY CARD ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-1 rounded-[2rem] bg-gradient-to-br from-primary/30 via-secondary/30 to-primary/30 shadow-2xl"
                >
                    <div className="bg-background/90 backdrop-blur-3xl rounded-[1.9rem] p-8 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Overview</span>
                                <h1 className="text-3xl font-black text-white">{batch.topic}</h1>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {batch.personas.map(p => (
                                    <span key={p} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted uppercase">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-secondary" />
                                    Market Context & Insight
                                </h4>
                                <p className="text-sm text-muted leading-relaxed italic">
                                    {batch.overview}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-primary" />
                                    Campaign Strategy Secrets
                                </h4>
                                <p className="text-sm text-muted leading-relaxed italic whitespace-pre-wrap">
                                    {batch.strategicAdvice}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── IDEAS LIST ── */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                        <LayoutDashboard size={18} className="text-primary" />
                        Recommended Social Media Posts
                        <span className="ml-auto text-xs text-muted font-normal">
                            {batch.ideas.length} ideas
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batch.ideas.map((idea, i) => (
                            <motion.div
                                key={idea._id}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                className="group bg-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:border-primary/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest badge">IDEA #{i + 1}</span>
                                    <p className="text-sm text-text/90 leading-relaxed font-medium min-h-[80px]">
                                        {idea.content}
                                    </p>
                                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                        <Link
                                            to={`/idea/${idea._id}`}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 text-xs font-bold text-muted hover:text-primary transition-all flex-1 justify-center"
                                        >
                                            <Eye size={14} /> Full Strategy
                                        </Link>
                                        <button
                                            onClick={() => handleCopy(idea._id, idea.content)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-secondary/20 text-xs font-bold text-muted hover:text-secondary transition-all"
                                        >
                                            {copiedId === idea._id ? <CheckCheck size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── REGENERATE OPTION ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-16 pb-12 border-t border-white/5"
                    >
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Refine these ideas?</h3>
                                <p className="text-sm text-muted">Tell us what you'd like to change or focus on, and we'll regenerate the batch for you.</p>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Example: Make them more professional for LinkedIn, or add a focus on sustainability..."
                                        className="w-full bg-surface/50 border border-white/10 rounded-2xl p-6 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] resize-none"
                                    />
                                    <MessageSquare className="absolute bottom-4 right-4 text-muted/30" size={20} />
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isRegenerating ? (
                                        <Loader2 className="animate-spin" size={22} />
                                    ) : (
                                        <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" size={22} />
                                    )}
                                    {isRegenerating ? "Weaving New Ideas..." : feedback ? "Regenerate with Feedback" : "Regenerate Fresh Batch"}
                                </button>
                            </div>

                            {batch.feedback && (
                                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                        <MessageSquare size={12} />
                                        Previous Refinement
                                    </div>
                                    <p className="text-xs text-muted italic">"{batch.feedback}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
