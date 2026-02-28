import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Unlock, RefreshCw } from 'lucide-react';
import API_BASE from '../config/api';

export default function IdeaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState(null);
    const [user, setUser] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const [persona, setPersona] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${API_BASE}/api/ideas/${id}`, config);
                setIdea(res.data);
                if (res.data.personas && res.data.personas.length > 0) {
                    setPersona(res.data.personas[0]);
                } else {
                    setPersona('');
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchIdea();
    }, [id]);

    const handleLockToggle = async () => {
        if (!idea) return;
        setIsLocking(true);
        try {
            const token = localStorage.getItem('token');
            const nextState = !idea.isLocked;
            await axios.put(`${API_BASE}/api/ideas/${idea._id}/lock`, {
                isLocked: nextState,
                lockedData: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdea(prev => ({ ...prev, isLocked: nextState }));
        } catch (err) {
            console.error('Lock toggle failed:', err);
            alert(err.response?.data?.msg || 'Failed to update lock status');
        } finally {
            setIsLocking(false);
        }
    };

    if (!idea) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading strategy…</div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs xs:text-base"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="text-right flex-1 xs:ml-8">
                        <span className="text-xs text-muted uppercase tracking-widest font-bold">Marketing Strategy Workspace</span>
                    </div>
                </header>

                <section className="bg-surface/30 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleLockToggle}
                            disabled={isLocking}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/40 border disabled:opacity-70 disabled:cursor-wait ${idea.isLocked
                                ? 'bg-green-500 text-white border-green-400 shadow-green-500/20'
                                : 'bg-red-500 text-white border-red-400 shadow-red-500/20'}`}
                        >
                            {isLocking
                                ? <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                                : idea.isLocked
                                    ? <><Lock size={14} /> Strategy Locked</>
                                    : <><Unlock size={14} /> Strategy Unlocked</>
                            }
                        </button>
                    </div>

                    <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight break-words pt-4">
                        {idea.content.split(' - ')[0]}
                    </p>
                    {persona && (
                        <div className="mt-6 flex justify-center">
                            <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-muted">
                                <span className="text-[0.55rem] font-black text-primary">Persona</span>
                                <span className="text-sm text-white normal-case tracking-normal">{persona}</span>
                            </span>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
