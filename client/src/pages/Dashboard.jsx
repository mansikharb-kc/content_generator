import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, LayoutDashboard, Database, LogOut, Download, FileSpreadsheet, Lock, Unlock, User, FileText, ImageIcon, Menu, X, Shield } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState('campaigns');
    const [lockedIdeas, setLockedIdeas] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser));
        } catch (e) {
            console.error('Failed to parse user', e);
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
            const res = await axios.get(`${API_BASE}/api/ideas/batches`, { headers: getAuthHeader() });
            setBatches(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchLockedIdeas = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/ideas/locked`, { headers: getAuthHeader() });
            setLockedIdeas(res.data);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBulkGenerate = async () => {
        if (bulkPersonas.length === 0) { setGenerateMsg('⚠️ Please select at least one persona.'); return; }
        if (!mainIdeaTopic.trim()) { setGenerateMsg('⚠️ Please enter a main idea / topic.'); return; }
        setIsGenerating(true);
        setGenerateMsg('');
        try {
            const res = await axios.post(`${API_BASE}/api/ideas/generate`, {
                count: ideaCount, personas: bulkPersonas, topic: mainIdeaTopic.trim()
            }, { headers: getAuthHeader() });
            navigate(`/batch/${res.data._id}`);
        } catch (err) {
            setGenerateMsg('❌ ' + (err.response?.data?.msg || err.response?.data?.error || err.message || 'Generation failed.'));
        } finally { setIsGenerating(false); }
    };

    const handleToggleLock = async (ideaId, currentLockedState) => {
        try {
            const nextState = !currentLockedState;
            await axios.put(`${API_BASE}/api/ideas/${ideaId}/lock`, { isLocked: nextState, lockedData: null }, { headers: getAuthHeader() });
            if (!nextState) setLockedIdeas(prev => prev.filter(idea => idea._id !== ideaId));
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update lock status');
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Delete this campaign strategy?")) return;
        try {
            await axios.delete(`${API_BASE}/api/ideas/batch/${id}`, { headers: getAuthHeader() });
            setBatches(batches.filter(b => b._id !== id));
        } catch (err) { alert("Failed to delete batch"); }
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/ideas/export-csv`, { headers: getAuthHeader(), responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'marketing_ideas_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Failed to download CSV'); }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
            {/* Header */}
            <header className="flex justify-between items-center gap-4 mb-6 sm:mb-10">
                <div className="flex flex-col">
                    <h1 className="text-lg sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
                        Marketing Intelligence
                    </h1>
                    <p className="text-muted text-[10px] sm:text-sm font-medium hidden sm:block">Architectural Catalogue Platform</p>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-primary/20 text-primary">
                        <FileText size={13} /> Content
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all">
                        <User size={13} /> Profile
                    </Link>
                    <Link to="/gallery" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all">
                        <ImageIcon size={13} /> Gallery
                    </Link>
                    <Link to="/prompt" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-all">
                        Prompt
                    </Link>

                </nav>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-white font-bold text-sm">{user?.name}</span>
                        <span className="text-muted text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
                    </div>
                    <Link to="/profile" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                        <User size={18} />
                    </Link>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-all">
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mb-6 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 space-y-1">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/10">
                        <FileText size={16} /> Content
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:bg-white/5 hover:text-white transition-all">
                        <User size={16} /> Profile
                    </Link>
                    <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:bg-white/5 hover:text-white transition-all">
                        <ImageIcon size={16} /> Image Store
                    </Link>
                    <Link to="/prompt" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:bg-white/5 hover:text-white transition-all">
                        Prompt Settings
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </motion.div>
            )}

            <main className="max-w-6xl mx-auto">
                {/* ── BULK GENERATOR ── */}
                <div className="mb-8 sm:mb-10 bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-base sm:text-xl font-bold mb-5 flex items-center gap-2">
                            <LayoutDashboard className="text-primary" size={18} /> Bulk Social Media Post Generator
                        </h2>

                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 block opacity-60">Target Persona Selection</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['Brand', 'Student', 'Architect', 'Interior Designer'].map((p) => (
                                    <button key={p}
                                        onClick={() => setBulkPersonas(prev => prev.includes(p) ? [] : [p])}
                                        disabled={user?.role === 'free'}
                                        className={`py-3 sm:py-4 px-3 rounded-2xl border text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-40 ${bulkPersonas.includes(p) ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30' : 'bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:border-white/20'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 sm:mb-6">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-3 block">Main Idea / Topic</label>
                            <textarea rows={3} value={mainIdeaTopic} onChange={(e) => setMainIdeaTopic(e.target.value)}
                                disabled={user?.role === 'free'}
                                placeholder="e.g. Luxury modular kitchens for modern architects..."
                                className="w-full bg-background/50 border border-white/10 rounded-xl p-3 sm:p-4 text-white placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 text-sm leading-relaxed" />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-background/50 p-4 sm:p-5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                                <label className="text-muted text-[10px] font-black uppercase tracking-widest">Quantity:</label>
                                <select value={ideaCount} onChange={(e) => setIdeaCount(Number(e.target.value))}
                                    disabled={user?.role === 'free'}
                                    className="bg-background border border-white/10 rounded-xl p-2 px-4 text-white focus:outline-none cursor-pointer disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all hover:border-primary/50">
                                    {[10, 20, 30, 40, 50].map(c => <option key={c} value={c}>{c} Strategic Ideas</option>)}
                                </select>
                            </div>
                            <button onClick={handleBulkGenerate}
                                disabled={isGenerating || user?.role === 'free'}
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 disabled:opacity-50 text-[10px]">
                                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={16} />}
                                {isGenerating ? 'Drafting...' : user?.role === 'free' ? 'Upgrade Plan' : 'Bulk Generate'}
                            </button>
                        </div>

                        {generateMsg && (
                            <p className={`mt-4 text-sm font-medium ${generateMsg.startsWith('✅') ? 'text-green-400' : generateMsg.startsWith('⚠️') ? 'text-yellow-400' : 'text-red-400'}`}>{generateMsg}</p>
                        )}
                        <div className="mt-4">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted font-bold">{batches.length} Strategic Campaigns saved</span>
                        </div>
                    </div>
                </div>

                {/* ── TOGGLE & LIST ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5 sm:mb-8 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {viewMode === 'campaigns' ? 'Recent Creative Strategies' : 'Locked Strategic Assets'}
                        </h2>
                        <p className="text-muted text-xs mt-1 font-medium">
                            {viewMode === 'campaigns' ? 'Browse your latest AI-generated campaign batches.' : 'Access your finalized and saved marketing inspirations.'}
                        </p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md shrink-0">
                        <button onClick={() => setViewMode('campaigns')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'campaigns' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}>
                            <Database size={13} /> Campaigns
                        </button>
                        <button onClick={() => setViewMode('locked')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'locked' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-muted hover:text-white'}`}>
                            <Lock size={13} /> Locked
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 sm:gap-4 mb-8 sm:mb-12">
                    {viewMode === 'campaigns' ? (
                        <>
                            {batches.map((batch, index) => (
                                <motion.div key={batch._id || index}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                    className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-surface/50 transition-colors group">
                                    <Link to={`/batch/${batch._id}`} className="flex-1 flex gap-3 sm:gap-4 items-center cursor-pointer">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0"><Database size={18} /></div>
                                        <div>
                                            <p className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{batch.topic}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-muted uppercase tracking-widest">{batch.ideas?.length || 0} Ideas</p>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <p className="text-[10px] text-muted uppercase tracking-widest">{new Date(batch.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2 self-end sm:self-auto">
                                        <Link to={`/batch/${batch._id}`}>
                                            <button className="px-3 py-2 rounded-xl bg-white/5 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5"><Eye size={14} /> View</button>
                                        </Link>
                                        <button onClick={(e) => { e.preventDefault(); handleDeleteBatch(batch._id); }}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {batches.length === 0 && (
                                <div className="text-center py-12 sm:py-16 bg-surface/20 border border-white/5 rounded-3xl text-muted italic text-sm">
                                    No campaigns found. Start generating to build your intelligence logs.
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {lockedIdeas.map((idea, index) => {
                                let displayContent = idea.content;
                                try {
                                    if (idea.content?.startsWith('{')) {
                                        const parsed = JSON.parse(idea.content);
                                        displayContent = parsed.title || parsed.content || idea.content;
                                    }
                                } catch (e) { }

                                return (
                                    <motion.div key={idea._id || index}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                        className="bg-surface/30 backdrop-blur-md border border-secondary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-surface/50 transition-colors group">
                                        <Link to={`/idea/${idea._id}`} className="flex-1 flex gap-3 sm:gap-4 items-center cursor-pointer">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary shrink-0"><Lock size={18} /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    {idea.ideaNumber > 0 && (
                                                        <span className="text-[10px] font-black bg-secondary/20 text-secondary px-2 py-0.5 rounded-md uppercase">Idea #{idea.ideaNumber}</span>
                                                    )}
                                                    <span className="text-[10px] text-muted font-bold truncate max-w-[200px]">Main Idea: {idea.batchTopic}</span>
                                                </div>
                                                <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-secondary transition-colors">{displayContent}</p>
                                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                                    {idea.isLocked && (
                                                        <p className="text-[8px] sm:text-[10px] text-secondary font-black uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Lock size={8} /> Strategy Locked
                                                        </p>
                                                    )}
                                                    {idea.lockedPlatforms?.map(plat => (
                                                        <p key={plat} className="text-[8px] sm:text-[10px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Lock size={8} /> {plat}
                                                        </p>
                                                    ))}
                                                    <p className="text-[10px] text-muted uppercase tracking-widest ml-auto">{new Date(idea.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="flex gap-2 self-end sm:self-auto">
                                            <button onClick={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.post(`${API_BASE}/api/v2-unlock-all/${idea._id}`, {}, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    // Re-fetch to clear from list
                                                    fetchLockedIdeas();
                                                } catch (err) {
                                                    alert('Failed to unlock');
                                                }
                                            }}
                                                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 border border-red-500/20 transition-all">
                                                <Unlock size={13} /> Master Unlock
                                            </button>
                                            <Link to={`/idea/${idea._id}`}>
                                                <button className="px-3 py-2 rounded-xl bg-white/5 hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center gap-1.5 transition-all"><Eye size={13} /> View Detail</button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {lockedIdeas.length === 0 && (
                                <div className="text-center py-12 sm:py-16 bg-surface/20 border border-white/5 rounded-3xl text-muted italic text-sm">
                                    No locked ideas yet. Use the <Lock size={12} className="inline mx-1" /> icon in idea details to pin your favorites.
                                </div>
                            )}
                        </>
                    )}
                </div>

            </main>
        </div>
    );
}
