import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, CheckCircle, Clock, Trophy, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import UserDropdown from '../components/UserDropdown';

const VoterDashboard = () => {
    const { logout, user } = useAuth();
    const [elections, setElections] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
    const [loading, setLoading] = useState(false);

    // Vote Modal State
    const [selectedElection, setSelectedElection] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState('');
    const [voteModalOpen, setVoteModalOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);

    // Results Modal State
    const [resultsModalOpen, setResultsModalOpen] = useState(false);
    const [resultsElection, setResultsElection] = useState(null);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const { data } = await api.get('/elections');
            setElections(data);
        } catch (error) {
            console.error("Failed to fetch elections", error);
        }
    };

    const handleVoteClick = (election) => {
        setSelectedElection(election);
        setSelectedCandidateId('');
        setVoteModalOpen(true);
    };

    const handleResultsClick = (election) => {
        setResultsElection(election);
        setResultsModalOpen(true);
    };

    const handleConfirmVote = async () => {
        if (!selectedCandidateId) return;

        setVoteLoading(true);
        try {
            await api.put(`/elections/${selectedElection._id}/vote`, {
                candidateId: selectedCandidateId
            });
            // Success
            alert("Vote cast successfully!");
            setVoteModalOpen(false);
            setConfirmationOpen(false);
            fetchElections(); // Refresh to update status
        } catch (error) {
            alert(error.response?.data?.message || 'Voting failed');
        } finally {
            setVoteLoading(false);
        }
    };

    const isEligible = (election) => {
        if (election.type === 'National') return true;
        if (election.type === 'Provincial') return election.targetProvince === user?.province;
        if (election.type === 'City' || election.type === 'City Wide') return election.targetCity === user?.city;
        return true; // Fallback for any other type
    };

    const hasVoted = (election) => {
        // Check if user ID is in election voters list
        return election.voters.includes(user?._id);
    };

    const getWinner = (election) => {
        if (!election.candidates || election.candidates.length === 0) return null;
        // Sort by votes desc
        const sorted = [...election.candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        // Check for tie? For now just return top
        return sorted[0];
    };

    const filteredElections = elections.filter(election => {
        const eligible = isEligible(election);
        // Explicitly exclude Inactive elections from Voter Dashboard unless we want a history tab
        if (election.status === 'Inactive') return false;

        if (activeTab === 'active') return eligible && (election.status === 'Active' || election.status === 'Upcoming');
        return eligible && election.status === 'Completed';
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-800">Voter Dashboard</h1>
                <UserDropdown />
            </header>

            <main className="p-8 max-w-5xl mx-auto">
                <div className="flex space-x-6 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-4 px-4 text-base font-medium transition-colors relative ${activeTab === 'active' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        Active Elections
                        {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`pb-4 px-4 text-base font-medium transition-colors relative ${activeTab === 'completed' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        Results / Completed
                        {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredElections.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500">No {activeTab} elections found for your location.</p>
                        </div>
                    ) : filteredElections.map(election => (
                        <div key={election._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${election.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {election.status}
                                    </span>
                                    <span className="text-gray-500 text-sm font-medium">{election.type}</span>
                                    {election.targetCity && <span className="text-gray-400 text-sm">• {election.targetCity}</span>}
                                    {election.targetProvince && <span className="text-gray-400 text-sm">• {election.targetProvince}</span>}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{election.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(election.date).toLocaleDateString()}
                                    <Clock className="h-4 w-4 ml-4 mr-2" />
                                    {new Date(election.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(election.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            <div className="mt-4 md:mt-0">
                                {hasVoted(election) && activeTab === 'active' ? (
                                    <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold flex items-center cursor-default">
                                        <CheckCircle className="h-5 w-5 mr-2" /> Voted
                                    </div>
                                ) : activeTab === 'active' ? (
                                    <button
                                        onClick={() => handleVoteClick(election)}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Vote Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleResultsClick(election)}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center"
                                    >
                                        <BarChart3 className="h-5 w-5 mr-2" /> View Results
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Vote Ballot Modal */}
            {voteModalOpen && selectedElection && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Official Ballot Paper</h3>
                            <p className="text-gray-500 text-sm">{selectedElection.title} - {selectedElection.type}</p>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                {selectedElection.candidates.map(candidate => (
                                    <label key={candidate._id} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCandidateId === candidate._id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input
                                            type="radio"
                                            name="candidate"
                                            value={candidate._id}
                                            checked={selectedCandidateId === candidate._id}
                                            onChange={() => setSelectedCandidateId(candidate._id)}
                                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <img
                                            src={candidate.photo || "https://via.placeholder.com/150"}
                                            alt={candidate.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm ml-4"
                                        />
                                        <div className="ml-4">
                                            <h4 className="font-bold text-gray-900 text-lg">{candidate.name}</h4>
                                            <p className="text-indigo-600 font-medium">{candidate.party}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={() => setVoteModalOpen(false)}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => selectedCandidateId && setConfirmationOpen(true)}
                                disabled={!selectedCandidateId}
                                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmationOpen && selectedElection && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-3xl">⚠️</div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Vote</h3>
                        <p className="text-gray-500 mb-8">
                            Are you sure you want to cast your vote for <span className="font-bold text-indigo-600">{selectedElection.candidates.find(c => c._id === selectedCandidateId)?.name}</span>?
                            <br /><span className="text-xs text-red-500 font-bold mt-2 block">This action cannot be undone.</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmationOpen(false)}
                                className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmVote}
                                disabled={voteLoading}
                                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-colors flex justify-center items-center"
                            >
                                {voteLoading ? 'Casting...' : 'Confirm Vote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Modal */}
            {resultsModalOpen && resultsElection && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">Election Results</h3>
                                <p className="text-gray-500">{resultsElection.title}</p>
                            </div>
                            <button onClick={() => setResultsModalOpen(false)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                                <LogOut className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {/* Winner Section */}
                            {getWinner(resultsElection) && (
                                <div className="mb-12 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Trophy className="h-64 w-64" />
                                    </div>
                                    <Trophy className="h-16 w-16 mb-4 text-yellow-300" />
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-100 mb-2">Elected Winner</h4>
                                    <div className="relative">
                                        <img
                                            src={getWinner(resultsElection).photo}
                                            alt="Winner"
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mb-4"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                            {getWinner(resultsElection).voteCount} Votes
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-1">{getWinner(resultsElection).name}</h2>
                                    <p className="text-indigo-100 font-medium">{getWinner(resultsElection).party}</p>
                                </div>
                            )}

                            {/* Chart Section */}
                            <div className="h-80 w-full mb-8">
                                <h4 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Detailed Results</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resultsElection.candidates}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="voteCount" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={60}>
                                            {resultsElection.candidates.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoterDashboard;
