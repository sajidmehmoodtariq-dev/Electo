import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

const PendingApproval = () => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-500/20 rounded-full">
                        <Clock className="h-12 w-12 text-yellow-300" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Account Pending</h1>
                <p className="text-purple-100 mb-8 leading-relaxed">
                    Your account has been created successfully but is currently pending approval from an administrator.
                    Please check back later.
                </p>

                <button
                    onClick={logout}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-white/20"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
