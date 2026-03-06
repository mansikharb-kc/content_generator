import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Lock, Unlock, RefreshCw, Share2, Sparkles, Edit2, Check, X,
    Instagram, Facebook, Pin, Youtube, Linkedin, MessageCircle,
    Copy, CheckCheck, LockOpen, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../config/api';



const PLATFORMS = [
    { id: 'Instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' },
    { id: 'Facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'Pinterest', name: 'Pinterest', icon: Pin, color: 'bg-red-600' },
    { id: 'YouTube', name: 'YouTube', icon: Youtube, color: 'bg-red-700' },
    { id: 'LinkedIn', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'WhatsApp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
];

export default function IdeaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState(null);
    const [user, setUser] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const [persona, setPersona] = useState('');
    const [generatedPost, setGeneratedPost] = useState(null);
    const [isGeneratingPost, setIsGeneratingPost] = useState(false);
    const [generateError, setGenerateError] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSection, setModalSection] = useState('both');
    const [ideaNote, setIdeaNote] = useState('');
    const [isEditingCopy, setIsEditingCopy] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editValues, setEditValues] = useState({
        postText: '',
        captionText: '',
        imageText: ''
    });
    const [companyContext, setCompanyContext] = useState('');
    const [contentGoal, setContentGoal] = useState('');

    // Platform Specific States
    const [platformContents, setPlatformContents] = useState({});
    const [generating, setGenerating] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
    const [platformNote, setPlatformNote] = useState('');
    const [lockedPlatforms, setLockedPlatforms] = useState([]);
    const [isPlatformLocking, setIsPlatformLocking] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState(null);


    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const fetchUploadedImages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/images?ideaId=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploadedImages(res.data);
        } catch (err) {
            console.error('Failed to load uploaded images:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchUploadedImages();
    }, [fetchUploadedImages]);

    const handleImageUpload = async (file) => {
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token || token === 'null' || token === 'undefined') {
            console.error('[Upload] No valid token found in localStorage');
            setImageUploadError('Your session has expired. Please log in again.');
            return;
        }

        setIsUploadingImage(true);
        setImageUploadError('');

        const formData = new FormData();
        formData.append('ideaId', id);
        formData.append('title', idea?.content?.slice(0, 80) || 'Reference image');
        formData.append('image', file);

        try {
            console.log(`[Upload] Attempting upload for idea ${id}...`);
            await axios.post(`${API_BASE}/api/images/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('[Upload] Success');
            fetchUploadedImages();
        } catch (err) {
            console.error('[Upload] Failed:', err);
            const serverMsg = err.response?.data?.msg;
            if (err.response?.status === 401) {
                setImageUploadError('Authentication failed. Please try logging out and back in.');
            } else {
                setImageUploadError(serverMsg || 'Upload failed. Please check your connection.');
            }
        } finally {
            setIsUploadingImage(false);
        }
    };


    const handleDropImage = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const preventDefault = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${API_BASE}/api/ideas/${id}`, config);
                setIdea(res.data);
                if (res.data.personas && res.data.personas.length > 0) {
                    setPersona(res.data.personas[0]);
                } else {
                    setPersona('');
                }
                setCompanyContext(res.data.batchTopic || '');
                if (res.data.platformContent) {
                    setPlatformContents(res.data.platformContent);
                    setGeneratedPost(res.data.platformContent.Instagram || null);
                }
                if (res.data.lockedPlatforms) {
                    setLockedPlatforms(res.data.lockedPlatforms);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchIdea();
    }, [id]);

    // Handle Auto-generation from query params
    useEffect(() => {
        if (idea && !isGeneratingPost) {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get('auto') === 'true') {
                const cleanNote = queryParams.get('note') || '';
                const missingPlatforms = PLATFORMS.filter(p => !platformContents[p.id]);

                if (missingPlatforms.length > 0) {
                    console.log(`[Auto-Pilot] Triggering generation for ${missingPlatforms.length} missing platforms.`);
                    navigate(`/idea/${id}`, { replace: true });
                    generateAllPlatforms(false);
                }
            }
        }
    }, [idea, id, navigate, platformContents, isGeneratingPost]);

    const handleToggleLock = async () => {
        if (!idea) return;
        setIsLocking(true);
        try {
            const token = localStorage.getItem('token');
            const nextState = !idea.isLocked;
            // Use the 'id' from useParams as it matches the route parameter
            await axios.put(`${API_BASE}/api/ideas/${id}/lock`, {
                isLocked: nextState,
                lockedData: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdea(prev => ({ ...prev, isLocked: nextState }));
        } catch (err) {
            console.error('Lock toggle failed:', err);
            const errorMsg = err.response?.data?.msg || err.response?.data || err.message || 'Failed to update lock status';
            alert(errorMsg);
        } finally {
            setIsLocking(false);
        }
    };

    const mergeGeneratedContent = (section, newData) => {
        const base = generatedPost || { postText: '', captionText: '', imageText: '' };
        if (section === 'copy') {
            return {
                ...base,
                postText: newData.postText,
                captionText: newData.captionText
            };
        }
        if (section === 'image') {
            return {
                ...base,
                imageText: newData.imageText
            };
        }
        return newData;
    };

    const closeModal = () => setIsModalOpen(false);

    const openRegenerateModal = (section = 'both') => {
        setModalSection(section);
        setIdeaNote('');
        setIsModalOpen(true);
    };

    const handleGenerateContent = async (section = 'both', note = '') => {
        const activePersona = persona || 'Customer'; // Generic fallback, but typically set from batch
        if (!idea) return;

        // Blocking guard ONLY for strategy generation, not for idea refinement or navigation
        if (!activePersona && section !== 'idea' && section !== 'platforms') {
            setGenerateError('Please select a persona first.');
            return;
        }

        if (idea.isLocked) {
            setGenerateError('This strategy is locked. Please unlock it to regenerate or refine.');
            return;
        }

        setIsGeneratingPost(true);
        setGenerateError('');
        console.log(`[Generate Content] Section: ${section}, Note: ${note}, Persona: ${activePersona}`);

        try {
            const token = localStorage.getItem('token');

            if (section === 'platforms') {
                closeModal();
                // Scroll to platforms section
                const element = document.getElementById('multi-platform-workspace');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                // Trigger auto-gen
                setIdeaNote(note);
                generateAllPlatforms(false);
                return;
            }

            if (section === 'idea') {
                console.log(`[Frontend] Calling Emergency V2 Refine: ${API_BASE}/api/v2-refine/${id}`);
                const res = await axios.post(`${API_BASE}/api/v2-refine/${id}`, {
                    note,
                    targetPersona: persona,
                    companyContext,
                    contentGoal,
                    token
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 120000
                });
                const updatedIdea = res.data;
                setIdea(prev => ({
                    ...prev,
                    content: updatedIdea.content,
                    analysis: updatedIdea.analysis
                }));

                // Full sync for all platforms to the new refined concept
                await generateAllPlatforms(true);

                closeModal();
                return;
            }

            // For 'copy', 'image', 'both' sections — use v2-content
            const res = await axios.post(`${API_BASE}/api/v2-content/${id}`, {
                persona: activePersona,
                note,
                platform: 'Instagram',
                previousContent: generatedPost
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 120000
            });
            const merged = mergeGeneratedContent(section, res.data);
            setGeneratedPost(merged);
            await persistGeneratedContent(merged);
            closeModal();
        } catch (err) {
            console.error('Generate content failed:', err);
            setGenerateError(err.response?.data?.msg || err.message || 'Generation error');
        } finally {
            setIsGeneratingPost(false);
        }
    };

    const startEditingCopy = () => {
        setEditValues({
            postText: generatedPost.postText,
            captionText: generatedPost.captionText,
            imageText: generatedPost.imageText || ''
        });
        setIsEditingCopy(true);
    };

    const startEditingImage = () => {
        setEditValues({
            postText: generatedPost.postText,
            captionText: generatedPost.captionText,
            imageText: generatedPost.imageText
        });
        setIsEditingImage(true);
    };

    const handleSaveEdit = async (section) => {
        const updatedContent = {
            ...generatedPost,
            postText: editValues.postText,
            captionText: editValues.captionText,
            imageText: editValues.imageText
        };

        setGeneratedPost(updatedContent);
        await persistGeneratedContent(updatedContent);

        if (section === 'copy') setIsEditingCopy(false);
        if (section === 'image') setIsEditingImage(false);
    };

    const cancelEdit = (section) => {
        if (section === 'copy') setIsEditingCopy(false);
        if (section === 'image') setIsEditingImage(false);
    };

    const persistGeneratedContent = async (content) => {
        if (!idea || !content) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_BASE}/api/v2-save`, {
                ideaId: idea._id,
                platform: 'Instagram',
                promptText: content.postText,
                captionPrompt: content.captionText,
                imagePrompt: content.imageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Also sync the local platformContents for Instagram
            setPlatformContents(prev => ({ ...prev, Instagram: content }));
        } catch (err) {
            console.error('Persist generated content failed:', err);
        }
    };

    // Platform Specific Methods
    const handlePlatformGenerate = async (platformId, customNote = '') => {
        if (lockedPlatforms.includes(platformId)) return;
        setGenerating(prev => ({ ...prev, [platformId]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/v2-content/${id}`, {
                persona: persona || 'Customer',
                platform: platformId,
                note: customNote || platformNote || ideaNote,
                previousContent: platformContents.Instagram || null
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 120000
            });

            setPlatformContents(prev => ({ ...prev, [platformId]: res.data }));
            if (platformId === 'Instagram') setGeneratedPost(res.data);

            await axios.post(`${API_BASE}/api/v2-save`, {
                ideaId: id,
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

    const generateAllPlatforms = async (force = false) => {
        for (const platform of PLATFORMS) {
            const hasContent = !!platformContents[platform.id];
            const isLocked = lockedPlatforms.includes(platform.id);
            if (!isLocked && (force || !hasContent)) {
                await handlePlatformGenerate(platform.id);
            }
        }
    };

    const handleTogglePlatformLock = async (platformId) => {
        setIsPlatformLocking(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/v2-toggle-lock`, {
                ideaId: id,
                platform: platformId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLockedPlatforms(res.data.lockedPlatforms || []);
        } catch (err) {
            console.error('Platform lock toggle failed:', err);
        } finally {
            setIsPlatformLocking(false);
        }
    };

    const handleCopy = (text, copyId) => {
        navigator.clipboard.writeText(text);
        setCopiedId(copyId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const startPlatformEditing = (platformId) => {
        const content = platformContents[platformId];
        if (!content) return;
        setEditValues({
            postText: content.postText || '',
            captionText: content.captionText || '',
            imageText: content.imageText || ''
        });
        setEditingPlatform(platformId);
    };

    const handleSavePlatformEdit = async () => {
        if (!editingPlatform) return;
        try {
            const token = localStorage.getItem('token');
            const updatedContent = {
                ...platformContents[editingPlatform],
                postText: editValues.postText,
                captionText: editValues.captionText,
                imageText: editValues.imageText
            };

            setPlatformContents(prev => ({ ...prev, [editingPlatform]: updatedContent }));
            if (editingPlatform === 'Instagram') setGeneratedPost(updatedContent);

            await axios.post(`${API_BASE}/api/v2-save`, {
                ideaId: id,
                platform: editingPlatform,
                promptText: editValues.postText,
                captionPrompt: editValues.captionText,
                imagePrompt: editValues.imageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEditingPlatform(null);
        } catch (err) {
            console.error('Failed to save platform edit:', err);
        }
    };

    if (!idea) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading strategy…</div>;
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden font-['Outfit'] selection:bg-primary/30 selection:text-white">
            {/* ── BACKGROUND ELEMENTS ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] animate-grain"></div>
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* ── HEADER ── */}
                <header className="flex items-center justify-between mb-20">
                    <button onClick={() => navigate(-1)}
                        className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95 backdrop-blur-xl">
                        <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted group-hover:text-white">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-white font-black text-xs uppercase tracking-tight">{user?.name}</span>
                            <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded mt-1 border border-primary/20">{user?.role}</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px] shadow-lg shadow-primary/20">
                            <div className="w-full h-full rounded-2xl bg-[#030303] flex items-center justify-center font-black text-sm text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── MAIN CONTENT GENERATOR SECTION ── */}
                <section className="relative mb-20">
                    {/* Top Glow */}
                    <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

                    <div className="relative z-10 text-center space-y-12">
                        {/* Main Title - Uses Refined Content if available */}
                        <div className="space-y-6 max-w-5xl mx-auto px-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 uppercase leading-[1.05] drop-shadow-2xl">
                                {idea.refinedContent || (() => {
                                    try {
                                        if (idea.content?.startsWith('{')) {
                                            const parsed = JSON.parse(idea.content);
                                            return parsed.title || parsed.content || idea.content;
                                        }
                                    } catch (e) { }
                                    return idea.content;
                                })()}
                            </h1>

                            {/* Date and Target Group */}
                            <div className="flex items-center justify-center gap-10 pt-4">
                                <div className="flex flex-col items-center group">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] leading-none mb-2 group-hover:text-white/60 transition-colors">DATE</span>
                                    <div className="h-[1px] w-4 bg-white/10 mb-2"></div>
                                    <span className="text-sm font-bold text-white/90">{new Date(idea.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="w-[1px] h-12 bg-white/5"></div>

                                <div className="flex flex-col items-center group">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] leading-none mb-2 group-hover:text-white/60 transition-colors">TARGET</span>
                                    <div className="h-[1px] w-4 bg-secondary/30 mb-2"></div>
                                    <span className="text-sm font-black text-secondary uppercase tracking-tight">{persona || 'General'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Redraft Button */}
                        <div className="flex justify-center pt-4">
                            {!idea.isLocked && (
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openRegenerateModal('idea')}
                                    disabled={isGeneratingPost}
                                    className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#5D5FEF] via-[#A5A6F6] to-[#EF5DA8] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 group/redraft transition-all duration-500"
                                >
                                    <RefreshCw size={18} className={`group-hover/redraft:rotate-180 transition-transform duration-700 ${isGeneratingPost ? 'animate-spin' : ''}`} />
                                    {isGeneratingPost ? 'Synthesizing...' : 'Redraft Core Concept'}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── GENERATED STRATEGY COPY CARD ── */}
                {generatedPost && (
                    <div className="max-w-4xl mx-auto mb-20">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Generated Strategy Copy</h3>
                                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <button
                                        onClick={() => handleCopy(generatedPost.postText + "\n\n" + generatedPost.captionText, 'full-copy')}
                                        className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Copy size={14} /> {copiedId === 'full-copy' ? 'Copied' : 'Copy'}
                                    </button>

                                    {!idea.isLocked && !isEditingCopy && (
                                        <>
                                            <button
                                                onClick={startEditingCopy}
                                                className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => openRegenerateModal('copy')}
                                                disabled={isGeneratingPost}
                                                className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                                            >
                                                {isGeneratingPost ? '...' : 'Regenerate'}
                                            </button>
                                        </>
                                    )}

                                    {isEditingCopy && (
                                        <>
                                            <button onClick={() => cancelEdit('copy')} className="h-10 px-4 text-muted hover:text-white transition-all"><X size={16} /></button>
                                            <button onClick={() => handleSaveEdit('copy')} className="h-10 px-6 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Save</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* Refined Core Idea Section */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 font-black flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_primary]"></div>
                                        Refined Core Idea (Strategist)
                                    </p>
                                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group-hover:border-primary/20 transition-all duration-500">
                                        <h4 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase leading-snug">
                                            {idea.refinedContent || "Generating strategic refinement..."}
                                        </h4>
                                    </div>
                                </div>

                                {/* Strategy Insights Section */}
                                <div className="grid sm:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted mb-4 font-black opacity-40">Strategy Insights / Post Text</p>
                                        {isEditingCopy ? (
                                            <textarea
                                                value={editValues.postText}
                                                onChange={(e) => setEditValues({ ...editValues, postText: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-primary focus:outline-none resize-none min-h-[120px]"
                                            />
                                        ) : (
                                            <p className="text-white/80 text-sm leading-relaxed font-bold border-l-2 border-primary/20 pl-6 py-2">
                                                {generatedPost.postText}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted mb-4 font-black opacity-40">Engagement Hook / Caption</p>
                                        {isEditingCopy ? (
                                            <textarea
                                                value={editValues.captionText}
                                                onChange={(e) => setEditValues({ ...editValues, captionText: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-muted focus:border-primary focus:outline-none resize-none min-h-[120px]"
                                            />
                                        ) : (
                                            <p className="text-muted text-xs leading-relaxed border-l-2 border-secondary/20 pl-6 py-2 whitespace-pre-line">
                                                {generatedPost.captionText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>


                        {/* ── VISUAL STRATEGY / IMAGE PROMPT ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent"></div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Visual Strategy</h3>
                                    <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] opacity-40">AI-Generated Image Prompt</p>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <button
                                        onClick={() => handleCopy(generatedPost.imageText, 'image-prompt-copy')}
                                        className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Copy size={14} /> {copiedId === 'image-prompt-copy' ? 'Copied' : 'Copy Prompt'}
                                    </button>

                                    {!idea.isLocked && !isEditingImage && (
                                        <>
                                            <button
                                                onClick={startEditingImage}
                                                className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => openRegenerateModal('image')}
                                                disabled={isGeneratingPost}
                                                className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl bg-gradient-to-r from-secondary via-purple-500 to-primary text-white shadow-lg shadow-secondary/20"
                                            >
                                                {isGeneratingPost ? '...' : 'Regenerate'}
                                            </button>
                                        </>
                                    )}

                                    {isEditingImage && (
                                        <>
                                            <button onClick={() => cancelEdit('image')} className="h-10 px-4 text-muted hover:text-white transition-all"><X size={16} /></button>
                                            <button onClick={() => handleSaveEdit('image')} className="h-10 px-6 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Save</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary via-purple-500 to-transparent rounded-full opacity-30"></div>
                                <div className="pl-8">
                                    {isEditingImage ? (
                                        <textarea
                                            value={editValues.imageText}
                                            onChange={(e) => setEditValues({ ...editValues, imageText: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-muted text-xs font-mono focus:border-secondary focus:outline-none resize-none min-h-[120px]"
                                        />
                                    ) : (
                                        <p className="text-muted text-sm font-mono leading-relaxed whitespace-pre-line group-hover:text-white/80 transition-colors">
                                            {generatedPost.imageText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    </div>
                )}

                {/* ── MEDIA INTELLIGENCE / REFERENCE VIALS ── */}
                <section className="mb-20 max-w-5xl mx-auto">
                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-10 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Media Intelligence</h3>
                                    <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1.5 shadow-lg shadow-primary/10">
                                        <Zap size={10} className="fill-primary" /> AI Sync Enabled
                                    </span>
                                </div>
                                <p className="text-xs text-muted max-w-md font-medium leading-relaxed">External visual training for the AI engine to analyze specific aesthetic parameters and adjust strategic outputs accordingly.</p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleToggleLock}
                                        disabled={isLocking}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 backdrop-blur-xl ${idea.isLocked ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border border-white/10 text-muted hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {idea.isLocked ? (
                                            <><Lock size={12} className="animate-pulse" /> Strategy Locked</>
                                        ) : (
                                            <><Unlock size={12} /> Master Unlocked</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <label
                                onDragOver={preventDefault}
                                onDragEnter={preventDefault}
                                onDragLeave={preventDefault}
                                onDrop={idea.isLocked ? preventDefault : handleDropImage}
                                htmlFor={idea.isLocked ? '' : "reference-image"}
                                className={`flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-dashed px-8 py-16 transition-all duration-700 relative overflow-hidden ${idea.isLocked
                                    ? 'border-white/5 bg-white/[0.01] cursor-not-allowed opacity-40'
                                    : isUploadingImage
                                        ? 'border-primary/50 bg-primary/5 cursor-wait'
                                        : 'border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.02] cursor-pointer group/drop'}`}
                            >
                                {!idea.isLocked && (
                                    <input
                                        id="reference-image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                        disabled={isUploadingImage}
                                    />
                                )}

                                <div className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${isUploadingImage ? 'bg-primary animate-bounce shadow-[0_0_40px_rgba(var(--primary-rgb),0.6)]' : 'bg-white/5 group-hover/drop:bg-primary/10 group-hover/drop:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'}`}>
                                    {idea.isLocked ? <Lock size={32} className="text-muted" /> : <Share2 size={32} className={isUploadingImage ? 'text-white' : 'text-muted group-hover/drop:text-primary transition-colors'} />}
                                    <Sparkles size={16} className="absolute -top-1 -right-1 text-primary animate-pulse" />
                                </div>

                                <div className="text-center space-y-2">
                                    <p className={`font-black uppercase tracking-[0.3em] text-xs transition-colors duration-500 ${isUploadingImage ? 'text-primary' : 'text-muted group-hover/drop:text-white'}`}>
                                        {idea.isLocked ? 'NEURAL VAULT SECURED' : isUploadingImage ? 'Synchronizing Visual Data...' : 'Universal Media Integration'}
                                    </p>
                                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest">Supports high-res PNG/JPG for pattern recognition</p>
                                </div>

                                {imageUploadError && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                                        <X size={12} className="cursor-pointer" onClick={() => setImageUploadError('')} />
                                        {imageUploadError}
                                    </div>
                                )}
                            </label>

                            {uploadedImages.length > 0 && (
                                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                        {uploadedImages.map((image, idx) => (
                                            <motion.div
                                                key={image._id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group/img relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl hover:border-primary/40 transition-all duration-700"
                                            >
                                                <img src={image.url} alt={image.title} className="h-full w-full object-cover grayscale-[0.6] group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 truncate">{image.title || 'Source'}</p>
                                                    <div className="h-[2px] w-8 bg-primary rounded-full"></div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {generatedPost && (
                    <div className="flex justify-center mt-12 mb-[-2rem] relative z-10">
                        <button
                            onClick={() => generateAllPlatforms(true)}
                            disabled={Object.values(generating).some(v => v)}
                            className="group relative px-8 py-4 bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-2xl font-black uppercase tracking-[0.3em] text-xs text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Sparkles size={18} className={Object.values(generating).some(v => v) ? 'animate-pulse' : ''} />
                            <span>{Object.values(generating).some(v => v) ? 'Generating for all...' : 'Generate Prompts for All Platforms'}</span>
                            {Object.values(generating).some(v => v) && (
                                <RefreshCw size={16} className="animate-spin" />
                            )}
                        </button>
                    </div>
                )}

                {/* ── DISTRIBUTION MATRIX / MULTI-PLATFORM WORKSPACE ── */}
                <section id="multi-platform-workspace" className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden mb-20">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 justify-center lg:justify-start">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                    <Share2 size={24} className="text-primary" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">Distribution Matrix</h2>
                            </div>
                            <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] opacity-40 text-center lg:text-left">Cross-Channel Synchronization Engine</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generateAllPlatforms(false)}
                                disabled={Object.values(generating).some(v => v)}
                                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                <Sparkles size={14} className="text-primary" />
                                Sync Missing
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => generateAllPlatforms(true)}
                                disabled={Object.values(generating).some(v => v)}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-lg shadow-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={Object.values(generating).some(v => v) ? 'animate-spin' : ''} />
                                Overwrite All
                            </motion.button>
                        </div>
                    </div>

                    {/* Platform Selector Hub */}
                    <div className="flex flex-wrap justify-center gap-6 mb-16 relative z-10">
                        {PLATFORMS.map((p) => {
                            const Icon = p.icon;
                            const isSelected = selectedPlatform === p.id;
                            const isLocked = lockedPlatforms.includes(p.id);
                            const hasContent = !!platformContents[p.id];
                            const isGenerating = generating[p.id];

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedPlatform(p.id);
                                        if (!hasContent && !isGenerating && !isLocked) {
                                            handlePlatformGenerate(p.id);
                                        }
                                    }}
                                    className={`group relative flex flex-col items-center justify-center w-28 h-28 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${isLocked
                                        ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                                        : isSelected
                                            ? `bg-white/[0.05] border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)]`
                                            : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                        }`}
                                >
                                    {/* Active Highlight Glow */}
                                    {isSelected && (
                                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${p.color.replace('bg-', 'from-').replace('text-', 'to-')}`}></div>
                                    )}

                                    <div className={`relative mb-3 p-3 rounded-2xl transition-all duration-500 ${isSelected ? p.color + ' shadow-lg scale-110' : 'bg-white/5 text-muted group-hover:text-white'}`}>
                                        <Icon size={24} className={isSelected ? 'text-white' : ''} />
                                    </div>

                                    <span className={`relative text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${isLocked ? 'text-amber-400/60' : isSelected ? 'text-white' : 'text-muted group-hover:text-white/60'}`}>
                                        {p.name.split(' ')[0]}
                                    </span>

                                    {/* Indicators */}
                                    {isGenerating ? (
                                        <div className="absolute top-3 right-3">
                                            <RefreshCw size={10} className="animate-spin text-primary" />
                                        </div>
                                    ) : isLocked ? (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                            <Lock size={10} className="text-white" />
                                        </div>
                                    ) : hasContent ? (
                                        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-w-5xl mx-auto pt-4 relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPlatform}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                {(() => {
                                    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
                                    if (!platform) return null;
                                    const Icon = platform.icon;
                                    const content = platformContents[selectedPlatform];
                                    const isGenerating = generating[selectedPlatform];
                                    const isLocked = lockedPlatforms.includes(selectedPlatform);

                                    return (
                                        <div className={`bg-white/[0.03] border-2 ${isLocked ? 'border-amber-500/20' : content ? 'border-white/10 shadow-2xl' : 'border-white/5'} rounded-[2.5rem] p-8 sm:p-12 space-y-10 backdrop-blur-3xl relative overflow-hidden`}>
                                            {/* Subcard Blur Accent */}
                                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8 relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${platform.color} shadow-2xl scale-110`}>
                                                        <Icon size={28} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">{platform.name}</h3>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${isLocked ? 'bg-amber-500/20 text-amber-400' : content ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted'}`}>
                                                                {isLocked ? 'LOCKED' : content ? 'SYNCED' : 'AWAITING'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {!editingPlatform ? (
                                                        <>
                                                            <button
                                                                onClick={() => startPlatformEditing(selectedPlatform)}
                                                                disabled={!content || isLocked}
                                                                className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-muted hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                                                            >
                                                                <Edit2 size={12} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleTogglePlatformLock(selectedPlatform)}
                                                                disabled={isPlatformLocking}
                                                                className={`h-10 px-6 rounded-xl border-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isLocked ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/5 text-muted border-white/10 hover:border-white/30'}`}
                                                            >
                                                                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                                                {isLocked ? 'Locked' : 'Unlocked'}
                                                            </button>
                                                            {content && !isLocked && (
                                                                <button
                                                                    onClick={() => handlePlatformGenerate(selectedPlatform)}
                                                                    disabled={isGenerating}
                                                                    className="h-10 px-6 rounded-xl bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                                                                    Sync
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditingPlatform(null)} className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted hover:text-white">Cancel</button>
                                                            <button onClick={handleSavePlatformEdit} className="h-10 px-8 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-500/20">Save Matrix</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {content ? (
                                                <div className={`grid lg:grid-cols-2 gap-12 relative z-10 ${isLocked ? 'opacity-40' : ''}`}>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Integrated Message</span>
                                                            <button
                                                                onClick={() => handleCopy(content.postText, `${selectedPlatform}-post`)}
                                                                className="text-[9px] font-black text-muted hover:text-white uppercase tracking-widest flex items-center gap-2"
                                                            >
                                                                <Copy size={12} /> {copiedId === `${selectedPlatform}-post` ? 'COPIED' : 'COPY'}
                                                            </button>
                                                        </div>
                                                        <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 min-h-[200px] flex items-center">
                                                            {editingPlatform === selectedPlatform ? (
                                                                <textarea
                                                                    value={editValues.postText}
                                                                    onChange={(e) => setEditValues({ ...editValues, postText: e.target.value })}
                                                                    className="w-full bg-transparent border-none focus:outline-none text-white text-lg font-black italic tracking-tighter p-0 resize-none uppercase"
                                                                />
                                                            ) : (
                                                                <p className="text-white text-2xl font-black italic tracking-tighter uppercase leading-tight">
                                                                    {content.postText}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Engagement Layer</span>
                                                            <button
                                                                onClick={() => handleCopy(content.captionText, `${selectedPlatform}-caption`)}
                                                                className="text-[9px] font-black text-muted hover:text-white uppercase tracking-widest flex items-center gap-2"
                                                            >
                                                                <Copy size={12} /> {copiedId === `${selectedPlatform}-caption` ? 'COPIED' : 'COPY'}
                                                            </button>
                                                        </div>
                                                        <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 min-h-[200px]">
                                                            {editingPlatform === selectedPlatform ? (
                                                                <textarea
                                                                    value={editValues.captionText}
                                                                    onChange={(e) => setEditValues({ ...editValues, captionText: e.target.value })}
                                                                    className="w-full bg-transparent border-none focus:outline-none text-muted text-sm font-medium p-0 resize-none h-[150px]"
                                                                />
                                                            ) : (
                                                                <p className="text-muted text-sm font-medium leading-relaxed whitespace-pre-line">
                                                                    {content.captionText}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                                        <Sparkles size={32} className="text-muted/30" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-white font-black uppercase tracking-widest">Awaiting Synchronization</h4>
                                                        <p className="text-xs text-muted max-w-xs">Initialize this channel to generate platform-specific strategic content based on your core idea.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePlatformGenerate(selectedPlatform)}
                                                        disabled={isGenerating}
                                                        className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 uppercase tracking-[0.3em] transition-all flex items-center gap-2"
                                                    >
                                                        {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="text-primary fill-primary" />}
                                                        Initialize Channel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

            </div>
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
                        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-background/90 p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-[0.3em]">
                                {modalSection === 'platforms' ? 'Generate Multi-Platform Strategy' :
                                    modalSection === 'idea' ? 'Refine Main Idea' :
                                        modalSection === 'image' ? 'Regenerate Image Prompt' :
                                            modalSection === 'copy' ? 'Regenerate Copy' : 'Regenerate All Content'}
                            </h3>
                            <p className="text-sm text-muted mb-3">
                                {modalSection === 'platforms' ? 'Mention any global tone or platform specific adjustments you want for the whole strategy.' :
                                    modalSection === 'idea' ? `The AI will perform a neural analysis to refine this title into a high-impact Core Idea tailored specifically for the ${persona} mindset.` :
                                        `Optional note: mention what you want to refine so the assistant can adjust the ${modalSection === 'image' ? 'visual direction' : 'written content'}.`}
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black underline uppercase tracking-[0.2em] text-muted mb-2 block">Additional Requirements / Comments</label>
                                    <textarea
                                        value={ideaNote}
                                        onChange={(e) => setIdeaNote(e.target.value)}
                                        rows={4}
                                        placeholder={modalSection === 'idea' ? "e.g. Focus on high-end luxury / make it more educational / add a sense of urgency" : "e.g. Make the copy more urgent / highlight sustainability / request a minimalist foyer image"}
                                        className="w-full resize-none rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                            {generateError && (
                                <p className="mt-3 text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{generateError}</p>
                            )}
                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="text-sm font-bold uppercase tracking-[0.3em] text-muted hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleGenerateContent(modalSection, ideaNote)}
                                    disabled={isGeneratingPost}
                                    className="relative overflow-hidden px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-gradient-to-r from-primary via-purple-500 to-secondary text-white shadow-lg shadow-primary/50 disabled:opacity-50 group"
                                >
                                    {isGeneratingPost && (
                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isGeneratingPost ? (
                                            <>
                                                <RefreshCw size={12} className="animate-spin" />
                                                {modalSection === 'idea' ? 'Analyzing & Refining...' : 'Generating...'}
                                            </>
                                        ) : (
                                            <>
                                                {modalSection === 'idea' ? <Zap size={12} /> : <Sparkles size={12} />}
                                                {modalSection === 'idea' ? 'Generate Core Idea' : (modalSection === 'platforms' ? 'Generate All Content' : 'Confirm Selection')}
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
