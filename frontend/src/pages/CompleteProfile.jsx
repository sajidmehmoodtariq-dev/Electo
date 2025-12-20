import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import api from '../utils/api';

const CompleteProfile = () => {
    const [cnic, setCnic] = useState('');
    const [error, setError] = useState('');
    const { user, login } = useAuth(); // We might need to refresh user state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', { cnic });
            // After successful update, we need to refresh the local user state or force a re-login/redirect
            // Since we don't have a "refreshUser" method in context yet (except login/register), 
            // we will force a location reload or better, update context.
            // For now, let's redirect to 'auth/success' which handles token/role parsing again if we get a new token.
            // But API returns new token.

            // Simpler: Redirect to a handler that refreshes? 
            // Or just manual refresh for now.
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Complete Profile</h1>
                    <p className="text-purple-100">Please enter your CNIC to continue.</p>
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
                                onChange={(e) => setCnic(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                placeholder="00000-0000000-0"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Save & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
