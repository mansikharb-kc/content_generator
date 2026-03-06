import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bot, Save, Zap, Image as ImageIcon } from 'lucide-react';
import API_BASE from '../config/api';

const PERSONAS = ['Architect', 'Brand', 'Student', 'Interior Designer', 'Default'];

export default function PromptSettings() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [notes, setNotes] = useState({});
    const [status, setStatus] = useState('idle');
    const [examples, setExamples] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [newExTitle, setNewExTitle] = useState('');
    const [exFile, setExFile] = useState(null);
    const [exPreview, setExPreview] = useState(null);

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/ideas/prompt/master`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPrompt(res.data.prompt || '');
                setNotes(res.data.personaNotes || {});
            } catch (err) {
                console.error('Failed to load prompt:', err);
            }
        };
        fetchPrompt();
        fetchExamples();
    }, []);

    const fetchExamples = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/images?ideaId=null`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filtering for only global examples (no ideaId)
            setExamples(res.data.filter(img => !img.ideaId));
        } catch (err) {
            console.error('Failed to fetch examples:', err);
        }
    };

    const handleExFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setExFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setExPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleUploadEx = async () => {
        if (!exFile) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', exFile);
            formData.append('title', newExTitle);

            const res = await axios.post(`${API_BASE}/api/images/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setExamples(prev => [res.data, ...prev]);
            setExFile(null);
            setExPreview(null);
            setNewExTitle('');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Example upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const deleteEx = async (id) => {
        if (!window.confirm('Remove this reference idea?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/images/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExamples(prev => prev.filter(ex => ex._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleNoteChange = (key, value) => {
        setNotes({ ...notes, [key]: value });
    };

    const handleSave = async () => {
        setStatus('saving');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/api/ideas/prompt/master`, {
                basePrompt: prompt,
                personaNotes: notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to save prompt:', err);
            setStatus('error');
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
                        <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase italic leading-none">
                            Engine Calibration
                        </h1>
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded mt-1 border border-primary/20 inline-block">Neural Config v4.0</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Bot size={14} />
                                    </div>
                                    Master Logical Core
                                </h2>
                                <p className="text-sm text-muted font-bold opacity-60">Global orchestration instructions for all personas.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={status === 'saving'}
                                className="group relative h-12 px-8 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                <span className="relative">{status === 'saving' ? 'Syncing...' : 'Save Configuration'}</span>
                                <Save size={14} className="relative" />
                            </button>
                        </div>
                        <textarea
                            rows={10}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white placeholder:text-muted/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all resize-none shadow-inner leading-relaxed"
                            placeholder="Enter the primary logical directives..."
                        />
                    </section>

                    <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
                        <div className="mb-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                    <Zap size={14} />
                                </div>
                                Recommendation Knowledge Base (Training Ideas)
                            </h2>
                            <p className="text-sm text-muted font-bold opacity-60 mt-2">Upload high-performing ideas and captions to train the AI on Knowledge Center's style.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Upload Form */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className={`relative h-48 rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group/u ${exPreview ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/[0.02]'}`}
                                    onClick={() => document.getElementById('ex-upload').click()}>
                                    {exPreview ? (
                                        <img src={exPreview} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 border border-white/5 group-hover/u:border-primary/30 transition-all">
                                                <ImageIcon size={20} className="text-muted group-hover/u:text-primary transition-colors" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Select Visual</p>
                                        </>
                                    )}
                                    <input id="ex-upload" type="file" className="hidden" accept="image/*" onChange={handleExFile} />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Enter Post Title / Caption Example..."
                                    value={newExTitle}
                                    onChange={(e) => setNewExTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-muted/20 focus:outline-none focus:border-primary/50 transition-all"
                                />

                                <button
                                    onClick={handleUploadEx}
                                    disabled={isUploading || !exFile}
                                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl border border-white/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? 'INDEXING...' : 'COMMIT REFERENCE IDEA'}
                                </button>
                            </div>

                            {/* Examples List */}
                            <div className="lg:col-span-8">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {examples.length === 0 ? (
                                        <div className="col-span-full h-48 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-muted opacity-30 border-dashed">
                                            <Zap size={32} className="mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No examples synchronized</p>
                                        </div>
                                    ) : (
                                        examples.map(ex => (
                                            <div key={ex._id} className="relative group/card aspect-square rounded-3xl overflow-hidden border border-white/5">
                                                <img src={ex.url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-tight truncate mb-2">{ex.title || 'Untitled'}</p>
                                                    <button
                                                        onClick={() => deleteEx(ex._id)}
                                                        className="w-full py-2 bg-red-500/20 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>


                </div>
            </main>
        </div>
    );
}
