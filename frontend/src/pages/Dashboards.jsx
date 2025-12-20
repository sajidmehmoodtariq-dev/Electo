import React from 'react';
import { useAuth } from '../context/AuthContext';

// AdminDashboard moved to './AdminDashboard.jsx'

export const OfficialDashboard = () => {
    const { logout } = useAuth();
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Official Dashboard</h1>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
    );
};

export const VoterDashboard = () => {
    const { logout } = useAuth();
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Voter Dashboard</h1>
            <p>Welcome, voter!</p>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded mt-4">Logout</button>
        </div>
    );
};
