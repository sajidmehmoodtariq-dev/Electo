import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Github, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(email, password);
            // Redirect based on status first, then other conditions
            if (user.status === 'pending') {
                navigate('/pending-approval');
            } else if (user.status === 'rejected') {
                navigate('/rejected');
            } else if (!user.cnic) {
                navigate('/complete-profile');
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'official') {
                navigate('/official');
            } else {
                navigate('/voter');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    const handleGithubLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/github`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Electo</h1>
                    <p className="text-purple-100">Welcome back! Please login to continue.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-100 ml-1">Email / Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-purple-200" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-purple-100">Password</label>
                            <Link to="/forgot-password" className="text-xs text-purple-200 hover:text-white transition-colors">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-purple-200" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                            <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-purple-100">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center px-4 py-3 border border-white/20 rounded-xl shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.536-6.033-5.696  c0-3.159,2.702-5.696,6.033-5.696c1.482,0,2.831,0.512,3.894,1.36l2.869-2.869C17.447,3.561,15.11,2.545,12.545,2.545  c-5.468,0-9.921,4.241-9.921,9.473c0,5.232,4.453,9.473,9.921,9.473c4.761,0,8.711-3.238,9.72-7.838h-9.72V10.239z" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={handleGithubLogin}
                            className="flex items-center justify-center px-4 py-3 border border-white/20 rounded-xl shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <Github className="h-5 w-5 mr-2" />
                            GitHub
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-purple-200">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-white hover:text-purple-100 transition-colors">
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
