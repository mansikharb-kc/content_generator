import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Shield, Key, Cloud, Bot, Save, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import API_BASE from '../config/api';

export default function AdminSettings() {
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
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-white transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                                <Shield className="text-primary" size={24} /> Admin Vault
                            </h1>
                            <p className="text-xs text-muted uppercase tracking-widest font-bold">System Configuration & API Keys</p>
                        </div>
                    </div>
                    {status === 'saved' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-4">
                            <CheckCircle size={14} /> Settings Saved
                        </div>
                    )}
                </header>

                {status === 'loading' ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-xs uppercase tracking-widest font-bold">Loading Vault...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OpenAI Section */}
                        <section className="bg-surface/30 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md md:col-span-2">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                                <Bot className="text-secondary" size={20} />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">AI Engine (OpenAI)</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">OpenAI API Key</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="password"
                                            name="openAiKey"
                                            value={config.openAiKey}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-primary focus:outline-none transition-all"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">Assistant ID (Optional)</label>
                                        <input
                                            type="text"
                                            name="openAiAssistantId"
                                            value={config.openAiAssistantId}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary focus:outline-none transition-all"
                                            placeholder="asst_..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">Default Model</label>
                                        <select
                                            name="openAiModel"
                                            value={config.openAiModel}
                                            onChange={handleChange}
                                            className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary focus:outline-none transition-all appearance-none"
                                        >
                                            <option value="gpt-4o-mini" className="bg-background">GPT-4o Mini (Fast/Cheap)</option>
                                            <option value="gpt-4o" className="bg-background">GPT-4o (Smart/Balanced)</option>
                                            <option value="o1-preview" className="bg-background">o1-preview (Advanced Reasoning)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Cloudinary Section */}
                        <section className="bg-surface/30 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md md:col-span-2">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                                <Cloud className="text-primary" size={20} />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">Storage Engine (Cloudinary)</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">Cloud Name</label>
                                    <input
                                        type="text"
                                        name="cloudinaryCloudName"
                                        value={config.cloudinaryCloudName}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary focus:outline-none transition-all"
                                        placeholder="Enter cloud name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">API Key</label>
                                    <input
                                        type="text"
                                        name="cloudinaryApiKey"
                                        value={config.cloudinaryApiKey}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary focus:outline-none transition-all"
                                        placeholder="Enter API key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-1">API Secret</label>
                                    <input
                                        type="password"
                                        name="cloudinaryApiSecret"
                                        value={config.cloudinaryApiSecret}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:border-primary focus:outline-none transition-all"
                                        placeholder="Enter API secret"
                                    />
                                </div>
                            </div>
                        </section>

                        {status === 'error' && (
                            <div className="md:col-span-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3">
                                <AlertCircle size={18} />
                                {errorMsg}
                            </div>
                        )}

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={status === 'saving'}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-secondary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {status === 'saving' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Syncing Vault...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Securely Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
