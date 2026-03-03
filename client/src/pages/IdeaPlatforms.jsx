import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, RefreshCw, Sparkles, Share2,
    Instagram, Facebook, Pin, Youtube, Linkedin, MessageCircle,
    Copy, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../config/api';

const PLATFORMS = [
    { id: 'Facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'Pinterest', name: 'Pinterest', icon: Pin, color: 'bg-red-600' },
    { id: 'YouTube', name: 'YouTube', icon: Youtube, color: 'bg-red-700' },
    { id: 'LinkedIn', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'WhatsApp Community', name: 'WhatsApp Community', icon: MessageCircle, color: 'bg-green-500' },
];

export default function IdeaPlatforms() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [idea, setIdea] = useState(null);
    const [persona, setPersona] = useState('');
    const [loading, setLoading] = useState(true);
    const [platformContents, setPlatformContents] = useState({});
    const [generating, setGenerating] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [globalNote, setGlobalNote] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('Facebook');
    const [platformNote, setPlatformNote] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const note = queryParams.get('note');
        if (note) setGlobalNote(note);
    }, []);

    const fetchIdeaData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/ideas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdea(res.data);
            setPersona(res.data.personas?.[0] || 'Architect');

            // Map existing content
            if (res.data.platformContent) {
                setPlatformContents(res.data.platformContent);
            }
        } catch (err) {
            console.error('Failed to fetch idea:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchIdeaData();
    }, [fetchIdeaData]);

    useEffect(() => {
        if (idea && !loading) {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get('auto') === 'true' && Object.keys(platformContents).length === 0) {
                // Remove the flag so it doesn't re-trigger on manual refresh
                const cleanNote = queryParams.get('note') || '';
                navigate(`/idea/${id}/platforms?note=${encodeURIComponent(cleanNote)}`, { replace: true });
                generateAll();
            }
        }
    }, [idea, loading, id, navigate, platformContents]);

    const handleGenerate = async (platformId, customNote = '') => {
        setGenerating(prev => ({ ...prev, [platformId]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/ideas/${id}/generate-content`, {
                persona,
                platform: platformId,
                note: customNote || platformNote || globalNote,
                previousContent: platformContents.Instagram || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPlatformContents(prev => ({ ...prev, [platformId]: res.data }));

            // Persist after generation
            await axios.post(`${API_BASE}/api/ideas/save-prompt`, {
                ideaId: id,
                ideaContent: idea.content,
                platform: platformId,
                promptText: res.data.postText,
                captionPrompt: res.data.captionText,
                imagePrompt: res.data.imageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(`Failed to generate for ${platformId}:`, err);
        } finally {
            setGenerating(prev => ({ ...prev, [platformId]: false }));
        }
    };

    const generateAll = async () => {
        for (const platform of PLATFORMS) {
            if (!platformContents[platform.id]) {
                await handleGenerate(platform.id);
            }
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading || !idea) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCw className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} /> Back to Idea
                    </button>
                    <div className="flex-1 text-center xs:text-right">
                        <span className="text-[10px] text-muted uppercase tracking-widest font-black">Multi-Platform Engine</span>
                    </div>
                </header>

                <section className="bg-surface/30 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                            Target Idea
                        </span>
                        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                            {(idea?.content || '').split(' - ')[0]}
                        </h1>
                        <div className="flex flex-col items-center gap-3">
                            <span className="px-5 py-2 rounded-full border border-white/15 bg-white/5 text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-secondary" /> {persona}
                            </span>
                            {/* Visual indicator for image analysis */}
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                <div className="flex -space-x-2">
                                    <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40 animate-pulse"></div>
                                    <div className="w-4 h-4 rounded-full bg-secondary/20 border border-secondary/40 animate-pulse [animation-delay:200ms]"></div>
                                </div>
                                Analyzing Reference Aesthetics
                            </div>
                        </div>

                    </div>

                    <button
                        onClick={generateAll}
                        disabled={Object.values(generating).some(v => v)}
                        className="mt-10 px-12 py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                    >
                        <Share2 size={20} />
                        {Object.values(generating).some(v => v) ? 'Spinning up magic...' : 'Generate All Platforms'}
                    </button>
                </section>

                <section className="bg-surface/20 border border-white/5 rounded-[2rem] p-8 space-y-8">
                    <div className="flex items-center gap-3 text-white">
                        <Share2 size={20} className="text-primary" />
                        <h2 className="text-lg font-black uppercase tracking-widest">1. Choose Growth Platforms</h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {PLATFORMS.map((p) => {
                            const Icon = p.icon;
                            const isSelected = selectedPlatform === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlatform(p.id)}
                                    className={`group relative flex flex-col items-center justify-center w-28 h-28 rounded-3xl border transition-all duration-300 ${isSelected
                                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                                        : 'bg-surface/40 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`mb-3 p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${isSelected ? p.color : 'bg-white/5 text-muted'}`}>
                                        <Icon size={24} className={isSelected ? 'text-white' : ''} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-white' : 'text-muted'}`}>
                                        {p.name.split(' ')[0]}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="platform-glow"
                                            className="absolute inset-0 rounded-3xl border-2 border-primary/50 pointer-events-none"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-w-2xl mx-auto space-y-4">
                        {globalNote && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Global Instructions (from previous page)</p>
                                <p className="text-xs text-muted italic">"{globalNote}"</p>
                            </div>
                        )}

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">
                                Adjustments for {selectedPlatform}
                            </label>
                            <textarea
                                value={platformNote}
                                onChange={(e) => setPlatformNote(e.target.value)}
                                placeholder={`e.g. Focus on ${selectedPlatform}-specific trends / Make it shorter / Use a different tone...`}
                                className="w-full bg-background/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none transition-all resize-none"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => handleGenerate(selectedPlatform)}
                            disabled={generating[selectedPlatform]}
                            className="group relative px-16 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]"></div>
                            <RefreshCw size={18} className={generating[selectedPlatform] ? 'animate-spin' : ''} />
                            {generating[selectedPlatform] ? 'Generating...' : `Generate Content for ${selectedPlatform.split(' ')[0]}`}
                        </button>
                    </div>
                </section>

                {/* Focused Platform Detail View */}
                <div className="max-w-4xl mx-auto pt-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedPlatform}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {(() => {
                                const platform = PLATFORMS.find(p => p.id === selectedPlatform);
                                const Icon = platform?.icon;
                                const content = platformContents[selectedPlatform];
                                const isGenerating = generating[selectedPlatform];

                                if (!platform) return null;

                                return (
                                    <div className={`bg-surface/30 border ${content ? 'border-primary/30' : 'border-white/5'} rounded-[2.5rem] p-8 sm:p-10 space-y-8 backdrop-blur-md shadow-2xl`}>
                                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${platform.color} shadow-xl`}>
                                                    <Icon size={28} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-xl font-black text-white uppercase tracking-widest">{platform.name}</h3>
                                                    <span className="text-xs text-muted uppercase tracking-tighter">
                                                        System Engine Status: {content ? 'CONTENT READY' : 'WAITING FOR INPUT'}
                                                    </span>
                                                </div>
                                            </div>
                                            {content && (
                                                <button
                                                    onClick={() => handleGenerate(selectedPlatform)}
                                                    disabled={isGenerating}
                                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                                                >
                                                    <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                                                    {isGenerating ? 'Refining...' : 'Regenerate'}
                                                </button>
                                            )}
                                        </div>

                                        {content ? (
                                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                {/* Main Message */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Main Marketing Message</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(content.postText, `${selectedPlatform}-post`)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-muted hover:text-white transition-all border border-white/5"
                                                        >
                                                            {copiedId === `${selectedPlatform}-post` ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                        </button>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-background/40 border border-white/5">
                                                        <p className="text-lg sm:text-xl text-white font-bold leading-relaxed">{content.postText}</p>
                                                    </div>
                                                </div>

                                                {/* Caption */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Caption & Social Insights</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(content.captionText, `${selectedPlatform}-caption`)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-muted hover:text-white transition-all border border-white/5"
                                                        >
                                                            {copiedId === `${selectedPlatform}-caption` ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                        </button>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-background/40 border border-white/5">
                                                        <p className="text-sm text-muted leading-relaxed whitespace-pre-line font-medium italic">"{content.captionText}"</p>
                                                    </div>
                                                </div>

                                                {/* Visual Prompt */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Visual Prompt (Stable Diffusion / Midjourney)</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(content.imageText, `${selectedPlatform}-image`)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-muted hover:text-white transition-all border border-white/5"
                                                        >
                                                            {copiedId === `${selectedPlatform}-image` ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                        </button>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/20 font-mono">
                                                        <p className="text-xs text-secondary leading-relaxed">{content.imageText}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-20 flex flex-col items-center justify-center space-y-6">
                                                <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                                                    {isGenerating ? (
                                                        <RefreshCw className="animate-spin text-primary" size={32} />
                                                    ) : (
                                                        <Icon className="text-muted/20" size={32} />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-lg font-bold text-white mb-2">{isGenerating ? 'Engine Spinning Up...' : 'No Content Yet'}</h4>
                                                    <p className="text-sm text-muted max-w-xs mx-auto">
                                                        {isGenerating
                                                            ? `We are analyzing your strategy specifically for ${platform.name} trends.`
                                                            : `Click the generate button above to create targeted content for ${platform.name}.`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
