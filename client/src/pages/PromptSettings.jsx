import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE from '../config/api';

const PERSONAS = ['Architect', 'Brand', 'Student', 'Interior Designer', 'Default'];

export default function PromptSettings() {
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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xs uppercase tracking-[0.4em] text-muted">← Back to campaigns</Link>
                    <div className="text-sm text-muted">Prompt Control Center</div>
                </div>

                <section className="rounded-3xl border border-white/10 bg-surface/60 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-white">Master Prompt</h1>
                        <button
                            onClick={handleSave}
                            disabled={status === 'saving'}
                            className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/40 disabled:opacity-50"
                        >
                            {status === 'saving' ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                        Edit the core instruction that the generator applies to every persona. These changes are stored in the database so all future content uses the updated version.
                    </p>
                    <textarea
                        rows={8}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-background/50 p-4 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none"
                    />
                </section>

                <section className="rounded-3xl border border-white/10 bg-surface/60 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white">Persona Adjustments</h2>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-muted">Optional</span>
                    </div>
                    <div className="space-y-4">
                        {PERSONAS.map((persona) => (
                            <div key={persona} className="space-y-2 rounded-2xl border border-white/10 bg-background/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{persona}</p>
                                <textarea
                                    rows={3}
                                    value={notes[persona] || ''}
                                    onChange={(e) => handleNoteChange(persona, e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-background/50 p-3 text-sm text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </section>
                <section className="rounded-3xl border border-white/10 bg-surface/60 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white">Image Prompt & Persona Tone</h2>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-muted">Optional</span>
                    </div>
                    <div className="space-y-3">
                        <textarea
                            rows={4}
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-background/50 p-4 text-sm text-white focus:border-primary focus:outline-none"
                            placeholder="Use this area to craft the cinematic image brief that the AI receives."
                        />
                        <div className="space-y-4">
                            {PERSONAS.map((persona) => (
                                <div key={`img-${persona}`} className="space-y-2 rounded-2xl border border-white/10 bg-background/40 p-4">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{persona}</p>
                                    <textarea
                                        rows={3}
                                        value={imageNotes[persona] || ''}
                                        onChange={(e) => handleNoteChange(persona, e.target.value, 'image')}
                                        className="w-full rounded-xl border border-white/10 bg-background/50 p-3 text-sm text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
