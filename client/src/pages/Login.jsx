import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 rounded-2xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full bg-background/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Email Address"
                        type="email"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        className="w-full bg-background/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Password"
                        type="password"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity">
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-muted">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
}
