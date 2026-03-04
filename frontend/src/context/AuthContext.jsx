import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
                // Optional: verify token with backend here
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const { data } = await axios.post('/api/users', { name, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put('/api/users/profile', userData, config);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Update failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
