import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Copy, RefreshCw, Check, Share2, Layers, Users, Save,
    Instagram, Facebook, Youtube, Linkedin, MessageCircle, Pin, Lock, Unlock
} from 'lucide-react';


const PLATFORMS = [
    { name: 'Instagram', color: 'from-pink-500 to-orange-500', icon: Instagram },
    { name: 'Facebook', color: 'from-blue-600 to-blue-400', icon: Facebook },
    { name: 'Pinterest', color: 'from-red-600 to-red-400', icon: Pin },
    { name: 'YouTube', color: 'from-red-700 to-red-500', icon: Youtube },
    { name: 'LinkedIn', color: 'from-blue-700 to-blue-500', icon: Linkedin },
    { name: 'WhatsApp Community', color: 'from-green-600 to-green-400', icon: MessageCircle }
];

export default function IdeaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState(null);


    // Selection State

    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    // Generation State
    const [results, setResults] = useState({}); // { platformName: { postText: "...", imageText: "...", loading: false, postCopied: false, imageCopied: false, saved: false } }
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const res = await axios.get(`${API_BASE}/api/ideas/${id}`, config);
                setIdea(res.data);

                if (res.data.isLocked && res.data.lockedData) {
                    setResults(JSON.parse(res.data.lockedData));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchIdea();
    }, [id]);

    const handleLockToggle = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
            const nextLockState = !idea.isLocked;

            const res = await axios.put(`${API_BASE}/api/ideas/${id}/lock`, {
                isLocked: nextLockState,
                lockedData: nextLockState ? results : null
            }, config);


            setIdea(res.data);
            if (!nextLockState) {
                // If unlocking, maybe we keep the results?
                // The user said "show only tht prompt" when locked.
            }
        } catch (err) {
            console.error('Lock toggle failed:', err);
            alert('Failed to update lock status');
        }
    };

    const toggleSelection = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };


    const handleGenerate = async () => {
        if (selectedPlatforms.length === 0) return;

        setIsGenerating(true);
        const newResults = { ...results };

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            for (const platform of selectedPlatforms) {
                newResults[platform] = { loading: true };
                setResults({ ...newResults });

                const res = await axios.post(`${API_BASE}/api/ideas/generate-prompts`, {
                    platform,
                    concept: idea.content
                }, {
                    headers
                });

                newResults[platform] = {
                    ...res.data,
                    loading: false,
                    postCopied: false,
                    imageCopied: false,
                    saved: false
                };
                setResults({ ...newResults });
            }
        } catch (err) {
            console.error(err);
            alert("Assistant failed to generate some prompts.");
        } finally {
            setIsGenerating(false);
        }
    };


    const regenerateSingle = async (platform) => {
        setResults(prev => ({
            ...prev,
            [platform]: { ...prev[platform], loading: true, postCopied: false, imageCopied: false, saved: false }
        }));

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await axios.post(`${API_BASE}/api/ideas/generate-prompts`, {
                platform,
                concept: idea.content
            }, {
                headers
            });

            setResults(prev => ({
                ...prev,
                [platform]: {
                    ...res.data,
                    loading: false,
                    postCopied: false,
                    imageCopied: false,
                    saved: false
                }
            }));
        } catch (err) {
            console.error(err);
            alert("Regeneration failed.");
            setResults(prev => ({
                ...prev,
                [platform]: { ...prev[platform], loading: false }
            }));
        }
    };


    const copyToClipboard = (platform, type) => {
        const text = type === 'post' ? results[platform].postText : results[platform].imageText;
        navigator.clipboard.writeText(text);

        const stateKey = type === 'post' ? 'postCopied' : 'imageCopied';
        setResults(prev => ({
            ...prev,
            [platform]: { ...prev[platform], [stateKey]: true }
        }));

        setTimeout(() => {
            setResults(prev => ({
                ...prev,
                [platform]: { ...prev[platform], [stateKey]: false }
            }));
        }, 2000);
    };

    const handleSavePrompt = async (platform) => {
        try {
            // Token removed - using public access
            const data = results[platform];
            await axios.post(`${API_BASE}/api/ideas/save-prompt`, {
                ideaId: idea._id || idea.id,
                ideaContent: idea.content,
                platform: platform,
                postPrompt: data.postText,
                imagePrompt: data.imageText
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setResults(prev => ({
                ...prev,
                [platform]: { ...prev[platform], saved: true }
            }));

            setTimeout(() => {
                setResults(prev => ({
                    ...prev,
                    [platform]: { ...prev[platform], saved: false }
                }));
            }, 2000);
        } catch (err) {
            console.error('Error saving prompt:', err);
            alert('Failed to save prompt');
        }
    };


    if (!idea) return <div className="p-4 sm:p-8 text-center text-white text-sm">Loading Idea...</div>;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 pb-16 sm:pb-32">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-12">

                {/* Header */}
                <header className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs xs:text-base">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="text-right flex-1 xs:ml-8">
                        <span className="text-xs text-muted uppercase tracking-widest font-bold">Marketing Strategy Workspace</span>
                    </div>
                </header>

                {/* 1. Top: Main Heading (The Idea) */}
                <section className="bg-surface/30 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                    <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight break-words">
                        {idea.content.split(' - ')[0]}
                    </p>
                </section>

                {/* 2. Middle: Configuration */}
                {!idea.isLocked && (
                    <div className="space-y-12">
                {/* Platform Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                                <Share2 size={18} className="text-secondary" /> 1. Choose Growth Platforms
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                                {PLATFORMS.map(platform => (
                                    <button
                                        key={platform.name}
                                        onClick={() => toggleSelection(platform.name, selectedPlatforms, setSelectedPlatforms)}
                                        className={`p-3 sm:p-4 rounded-2xl border transition-all text-xs sm:text-sm font-medium flex flex-col items-center justify-center gap-2 sm:gap-3 h-24 sm:h-28 lg:h-32 ${selectedPlatforms.includes(platform.name)
                                            ? 'bg-white/10 border-white/20 text-white shadow-2xl shadow-white/5 scale-105'
                                            : 'bg-surface/50 border-white/5 text-muted hover:border-white/20 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.color} text-white shadow-lg`}>
                                            <platform.icon size={24} />
                                        </div>
                                        <span className="text-center font-bold tracking-tight">{platform.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Action */}
                <div className="flex flex-col items-center gap-6 pt-4">
                    {!idea.isLocked && (
                        <button
                            onClick={handleGenerate}
                            disabled={selectedPlatforms.length === 0 || isGenerating}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Layers />}
                            {isGenerating ? 'Generating Content...' : 'Generate Content for Post'}
                        </button>
                    )}

                    {Object.keys(results).length > 0 && !isGenerating && (
                        <button
                            onClick={handleLockToggle}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all border-2 ${idea.isLocked
                                ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                                }`}
                        >
                            {idea.isLocked ? <Unlock size={20} /> : <Lock size={20} />}
                            {idea.isLocked ? 'Unlock Strategy' : 'Lock This Strategy'}
                        </button>
                    )}

                    {idea.isLocked && (
                        <p className="text-muted text-sm italic">This strategy is locked and will be shown every time you visit.</p>
                    )}
                </div>

                {/* 3. Bottom: Generated Results */}
                <AnimatePresence>
                    {Object.keys(results).length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pt-8 border-t border-white/10"
                        >
                            <h3 className="text-2xl font-bold mb-8 text-center text-white">Generated Content for Posts</h3>

                            <div className="grid gap-6">
                                {Object.entries(results).map(([platform, data]) => (
                                    <motion.div
                                        key={platform}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-surface/40 border border-white/10 rounded-xl p-6 hover:bg-surface/60 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${PLATFORMS.find(p => p.name === platform)?.color}`}></div>
                                                <h4 className="font-bold text-lg text-white">{platform} Content</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                {!idea.isLocked && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSavePrompt(platform)}
                                                            className={`p-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${data.saved
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-white/5 hover:bg-white/10 text-muted hover:text-white'
                                                                }`}
                                                            title="Save to Database"
                                                        >
                                                            {data.saved ? <Check size={18} /> : <Save size={18} />}
                                                            {data.saved && <span className="text-xs font-bold">Strategy Saved</span>}
                                                        </button>
                                                        <button
                                                            onClick={() => regenerateSingle(platform)}
                                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors"
                                                            title="Regenerate"
                                                        >
                                                            <RefreshCw size={18} className={data.loading ? "animate-spin" : ""} />
                                                        </button>
                                                    </>
                                                )}
                                                {idea.isLocked && (
                                                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/20">
                                                        <Lock size={14} />
                                                        <span className="text-xs font-bold">LOCKED</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Post Prompt */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-t-lg border-x border-t border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">📝 Content for Post</span>
                                                    <button
                                                        onClick={() => copyToClipboard(platform, 'post')}
                                                        className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${data.postCopied ? 'text-green-400' : 'text-primary hover:text-white'}`}
                                                    >
                                                        {data.postCopied ? <Check size={10} /> : <Copy size={10} />}
                                                        {data.postCopied ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="relative bg-black/40 rounded-b-lg p-4 border border-white/10 min-h-[120px]">
                                                    {data.loading ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <RefreshCw className="animate-spin text-muted" size={16} />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap italic">"{data.postText}"</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Image Prompt */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-t-lg border-x border-t border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">🖼️ AI Image Prompt</span>
                                                    <button
                                                        onClick={() => copyToClipboard(platform, 'image')}
                                                        className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${data.imageCopied ? 'text-green-400' : 'text-primary hover:text-white'}`}
                                                    >
                                                        {data.imageCopied ? <Check size={10} /> : <Copy size={10} />}
                                                        {data.imageCopied ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="relative bg-black/40 rounded-b-lg p-4 border border-white/10 min-h-[120px]">
                                                    {data.loading ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <RefreshCw className="animate-spin text-muted" size={16} />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap italic">"{data.imageText}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
