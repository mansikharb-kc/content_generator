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
                <header className="flex items-center justify-between mb-12">
                    <button onClick={() => navigate(-1)}
                        className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95">
                        <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white">Back</span>

                    </button>

                    <div className="hidden sm:flex items-center gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px]">
                            <div className="w-full h-full rounded-2xl bg-[#030303] flex items-center justify-center font-black text-xs text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden group mb-12">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    <div className="absolute top-8 right-8 z-20 flex gap-3">
                        <button
                            onClick={handleToggleLock}
                            disabled={isLocking}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 ${idea.isLocked ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border border-white/10 text-muted hover:bg-white/10 hover:text-white'}`}
                        >
                            {idea.isLocked ? (
                                <><Lock size={12} className="animate-pulse" /> LOCKED</>
                            ) : (
                                <><Unlock size={12} /> UNLOCKED</>
                            )}
                        </button>
                    </div>

                    <div className="relative z-10 text-center space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.4em] mx-auto">
                            <Sparkles size={12} /> Idea Overview

                        </div>

                        <div className="space-y-4 max-w-4xl mx-auto">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 uppercase leading-tight group-hover:scale-[1.01] transition-transform duration-700">
                                {(() => {
                                    try {
                                        if (idea.content?.startsWith('{')) {
                                            const parsed = JSON.parse(idea.content);
                                            return parsed.title || parsed.content || idea.content;
                                        }
                                    } catch (e) { }
                                    return idea.content;
                                })()}
                            </h1>
                            <div className="flex items-center justify-center gap-6 pt-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">DATE</span>

                                    <span className="text-xs font-bold text-white/80 mt-1">{new Date(idea.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/5"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">TARGET</span>
                                    <span className="text-xs font-bold text-secondary mt-1">{persona}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            {!idea.isLocked && (
                                <button
                                    onClick={() => openRegenerateModal('idea')}
                                    disabled={isGeneratingPost}
                                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/reg"
                                >
                                    <RefreshCw size={14} className={`group-hover/reg:rotate-180 transition-transform duration-500 ${isGeneratingPost ? 'animate-spin' : ''}`} />
                                    {isGeneratingPost ? 'Re-Synthesizing...' : 'Redraft Core Concept'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>



                {generatedPost && (
                    <div className="space-y-6">
                        <section className="bg-surface/40 border border-white/5 rounded-2xl p-6 text-white space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h3 className="text-lg font-black text-white">Generated Strategy Copy</h3>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleCopy(generatedPost.postText + "\n\n" + generatedPost.captionText, 'full-copy')}
                                        className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Copy size={12} /> {copiedId === 'full-copy' ? 'Copied!' : 'Copy'}
                                    </button>
                                    {!idea.isLocked && (
                                        <>
                                            {!isEditingCopy ? (
                                                <>
                                                    <button
                                                        onClick={startEditingCopy}
                                                        className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openRegenerateModal('copy')}
                                                        disabled={isGeneratingPost}
                                                        className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all disabled:opacity-50 text-center"
                                                    >
                                                        {isGeneratingPost ? '...' : 'Regenerate'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => cancelEdit('copy')}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <X size={12} /> Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEdit('copy')}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
                                                    >
                                                        <Check size={12} /> Save
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Strategy Insights / post text</p>
                                {isEditingCopy ? (
                                    <textarea
                                        value={editValues.postText}
                                        onChange={(e) => setEditValues({ ...editValues, postText: e.target.value })}
                                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-bold focus:border-primary focus:outline-none resize-none"
                                        rows={2}
                                    />
                                ) : (
                                    <p className="text-white text-base leading-relaxed font-bold">{generatedPost.postText}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Engagement Hook / caption</p>
                                {isEditingCopy ? (
                                    <textarea
                                        value={editValues.captionText}
                                        onChange={(e) => setEditValues({ ...editValues, captionText: e.target.value })}
                                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-muted focus:border-primary focus:outline-none resize-none"
                                        rows={8}
                                    />
                                ) : (
                                    <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{generatedPost.captionText}</p>
                                )}
                            </div>
                        </section>

                        <section className="bg-surface/40 border border-white/5 rounded-2xl p-6 text-white space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h3 className="text-lg font-black text-white">Image Prompt</h3>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleCopy(generatedPost.imageText, 'image-prompt-copy')}
                                        className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Copy size={12} /> {copiedId === 'image-prompt-copy' ? 'Copied!' : 'Copy Prompt'}
                                    </button>
                                    {!idea.isLocked && (
                                        <>
                                            {!isEditingImage ? (
                                                <>
                                                    <button
                                                        onClick={startEditingImage}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openRegenerateModal('image')}
                                                        disabled={isGeneratingPost}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                                                    >
                                                        {isGeneratingPost ? 'Regenerating…' : 'Regenerate prompt'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => cancelEdit('image')}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-white/5 border border-white/10 text-muted hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <X size={12} /> Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEdit('image')}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
                                                    >
                                                        <Check size={12} /> Save
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Image prompt</p>
                            {isEditingImage ? (
                                <textarea
                                    value={editValues.imageText}
                                    onChange={(e) => setEditValues({ ...editValues, imageText: e.target.value })}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-muted text-xs font-mono focus:border-primary focus:outline-none resize-none"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-muted text-sm font-mono leading-relaxed whitespace-pre-line">{generatedPost.imageText}</p>
                            )}
                        </section>
                    </div>
                )
                }
                <section className="mt-8 rounded-3xl border border-white/5 bg-surface/40 p-6 shadow-xl relative overflow-hidden">
                    {/* Visual status for AI inclusion */}
                    <div className="absolute top-0 right-10 flex gap-1">
                        <div className="h-1 w-12 bg-primary/40 rounded-b-full"></div>
                        <div className="h-1.5 w-8 bg-secondary/40 rounded-b-full"></div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                Reference Images
                                <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">AI Enabled</span>
                            </h3>
                            <p className="text-xs text-muted">Upload visuals so the AI engine can analyze your specific aesthetic and adjust strategy accordingly.</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${imageUploadError ? 'text-red-400' : 'text-muted'}`}>
                                {idea.isLocked ? 'Strategy Locked' : isUploadingImage ? 'Processing…' : imageUploadError ? 'Upload Error' : 'Drag & drop or browse'}
                            </span>
                            {imageUploadError && !idea.isLocked && (
                                <button
                                    onClick={() => setImageUploadError('')}
                                    className="text-[8px] text-red-300 underline hover:text-red-100 transition-colors uppercase tracking-widest font-black"
                                >
                                    Clear Error
                                </button>
                            )}
                        </div>
                    </div>

                    <label
                        onDragOver={preventDefault}
                        onDragEnter={preventDefault}
                        onDragLeave={preventDefault}
                        onDrop={idea.isLocked ? preventDefault : handleDropImage}
                        htmlFor={idea.isLocked ? '' : "reference-image"}
                        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-sm transition-all duration-500 ${idea.isLocked
                            ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-60'
                            : isUploadingImage
                                ? 'border-primary/50 bg-primary/5 cursor-wait'
                                : 'border-white/20 bg-background/30 hover:border-white/40 hover:bg-white/5 cursor-pointer'}`}
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
                        <div className={`p-4 rounded-2xl bg-white/5 transition-transform duration-500 ${isUploadingImage ? 'animate-bounce' : ''}`}>
                            {idea.isLocked ? <Lock size={24} className="text-muted" /> : <Share2 size={24} className={isUploadingImage ? 'text-primary' : 'text-muted'} />}
                        </div>
                        <p className={`font-black uppercase tracking-widest text-[10px] ${isUploadingImage ? 'text-primary' : 'text-muted'}`}>
                            {idea.isLocked ? 'Strategy is locked — unlock to add images' : isUploadingImage ? 'Analyzing Image Data...' : 'Drop an image or click to select'}
                        </p>
                    </label>

                    {imageUploadError && (
                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-400 font-bold flex items-center gap-2">
                                <X size={14} className="cursor-pointer" onClick={() => setImageUploadError('')} />
                                {imageUploadError}
                            </p>
                        </div>
                    )}

                    {uploadedImages.length > 0 && (
                        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                            {uploadedImages.map(image => (
                                <div key={image._id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-background/50">
                                    <img src={image.url} alt={image.title} className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                        <p className="text-[8px] font-black text-white uppercase truncate">{image.title || 'Reference'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

                <section id="multi-platform-workspace" className="bg-surface/20 border border-white/5 rounded-[2rem] p-8 space-y-8 mt-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 text-white">
                            <Share2 size={24} className="text-primary" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Multi-Platform Workspace</h2>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => generateAllPlatforms(false)}
                                disabled={Object.values(generating).some(v => v)}
                                className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Sparkles size={14} className="text-primary" />
                                Fill Missing
                            </button>
                            <button
                                onClick={() => generateAllPlatforms(true)}
                                disabled={Object.values(generating).some(v => v)}
                                className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={Object.values(generating).some(v => v) ? 'animate-spin' : ''} />
                                Regenerate All
                            </button>
                        </div>
                    </div>

                    {Object.values(generating).some(v => v) && (
                        <div className="w-full py-3 px-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-4 animate-pulse">
                            <RefreshCw size={16} className="animate-spin text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                Generating for {PLATFORMS.find(p => generating[p.id])?.name}...
                            </span>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 py-4">
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
                                    className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all duration-300 ${isLocked
                                        ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                        : isSelected
                                            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]'
                                            : 'bg-surface/40 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`mb-2 p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${isSelected ? p.color : 'bg-white/5 text-muted'}`}>
                                        <Icon size={20} className={isSelected ? 'text-white' : ''} />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isLocked ? 'text-amber-400' : isSelected ? 'text-white' : 'text-muted'}`}>
                                        {p.name.split(' ')[0]}
                                    </span>
                                    {isGenerating ? (
                                        <div className="absolute top-1.5 right-1.5">
                                            <RefreshCw size={8} className="animate-spin text-primary" />
                                        </div>
                                    ) : isLocked ? (
                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                            <Lock size={8} className="text-white" />
                                        </div>
                                    ) : hasContent ? (
                                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400"></div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className="max-w-4xl mx-auto pt-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPlatform}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {(() => {
                                    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
                                    if (!platform) return null;
                                    const Icon = platform.icon;
                                    const content = platformContents[selectedPlatform];
                                    const isGenerating = generating[selectedPlatform];
                                    const isLocked = lockedPlatforms.includes(selectedPlatform);

                                    return (
                                        <div className={`bg-surface/30 border ${isLocked ? 'border-amber-500/30' : content ? 'border-primary/30' : 'border-white/5'} rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl`}>
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${platform.color} shadow-lg`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{platform.name}</h3>
                                                        <span className={`text-[8px] uppercase tracking-tighter ${isLocked ? 'text-amber-400' : 'text-muted'}`}>
                                                            {isLocked ? '🔒 Locked' : content ? 'Ready' : 'Waiting'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!editingPlatform ? (
                                                        <>
                                                            <button
                                                                onClick={() => startPlatformEditing(selectedPlatform)}
                                                                disabled={!content || isLocked}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-muted hover:text-white transition-all disabled:opacity-30"
                                                            >
                                                                <Edit2 size={10} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleTogglePlatformLock(selectedPlatform)}
                                                                disabled={isPlatformLocking}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${isLocked ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-muted border-white/10 hover:border-white/30'}`}
                                                            >
                                                                {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                                                                {isLocked ? 'Locked' : 'Unlocked'}
                                                            </button>
                                                            {content && !isLocked && (
                                                                <button
                                                                    onClick={() => handlePlatformGenerate(selectedPlatform)}
                                                                    disabled={isGenerating}
                                                                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-muted hover:text-white transition-all disabled:opacity-50"
                                                                >
                                                                    <RefreshCw size={10} className={isGenerating ? 'animate-spin' : ''} />
                                                                    Regenerate
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditingPlatform(null)} className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted hover:text-white"><X size={10} /> Cancel</button>
                                                            <button onClick={handleSavePlatformEdit} className="px-4 py-1.5 bg-green-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest"><Check size={10} /> Save</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {content ? (
                                                <div className={`space-y-6 ${isLocked ? 'opacity-70' : ''}`}>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Message</span>
                                                            <button onClick={() => handleCopy(content.postText, `${selectedPlatform}-post`)} className="text-[8px] font-bold text-muted hover:text-white">
                                                                {copiedId === `${selectedPlatform}-post` ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-background/40 border border-white/5">
                                                            {editingPlatform === selectedPlatform ? (
                                                                <textarea
                                                                    value={editValues.postText}
                                                                    onChange={(e) => setEditValues({ ...editValues, postText: e.target.value })}
                                                                    className="w-full bg-transparent border-none focus:outline-none text-white text-sm font-bold p-0 resize-none"
                                                                    rows={2}
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-white font-bold leading-relaxed">{content.postText}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Caption</span>
                                                            <button onClick={() => handleCopy(content.captionText, `${selectedPlatform}-caption`)} className="text-[8px] font-bold text-muted hover:text-white">
                                                                {copiedId === `${selectedPlatform}-caption` ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-background/40 border border-white/5">
                                                            {editingPlatform === selectedPlatform ? (
                                                                <textarea
                                                                    value={editValues.captionText}
                                                                    onChange={(e) => setEditValues({ ...editValues, captionText: e.target.value })}
                                                                    className="w-full bg-transparent border-none focus:outline-none text-xs text-muted font-medium italic p-0 resize-none"
                                                                    rows={6}
                                                                />
                                                            ) : (
                                                                <p className="text-xs text-muted leading-relaxed whitespace-pre-line font-medium italic">"{content.captionText}"</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">AI Image Engine</span>
                                                            <button onClick={() => handleCopy(content.imageText, `${selectedPlatform}-image`)} className="text-[8px] font-bold text-muted hover:text-white">
                                                                {copiedId === `${selectedPlatform}-image` ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                                                            {editingPlatform === selectedPlatform ? (
                                                                <textarea
                                                                    value={editValues.imageText}
                                                                    onChange={(e) => setEditValues({ ...editValues, imageText: e.target.value })}
                                                                    className="w-full bg-transparent border-none focus:outline-none text-[10px] text-secondary p-0 font-mono resize-none"
                                                                    rows={3}
                                                                />
                                                            ) : (
                                                                <p className="text-[10px] text-secondary font-mono leading-relaxed">{content.imageText}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                                                        {isGenerating ? <RefreshCw className="animate-spin text-primary" size={24} /> : <Icon className="text-muted/20" size={24} />}
                                                    </div>
                                                    <button
                                                        onClick={() => handlePlatformGenerate(selectedPlatform)}
                                                        className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                                                    >
                                                        <Sparkles size={14} /> Generate {platform.name}
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
