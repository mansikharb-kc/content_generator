import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, LayoutDashboard, Database, LogOut, Download, FileSpreadsheet } from 'lucide-react';
import API_BASE from '../config/api';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [ideas, setIdeas] = useState([]);
    const [ideaCount, setIdeaCount] = useState(10);
    const navigate = useNavigate();

    const [selectedPersonas, setSelectedPersonas] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/ideas`);
            setIdeas(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAnalyze = async () => {
        if (selectedPersonas.length === 0) {
            alert("Please select at least one persona.");
            return;
        }
        setIsAnalyzing(true);
        try {
            const res = await axios.post(`${API_BASE}/api/ideas/analyze`, {
                personas: selectedPersonas
            });
            setAnalysis(res.data);
            fetchIdeas();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.msg || "Analysis failed.";
            alert(errMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const deleteIdea = async (id) => {
        try {
            await axios.delete(`${API_BASE}/api/ideas/${id}`);
            setIdeas(ideas.filter(idea => idea.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE}/api/ideas/export-csv`, {
                headers: { 'x-auth-token': token },
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
        <div className="min-h-screen p-8 bg-background">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Marketing Intelligence
                    </h1>
                    <p className="text-muted text-sm font-medium">Architectural Catalogue Platform</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-muted">Welcome, {user?.name}</span>
                    <Link to="/deleted">
                        <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                            <Trash2 size={16} className="text-red-400" /> Recycle Bin
                        </button>
                    </Link>
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2 font-bold"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">

                {/* Persona Selection & Intelligence Section */}
                <div className="mb-12 bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Database className="text-primary" /> System Parameters
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Selected Persona</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Brand', 'Student', 'Architect', 'Interior Designer'].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => {
                                                        setSelectedPersonas(prev =>
                                                            prev.includes(p)
                                                                ? prev.filter(item => item !== p)
                                                                : [...prev, p]
                                                        );
                                                    }}
                                                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all ${selectedPersonas.includes(p)
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-[1.02]'
                                                        : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-black text-xl text-white shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? "Analyzing Intelligence..." : "Run Marketing Intelligence"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            {!analysis ? (
                                <div className="text-center p-8 border-2 border-dashed border-white/5 rounded-3xl group">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <LayoutDashboard className="text-muted" size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-muted mb-2">Awaiting Parameters</h4>
                                    <p className="text-sm text-muted/60 max-w-[200px] mx-auto">Select a persona to generate tailored marketing intelligence.</p>
                                </div>
                            ) : (
                                <div className="h-full bg-black/20 rounded-3xl p-6 border border-white/5 overflow-y-auto max-h-[400px] custom-scrollbar">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest">Analysis Result</span>
                                            <h4 className="text-2xl font-black mt-2">{analysis.brandName} <span className="text-primary">×</span> {analysis.persona}</h4>
                                        </div>
                                        <div className="text-right text-[10px] text-muted font-mono uppercase">
                                            {analysis.generatedAt}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <section>
                                            <h5 className="text-primary text-xs font-black uppercase mb-2">Step 1: Brand Overview</h5>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div><p className="text-muted mb-1 uppercase font-bold text-[9px]">Industry</p><p>{analysis.overview?.industry}</p></div>
                                                    <div><p className="text-muted mb-1 uppercase font-bold text-[9px]">Category</p><p>{analysis.overview?.category}</p></div>
                                                    <div className="col-span-2"><p className="text-muted mb-1 uppercase font-bold text-[9px]">Strength</p><p>{analysis.overview?.strength}</p></div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h5 className="text-primary text-xs font-black uppercase mb-2">Step 2: Persona Mindset</h5>
                                            <p className="text-sm italic text-muted">"{analysis.mindset}"</p>
                                        </section>

                                        <section className="space-y-4">
                                            <div>
                                                <h6 className="text-white text-sm font-bold mb-2">Analysis & Benefits</h6>
                                                <p className="text-sm text-muted mb-3">{analysis.analysis}</p>
                                                <ul className="space-y-1">
                                                    {analysis.benefits?.map((b, i) => (
                                                        <li key={i} className="text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{b}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h6 className="text-white text-sm font-bold mb-2">Suggested Use Cases</h6>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.useCases?.map((u, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">{u}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h6 className="text-white text-sm font-bold mb-2">WhatsApp Community Content</h6>
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm leading-relaxed text-green-100 font-medium">
                                                    {analysis.whatsappContent || "Community briefing ready for distribution."}
                                                </div>
                                            </div>

                                            <div>
                                                <h6 className="text-white text-sm font-bold mb-2">Social Content Ideas</h6>
                                                <div className="space-y-2">
                                                    {analysis.posts?.map((p, i) => (
                                                        <div key={i} className="p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg text-xs leading-relaxed italic">
                                                            {p}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <h6 className="text-secondary text-sm font-bold mb-2 uppercase tracking-tight">Strategic Recommendation</h6>
                                                <p className="text-sm font-medium leading-relaxed">{analysis.strategy}</p>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bulk Generator Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-3 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <LayoutDashboard className="text-primary" /> Bulk Generator
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-muted text-sm">Campaign Focus</label>
                                <input
                                    type="text"
                                    placeholder="Enter a topic for bulk idea generation..."
                                    className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex justify-between items-center bg-background/30 p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <label className="text-muted text-sm font-medium">Quantity:</label>
                                    <select
                                        value={ideaCount}
                                        onChange={(e) => setIdeaCount(Number(e.target.value))}
                                        className="bg-background/50 border border-white/10 rounded-lg p-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                    >
                                        {[10, 20, 30, 40, 50].map(c => <option key={c} value={c}>{c} Ideas</option>)}
                                    </select>
                                </div>
                                <Link to="/generate" state={{ count: ideaCount }}>
                                    <button className="px-6 py-3 rounded-lg bg-surface hover:bg-white/5 border border-white/10 text-white font-bold transition-all flex items-center gap-2">
                                        <Plus size={20} /> Bulk Create
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center text-2xl font-black text-white border border-white/10">
                            {ideas.length}
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-muted">Total Insights</p>
                            <p className="text-xs text-muted/60 mt-1">Managed in Database</p>
                        </div>
                    </div>
                </div>

                {/* ── DATA EXPORT PANEL ── */}
                <div className="mb-12 bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-secondary/40 transition-all duration-300">
                    {/* Decorative background icon */}
                    <div className="absolute -right-6 -top-6 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
                        <FileSpreadsheet size={160} className="text-secondary" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Left: info */}
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-black uppercase tracking-widest">
                                <Download size={12} /> Export
                            </div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
                                Data Export Center
                            </h2>
                            <p className="text-muted text-sm max-w-md leading-relaxed">
                                Download a full CSV report with all your marketing ideas and social media prompts — Instagram, Facebook, Pinterest, YouTube, LinkedIn, WhatsApp — ready for offline use or team sharing.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {['Idea Content', 'Instagram', 'Facebook', 'Pinterest', 'YouTube', 'LinkedIn', 'WhatsApp'].map(col => (
                                    <span key={col} className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right: action */}
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

                {/* Ideas List */}
                <h2 className="text-2xl font-bold mb-6">Recent Intelligence Logs</h2>
                <div className="grid gap-4">
                    {ideas.map((idea, index) => {
                        const ideaId = idea.id || idea._id;
                        const isAnalysis = idea.content.startsWith('MARKETING ANALYSIS:') || idea.content.startsWith('PLATFORM ANALYSIS:');
                        const displayContent = isAnalysis
                            ? idea.content.split(' - ')[0].replace('MARKETING ANALYSIS: ', '').replace('PLATFORM ANALYSIS: ', '')
                            : idea.content.split(' - ')[0];

                        return (
                            <motion.div
                                key={ideaId || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-xl p-4 flex justify-between items-center hover:bg-surface/50 transition-colors group"
                            >
                                <Link to={`/idea/${ideaId}`} className="flex-1 flex gap-4 items-center cursor-pointer">
                                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${isAnalysis ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted'}`}>
                                        {isAnalysis ? <Database size={16} /> : index + 1}
                                    </span>
                                    <div>
                                        <p className={`text-lg font-medium ${isAnalysis ? 'text-white' : 'text-muted'}`}>{displayContent}</p>
                                        <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                                            {isAnalysis ? 'Strategic Analysis' : 'Generated Idea'} • {new Date(idea.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link to={`/idea/${ideaId}`}>
                                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </Link>
                                    <button onClick={() => deleteIdea(ideaId)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                    {ideas.length === 0 && (
                        <div className="text-center py-12 text-muted">
                            No logs found. Initialize parameters to begin.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
