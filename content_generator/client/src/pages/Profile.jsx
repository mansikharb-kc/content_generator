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
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-xl font-black text-white uppercase tracking-tighter">User Profile</h1>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 mb-4 shadow-xl shadow-primary/20">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                <User size={40} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Mail size={12} /> Email Address
                                </p>
                                <p className="text-white font-bold">{user.email}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Calendar size={12} /> Account Created
                                </p>
                                <p className="text-white font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest mb-4">Account Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {user.role === 'admin' && (
                                    <Link to="/register">
                                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary/20 transition-all group">
                                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                            Create User
                                        </button>
                                    </Link>
                                )}
                                {(user.role === 'admin' || user.role === 'marketing') && (
                                    <Link to="/deleted">
                                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all group">
                                            <Trash2 size={20} className="text-red-400 group-hover:scale-110 transition-transform" />
                                            Recycle Bin
                                        </button>
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:col-span-2 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all mt-4 group"
                                >
                                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── ADMIN: USER MANAGEMENT ── */}
                {user.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-surface/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">System Users</h3>
                                <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">Manage platform access and roles</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Shield size={20} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest">User Details</th>
                                        <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest hidden sm:table-cell">Role</th>
                                        <th className="pb-4 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u._id} className="group transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted font-bold text-xs uppercase">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm leading-none">{u.name}</p>
                                                        <p className="text-muted text-xs mt-1">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 hidden sm:table-cell">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' :
                                                    u.role === 'marketing' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                                                        'bg-white/5 border-white/10 text-muted'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    disabled={u._id === user.id || u._id === user._id || u.email === user.email}
                                                    className="p-2 rounded-lg bg-white/5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed group-hover:scale-105"
                                                    title={u.email === user.email ? "Cannot delete yourself" : "Delete User"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
