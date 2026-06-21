import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck, Sparkles, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await api.post(endpoint, { email, password });
      
      localStorage.setItem('cp_token', response.data.token);
      localStorage.setItem('cp_user', response.data.email);
      onAuthSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#0a0a0c'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '4rem 3rem', 
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '1.5rem'
          }}>
            <Fingerprint size={28} color="black" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
            Workspace Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            {isLogin ? 'Sign in to access your tools.' : 'Create your workspace account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>EMAIL</label>
            <input 
              type="email" 
              className="glass"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '1rem', color: 'white', outline: 'none', border: '1px solid var(--glass-border)', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PASSWORD</label>
            <input 
              type="password" 
              className="glass"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '1rem', color: 'white', outline: 'none', border: '1px solid var(--glass-border)', fontSize: '0.95rem' }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? "New here?" : "Joined already?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'white', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
