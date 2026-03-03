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
            className="min-h-screen bg-background text-white p-4 sm:p-8"
            onPaste={handlePaste}
        >
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Image Store
                        </h1>
                        <p className="text-xs text-muted mt-0.5">{images.length} image{images.length !== 1 ? 's' : ''} stored</p>
                    </div>
                </header>

                {/* Upload Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-muted mb-5 flex items-center gap-2">
                        <Upload size={12} /> Upload New Image
                    </h2>

                    {!preview ? (
                        <div
                            ref={dropRef}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                                ${dragging
                                    ? 'border-primary/80 bg-primary/10 scale-[1.01]'
                                    : 'border-white/10 bg-black/10 hover:border-primary/50 hover:bg-black/20'
                                }`}
                        >
                            <ImageIcon className="w-10 h-10 mb-3 text-muted" />
                            <p className="text-sm font-bold uppercase tracking-widest text-white/80">Upload Image</p>
                            <p className="text-[10px] text-muted/50 mt-1">Drop file, Paste, or Click to browse</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative w-fit mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-64 max-w-full block"
                                />
                                <button
                                    onClick={() => { setPreview(null); setFile(null); }}
                                    className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white rounded-full p-1.5 hover:bg-red-500/80 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Add a title (optional)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-xl shadow-primary/20"
                            >
                                {uploading
                                    ? <><RefreshCw size={16} className="animate-spin" /> Uploading...</>
                                    : uploadSuccess
                                        ? <><Check size={16} /> Uploaded!</>
                                        : <><Upload size={16} /> Upload to Store</>
                                }
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <RefreshCw className="animate-spin text-primary" size={32} />
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 text-muted gap-4">
                        <ImageIcon size={48} className="opacity-20" />
                        <p className="text-sm font-medium">No images yet. Upload one above!</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                    >
                        <AnimatePresence>
                            {images.map((img, i) => (
                                <motion.div
                                    key={img._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="relative group bg-surface/30 border border-white/5 rounded-2xl overflow-hidden aspect-square cursor-pointer hover:border-white/20 hover:shadow-xl hover:shadow-black/40 transition-all"
                                    onClick={() => setLightbox(img)}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.title || 'Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        {img.title && (
                                            <p className="text-xs font-semibold text-white truncate mb-1">{img.title}</p>
                                        )}
                                        <p className="text-[9px] text-white/50 truncate">{img.uploaderName}</p>
                                        {canDelete(img) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-red-400 rounded-full p-1.5 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                title="Delete"
                                            >
                                                {deletingId === img._id
                                                    ? <RefreshCw size={12} className="animate-spin" />
                                                    : <Trash2 size={12} />
                                                }
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-4"
                        >
                            <button
                                onClick={() => setLightbox(null)}
                                className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md text-white rounded-full p-2 hover:bg-white/20 transition-all z-10"
                            >
                                <X size={18} />
                            </button>
                            <img
                                src={lightbox.url}
                                alt={lightbox.title || 'Image'}
                                className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl"
                            />
                            <div className="text-center">
                                {lightbox.title && (
                                    <p className="text-white font-semibold text-sm">{lightbox.title}</p>
                                )}
                                <p className="text-muted text-xs mt-1">By {lightbox.uploaderName} · {new Date(lightbox.createdAt).toLocaleDateString()}</p>
                            </div>
                            {canDelete(lightbox) && (
                                <button
                                    onClick={() => handleDelete(lightbox._id)}
                                    className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-red-500/40 transition-all"
                                >
                                    <Trash2 size={14} /> Delete Image
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
