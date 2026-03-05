import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Trash2, UserPlus, ArrowLeft, Shield, Mail, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../config/api';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'admin') {
                fetchUsers();
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { 'Authorization': `Bearer ${token}` };
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/auth/all`, {
                headers: getAuthHeader()
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleDeleteUser = async (targetId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action is permanent.")) return;
        try {
            await axios.delete(`${API_BASE}/api/auth/${targetId}`, {
                headers: getAuthHeader()
            });
            setUsers(users.filter(u => u._id !== targetId));
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to delete user");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050510] relative overflow-hidden p-4 sm:p-8">
            {/* 🛸 Hyper-Premium Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex items-center justify-between mb-8 sm:mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        <h1 className="text-xl font-black text-white uppercase tracking-widest">Profile Identity</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* User Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl text-center"
                    >
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary p-[1px] shadow-2xl shadow-primary/20 transform rotate-3">
                                <div className="w-full h-full rounded-[2.45rem] bg-[#050510] flex items-center justify-center transform -rotate-3">
                                    <User size={50} className="text-white opacity-80" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center border-4 border-[#050510] shadow-xl text-white">
                                <Shield size={18} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">{user.name}</h2>
                        <div className="flex flex-col items-center gap-4 mt-4">
                            <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                Global {user.role} Authorization
                            </span>

                            <div className="w-full space-y-3 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all text-left">
                                    <div>
                                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Mail size={10} /> Email
                                        </p>
                                        <p className="text-white text-xs font-bold truncate max-w-[150px]">{user.email}</p>
                                    </div>
                                    <button className="text-[8px] font-black text-primary uppercase underline tracking-widest">Verify</button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all text-left">
                                    <div>
                                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Calendar size={10} /> Created
                                        </p>
                                        <p className="text-white text-xs font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full h-14 mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all group"
                            >
                                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                                Terminate Session
                            </button>
                        </div>
                    </motion.div>

                    {/* Actions & Management Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 space-y-8"
                    >
                        {/* Quick Actions */}
                        <div className="bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
                            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6 mb-1 opacity-60">Operations Center</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.role === 'admin' && (
                                    <Link to="/register" className="h-full">
                                        <button className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group p-4 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                                <UserPlus size={20} />
                                            </div>
                                            Generate Identity
                                        </button>
                                    </Link>
                                )}
                                {(user.role === 'admin' || user.role === 'marketing') && (
                                    <Link to="/deleted" className="h-full">
                                        <button className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group p-4 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                                <Trash2 size={20} />
                                            </div>
                                            Recycle Repository
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* User Management Table */}
                        {user.role === 'admin' && (
                            <div className="bg-surface/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Active nodes</h3>
                                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mt-1 opacity-60">System identity synchronization</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 border-white/5">
                                        <Shield size={22} />
                                    </div>
                                </div>

                                <div className="overflow-x-auto -mx-8 sm:-mx-10 px-8 sm:px-10">
                                    <table className="w-full text-left min-w-[400px]">
                                        <thead>
                                            <tr>
                                                <th className="pb-6 text-[9px] font-black text-muted uppercase tracking-widest border-b border-white/5">Subject Node</th>
                                                <th className="pb-6 text-[9px] font-black text-muted uppercase tracking-widest border-b border-white/5 px-4 hidden sm:table-cell text-center">Class</th>
                                                <th className="pb-6 text-[9px] font-black text-muted uppercase tracking-widest border-b border-white/5 text-right">Binary</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((u) => (
                                                <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted font-black text-xs uppercase border border-white/5 group-hover:border-primary/30 transition-colors">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-black text-xs tracking-tight">{u.name}</p>
                                                                <p className="text-muted text-[10px] font-medium opacity-60">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4 hidden sm:table-cell text-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' :
                                                            u.role === 'marketing' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                                                                'bg-white/5 border-white/10 text-muted'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            disabled={u._id === user.id || u._id === user._id || u.email === user.email}
                                                            className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white/5 text-muted hover:bg-red-500 hover:text-white border border-white/5 hover:border-red-400 transition-all duration-300 disabled:opacity-10 disabled:cursor-not-allowed transform active:scale-90"
                                                            title={u.email === user.email ? "Self-deletion blocked" : "Terminate Node"}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
