import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, LayoutDashboard, Database, LogOut, Download, FileSpreadsheet, Lock, Unlock, User, FileText, ImageIcon, Menu, X, Shield, RefreshCw, Zap, ChevronDown } from 'lucide-react';


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
        <div className="min-h-screen bg-[#050510] relative overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* 🛸 Hyper-Premium Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <main className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center gap-4 mb-8 sm:mb-12">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping block sm:hidden"></span>
                            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white uppercase italic">
                                Dashboard
                            </h1>
                        </div>
                    </div>



                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl uppercase">
                        <Link to="/" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                            <FileText size={14} /> CONTENT
                        </Link>
                        <Link to="/profile" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-all hover:bg-white/5">
                            <User size={14} /> PROFILE
                        </Link>
                        <Link to="/gallery" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-all hover:bg-white/5">
                            <ImageIcon size={14} /> GALLERY
                        </Link>
                        <Link to="/prompt" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-all hover:bg-white/5">
                            PROMPT
                        </Link>
                    </nav>



                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-white font-black text-xs uppercase tracking-tight">{user?.name}</span>
                            <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded mt-1 border border-primary/20">{user?.role}</span>
                        </div>
                        <Link to="/profile" className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white hover:border-white/10 transition-all shadow-xl">
                            <User size={20} />
                        </Link>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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

                {/* ── BULK GENERATOR ── */}
                <div className="mb-8 sm:mb-12 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 sm:p-10 shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <LayoutDashboard size={14} />
                            </div>
                            Bulk Social Media Post Generator
                        </h2>


                        <div className="mb-8">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-4 block opacity-50">TARGET PERSONA SELECTION</label>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {['Brand', 'Student', 'Architect', 'Interior Designer'].map((p) => (
                                    <button key={p}
                                        onClick={() => setBulkPersonas(prev => prev.includes(p) ? [] : [p])}
                                        disabled={user?.role === 'free'}
                                        className={`py-4 px-3 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-20 flex flex-col items-center gap-2 group/btn ${bulkPersonas.includes(p) ? 'bg-primary text-white border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] scale-[1.02]' : 'bg-white/5 border-white/5 text-muted/60 hover:bg-white/[0.08] hover:border-white/10 hover:text-white'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${bulkPersonas.includes(p) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-muted/40 group-hover/btn:bg-primary'}`}></span>
                                        {p.toUpperCase()}
                                    </button>

                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-4 block opacity-50">MAIN IDEA / TOPIC</label>
                            <div className="relative group/input">
                                <textarea rows={4} value={mainIdeaTopic} onChange={(e) => setMainIdeaTopic(e.target.value)}
                                    disabled={user?.role === 'free'}
                                    placeholder="e.g. Luxury modular kitchens for modern architects..."
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-xs font-bold text-white placeholder:text-muted/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all resize-none shadow-inner leading-relaxed" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-3xl">
                            <div className="flex items-center justify-between sm:justify-start gap-6 flex-1">
                                <label className="text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40">QUANTITY:</label>

                                <div className="relative group/select">
                                    <select
                                        value={ideaCount}
                                        onChange={(e) => setIdeaCount(Number(e.target.value))}
                                        disabled={user?.role === 'free'}
                                        className="bg-black/40 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-2xl border border-white/5 appearance-none focus:outline-none focus:border-primary/40 transition-all cursor-pointer min-w-[200px]"
                                    >
                                        {[10, 20, 30, 40].map(val => (
                                            <option key={val} value={val} className="bg-[#050510]">{val} STRATEGIC IDEAS</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                </div>

                            </div>
                            <button onClick={handleBulkGenerate} disabled={isGenerating || !mainIdeaTopic || bulkPersonas.length === 0}
                                className="group relative h-14 px-10 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.2rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                {isGenerating ? (
                                    <RefreshCw size={14} className="relative animate-spin" />
                                ) : (
                                    <Plus size={16} className="relative group-hover:scale-125 transition-transform" />
                                )}
                                <span className="relative">
                                    {isGenerating ? 'Generating...' : 'BULK GENERATE'}
                                </span>
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

                {/* ── CAMPAIGN REPOSITORY ── */}
                <div className="mt-16 mb-10">
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-6 px-2">
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase italic">
                                Recent Creative Strategies
                            </h2>
                        </div>


                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <button onClick={() => setViewMode('campaigns')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'campaigns' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted/60 hover:text-white hover:bg-white/5'}`}>
                                <Database size={14} /> Campaigns
                            </button>
                            <button onClick={() => setViewMode('locked')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === 'locked' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-muted/60 hover:text-white hover:bg-white/5'}`}>
                                <Lock size={14} /> Locked
                            </button>
                        </div>

                    </div>
                </div>

                <div className="grid gap-4 mb-24">
                    {viewMode === 'campaigns' ? (
                        <>
                            {batches.map((batch, index) => (
                                <motion.div key={batch._id || index}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                    className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

                                    <Link to={`/batch/${batch._id}`} className="flex-1 flex gap-5 items-center cursor-pointer relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                            <Database size={24} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors italic uppercase italic">
                                                {batch.topic || 'UNTITLED_LOG'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                                    <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_rgba(var(--primary-rgb),0.8)]"></span>
                                                    <p className="text-[9px] text-muted font-black uppercase tracking-widest">{batch.ideas?.length || 0} Assets</p>
                                                </div>
                                                <p className="text-[9px] text-muted font-bold uppercase tracking-widest opacity-40">{new Date(batch.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex gap-2 self-end sm:self-auto relative z-10">
                                        <Link to={`/batch/${batch._id}`}>
                                            <button className="h-11 px-6 rounded-xl bg-white/5 hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-primary flex items-center gap-2">
                                                <Eye size={14} /> View Log
                                            </button>
                                        </Link>
                                        <button onClick={(e) => { e.preventDefault(); handleDeleteBatch(batch._id); }}
                                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500 text-red-400 hover:text-white transition-all border border-white/5 hover:border-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {batches.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-muted gap-6 bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem]">
                                    <Database size={48} className="opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">No Campaigns Synchronized</p>
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
                                        className="bg-white/[0.03] backdrop-blur-3xl border border-secondary/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 hover:bg-white/[0.06] hover:border-secondary/40 transition-all duration-500 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/10 transition-colors"></div>

                                        <Link to={`/idea/${idea._id}`} className="flex-1 flex gap-5 items-center cursor-pointer relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 border border-secondary/20 group-hover:scale-110 transition-transform duration-500">
                                                <Lock size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    {idea.ideaNumber > 0 && (
                                                        <span className="text-[9px] font-black bg-secondary text-white px-2 py-0.5 rounded-md uppercase tracking-widest italic">Node #{idea.ideaNumber}</span>
                                                    )}
                                                    <span className="text-[9px] text-muted font-black uppercase tracking-[0.2em] opacity-40 truncate max-w-[200px]">Origin: {idea.batchTopic}</span>
                                                </div>
                                                <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{displayContent}</p>
                                                <div className="flex items-center flex-wrap gap-2 mt-3">
                                                    {idea.isLocked && (
                                                        <p className="text-[8px] text-secondary font-black uppercase tracking-[0.2em] bg-secondary/10 px-2 py-1 rounded-lg border border-secondary/20 flex items-center gap-1.5">
                                                            <div className="w-1 h-1 rounded-full bg-secondary animate-pulse"></div> Master Locked
                                                        </p>
                                                    )}
                                                    {idea.lockedPlatforms?.map(plat => (
                                                        <p key={plat} className="text-[8px] text-amber-400 font-black uppercase tracking-[0.2em] bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                                            <div className="w-1 h-1 rounded-full bg-amber-500"></div> {plat}
                                                        </p>
                                                    ))}
                                                    <p className="text-[8px] text-muted font-black uppercase tracking-widest ml-auto opacity-30">{new Date(idea.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="flex gap-2 self-end sm:self-auto relative z-10">
                                            <button onClick={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.post(`${API_BASE}/api/v2-unlock-all/${idea._id}`, {}, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    fetchLockedIdeas();
                                                } catch (err) { }
                                            }}
                                                className="h-11 px-6 rounded-xl bg-white/5 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-red-500 flex items-center gap-2">
                                                <Unlock size={14} /> Unlock Node
                                            </button>
                                            <Link to={`/idea/${idea._id}`}>
                                                <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-secondary text-secondary hover:text-white transition-all border border-white/5 hover:border-secondary">
                                                    <Eye size={16} />
                                                </button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {lockedIdeas.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-muted gap-6 bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem]">
                                    <Lock size={48} className="opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Neural Vault Depleted • Use Lock to Save Assets</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </main>
        </div>
    );
}
