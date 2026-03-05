import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Trash2, X, ImageIcon, RefreshCw, Check } from 'lucide-react';

export default function Gallery() {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [user, setUser] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef();
    const dropRef = useRef();

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(u);
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/images`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(res.data);
        } catch (err) {
            console.error('Failed to fetch images:', err);
        } finally {
            setLoading(false);
        }
    };

    const processFile = (f) => {
        if (!f || !f.type.startsWith('image/')) return;
        setFile(f);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const handleFileChange = (e) => processFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        processFile(f);
    };

    const handlePaste = (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.startsWith('image/')) {
                processFile(item.getAsFile());
                break;
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', title);

            const res = await axios.post(`${API_BASE}/api/images/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setImages(prev => [res.data, ...prev]);
            setFile(null);
            setPreview(null);
            setTitle('');
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 2500);
        } catch (err) {
            console.error('Upload failed:', err);
            alert(err.response?.data?.msg || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        setDeletingId(id);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/images/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(prev => prev.filter(img => img._id !== id));
            if (lightbox?._id === id) setLightbox(null);
        } catch (err) {
            alert(err.response?.data?.msg || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    const canDelete = (img) =>
        user?.role === 'admin' || img.uploadedBy === user?._id || img.uploadedBy === user?.id;

    return (
        <div
            className="min-h-screen bg-[#050510] relative overflow-hidden p-4 sm:p-8"
            onPaste={handlePaste}
        >
            {/* 🛸 Hyper-Premium Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <header className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"></span>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
                                Image Store
                            </h1>
                        </div>
                        <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] opacity-60">
                            {images.length} ARCHIVAL ASSETS SYNCHRONIZED
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Upload Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6 flex items-center gap-3 opacity-60">
                            <Upload size={14} className="text-primary" /> NEW ASSET INITIALIZATION
                        </h2>

                        {!preview ? (
                            <div
                                ref={dropRef}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center w-full h-56 border border-dashed rounded-[2rem] cursor-pointer transition-all duration-500 group relative overflow-hidden
                                    ${dragging
                                        ? 'border-primary/80 bg-primary/10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] scale-[1.02]'
                                        : 'border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500">
                                        <ImageIcon className={`w-8 h-8 transition-colors duration-500 ${dragging ? 'text-primary' : 'text-muted/60 group-hover:text-primary'}`} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Transfer Sequence</p>
                                    <p className="text-[9px] text-muted/40 mt-2 font-bold uppercase tracking-widest px-8 text-center">Drop file, Paste, or Click</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {/* Scanning line animation */}
                                {dragging && (
                                    <motion.div
                                        initial={{ top: '0%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-0"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl bg-black/40 p-2">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-auto max-h-64 object-cover rounded-[1.5rem] block"
                                    />
                                    <button
                                        onClick={() => { setPreview(null); setFile(null); }}
                                        className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl text-white rounded-full p-2 hover:bg-red-500 transition-all border border-white/10 shadow-xl"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1 opacity-60">Asset Identifier</label>
                                    <input
                                        type="text"
                                        placeholder="Internal Code / Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-muted/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="group relative w-full h-14 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                    <span className="relative">
                                        {uploading ? 'Processing Data...' : uploadSuccess ? 'Sequence Confirmed' : 'Commit to Repository'}
                                    </span>
                                    {uploading ? (
                                        <RefreshCw size={14} className="relative animate-spin" />
                                    ) : uploadSuccess ? (
                                        <Check size={14} className="relative" />
                                    ) : (
                                        <Upload size={14} className="relative group-hover:-translate-y-1 transition-transform" />
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Gallery Grid Section */}
                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Retrieving Assets</p>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-muted gap-6 bg-surface/20 border border-white/5 rounded-[2.5rem] border-dashed">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5 opacity-40">
                                    <ImageIcon size={40} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Repository Empty • Awaiting Input</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4"
                            >
                                <AnimatePresence>
                                    {images.map((img, i) => (
                                        <motion.div
                                            key={img._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="relative group bg-[#0A0A1F] border border-white/5 rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                                            onClick={() => setLightbox(img)}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.title || 'Asset'}
                                                className="w-full h-full object-cover transition-all duration-700 scale-[1.02] group-hover:scale-110 saturate-[0.8] group-hover:saturate-100"
                                                loading="lazy"
                                            />
                                            {/* Advanced Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                                                        {img.title || 'untitled_asset'}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[8px] font-bold text-muted uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {img.uploaderName || 'SYSTEM'}
                                                        </p>
                                                        <span className="text-[7px] text-primary font-black uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 opacity-0 group-hover:opacity-100 transition-all">
                                                            ID: {img._id.slice(-4)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {canDelete(img) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                                                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-xl text-muted hover:text-red-400 border border-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:border-red-500/50"
                                                    title="Permanently Delete"
                                                >
                                                    {deletingId === img._id
                                                        ? <RefreshCw size={12} className="animate-spin text-primary" />
                                                        : <Trash2 size={12} />
                                                    }
                                                </button>
                                            )}

                                            {/* Decorative Corner */}
                                            <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                                                <div className="absolute bottom-[-15px] right-[-15px] w-10 h-10 bg-primary/20 rotate-45 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox with High Fidelity Stylings */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#050510]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10"
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-6xl w-full flex flex-col items-center gap-8"
                        >
                            <button
                                onClick={() => setLightbox(null)}
                                className="absolute -top-12 sm:top-0 -right-4 sm:-right-16 w-12 h-12 bg-white/5 backdrop-blur-3xl text-white rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-white/10 border border-white/5 transition-all group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>

                            <div className="relative group/lb w-full flex justify-center">
                                <img
                                    src={lightbox.url}
                                    alt={lightbox.title || 'Asset'}
                                    className="max-h-[75vh] max-w-full object-contain rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5 bg-black/40"
                                />
                                <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none" />
                            </div>

                            <div className="text-center space-y-3 bg-white/5 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] px-12 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                                {lightbox.title && (
                                    <h3 className="text-white font-black text-xl uppercase tracking-tighter italic">
                                        “{lightbox.title}”
                                    </h3>
                                )}
                                <div className="flex items-center justify-center gap-6">
                                    <div className="flex flex-col items-center">
                                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1">Source identity</p>
                                        <p className="text-[10px] text-white font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                                            {lightbox.uploaderName || 'SYSTEM'}
                                        </p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1">Temporal stamp</p>
                                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">{new Date(lightbox.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {canDelete(lightbox) && (
                                    <button
                                        onClick={() => handleDelete(lightbox._id)}
                                        className="h-12 mt-6 flex items-center gap-3 bg-red-500/10 text-red-500 border border-red-500/20 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all transform active:scale-95 mx-auto"
                                    >
                                        <Trash2 size={16} /> Purge Asset Node
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
