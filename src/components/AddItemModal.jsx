import React, { useState } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddItemModal = ({ isOpen, onClose, onAdd, type, categories = [] }) => {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('General');
  const [isNewCategory, setIsNewCategory] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim(), category.trim() || 'General');
      setValue('');
      setCategory('General');
      setIsNewCategory(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.9)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(16px)'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass"
          style={{ 
            width: '90%', 
            maxWidth: '440px', 
            padding: '2.5rem', 
            position: 'relative',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            className="btn-icon btn-secondary" 
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Create Section</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>SECTION NAME</label>
              <input 
                autoFocus
                className="form-input"
                type="text" 
                placeholder="e.g. Technical Skills"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>CATEGORY</label>
                <button 
                  type="button" 
                  onClick={() => setIsNewCategory(!isNewCategory)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {isNewCategory ? 'Select Existing' : <><Plus size={12} /> New Category</>}
                </button>
              </div>

              {isNewCategory ? (
                <motion.input 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="form-input"
                  type="text" 
                  placeholder="Type new category name..."
                  value={category === 'General' ? '' : category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="General" style={{ background: '#1a1a1a' }}>General</option>
                    {categories.map(cat => (
                      cat !== 'General' && <option key={cat} value={cat} style={{ background: '#1a1a1a' }}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '1.1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
              Create Section
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddItemModal;
