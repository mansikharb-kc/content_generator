import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bot, Save, Zap, ImageIcon } from 'lucide-react';
import API_BASE from '../config/api';

const PERSONAS = ['Architect', 'Brand', 'Student', 'Interior Designer', 'Default'];

export default function PromptSettings() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [notes, setNotes] = useState({});
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageNotes, setImageNotes] = useState({});
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/ideas/prompt/master`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPrompt(res.data.prompt || '');
                setNotes(res.data.personaNotes || {});
                setImagePrompt(res.data.imagePrompt || '');
                setImageNotes(res.data.personaImageNotes || {});
            } catch (err) {
                console.error('Failed to load prompt:', err);
            }
        };
        fetchPrompt();
    }, []);

    const handleNoteChange = (key, value, type = 'text') => {
        const setter = type === 'image' ? setImageNotes : setNotes;
        const prev = type === 'image' ? imageNotes : notes;
        setter({ ...prev, [key]: value });
    };

    const handleSave = async () => {
        setStatus('saving');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/api/ideas/prompt/master`, {
                basePrompt: prompt,
                personaNotes: notes,
                imagePrompt,
                personaImageNotes: imageNotes
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
                                Persona Bias Overrides
                            </h2>
                            <p className="text-sm text-muted font-bold opacity-60 mt-2">Inject specific behavioral nuances per demographic node.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PERSONAS.map((persona) => (
                                <div key={persona} className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 hover:bg-white/[0.03] transition-all group/p">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover/p:text-secondary transition-colors">{persona}</p>
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary/20 group-hover/p:bg-secondary transition-all"></span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={notes[persona] || ''}
                                        onChange={(e) => handleNoteChange(persona, e.target.value)}
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white/70 placeholder:text-muted/10 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.02] transition-all resize-none leading-relaxed"
                                        placeholder={`Enter custom logic for ${persona}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        <div className="mb-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <ImageIcon size={14} />
                                </div>
                                Aesthetic Synthesis Engine
                            </h2>
                            <p className="text-sm text-muted font-bold opacity-60 mt-2">Configure the visual prompting logic and cinematic defaults.</p>
                        </div>
                        <div className="space-y-8">
                            <textarea
                                rows={6}
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm font-bold text-white placeholder:text-muted/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all resize-none shadow-inner leading-relaxed"
                                placeholder="Use this area to craft the cinematic image brief..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {PERSONAS.map((persona) => (
                                    <div key={`img-${persona}`} className="space-y-3 rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 hover:bg-white/[0.03] transition-all group/p">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover/p:text-primary transition-colors">{persona} Aesthetic</p>
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/p:bg-primary transition-all"></span>
                                        </div>
                                        <textarea
                                            rows={4}
                                            value={imageNotes[persona] || ''}
                                            onChange={(e) => handleNoteChange(persona, e.target.value, 'image')}
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white/70 placeholder:text-muted/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.02] transition-all resize-none leading-relaxed"
                                            placeholder={`Enter artistic direction for ${persona}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
