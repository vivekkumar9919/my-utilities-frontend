import React, { useState } from 'react';
import { Copy, Check, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionCard = ({ section, onAddItem, onDeleteItem, onDeleteSection, index }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(index === 0); // Expand the first one by default
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemLabel && newItemValue) {
      onAddItem(section._id, newItemLabel, newItemValue);
      setNewItemLabel('');
      setNewItemValue('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="glass" 
      style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isExpanded ? '1.5rem' : '0',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isExpanded ? '0 20px 40px -20px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {section.title.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{section.title}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
            {section.items.length} items
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn-icon btn-secondary" 
            onClick={(e) => { e.stopPropagation(); onDeleteSection(section._id); }}
            style={{ color: 'var(--danger)', padding: '0.4rem', background: 'none', border: 'none' }}
          >
            <Trash2 size={16} />
          </button>
          {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem' }}>
              {section.items.map((item) => (
                <div 
                  key={item._id} 
                  className="item-row"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '1rem', 
                    padding: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-icon btn-secondary"
                        onClick={() => handleCopy(item.value, item._id)}
                        style={{ 
                          color: copiedId === item._id ? 'var(--success)' : 'var(--text-main)',
                          padding: '0.4rem',
                          background: copiedId === item._id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        {copiedId === item._id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button 
                        className="btn-icon btn-secondary"
                        onClick={() => onDeleteItem(section._id, item._id)}
                        style={{ color: 'var(--danger)', padding: '0.4rem', background: 'rgba(239, 68, 68, 0.05)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-main)', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-all',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    lineHeight: '1.5',
                    opacity: 0.9
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}

              {!isAdding ? (
                <button 
                  className="btn btn-secondary w-full justify-center border-dashed" 
                  onClick={() => setIsAdding(true)}
                >
                  <Plus size={16} /> Add Item
                </button>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAdd} 
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <input 
                    className="form-input"
                    type="text" 
                    placeholder="Label (e.g. Portfolio)" 
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    autoFocus
                  />
                  <textarea 
                    className="form-input"
                    placeholder="Value or Template..." 
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    style={{ 
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary flex-1">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SectionCard;
