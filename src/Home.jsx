import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Layers, LogOut, User as UserIcon } from 'lucide-react';

const Home = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '3rem', padding: '1rem 0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="glass" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '100px' }}>
              <UserIcon size={14} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user ? user.split('@')[0] : 'User'}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onLogout} style={{ borderRadius: '100px', color: 'var(--danger)' }} title="Logout">
            <LogOut size={18} />
          </button>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Workspace Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Select a service to manage your career applications and digital assets.
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/jobs')}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              width: '320px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#6366f1' }}>
              <Briefcase size={48} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Job Tracker</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Track applications, monitor match scores, and manage your LinkedIn job funnel.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vault')}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              width: '320px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#10b981' }}>
              <Layers size={48} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>OmniVault</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              A secure command center for all your digital assets, links, and text snippets.
            </p>
          </motion.div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
        Workspace Portal &copy; {new Date().getFullYear()} | Integrated Dashboard
      </footer>
    </div>
  );
};

export default Home;
