import { useState, useEffect } from 'react';
import axios from 'axios';
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
            const res = await axios.get('http://localhost:5000/api/ideas/deleted');
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
            await axios.post(`http://localhost:5000/api/ideas/restore/${id}`);
            setDeletedIdeas(deletedIdeas.filter(i => i.id !== id));
            setSelectedIds(selectedIds.filter(i => i !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const permanentDelete = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/ideas/permanent/${id}`);
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
            await axios.delete('http://localhost:5000/api/ideas/permanent-all', {
                data: { ids: selectedIds }
            });
            setDeletedIdeas(deletedIdeas.filter(idea => !selectedIds.includes(idea.id)));
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-background">
            <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Trash2 className="text-red-400" /> Recycle Bin
                </h1>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-muted flex items-center gap-2">
                        <Database size={18} /> Ideas here will be stored indefinitely unless permanently deleted.
                    </p>

                    {!loading && deletedIdeas.length > 0 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSelectAll}
                                className="text-sm font-medium text-muted hover:text-white flex items-center gap-2 transition-colors"
                            >
                                {selectedIds.length === deletedIdeas.length ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                                {selectedIds.length === deletedIdeas.length ? 'Deselect All' : 'Select All'}
                            </button>

                            <button
                                onClick={deleteSelected}
                                disabled={selectedIds.length === 0}
                                className="px-6 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Trash2 size={18} /> Delete Selected ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted">Loading archived ideas...</div>
                    ) : deletedIdeas.map((idea, index) => (
                        <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-surface/20 border rounded-xl p-5 flex justify-between items-center group transition-all ${selectedIds.includes(idea.id) ? 'border-primary/50 bg-primary/5' : 'border-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button onClick={() => toggleSelectOne(idea.id)} className="text-muted hover:text-primary transition-colors">
                                    {selectedIds.includes(idea.id) ? <CheckSquare size={22} className="text-primary" /> : <Square size={22} />}
                                </button>

                                <div className="flex-1 cursor-pointer" onClick={() => toggleSelectOne(idea.id)}>
                                    <p className="text-lg text-white/80 line-clamp-1">{idea.content}</p>
                                    <p className="text-xs text-muted mt-1">Deleted on: {new Date(idea.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => restoreIdea(idea.id)}
                                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 font-bold"
                                    title="Restore Idea"
                                >
                                    <RotateCcw size={18} /> <span className="hidden sm:inline">Restore</span>
                                </button>
                                <button
                                    onClick={() => permanentDelete(idea.id)}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                    title="Delete Permanently"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {!loading && deletedIdeas.length === 0 && (
                        <div className="text-center py-24 bg-surface/10 rounded-2xl border border-dashed border-white/10">
                            <p className="text-muted text-lg">Your recycle bin is empty.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
