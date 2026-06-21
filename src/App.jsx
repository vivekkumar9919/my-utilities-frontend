import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './Home';
import JobsDashboard from './JobsDashboard';
import VaultDashboard from './VaultDashboard';

function MainApp() {
  const [user, setUser] = useState(localStorage.getItem('cp_user'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem('cp_user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    setUser(null);
    navigate('/');
  };

  const handleAuthSuccess = (data) => {
    setUser(data.email);
    navigate('/');
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
      <Route path="/jobs" element={<JobsDashboard user={user} onLogout={handleLogout} />} />
      <Route path="/vault" element={<VaultDashboard user={user} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
