import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, UserCircle } from 'lucide-react';
import api from '../utils/api';
import { validateCnic, formatCnic } from '../utils/validators';

const CompleteProfile = () => {
    const { user } = useAuth(); // Get user from context, if available
    const [cnic, setCnic] = useState('');
    const [role, setRole] = useState('voter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Start loading to verify user state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                // Fetch fresh user data from backend
                const { data } = await api.get('/auth/me');

                // Pre-fill data if exists
                if (data.cnic) setCnic(data.cnic);
                if (data.role && ['voter', 'official', 'admin'].includes(data.role)) setRole(data.role);

                // If user already has CNIC and this page is visited, redirect?
                // The user request says "if cnic and role exists it should skip that page and redirect to dashboard"
                // But we need to make sure we don't prevent them from fixing it if they landed here explicitly?
                // Usually this page is guarded. If guarded, we redirect if satisfied.
                if (data.cnic && data.role) {
                    // Update local token just in case
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        // Use location reload to ensure Context updates fully without issues
                        // Or navigate if we trust context update?
                        // Let's rely on RedirectHandler logic in App.jsx via reload or navigate
                        // navigate('/') might trigger App redirect.
                    }
                    window.location.href = '/';
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch user status", err);
                setLoading(false);
                // If 401, they will be kicked out by protected route anyway
            }
        };

        fetchUserStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cnicError = validateCnic(cnic);
        if (cnicError) {
            setError(cnicError);
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.put('/auth/profile', { cnic, role });
            // Update token with the new one containing CNIC
            localStorage.setItem('token', data.token);
            // Force reload to ensure App.jsx reads the new token permissions
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                Loading profile...
            </div>
        );
    }

    const isAdmin = role === 'admin' || (user && user.role === 'admin');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Complete Profile</h1>
                    <p className="text-purple-100">Please provide additional details to continue.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-100 ml-1">CNIC</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-5 w-5 text-purple-200" />
                            </div>
                            <input
                                type="text"
                                value={cnic}
                                onChange={(e) => setCnic(formatCnic(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                placeholder="12345-1234567-1"
                                maxLength="15"
                                required
                            />
                        </div>
                    </div>

                    {!isAdmin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-100 ml-1">Select Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('voter')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === 'voter'
                                            ? 'bg-white/20 border-white text-white shadow-lg'
                                            : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                                        }`}
                                >
                                    <UserCircle className="h-8 w-8 mb-2" />
                                    <span className="font-semibold">Voter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('official')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === 'official'
                                            ? 'bg-white/20 border-white text-white shadow-lg'
                                            : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                                        }`}
                                >
                                    <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-semibold">Official</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
