import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, RotateCcw, Database, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DeletedIdeas() {
    const [deletedIdeas, setDeletedIdeas] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeletedIdeas();
    }, []);

    const fetchDeletedIdeas = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await axios.get(`${API_BASE}/api/ideas/deleted`, {
                headers
            });
            setDeletedIdeas(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };


    const toggleSelectAll = () => {
        if (selectedIds.length === deletedIdeas.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(deletedIdeas.map(i => i.id));
        }
    };

    const toggleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const restoreIdea = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            await axios.post(`${API_BASE}/api/ideas/restore/${id}`, {}, {
                headers
            });
            setDeletedIdeas(deletedIdeas.filter(i => i.id !== id));
            setSelectedIds(selectedIds.filter(i => i !== id));
        } catch (err) {
            console.error(err);
        }
    };


    const permanentDelete = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            await axios.delete(`${API_BASE}/api/ideas/permanent/${id}`, {
                headers
            });
            setDeletedIdeas(deletedIdeas.filter(i => i.id !== id));
            setSelectedIds(selectedIds.filter(i => i !== id));
        } catch (err) {
            console.error(err);
        }
    };


    const deleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} items?`)) return;

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            await axios.delete(`${API_BASE}/api/ideas/permanent-all`, {
                headers,
                data: { ids: selectedIds }
            });
            setDeletedIdeas(deletedIdeas.filter(idea => !selectedIds.includes(idea._id || idea.id)));
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
        }
    };


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

            <main className="max-w-6xl mx-auto relative z-10 pb-24">
                <header className="flex items-center justify-between gap-4 mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white">Neural Exit</span>
                    </button>
                    <div className="text-right">
                        <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase italic leading-none flex items-center gap-3 justify-end">
                            <Trash2 className="text-red-500" size={24} />
                            Trash Vault
                        </h1>
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded mt-1 border border-primary/20 inline-block text-right">Archival Disposal System</p>
                    </div>
                </header>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-3xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-muted">
                            <Database size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Data Integrity Protocol</p>
                            <p className="text-xs text-muted font-bold">Items persist in local cache until permanent purge.</p>
                        </div>
                    </div>

                    {!loading && deletedIdeas.length > 0 && (
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={toggleSelectAll}
                                className="group/btn flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-white hover:bg-white/10 transition-all"
                            >
                                {selectedIds.length === deletedIdeas.length ? (
                                    <CheckSquare size={16} className="text-primary" />
                                ) : (
                                    <Square size={16} className="group-hover/btn:text-primary transition-colors" />
                                )}
                                {selectedIds.length === deletedIdeas.length ? 'Deselect Nodes' : 'Select All Nodes'}
                            </button>

                            <button
                                onClick={deleteSelected}
                                disabled={selectedIds.length === 0}
                                className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-red-500/5 hover:shadow-red-500/20"
                            >
                                <Trash2 size={16} className="group-hover:animate-bounce" /> Mass Purge ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin shadow-2xl shadow-primary/20"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Syncing Disposal Repository...</p>
                        </div>
                    ) : deletedIdeas.map((idea, index) => (
                        <motion.div
                            key={idea._id || idea.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative bg-white/[0.02] backdrop-blur-2xl border rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-500 hover:bg-white/[0.04] ${selectedIds.includes(idea._id || idea.id)
                                    ? 'border-primary/40 bg-primary/5 shadow-2xl shadow-primary/5'
                                    : 'border-white/5'
                                }`}
                        >
                            <div className="flex items-start gap-6 flex-1 w-full">
                                <button
                                    onClick={() => toggleSelectOne(idea._id || idea.id)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-muted hover:text-primary hover:border-primary/40 transition-all flex-shrink-0"
                                >
                                    {selectedIds.includes(idea._id || idea.id) ? (
                                        <CheckSquare size={18} className="text-primary" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>

                                <div className="flex-1 space-y-2 cursor-pointer" onClick={() => toggleSelectOne(idea._id || idea.id)}>
                                    <p className="text-sm sm:text-base text-white font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {idea.content}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted opacity-40">Entry Disposal:</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary italic px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                            {new Date(idea.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => restoreIdea(idea._id || idea.id)}
                                    className="flex-1 md:flex-none h-12 flex items-center justify-center gap-3 px-8 rounded-xl bg-white/5 border border-white/5 text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all text-[10px] font-black uppercase tracking-widest group/restore"
                                >
                                    <RotateCcw size={16} className="group-hover/restore:rotate-[-45deg] transition-transform" />
                                    <span>Restore Node</span>
                                </button>
                                <button
                                    onClick={() => permanentDelete(idea._id || idea.id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                    title="Permanent Purge"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {!loading && deletedIdeas.length === 0 && (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center opacity-40">
                                <Trash2 size={40} className="text-muted" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Repository Cleared</p>
                                <p className="text-xs text-muted font-bold">Trash vault contains no restorable nodes.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
