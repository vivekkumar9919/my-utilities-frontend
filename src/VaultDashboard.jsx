import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Grid, Layout, Folder, Tag, Layers, Activity, Sparkles, Hash, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionCard from './components/SectionCard';
import AddItemModal from './components/AddItemModal';
import DataManagement from './components/DataManagement';
import api from './api';
import { useNavigate } from 'react-router-dom';

function VaultDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSections();
    }
  }, [user]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/data/sections');
      setSections(response.data);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  };

  const addSection = async (title, category) => {
    try {
      const response = await api.post('/data/sections', { title, category });
      setSections([response.data, ...sections]);
      setActiveCategory(category);
    } catch (err) {
      alert('Failed to add section');
    }
  };

  const deleteSection = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/data/sections/${id}`);
        setSections(sections.filter(s => s._id !== id));
      } catch (err) {
        alert('Failed to delete section');
      }
    }
  };

  const addItem = async (sectionId, label, value) => {
    try {
      const response = await api.post(`/data/sections/${sectionId}/items`, { label, value });
      setSections(sections.map(s => s._id === sectionId ? response.data : s));
    } catch (err) {
      alert('Failed to add item');
    }
  };

  const deleteItem = async (sectionId, itemId) => {
    try {
      const response = await api.delete(`/data/sections/${sectionId}/items/${itemId}`);
      setSections(sections.map(s => s._id === sectionId ? response.data : s));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const categories = ['All', ...new Set(sections.map(s => s.category || 'General'))];
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  const filteredSections = sections
    .filter(s => activeCategory === 'All' || (s.category || 'General') === activeCategory)
    .map(s => ({
      ...s,
      items: s.items.filter(i => 
        i.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(s => s.items.length > 0 || s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="app-container">
      <header style={{ marginBottom: '5rem' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Back to Portal
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1.25rem', width: '300px', borderRadius: '100px' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.75rem' }} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <button className="btn btn-secondary btn-icon" onClick={() => setIsDataModalOpen(true)} style={{ borderRadius: '100px' }}>
              <Download size={18} />
            </button>
          </div>
        </nav>

        <div style={{ textAlign: 'left' }}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}
          >
            OmniVault
          </motion.h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '600px' }}>
            A secure, minimalist command center for all your digital assets.
          </p>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Stats</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>{sections.length}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SECTIONS</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>{totalItems}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RESOURCES</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '1rem', textTransform: 'uppercase' }}>Filter</p>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <Hash size={16} />
              {cat}
            </button>
          ))}
          
          <button 
            className="btn btn-primary w-full justify-center" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> New Section
          </button>
        </aside>

        <main>
          {loading ? (
            <div style={{ padding: '4rem 0' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Syncing...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence mode="popLayout">
                {filteredSections.map((section, index) => (
                  <SectionCard 
                    key={section._id} 
                    section={section} 
                    onDeleteItem={deleteItem}
                    onAddItem={addItem}
                    onDeleteSection={deleteSection}
                    index={index}
                  />
                ))}
              </AnimatePresence>

              {!loading && filteredSections.length === 0 && (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '1rem' }}>
                  <p>No resources found in this category.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addSection}
        categories={categories.filter(c => c !== 'All')}
        type="section"
      />

      <DataManagement 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        data={sections}
        onImport={(newData) => alert('Bulk import is currently disabled.')}
      />
      
      <footer style={{ marginTop: '6rem', textAlign: 'left', color: 'var(--text-muted)', paddingBottom: '4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OmniVault v1.0 | Full-Stack Secured | Generic Asset Storage</p>
      </footer>
    </div>
  );
}

export default VaultDashboard;
