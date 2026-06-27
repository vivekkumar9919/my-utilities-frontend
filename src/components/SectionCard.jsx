import React, { useState } from 'react';
import { Copy, Check, Trash2, Plus, ChevronDown, ChevronUp, Pencil, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionCard = ({ section, onAddItem, onDeleteItem, onDeleteSection, onOpenEditSection, onEditItem, dragHandleProps, index }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(index === 0); // Expand the first one by default
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemTag, setNewItemTag] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Edit Item State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemLabel, setEditItemLabel] = useState('');
  const [editItemValue, setEditItemValue] = useState('');
  const [editItemTag, setEditItemTag] = useState('');

  // Hash function to assign a consistent hue to a tag
  const getTagColor = (tagStr) => {
    if (!tagStr) return 'var(--accent)';
    let hash = 0;
    for (let i = 0; i < tagStr.length; i++) {
      hash = tagStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemLabel && newItemValue) {
      onAddItem(section._id, newItemLabel, newItemValue, newItemTag);
      setNewItemLabel('');
      setNewItemValue('');
      setNewItemTag('');
      setIsAdding(false);
    }
  };

  const handleEditItemSubmit = (e, itemId) => {
    e.preventDefault();
    if (editItemLabel && editItemValue) {
      onEditItem(section._id, itemId, editItemLabel, editItemValue, editItemTag);
      setEditingItemId(null);
    }
  };

  const startEditingItem = (item) => {
    setEditingItemId(item._id);
    setEditItemLabel(item.label);
    setEditItemValue(item.value);
    setEditItemTag(item.tag || '');
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
          cursor: 'pointer',
          paddingBottom: isExpanded ? '1rem' : '0',
          borderBottom: isExpanded ? '1px solid var(--border-glass)' : '1px solid transparent',
          transition: 'all 0.2s'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="section-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            {...dragHandleProps} 
            style={{ 
              cursor: 'grab', 
              display: 'flex', 
              alignItems: 'center', 
              color: 'var(--text-muted)',
              marginRight: '-0.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={20} />
          </div>
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
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!isExpanded) setIsExpanded(true);
              setIsAdding(true); 
            }}
            title="Add Item"
            style={{ color: 'var(--text-primary)', padding: '0.4rem', background: 'none', border: 'none' }}
          >
            <Plus size={16} />
          </button>
          <button 
            className="btn-icon btn-secondary" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onOpenEditSection(section);
            }}
            title="Edit Section"
            style={{ color: 'var(--text-primary)', padding: '0.4rem', background: 'none', border: 'none' }}
          >
            <Pencil size={16} />
          </button>
          <button 
            className="btn-icon btn-secondary" 
            onClick={(e) => { e.stopPropagation(); onDeleteSection(section._id); }}
            title="Delete Section"
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
                  {editingItemId === item._id ? (
                    <motion.form 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={(e) => handleEditItemSubmit(e, item._id)} 
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input 
                          className="form-input"
                          type="text" 
                          placeholder="Label" 
                          value={editItemLabel}
                          onChange={(e) => setEditItemLabel(e.target.value)}
                          style={{ flex: 2 }}
                          autoFocus
                        />
                        <input 
                          className="form-input"
                          type="text" 
                          placeholder="Tag" 
                          value={editItemTag}
                          onChange={(e) => setEditItemTag(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                      <textarea 
                        className="form-input"
                        placeholder="Value..." 
                        value={editItemValue}
                        onChange={(e) => setEditItemValue(e.target.value)}
                        style={{ minHeight: '100px', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingItemId(null)}>Cancel</button>
                      </div>
                    </motion.form>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.label}
                      </span>
                      {item.tag && (
                        <span 
                          className="tag-pill" 
                          style={{ 
                            backgroundColor: `${getTagColor(item.tag)}20`, // 20% opacity hex approximation
                            color: getTagColor(item.tag),
                            border: `1px solid ${getTagColor(item.tag)}40`
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>
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
                          onClick={() => startEditingItem(item)}
                          style={{ color: 'var(--text-main)', padding: '0.4rem', background: 'rgba(255,255,255,0.05)' }}
                          title="Edit Item"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="btn-icon btn-secondary"
                          onClick={() => onDeleteItem(section._id, item._id)}
                          style={{ color: 'var(--danger)', padding: '0.4rem', background: 'rgba(239, 68, 68, 0.05)' }}
                          title="Delete Item"
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
                  </>
                )}
                </div>
              ))}

              {isAdding && (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAdd} 
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input 
                      className="form-input"
                      type="text" 
                      placeholder="Label (e.g. Portfolio)" 
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      style={{ flex: 2 }}
                      autoFocus
                    />
                    <input 
                      className="form-input"
                      type="text" 
                      placeholder="Tag (optional)" 
                      value={newItemTag}
                      onChange={(e) => setNewItemTag(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
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
