import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Calendar, Users, Upload, CheckCircle, Clock } from 'lucide-react';

const OfficialDashboard = () => {
    const { logout, user } = useAuth();
    const [elections, setElections] = useState([]);
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'create-step-1', 'create-step-2'
    const [currentElectionId, setCurrentElectionId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [electionData, setElectionData] = useState({
        title: '',
        type: 'National',
        date: '',
        targetCity: '',
        targetProvince: ''
    });

    const cities = ['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
    const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'];

    const [candidateData, setCandidateData] = useState({
        name: '',
        party: '',
        photo: null
    });
    const [addedCandidates, setAddedCandidates] = useState([]);

    useEffect(() => {
        if (activeView === 'dashboard') {
            fetchElections();
        }
    }, [activeView]);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingElection, setEditingElection] = useState(null);

    const handleEditClick = (election) => {
        setEditingElection({
            ...election,
            // Format date for input "YYYY-MM-DD"
            date: new Date(election.date).toISOString().split('T')[0]
        });
        setEditModalOpen(true);
    };

    const handleUpdateElection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/elections/${editingElection._id}`, {
                title: editingElection.title,
                type: editingElection.type,
                date: editingElection.date,
                targetCity: editingElection.targetCity,
                targetProvince: editingElection.targetProvince,
                isCancelled: editingElection.isCancelled
            });
            setEditModalOpen(false);
            setEditingElection(null);
            fetchElections();
            alert("Election details updated.");
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchElections = async () => {
        try {
            const { data } = await api.get('/elections');
            setElections(data);
        } catch (error) {
            console.error("Failed to fetch elections", error);
        }
    };

    const handleCreateElection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/elections', electionData);
            setCurrentElectionId(data._id);
            setActiveView('create-step-2');
            setAddedCandidates([]); // Reset for new election
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create election');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        if (!candidateData.photo) return alert("Please upload a photo");

        setLoading(true);
        const formData = new FormData();
        formData.append('name', candidateData.name);
        formData.append('party', candidateData.party);
        formData.append('photo', candidateData.photo);

        try {
            const { data } = await api.post(`/elections/${currentElectionId}/candidates`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update local list (backend returns updated election)
            setAddedCandidates(data.candidates);
            setCandidateData({ name: '', party: '', photo: null });

            // Reset file input manually if needed
            document.getElementById('candidate-photo').value = '';
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add candidate');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        setActiveView('dashboard');
        setCurrentElectionId(null);
        setElectionData({ title: '', type: 'National', date: '' });
    };

    const handleFileChange = (e) => {
        setCandidateData({ ...candidateData, photo: e.target.files[0] });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Official Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-500 text-sm">Welcome, {user?.name}</span>
                    <button onClick={logout} className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {activeView === 'dashboard' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-semibold text-gray-700">Managed Elections</h2>
                            <button
                                onClick={() => setActiveView('create-step-1')}
                                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Create Election
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {elections.map(election => (
                                <div key={election._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${election.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                election.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                    election.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {election.status}
                                            </span>
                                            <span className="text-gray-400 text-xs text-right">
                                                {election.type}
                                                {election.targetCity && ` - ${election.targetCity}`}
                                                {election.targetProvince && ` - ${election.targetProvince}`}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">{election.title}</h3>
                                        <div className="flex items-center text-gray-500 text-sm mb-4">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(election.date).toLocaleDateString()} ({election.year})
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Users className="h-4 w-4 mr-2" />
                                            {election.candidates.length} Candidates
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {new Date(election.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(election.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button
                                            onClick={() => handleEditClick(election)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {elections.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-400">
                                    No elections found. Create one to get started.
                                </div>
                            )}
                        </div>
                        {/* Edit Modal */}
                        {editModalOpen && editingElection && (
                            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                                    <h2 className="text-xl font-bold mb-4">Manage Election</h2>

                                    {/* Tabs or Sections */}
                                    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                                        {/* Section 1: Details */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h3 className="font-bold text-gray-700 mb-3">Election Details</h3>
                                            <form onSubmit={handleUpdateElection} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-3 py-2 border rounded-lg"
                                                        value={editingElection.title}
                                                        onChange={(e) => setEditingElection({ ...editingElection, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Date</label>
                                                        <input
                                                            type="date"
                                                            required
                                                            min={new Date().toISOString().split('T')[0]}
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                            value={editingElection.date}
                                                            onChange={(e) => setEditingElection({ ...editingElection, date: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Status</label>
                                                        <label className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                                                            <input
                                                                type="checkbox"
                                                                checked={editingElection.isCancelled}
                                                                onChange={(e) => setEditingElection({ ...editingElection, isCancelled: e.target.checked })}
                                                                className="w-5 h-5 text-red-600 rounded"
                                                            />
                                                            <span className="text-gray-700 font-medium">Mark as Inactive</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {editingElection.type === 'City' && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Target City</label>
                                                        <select
                                                            required
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                            value={editingElection.targetCity || ''}
                                                            onChange={(e) => setEditingElection({ ...editingElection, targetCity: e.target.value })}
                                                        >
                                                            <option value="">Select City</option>
                                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                )}

                                                {editingElection.type === 'Provincial' && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Target Province</label>
                                                        <select
                                                            required
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                            value={editingElection.targetProvince || ''}
                                                            onChange={(e) => setEditingElection({ ...editingElection, targetProvince: e.target.value })}
                                                        >
                                                            <option value="">Select Province</option>
                                                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 text-sm"
                                                    >
                                                        {loading ? 'Saving...' : 'Update Details'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Section 2: Candidates */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h3 className="font-bold text-gray-700 mb-3">Manage Candidates</h3>

                                            {/* List Existing */}
                                            <div className="mb-4 space-y-2">
                                                {editingElection.candidates && editingElection.candidates.length > 0 ? (
                                                    editingElection.candidates.map((c, i) => (
                                                        <div key={i} className="flex items-center p-2 bg-white rounded border border-gray-200">
                                                            <img src={c.photo} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                                                            <div className="ml-3">
                                                                <p className="text-sm font-bold">{c.name}</p>
                                                                <p className="text-xs text-gray-500">{c.party}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No candidates yet.</p>
                                                )}
                                            </div>

                                            {/* Add New */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <h4 className="text-sm font-bold text-gray-600 mb-2">Add New Candidate</h4>
                                                <div className="space-y-3">
                                                    <input
                                                        placeholder="Name"
                                                        className="w-full px-3 py-2 text-sm border rounded"
                                                        value={candidateData.name}
                                                        onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
                                                    />
                                                    <input
                                                        placeholder="Party"
                                                        className="w-full px-3 py-2 text-sm border rounded"
                                                        value={candidateData.party}
                                                        onChange={(e) => setCandidateData({ ...candidateData, party: e.target.value })}
                                                    />
                                                    <input
                                                        type="file"
                                                        className="w-full text-sm"
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            if (!candidateData.photo || !candidateData.name || !candidateData.party) return alert("All fields required");
                                                            setLoading(true);
                                                            const formData = new FormData();
                                                            formData.append('name', candidateData.name);
                                                            formData.append('party', candidateData.party);
                                                            formData.append('photo', candidateData.photo);
                                                            try {
                                                                const { data } = await api.post(`/elections/${editingElection._id}/candidates`, formData, {
                                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                                });
                                                                setEditingElection(data); // Update local state with new candidate
                                                                setCandidateData({ name: '', party: '', photo: null });
                                                                alert("Candidate added!");
                                                            } catch (e) {
                                                                alert("Failed to add candidate");
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                        className="w-full py-2 bg-gray-800 text-white rounded text-sm font-bold hover:bg-gray-900"
                                                    >
                                                        {loading ? 'Adding...' : 'Add Candidate'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-right">
                                        <button
                                            onClick={() => setEditModalOpen(false)}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeView === 'create-step-1' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Election</h2>
                            <p className="text-gray-500">Step 1: Define Election Details</p>
                        </div>

                        <form onSubmit={handleCreateElection} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Election Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="e.g., General Election 2024"
                                        value={electionData.title}
                                        onChange={(e) => setElectionData({ ...electionData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Election Type</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            value={electionData.type}
                                            onChange={(e) => setElectionData({ ...electionData, type: e.target.value })}
                                        >
                                            <option value="National">National</option>
                                            <option value="Provincial">Provincial</option>
                                            <option value="City">City Wide</option>
                                        </select>
                                    </div>

                                    {electionData.type === 'City' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Target City</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                                value={electionData.targetCity}
                                                onChange={(e) => setElectionData({ ...electionData, targetCity: e.target.value })}
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {electionData.type === 'Provincial' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Province</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                                value={electionData.targetProvince}
                                                onChange={(e) => setElectionData({ ...electionData, targetProvince: e.target.value })}
                                            >
                                                <option value="">Select Province</option>
                                                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                            value={electionData.date}
                                            onChange={(e) => setElectionData({ ...electionData, date: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Voting hours automatically set to 08:00 - 17:00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveView('dashboard')}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Next: Add Candidates'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeView === 'create-step-2' && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Form */}
                        <div className="lg:col-span-1">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Add Candidates</h2>
                                <p className="text-gray-500 text-sm">Step 2: Register candidates for this election.</p>
                            </div>

                            <form onSubmit={handleAddCandidate} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={candidateData.name}
                                            onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="Candidate Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Party / Affiliation</label>
                                        <input
                                            type="text"
                                            required
                                            value={candidateData.party}
                                            onChange={(e) => setCandidateData({ ...candidateData, party: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="e.g., Independent, PTI"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Photo</label>
                                        <div className="relative border-dashed border-2 border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                id="candidate-photo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                            <span className="text-xs text-gray-500">
                                                {candidateData.photo ? candidateData.photo.name : 'Click to upload'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Candidate'}
                                </button>
                            </form>

                            <button
                                onClick={handleFinish}
                                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" /> Finish & Publish
                            </button>
                        </div>

                        {/* Right: List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                                    Registered Candidates ({addedCandidates.length})
                                </h3>

                                {addedCandidates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                        <Users className="h-12 w-12 mb-2 opacity-20" />
                                        <p>No candidates added yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addedCandidates.map((c, idx) => (
                                            <div key={idx} className="flex items-center p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                                <img
                                                    src={c.photo} // Cloudinary URL
                                                    alt={c.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                                <div className="ml-4">
                                                    <h4 className="font-bold text-gray-800">{c.name}</h4>
                                                    <p className="text-sm text-gray-500">{c.party}</p>
                                                </div>
                                                {/* Could add remove button here later if needed */}
                                                <div className="ml-auto">
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">vote count: 0</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OfficialDashboard;
