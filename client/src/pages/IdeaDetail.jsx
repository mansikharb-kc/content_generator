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
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);


    // Selection State

    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    // Generation State
    const [results, setResults] = useState({}); // { platformName: { postText: "...", captionText: "...", imageText: "...", loading: false, postCopied: false, captionCopied: false, imageCopied: false, saved: false } }
    const [isGenerating, setIsGenerating] = useState(false);
    const [imagePreviews, setImagePreviews] = useState({}); // { platformName: 'data_url' }

    const processFile = (platform, file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({
                    ...prev,
                    [platform]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = (platform, e) => {
        const file = e.target.files[0];
        processFile(platform, file);
    };

    const handleDrop = (platform, e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        processFile(platform, file);
    };

    const handlePaste = (platform, e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                processFile(platform, file);
                break;
            }
        }
    };

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                const res = await axios.get(`${API_BASE}/api/ideas/${id}`, config);
                setIdea(res.data);

                if (res.data.isLocked && res.data.lockedData) {
                    try {
                        const parsedData = JSON.parse(res.data.lockedData);
                        if (parsedData) {
                            setResults(parsedData.results || {});
                            setImagePreviews(parsedData.imagePreviews || {});
                        }
                    } catch (e) {
                        console.error('Failed to parse locked data:', e);
                    }
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
                lockedData: nextLockState ? { results, imagePreviews } : null
            }, config);


            setIdea(res.data);
            if (!nextLockState) {
                // If unlocking, maybe we keep the results?
                // The user said "show only tht prompt" when locked.
            }
        } catch (err) {
            console.error('Lock toggle failed:', err);
            const errMsg = err.response?.data?.msg || 'Failed to update lock status';
            alert(errMsg);
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
                newResults[platform] = {
                    loading: true,
                    postLoading: true,
                    captionLoading: true,
                    imageLoading: true
                };
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
                    postLoading: false,
                    captionLoading: false,
                    imageLoading: false,
                    postCopied: false,
                    captionCopied: false,
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
            [platform]: {
                ...prev[platform],
                loading: true,
                postLoading: true,
                captionLoading: true,
                imageLoading: true,
                postCopied: false,
                captionCopied: false,
                imageCopied: false,
                saved: false,
                feedback: prev[platform]?.feedback || ''
            }
        }));

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await axios.post(`${API_BASE}/api/ideas/generate-prompts`, {
                platform,
                concept: idea.content,
                feedback: results[platform]?.feedback
            }, {
                headers
            });

            setResults(prev => ({
                ...prev,
                [platform]: {
                    ...res.data,
                    loading: false,
                    postLoading: false,
                    captionLoading: false,
                    imageLoading: false,
                    postCopied: false,
                    captionCopied: false,
                    imageCopied: false,
                    saved: false,
                    feedback: prev[platform]?.feedback // Keep the feedback text
                }
            }));
        } catch (err) {
            console.error(err);
            alert("Regeneration failed.");
            setResults(prev => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    loading: false,
                    postLoading: false,
                    captionLoading: false,
                    imageLoading: false
                }
            }));
        }
    };

    const regenerateField = async (platform, field) => {
        const loadingKey = `${field.replace('Text', '')}Loading`; // postText -> postLoading

        setResults(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [loadingKey]: true,
                saved: false
            }
        }));

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await axios.post(`${API_BASE}/api/ideas/generate-prompts`, {
                platform,
                concept: idea.content,
                targetField: field,
                feedback: results[platform]?.feedback
            }, {
                headers
            });

            setResults(prev => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    [field]: res.data[field],
                    [loadingKey]: false,
                    [`${field.replace('Text', '')}Copied`]: false
                }
            }));
        } catch (err) {
            console.error(err);
            alert(`Failed to regenerate ${field}`);
            setResults(prev => ({
                ...prev,
                [platform]: { ...prev[platform], [loadingKey]: false }
            }));
        }
    };


    const copyToClipboard = (platform, type) => {
        let text = '';
        let stateKey = '';

        if (type === 'post') {
            text = results[platform].postText;
            stateKey = 'postCopied';
        } else if (type === 'caption') {
            text = results[platform].captionText;
            stateKey = 'captionCopied';
        } else {
            text = results[platform].imageText;
            stateKey = 'imageCopied';
        }

        navigator.clipboard.writeText(text);

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
            const token = localStorage.getItem('token');
            const data = results[platform];
            await axios.post(`${API_BASE}/api/ideas/save-prompt`, {
                ideaId: idea._id || idea.id,
                ideaContent: idea.content,
                platform: platform,
                postPrompt: data.postText,
                captionPrompt: data.captionText,
                imagePrompt: data.imageText,
                uploadedImage: imagePreviews[platform] || ''
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
            const errMsg = err.response?.data?.msg || 'Failed to save prompt';
            alert(errMsg);
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

                    {/* Floating Lock Toggle */}
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleLockToggle}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/40 border ${idea.isLocked
                                ? 'bg-green-500 text-white border-green-400 shadow-green-500/20'
                                : 'bg-red-500 text-white border-red-400 shadow-red-500/20'}`}
                        >
                            {idea.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                            {idea.isLocked ? 'Strategy Locked' : 'Strategy Unlocked'}
                        </button>
                    </div>

                    <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight break-words pt-4">
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
                            disabled={selectedPlatforms.length === 0 || isGenerating || user?.role === 'free'}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Layers />}
                            {isGenerating ? 'Generating Content...' : user?.role === 'free' ? 'Generation Locked (Free)' : 'Generate Content for Post'}
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
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${PLATFORMS.find(p => p.name === platform)?.color}`}></div>
                                                <h4 className="font-bold text-lg text-white">{platform} Content</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                {idea.isLocked && (
                                                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/20">
                                                        <Lock size={14} />
                                                        <span className="text-xs font-bold">LOCKED</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image Upload Section - Now in the Mid */}
                                        {!idea.isLocked && (user?.role === 'admin' || user?.role === 'marketing') && (
                                            <div className="mb-8 pb-8 border-b border-white/5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 mb-4">
                                                    <Share2 size={12} /> Post Visual Media
                                                </label>
                                                <div className="w-full">
                                                    {!imagePreviews[platform] ? (
                                                        <div className="flex items-center justify-center w-full">
                                                            <label
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => handleDrop(platform, e)}
                                                                onPaste={(e) => handlePaste(platform, e)}
                                                                tabIndex={0}
                                                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/5 border-dashed rounded-2xl cursor-pointer bg-black/10 hover:bg-black/20 transition-all hover:border-primary/50 group focus:outline-none focus:border-primary/50 outline-none"
                                                            >
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                                                    <Share2 className="w-10 h-10 mb-4 text-muted group-hover:text-primary transition-colors" />
                                                                    <p className="mb-2 text-sm text-white/80 font-bold uppercase tracking-widest">Upload Image</p>
                                                                    <p className="text-[10px] text-muted/50 font-medium italic">Drop file or Paste here</p>
                                                                </div>
                                                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(platform, e)} />
                                                            </label>
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-fit mx-auto rounded-2xl overflow-hidden border border-white/10 group flex items-center justify-center shadow-2xl">
                                                            <img
                                                                src={imagePreviews[platform]}
                                                                alt="Preview"
                                                                className="max-w-full max-h-[500px] h-auto block"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                                <label className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2">
                                                                    <RefreshCw size={14} /> Change Image
                                                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(platform, e)} />
                                                                </label>
                                                                <button
                                                                    onClick={() => setImagePreviews(prev => {
                                                                        const next = { ...prev };
                                                                        delete next[platform];
                                                                        return next;
                                                                    })}
                                                                    className="bg-red-500/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 transition-all flex items-center gap-2"
                                                                    title="Remove Image"
                                                                >
                                                                    <ArrowLeft size={14} className="rotate-45" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Post Content */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-t-lg border-x border-t border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">📝 Content for Post</span>
                                                    <div className="flex gap-2">
                                                        {!idea.isLocked && (user?.role === 'admin' || user?.role === 'marketing') && (
                                                            <button
                                                                onClick={() => regenerateField(platform, 'postText')}
                                                                className="text-[10px] font-bold flex items-center gap-1 text-muted hover:text-white transition-colors"
                                                                title="Regenerate only content"
                                                            >
                                                                <RefreshCw size={10} className={data.postLoading ? "animate-spin" : ""} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => copyToClipboard(platform, 'post')}
                                                            className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${data.postCopied ? 'text-green-400' : 'text-primary hover:text-white'}`}
                                                        >
                                                            {data.postCopied ? <Check size={10} /> : <Copy size={10} />}
                                                            {data.postCopied ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative bg-black/40 rounded-b-lg p-4 border border-white/10 min-h-[120px]">
                                                    {data.loading || data.postLoading ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <RefreshCw className="animate-spin text-muted" size={16} />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap italic">{data.postText}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Caption */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-t-lg border-x border-t border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">💬 Caption for Post</span>
                                                    <div className="flex gap-2">
                                                        {!idea.isLocked && (user?.role === 'admin' || user?.role === 'marketing') && (
                                                            <button
                                                                onClick={() => regenerateField(platform, 'captionText')}
                                                                className="text-[10px] font-bold flex items-center gap-1 text-muted hover:text-white transition-colors"
                                                                title="Regenerate only caption"
                                                            >
                                                                <RefreshCw size={10} className={data.captionLoading ? "animate-spin" : ""} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => copyToClipboard(platform, 'caption')}
                                                            className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${data.captionCopied ? 'text-green-400' : 'text-primary hover:text-white'}`}
                                                        >
                                                            {data.captionCopied ? <Check size={10} /> : <Copy size={10} />}
                                                            {data.captionCopied ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative bg-black/40 rounded-b-lg p-4 border border-white/10 min-h-[120px]">
                                                    {data.loading || data.captionLoading ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <RefreshCw className="animate-spin text-muted" size={16} />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap italic">{data.captionText}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Image Prompt */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-t-lg border-x border-t border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-muted tracking-widest">🖼️ AI Image Prompt</span>
                                                    <div className="flex gap-2">
                                                        {!idea.isLocked && (user?.role === 'admin' || user?.role === 'marketing') && (
                                                            <button
                                                                onClick={() => regenerateField(platform, 'imageText')}
                                                                className="text-[10px] font-bold flex items-center gap-1 text-muted hover:text-white transition-colors"
                                                                title="Regenerate only image prompt"
                                                            >
                                                                <RefreshCw size={10} className={data.imageLoading ? "animate-spin" : ""} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => copyToClipboard(platform, 'image')}
                                                            className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${data.imageCopied ? 'text-green-400' : 'text-primary hover:text-white'}`}
                                                        >
                                                            {data.imageCopied ? <Check size={10} /> : <Copy size={10} />}
                                                            {data.imageCopied ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative bg-black/40 rounded-b-lg p-4 border border-white/10 min-h-[120px]">
                                                    {data.loading || data.imageLoading ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <RefreshCw className="animate-spin text-muted" size={16} />
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap italic">{data.imageText}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feedback / Comment Section */}
                                        {!idea.isLocked && (user?.role === 'admin' || user?.role === 'marketing') && results[platform] && !results[platform].loading && (
                                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                                        <MessageCircle size={12} /> Prompt Feedback
                                                    </label>
                                                    {data.feedback && (
                                                        <span className="text-[10px] text-primary/60 font-bold uppercase">Ready to refine</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-4">
                                                    <textarea
                                                        value={data.feedback || ''}
                                                        onChange={(e) => setResults(prev => ({
                                                            ...prev,
                                                            [platform]: { ...prev[platform], feedback: e.target.value }
                                                        }))}
                                                        placeholder="Add instructions to refine these prompts..."
                                                        className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-muted/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleSavePrompt(platform)}
                                                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase transition-all shadow-lg ${data.saved
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-white/5 hover:bg-white/10 text-white'
                                                                }`}
                                                            title="Save Strategy"
                                                        >
                                                            {data.saved ? <Check size={14} /> : <Save size={14} />}
                                                            {data.saved ? 'Saved' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => regenerateSingle(platform)}
                                                            disabled={data.loading}
                                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-[10px] uppercase transition-all flex items-center gap-2 group shadow-xl shadow-primary/20"
                                                            title="Regenerate with feedback"
                                                        >
                                                            <RefreshCw size={14} className={data.loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                                                            {data.loading ? '...' : 'Regenerate Content'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </div>
        </div >
    );
}
