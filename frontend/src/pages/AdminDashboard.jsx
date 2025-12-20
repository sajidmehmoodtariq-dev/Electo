import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Check, X, Search, User, Filter, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'users'
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const status = activeTab === 'requests' ? 'pending' : '';
            const { data } = await api.get(`/admin/users${status ? `?status=${status}` : ''}`);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/users/${id}/status`, { status: 'active' });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Failed to approve", error);
        }
    };

    const handleRejectClick = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        try {
            await api.put(`/admin/users/${selectedUser._id}/status`, {
                status: 'rejected',
                rejectionReason
            });
            setModalOpen(false);
            setRejectionReason('');
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        Admin Dashboard
                    </h1>
                </div>
                <button onClick={logout} className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
            </header>

            {/* Container */}
            <div className="container mx-auto p-6 max-w-6xl">

                {/* Tabs */}
                <div className="flex space-x-6 mb-8 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        New Requests
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        User Management
                        {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full"></div>}
                    </button>
                </div>

                {/* Content */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-700 text-xs uppercase text-gray-400 tracking-wider">
                                    <th className="p-4 pl-6">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">CNIC</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    user.role === 'official' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 font-mono text-sm">
                                            {user.cnic || <span className="text-gray-600">N/A</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    user.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            {user.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(user._id)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Approve">
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleRejectClick(user)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Reject">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            {user.status === 'active' && user.role !== 'admin' && ( // Don't reject admins easily
                                                <button onClick={() => handleRejectClick(user)} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs border border-red-500/20">
                                                    Ban / Reject
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Reject User</h3>
                        <p className="text-gray-400 mb-4 text-sm">
                            Please provide a reason for rejecting <span className="text-white font-medium">{selectedUser?.name}</span>'s account. This will be visible to them.
                        </p>
                        <textarea
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-6 h-32"
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
