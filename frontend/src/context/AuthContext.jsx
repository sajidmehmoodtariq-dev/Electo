import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage
        const token = localStorage.getItem('token');

        // Check for token in URL (from Google Auth redirect)
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token');

        if (urlToken) {
            localStorage.setItem('token', urlToken);
            // Remove token from URL to clean it up
            window.history.replaceState({}, document.title, "/");
            try {
                const decoded = jwtDecode(urlToken);
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        } else if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry? jwt-decode helps. 
                // Ideally checking expiry is good.
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser(decoded);
        return decoded; // Return user info for redirect logic
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser(decoded);
        return decoded;
    }

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
