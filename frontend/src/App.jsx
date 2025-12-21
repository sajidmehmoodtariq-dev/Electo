import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PendingApproval from './pages/PendingApproval';
import Rejected from './pages/Rejected';
import CompleteProfile from './pages/CompleteProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OfficialDashboard from './pages/OfficialDashboard';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard';

const RedirectHandler = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check CNIC first
        if (!user.cnic) {
          navigate('/complete-profile');
          return;
        }

        // Check Status
        if (user.status === 'rejected') {
          navigate('/rejected');
          return;
        }
        if (user.status === 'pending' || user.isApproved === false) {
          navigate('/pending-approval');
          return;
        }

        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'official') navigate('/official');
        else navigate('/voter');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return <div className="flex justify-center items-center h-screen text-white bg-gray-900">Loading...</div>;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/rejected" element={<Rejected />} />
          <Route path="/auth/success" element={<RedirectHandler />} />

          {/* Protected Profile Completion */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'official', 'voter']} />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<RedirectHandler />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['official']} />}>
            <Route path="/official" element={<OfficialDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['voter', 'admin', 'official']} />}>
            <Route path="/voter" element={<VoterDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
