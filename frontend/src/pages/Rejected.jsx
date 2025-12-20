import React from 'react';
import { useAuth } from '../context/AuthContext';
import { XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Rejected = () => {
    const { logout } = useAuth();
    const location = useLocation();

    // Attempt to get reason from location state or query params if passed
    // But ideally it should be in the user object context if we updated it
    // However, if we redirect from login, we might pass it.
    // Let's assume the user object in context has the latest info OR we pass via URL.
    // AuthController passes `reason` in query param for social login.
    // For normal login, we get it in the response.

    const searchParams = new URLSearchParams(location.search);
    const reasonFromUrl = searchParams.get('reason');

    // If not in URL, maybe check local storage or user object (but user object might be null if we don't set it for rejected?)
    // Actually, `loginUser` returns the user data even if rejected (we don't block login based on status in controller).
    // So AuthContext `user` should have it directly.

    // We need to access `user` from context, but `Rejected` page might be shown when user is logged in.
    const { user } = useAuth();

    const reason = user?.rejectionReason || reasonFromUrl || "No specific reason provided.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/20 rounded-full">
                        <XCircle className="h-12 w-12 text-red-200" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Account Rejected</h1>
                <p className="text-red-100 mb-6 leading-relaxed">
                    Your account application has been rejected by the administrator.
                </p>

                <div className="bg-black/20 rounded-xl p-4 mb-8 text-left">
                    <p className="text-xs text-red-200 uppercase font-bold tracking-wider mb-1">Reason</p>
                    <p className="text-white italic">"{reason}"</p>
                </div>

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

export default Rejected;
