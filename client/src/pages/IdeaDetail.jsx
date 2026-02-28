import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Unlock, RefreshCw } from 'lucide-react';
import API_BASE from '../config/api';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSection, setModalSection] = useState('both');
    const [ideaNote, setIdeaNote] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        fetchUploadedImages();
    }, []);

    const fetchUploadedImages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/images`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploadedImages(res.data);
        } catch (err) {
            console.error('Failed to load uploaded images:', err);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setIsUploadingImage(true);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', idea?.content?.slice(0, 80) || 'Reference image');
        try {
            await axios.post(`${API_BASE}/api/images/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchUploadedImages();
        } catch (err) {
            console.error('Image upload failed:', err);
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
                if (res.data.platformContent && res.data.platformContent.postText) {
                    setGeneratedPost(res.data.platformContent);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchIdea();
    }, [id]);

    const handleLockToggle = async () => {
        if (!idea) return;
        setIsLocking(true);
        try {
            const token = localStorage.getItem('token');
            const nextState = !idea.isLocked;
            await axios.put(`${API_BASE}/api/ideas/${idea._id}/lock`, {
                isLocked: nextState,
                lockedData: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdea(prev => ({ ...prev, isLocked: nextState }));
        } catch (err) {
            console.error('Lock toggle failed:', err);
            alert(err.response?.data?.msg || 'Failed to update lock status');
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
        if (!idea || !persona) return;
        setIsGeneratingPost(true);
        setGenerateError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/api/ideas/${idea._id}/generate-content`, {
                persona,
                note,
                section
            }, {
                headers: { Authorization: `Bearer ${token}` }
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

    const persistGeneratedContent = async (content) => {
        if (!idea || !content) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_BASE}/api/ideas/save-prompt`, {
                ideaId: idea._id,
                ideaContent: idea.content,
                platform: 'Instagram',
                promptText: content.postText,
                captionPrompt: content.captionText,
                imagePrompt: content.imageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Persist generated content failed:', err);
        }
    };

    if (!idea) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading strategy…</div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs xs:text-base"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="text-right flex-1 xs:ml-8">
                        <span className="text-xs text-muted uppercase tracking-widest font-bold">Marketing Strategy Workspace</span>
                    </div>
                </header>

                <section className="bg-surface/30 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleLockToggle}
                            disabled={isLocking}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/40 border disabled:opacity-70 disabled:cursor-wait ${idea.isLocked
                                ? 'bg-green-500 text-white border-green-400 shadow-green-500/20'
                                : 'bg-red-500 text-white border-red-400 shadow-red-500/20'}`}
                        >
                            {isLocking
                                ? <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                                : idea.isLocked
                                    ? <><Lock size={14} /> Strategy Locked</>
                                    : <><Unlock size={14} /> Strategy Unlocked</>
                            }
                        </button>
                    </div>

                    <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight break-words pt-4">
                        {idea.content.split(' - ')[0]}
                    </p>
                    {persona && (
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-muted">
                                <span className="text-[0.55rem] font-black text-primary">Persona</span>
                                <span className="text-sm text-white normal-case tracking-normal">{persona}</span>
                            </span>
                            <button
                                onClick={() => openRegenerateModal('both')}
                                disabled={isGeneratingPost}
                                className="px-6 py-2 text-xs tracking-[0.3em] font-black uppercase rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/40 hover:scale-[1.01] transition-all disabled:opacity-50"
                            >
                                {isGeneratingPost ? 'Generating content…' : 'Generate Content for this topic'}
                            </button>
                            {generateError && (
                                <p className="text-[11px] text-red-400">{generateError}</p>
                            )}
                        </div>
                    )}
                </section>
                {generatedPost && (
                    <div className="space-y-6">
                        <section className="bg-surface/40 border border-white/5 rounded-2xl p-6 text-white space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-lg font-black text-white">Generated Instagram Copy</h3>
                                <button
                                    onClick={() => openRegenerateModal('copy')}
                                    disabled={isGeneratingPost}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingPost ? 'Regenerating…' : 'Regenerate copy'}
                                </button>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Hook / post text</p>
                                <p className="text-white text-base leading-relaxed font-bold">{generatedPost.postText}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Caption + insights</p>
                                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{generatedPost.captionText}</p>
                            </div>
                        </section>

                        <section className="bg-surface/40 border border-white/5 rounded-2xl p-6 text-white space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-lg font-black text-white">Image Prompt</h3>
                                <button
                                    onClick={() => openRegenerateModal('image')}
                                    disabled={isGeneratingPost}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingPost ? 'Regenerating…' : 'Regenerate prompt'}
                                </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Image prompt</p>
                            <p className="text-muted text-sm font-mono leading-relaxed whitespace-pre-line">{generatedPost.imageText}</p>
                        </section>
                    </div>
                )}
                <section className="mt-8 rounded-3xl border border-white/5 bg-surface/40 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-black text-white">Reference Images</h3>
                            <p className="text-xs text-muted">Upload visuals you created externally so they stay alongside this idea for future reference.</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-muted">{isUploadingImage ? 'Uploading…' : 'Drag & drop or browse'}</span>
                    </div>
                    <label
                        onDragOver={preventDefault}
                        onDragEnter={preventDefault}
                        onDragLeave={preventDefault}
                        onDrop={handleDropImage}
                        htmlFor="reference-image"
                        className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-background/30 px-4 py-10 text-sm text-muted transition hover:border-white/40"
                    >
                        <input
                            id="reference-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        />
                        <p className="text-muted">{isUploadingImage ? 'Uploading image…' : 'Drop an image or click to select'}</p>
                    </label>
                    {uploadedImages.length > 0 && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {uploadedImages.map(image => (
                                <div key={image._id} className="overflow-hidden rounded-2xl border border-white/10 bg-background/50">
                                    <img src={image.url} alt={image.title} className="h-40 w-full object-cover" />
                                    <div className="p-3 space-y-1">
                                        <p className="text-sm font-bold text-white">{image.title || 'Uploaded reference'}</p>
                                        <p className="text-[10px] text-muted">Uploaded: {new Date(image.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
                    <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-background/90 p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-[0.3em]">
                            Regenerate {modalSection === 'image' ? 'Image Prompt' : modalSection === 'copy' ? 'Copy' : 'All Content'}
                        </h3>
                        <p className="text-sm text-muted mb-3">
                            Optional note: mention what you want to refine so the assistant can adjust the {modalSection === 'image' ? 'visual direction' : 'written content'}.
                        </p>
                        <textarea
                            value={ideaNote}
                            onChange={(e) => setIdeaNote(e.target.value)}
                            rows={3}
                            placeholder="e.g. Make the copy more urgent / highlight sustainability / request a minimalist foyer image"
                            className="w-full resize-none rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                        />
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
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/50 disabled:opacity-50"
                            >
                                {isGeneratingPost ? 'Regenerating…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
