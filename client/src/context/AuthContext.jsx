import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const loadUser = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth');
            setUser(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Load user error:", err);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
            loadUser();
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
