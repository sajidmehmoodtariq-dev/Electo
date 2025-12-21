import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, MapPin, Lock, Save, AlertCircle, ArrowLeft, Upload, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateCnic, formatCnic } from '../utils/validators';

const Profile = () => {
    const { user, login } = useAuth(); // login not used directly but context update might happen via reload

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cnic: '',
        city: '',
        province: '',
        password: '',
        confirmPassword: '',
    });

    // Add missing state
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'];
    const cityOptions = {
        'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'],
        'Sindh': ['Karachi', 'Hyderabad', 'Sukkur'],
        'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan'],
        'Balochistan': ['Quetta', 'Gwadar']
    };

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                cnic: user.cnic || '',
                city: user.city || '',
                province: user.province || '',
            }));
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cnic') {
            setFormData({ ...formData, [name]: formatCnic(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, avatar: file }));
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        if (formData.cnic) {
            const cnicError = validateCnic(formData.cnic);
            if (cnicError) {
                setMessage({ type: 'error', text: cnicError });
                setLoading(false);
                return;
            }
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.cnic) data.append('cnic', formData.cnic);
            if (formData.city) data.append('city', formData.city);
            if (formData.province) data.append('province', formData.province);

            if (formData.password) {
                data.append('password', formData.password);
            }
            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            const response = await api.put('/auth/profile', data);

            // Update local token to reflect changes immediately if token was refreshed
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Force a reload to update header avatar
                window.location.reload();
            }

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            // Clear password fields
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center">
                    <Link to="/" className="text-white/80 hover:text-white transition-colors mr-4">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="bg-white/10 backdrop-blur-md px-8 py-6 border-b border-white/20">
                        <div className="flex items-center space-x-6">
                            <div className="relative group">
                                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-indigo-600 uppercase border-4 border-indigo-400 overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-white text-xl font-bold">{user?.name}</h2>
                                <p className="text-indigo-100">{user?.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-indigo-500 text-white text-xs rounded-full uppercase font-bold tracking-wider">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <AlertCircle className="h-5 w-5 mr-3" />
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="col-span-full">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2">Personal Information</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-white/60" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-white/60" />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="pl-10 block w-full bg-white/5 border border-white/20 text-white/70 cursor-not-allowed rounded-lg shadow-sm py-2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">CNIC (Identity)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-white/60 font-bold text-xs">ID</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="cnic"
                                        value={formData.cnic}
                                        onChange={handleChange}
                                        placeholder="12345-1234567-1"
                                        maxLength="15"
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5"
                                    />
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="col-span-full mt-2">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2">Location Details</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">Province</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-white/60" />
                                    </div>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5"
                                    >
                                        <option value="" className="bg-gray-800">Select Province</option>
                                        {provinces.map(p => <option key={p} value={p} className="bg-gray-800">{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">City</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-white/60" />
                                    </div>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!formData.province}
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5 disabled:bg-white/5 disabled:cursor-not-allowed"
                                    >
                                        <option value="" className="bg-gray-800">Select City</option>
                                        {formData.province && cityOptions[formData.province]?.map(c => (
                                            <option key={c} value={c} className="bg-gray-800">{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="col-span-full mt-2">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2">Security</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/60" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/60" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="pl-10 block w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 rounded-lg shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50 py-2.5"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-8 py-3 border border-white/20 rounded-xl shadow-lg text-base font-bold text-white bg-white/20 backdrop-blur-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
