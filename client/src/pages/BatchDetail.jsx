import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowLeft, Eye, Copy,
    CheckCheck, LayoutDashboard, Loader2, RotateCcw,
    MessageSquare, Lock, Unlock, Database, Zap
} from 'lucide-react';
import API_BASE from '../config/api';

const parseStrategicAdvice = (text) => {
    if (!text) return [];
    const normalized = text.trim();
    const numberedSegments = normalized
        .split(/\d+\.\s*/)
        .map((segment) => segment.replace(/^\W+/, '').trim())
        .filter(Boolean);

    if (numberedSegments.length > 1) return numberedSegments;

    return normalized
        .split(/\r?\n+/)
        .map((segment) => segment.trim())
        .filter(Boolean);
};

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

    const handleToggleLock = async (ideaId, currentLockedState) => {
        try {
            const token = localStorage.getItem('token');
            const nextState = !currentLockedState;

            await axios.put(`${API_BASE}/api/ideas/${ideaId}/lock`, {
                isLocked: nextState,
                lockedData: null
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setBatch(prev => ({
                ...prev,
                ideas: prev.ideas.map(idea =>
                    idea._id === ideaId ? { ...idea, isLocked: nextState } : idea
                )
            }));
        } catch (err) {
            console.error('Lock toggle failed:', err);
            const errMsg = err.response?.data?.msg || 'Failed to update lock status';
            alert(errMsg);
        }
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

            <header className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-8 sm:mb-12 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                >
                    <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white">Back</span>
                </button>
            </header>

            <main className="max-w-6xl mx-auto relative z-10 pb-24">
                {/* ── BATCH STRATEGY CARD ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                    <Sparkles size={14} /> Batch Overview

                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase italic leading-none">{batch.topic}</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {batch.personas.map(p => (
                                    <span key={p} className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-muted hover:text-white hover:bg-white/[0.08] transition-all">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                                    <Database size={14} className="text-secondary" />
                                    STRATEGY OVERVIEW

                                </h4>
                                <p className="text-sm text-muted leading-relaxed font-bold opacity-80 italic">
                                    {batch.overview}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                                    <Zap size={14} className="text-primary" />
                                    STRATEGIC ADVICE

                                </h4>
                                {(() => {
                                    const strategyPoints = parseStrategicAdvice(batch.strategicAdvice);
                                    const numberWords = ['01', '02', '03', '04', '05', '06', '07'];
                                    return strategyPoints.length ? (
                                        <ul className="space-y-6 text-sm">
                                            {strategyPoints.map((point, index) => (
                                                <li key={index} className="flex gap-6 group/li">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary min-w-[3.5rem] mt-1 opacity-40 group-hover/li:opacity-100 transition-opacity">
                                                        {numberWords[index] || `${index + 1}`}
                                                    </span>
                                                    <span className="flex-1 text-white font-bold opacity-70 group-hover/li:opacity-100 transition-opacity leading-relaxed">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted/40 italic">Strategic advice unavailable.</p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── IDEAS LIST ── */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase italic flex items-center gap-3">
                            <LayoutDashboard size={20} className="text-primary" />
                            GENERATED STRATEGIES

                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-40">
                            {batch.ideas.length} RECOMMENDED NODES
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batch.ideas.map((idea, i) => (
                            <motion.div
                                key={idea._id}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                className="group bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-2 py-0.5 rounded border border-primary/20 italic">STRATEGY #{i + 1}</span>

                                        <div className="flex items-center gap-2">
                                            {idea.isLocked ? (
                                                <button
                                                    onClick={() => handleToggleLock(idea._id, true)}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                                                >
                                                    <Lock size={10} className="animate-pulse" /> LOCKED
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleLock(idea._id, false)}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                                >
                                                    <Unlock size={10} /> UNLOCKED
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-white font-bold leading-relaxed min-h-[90px] opacity-70 group-hover:opacity-100 transition-opacity">
                                        {idea.content}
                                    </p>
                                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                                        <Link
                                            to={`/idea/${idea._id}`}
                                            className="h-11 flex items-center gap-2 px-6 rounded-xl bg-white/5 hover:bg-primary hover:text-white text-muted text-[10px] font-black uppercase tracking-widest transition-all flex-1 justify-center border border-white/5 hover:border-primary"
                                        >
                                            <Eye size={14} /> VIEW

                                        </Link>
                                        <button
                                            onClick={() => handleCopy(idea._id, idea.content)}
                                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-secondary/20 text-muted hover:text-secondary border border-white/5 transition-all"
                                        >
                                            {copiedId === idea._id ? <CheckCheck size={16} /> : <Copy size={16} />}
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
                        className="pt-16 pb-12 mt-12 border-t border-white/5"
                    >
                        <div className="max-w-3xl mx-auto space-y-10">
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">Neural Refinement</h3>
                            </div>

                            <div className="relative group/input">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2.5rem] blur-xl opacity-0 group-hover/input:opacity-100 transition duration-1000"></div>
                                <div className="relative">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Example: Increase professional tone for LinkedIn / Focus on sustainable materials..."
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-sm font-bold text-white placeholder:text-muted/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all min-h-[160px] resize-none leading-relaxed"
                                    />
                                    <MessageSquare className="absolute bottom-6 right-8 text-muted/20" size={20} />
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="group relative h-16 px-12 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-4 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                    {isRegenerating ? (
                                        <Loader2 className="animate-spin relative" size={20} />
                                    ) : (
                                        <RotateCcw className="group-hover:rotate-180 transition-transform duration-700 relative" size={20} />
                                    )}
                                    <span className="relative">
                                        {isRegenerating ? "Synthesizing Concepts..." : feedback ? "Initialize Refined Batch" : "Initialize Fresh Iteration"}
                                    </span>
                                </button>
                            </div>

                            {batch.feedback && (
                                <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group/prev">
                                    <div className="flex items-center gap-3 mb-3 text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
                                        <MessageSquare size={12} />
                                        Trace Feedback Log
                                    </div>
                                    <p className="text-xs text-muted italic font-bold opacity-60 group-hover/prev:opacity-100 transition-opacity leading-relaxed">"{batch.feedback}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
