import React from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
    const { logout } = useAuth();
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
    );
};

export const OfficialDashboard = () => {
    const { logout } = useAuth();
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Official Dashboard</h1>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
    );
};

export const VoterDashboard = () => {
    const { logout } = useAuth();
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Voter Dashboard</h1>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
    );
};
