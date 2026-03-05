import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Key, Cloud, Bot, Save, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE from '../config/api';

export default function AdminSettings() {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        openAiKey: '',
        openAiAssistantId: '',
        openAiModel: 'gpt-4o-mini',
        cloudinaryCloudName: '',
        cloudinaryApiKey: '',
        cloudinaryApiSecret: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, saving, saved, error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            setStatus('loading');
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/config`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConfig(res.data);
                setStatus('idle');
            } catch (err) {
                console.error('Failed to load config:', err);
                setStatus('error');
                setErrorMsg('Unauthorized or failed to load settings. Make sure you are an admin.');
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus('saving');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/api/config`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error('Failed to save config:', err);
            setStatus('error');
            setErrorMsg(err.response?.data?.msg || 'Failed to update settings');
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

            <main className="max-w-5xl mx-auto relative z-10 pb-24">
                <header className="flex items-center justify-between gap-4 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} className="text-muted group-hover:text-white group-hover:-translate-x-1 transition-all" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted group-hover:text-white">Neural Exit</span>
                        </button>
                        <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase italic leading-none flex items-center gap-3">
                                <Shield className="text-primary" size={24} />
                                Admin Vault
                            </h1>
                            <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em] opacity-60">Architectural Core Controls</p>
                        </div>
                    </div>
                    {status === 'saved' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10"
                        >
                            <CheckCircle size={14} /> Synchronized
                        </motion.div>
                    )}
                </header>

                {status === 'loading' ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] border-2 border-primary/20 border-t-primary animate-spin shadow-2xl shadow-primary/20"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Decrypting Vault...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="grid grid-cols-1 gap-8">
                        {/* OpenAI Section */}
                        <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Bot className="text-primary" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">AI Synthesis Engine</h2>
                                    <p className="text-[9px] text-muted font-bold tracking-widest uppercase opacity-40">OpenAI Configuration</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Master API Key</label>
                                    <div className="relative group/input">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
                                        <div className="relative">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within/input:text-primary transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="openAiKey"
                                                value={config.openAiKey}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-white placeholder:text-muted/10 focus:border-primary/40 focus:bg-black/60 transition-all focus:outline-none"
                                                placeholder="sk-................................................"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Assistant Protocol ID</label>
                                        <input
                                            type="text"
                                            name="openAiAssistantId"
                                            value={config.openAiAssistantId}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white placeholder:text-muted/10 focus:border-primary/40 focus:bg-black/60 transition-all focus:outline-none"
                                            placeholder="asst_..."
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Neural Model Class</label>
                                        <div className="relative flex items-center">
                                            <select
                                                name="openAiModel"
                                                value={config.openAiModel}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-primary/40 focus:bg-black/60 transition-all focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="gpt-4o-mini" className="bg-[#050510] py-4">GPT-4o Mini (Optimal Speed)</option>
                                                <option value="gpt-4o" className="bg-[#050510] py-4">GPT-4o (High Intelligence)</option>
                                                <option value="o1-preview" className="bg-[#050510] py-4">o1-preview (Deep Reasoning)</option>
                                            </select>
                                            <div className="absolute right-6 pointer-events-none text-muted">
                                                <ArrowLeft size={16} className="-rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Cloudinary Section */}
                        <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>

                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                    <Cloud className="text-secondary" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Grid Storage Protocol</h2>
                                    <p className="text-[9px] text-muted font-bold tracking-widest uppercase opacity-40">Cloudinary Media Stack</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Cloud Namespace</label>
                                    <input
                                        type="text"
                                        name="cloudinaryCloudName"
                                        value={config.cloudinaryCloudName}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-secondary/40 focus:bg-black/60 transition-all focus:outline-none"
                                        placeholder="Vault Identifier"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Access Key</label>
                                    <input
                                        type="text"
                                        name="cloudinaryApiKey"
                                        value={config.cloudinaryApiKey}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-secondary/40 focus:bg-black/60 transition-all focus:outline-none"
                                        placeholder="Public UID"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.4em] ml-2">Master Secret</label>
                                    <input
                                        type="password"
                                        name="cloudinaryApiSecret"
                                        value={config.cloudinaryApiSecret}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-white focus:border-secondary/40 focus:bg-black/60 transition-all focus:outline-none"
                                        placeholder="Private Hash"
                                    />
                                </div>
                            </div>
                        </section>

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-xl shadow-red-500/5"
                            >
                                <AlertCircle size={20} />
                                {errorMsg}
                            </motion.div>
                        )}

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={status === 'saving'}
                                className="group relative w-full h-20 bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-[0.3em] text-[12px] rounded-[2rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-4 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                {status === 'saving' ? (
                                    <>
                                        <Loader2 className="animate-spin relative" size={24} />
                                        <span className="relative">Synchronizing Core Logic...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={24} className="relative group-hover:scale-110 transition-transform" />
                                        <span className="relative">Commit Configuration to Vault</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
