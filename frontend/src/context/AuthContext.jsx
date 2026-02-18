import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Set axios defaults for credentials
    axios.defaults.withCredentials = true;

    const checkAuth = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/protected');
            setIsAuthenticated(true);
            setUser(res.data.user);
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            await axios.post('http://localhost:5000/api/auth/login', { email, password });
            await checkAuth(); // Re-check auth to set user and state
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout');
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout error', err);
            // Even if error, clear state
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
