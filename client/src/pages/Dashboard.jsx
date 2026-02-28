import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, LayoutDashboard, Database, LogOut, Download, FileSpreadsheet, UserPlus, Lock, Unlock, User, FileText, ImageIcon } from 'lucide-react';
import API_BASE from '../config/api';

export default function Dashboard() {

    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [ideaCount, setIdeaCount] = useState(10);
    const [user, setUser] = useState(null);
    const [bulkPersonas, setBulkPersonas] = useState([]);
    const [mainIdeaTopic, setMainIdeaTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateMsg, setGenerateMsg] = useState('');
    const [viewMode, setViewMode] = useState('campaigns'); // 'campaigns' or 'locked'
    const [lockedIdeas, setLockedIdeas] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        fetchBatches();
        fetchLockedIdeas();
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { 'Authorization': `Bearer ${token}` };
    };

    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/ideas/batches`, {
                headers: getAuthHeader()
            });
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLockedIdeas = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/ideas/locked`, {
                headers: getAuthHeader()
            });
            setLockedIdeas(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBulkGenerate = async () => {
        if (bulkPersonas.length === 0) {
            setGenerateMsg('⚠️ Please select at least one persona.');
            return;
        }
        if (!mainIdeaTopic.trim()) {
            setGenerateMsg('⚠️ Please enter a main idea / topic.');
            return;
        }
        setIsGenerating(true);
        setGenerateMsg('');
        try {
            const res = await axios.post(`${API_BASE}/api/ideas/generate`, {
                count: ideaCount,
                personas: bulkPersonas,
                topic: mainIdeaTopic.trim()
            }, { headers: getAuthHeader() });

            // Navigate to the new page
            navigate(`/batch/${res.data._id}`);
        } catch (err) {
            console.error(err);
            setGenerateMsg('❌ ' + (err.response?.data?.msg || err.response?.data?.error || err.message || 'Generation failed.'));
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteIdea = async (id) => {
        try {
            await axios.delete(`${API_BASE}/api/ideas/${id}`, {
                headers: getAuthHeader()
            });
            setLockedIdeas(prev => prev.filter(idea => idea._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleLock = async (ideaId, currentLockedState) => {
        try {
            const nextState = !currentLockedState;
            await axios.put(`${API_BASE}/api/ideas/${ideaId}/lock`, {
                isLocked: nextState,
                lockedData: null
            }, {
                headers: getAuthHeader()
            });

            // If we are unlocking, remove from the locked list
            if (!nextState) {
                setLockedIdeas(prev => prev.filter(idea => idea._id !== ideaId));
            }
        } catch (err) {
            console.error('Lock toggle failed:', err);
            alert(err.response?.data?.msg || 'Failed to update lock status');
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this campaign strategy?")) return;
        try {
            await axios.delete(`${API_BASE}/api/ideas/batch/${id}`, {
                headers: getAuthHeader()
            });
            setBatches(batches.filter(b => b._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete batch");
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/ideas/export-csv`, {
                headers: getAuthHeader(),
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'marketing_ideas_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to download CSV');
        }
    };


    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
                <div className="flex flex-col">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Marketing Intelligence
                    </h1>
                    <p className="text-muted text-xs sm:text-sm font-medium">Architectural Catalogue Platform</p>
                </div>

                {/* Central Navigation Menu */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'campaigns' || viewMode === 'locked' ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'text-muted hover:text-white'}`}
                    >
                        <FileText size={14} /> Content
                    </Link>
                    <Link
                        to="/profile"
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all"
                    >
                        <User size={14} /> Profile
                    </Link>
                    <Link
                        to="/gallery"
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all"
                    >
                        <ImageIcon size={14} /> Image Store
                    </Link>
                    <Link
                        to="/prompt"
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all"
                    >
                        Prompt
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-white font-bold text-sm tracking-tight">{user?.name}</span>
                        <span className="text-muted text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
                    </div>
                    <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 transition-all">
                        <User size={20} />
                    </Link>
                </div>
            </header>


            <main className="max-w-6xl mx-auto">

                {/* ── BULK GENERATOR ── */}
                <div className="mb-12 bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <LayoutDashboard className="text-primary" />
                            Bulk Social Media Post Generator
                        </h2>

                        {/* Persona Selector */}
                        <div className="mb-6">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">Target Persona</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['Brand', 'Student', 'Architect', 'Interior Designer'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setBulkPersonas(prev =>
                                        prev.includes(p) ? [] : [p]
                                    )}
                                    disabled={user?.role === 'free'}
                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-40 ${bulkPersonas.includes(p)
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-[1.02]'
                                        : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Idea / Topic */}
                        <div className="mb-6">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">Main Idea / Topic</label>
                            <textarea
                                rows={3}
                                value={mainIdeaTopic}
                                onChange={(e) => setMainIdeaTopic(e.target.value)}
                                disabled={user?.role === 'free'}
                                placeholder="e.g. Luxury modular kitchens for modern architects..."
                                className="w-full bg-background/50 border border-white/10 rounded-xl p-4 text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 text-sm leading-relaxed"
                            />
                        </div>


                        {/* Quantity + Generate */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/30 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <label className="text-muted text-sm font-medium">No. of Ideas:</label>
                                <select
                                    value={ideaCount}
                                    onChange={(e) => setIdeaCount(Number(e.target.value))}
                                    disabled={user?.role === 'free'}
                                    className="bg-background/50 border border-white/10 rounded-lg p-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                                >
                                    {[10, 20, 30, 40, 50].map(c => <option key={c} value={c}>{c} Ideas</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleBulkGenerate}
                                disabled={isGenerating || user?.role === 'free'}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                <Plus size={18} />
                                {isGenerating ? 'Generating...' : user?.role === 'free' ? 'Locked' : 'Bulk Create'}
                            </button>
                        </div>

                        {generateMsg && (
                            <p className={`mt-4 text-sm font-medium ${generateMsg.startsWith('✅') ? 'text-green-400' :
                                generateMsg.startsWith('⚠️') ? 'text-yellow-400' : 'text-red-400'
                                }`}>{generateMsg}</p>
                        )}
                        <div className="mt-4">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted font-bold">{batches.length} Strategic Campaigns saved</span>
                        </div>
                    </div>
                </div>{/* ── end Bulk Generator ── */}

                {/* ── TOGGLE & LIST ── */}
                <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {viewMode === 'campaigns' ? 'Recent Creative Strategies' : 'Locked Strategic Assets'}
                        </h2>
                        <p className="text-muted text-xs mt-1 font-medium">
                            {viewMode === 'campaigns' ? 'Browse your latest AI-generated campaign batches.' : 'Access your finalized and saved marketing inspirations.'}
                        </p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setViewMode('campaigns')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'campaigns' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}
                        >
                            <Database size={14} /> Campaigns
                        </button>
                        <button
                            onClick={() => setViewMode('locked')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'locked' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-muted hover:text-white'}`}
                        >
                            <Lock size={14} /> Locked Ideas
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 mb-12">
                    {viewMode === 'campaigns' ? (
                        <>
                            {batches.map((batch, index) => (
                                <motion.div
                                    key={batch._id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:bg-surface/50 transition-colors group"
                                >
                                    <Link to={`/batch/${batch._id}`} className="flex-1 flex gap-5 items-center cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{batch.topic}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[10px] text-muted uppercase tracking-widest">
                                                    {batch.ideas?.length || 0} Ideas Generated
                                                </p>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <p className="text-[10px] text-muted uppercase tracking-widest">
                                                    {new Date(batch.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2">
                                        <Link to={`/batch/${batch._id}`}>
                                            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-2">
                                                <Eye size={16} /> View Analysis
                                            </button>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteBatch(batch._id);
                                            }}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center justify-center"
                                            title="Delete Strategy"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {batches.length === 0 && (
                                <div className="text-center py-16 bg-surface/20 border border-white/5 rounded-3xl text-muted italic">
                                    No campaigns found. Start generating to build your intelligence logs.
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {lockedIdeas.map((idea, index) => (
                                <motion.div
                                    key={idea._id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-surface/30 backdrop-blur-md border border-secondary/20 rounded-2xl p-5 flex justify-between items-center hover:bg-surface/50 transition-colors group"
                                >
                                    <Link to={`/idea/${idea._id}`} className="flex-1 flex gap-5 items-center cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                                            <Lock size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white group-hover:text-secondary transition-colors line-clamp-1">{idea.content}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Locked Strategy</p>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <p className="text-[10px] text-muted uppercase tracking-widest">
                                                    {new Date(idea.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleToggleLock(idea._id, true);
                                            }}
                                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                            title="Unlock Strategic Asset"
                                        >
                                            <Unlock size={16} /> Unlock
                                        </button>
                                        <Link to={`/idea/${idea._id}`}>
                                            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-secondary/20 text-secondary text-xs font-bold transition-all flex items-center gap-2">
                                                <Eye size={16} /> View Asset
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                            {lockedIdeas.length === 0 && (
                                <div className="text-center py-16 bg-surface/20 border border-white/5 rounded-3xl text-muted italic">
                                    No locked ideas yet. Use the <Lock size={12} className="inline mx-1" /> icon in idea details to pin your favorites.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── DATA EXPORT PANEL ── */}
                <div className="mb-12 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-secondary/40 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
                        <FileSpreadsheet size={160} className="text-secondary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-black uppercase tracking-widest">
                                <Download size={12} /> Export
                            </div>
                            <h2 className="text-2xl font-black text-white">Data Export Center</h2>
                            <p className="text-muted text-sm max-w-md leading-relaxed">
                                Download a full CSV report with all your marketing ideas and social media prompts — Instagram, Facebook, Pinterest, YouTube, LinkedIn, WhatsApp.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Idea Content', 'Instagram', 'Facebook', 'Pinterest', 'YouTube', 'LinkedIn', 'WhatsApp'].map(col => (
                                    <span key={col} className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted">{col}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3 shrink-0">
                            <button
                                onClick={handleExportCSV}
                                className="bg-gradient-to-r from-secondary to-primary text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95"
                            >
                                <Download size={24} /> Download CSV
                            </button>
                            <p className="text-muted text-xs">marketing_ideas_export.csv</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
