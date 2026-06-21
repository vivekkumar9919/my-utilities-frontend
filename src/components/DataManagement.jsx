import React, { useRef } from 'react';
import { X, Download, Upload, AlertCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataManagement = ({ isOpen, onClose, data, onImport }) => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = React.useState(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copypaste-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('Exported successfully!');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const newData = JSON.parse(event.target.result);
          if (Array.isArray(newData)) {
            onImport(newData);
            setStatus('Imported successfully!');
            setTimeout(() => {
              setStatus(null);
              onClose();
            }, 2000);
          } else {
            throw new Error('Invalid format');
          }
        } catch (err) {
          alert('Failed to import: Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data));
    setStatus('JSON copied to clipboard!');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <AnimatePresence>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass"
          style={{ 
            width: '90%', 
            maxWidth: '500px', 
            padding: '2.5rem', 
            position: 'relative'
          }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            className="btn-icon btn-secondary" 
            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 800 }}>Data Backup</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Your data is securely synced to your account. You can still export it as a JSON file for local backups or to migrate your data manually.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExport}>
              <Download size={18} /> Export as JSON File
            </button>
            
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleImportClick}>
              <Upload size={18} /> Import JSON File
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleFileChange}
            />

            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCopyToClipboard}>
              <Copy size={18} /> Copy Raw JSON
            </button>
          </div>

          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '0.75rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--success)',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}
              >
                <Check size={16} /> {status}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.05)', 
            borderRadius: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--text-main)' }}>Warning:</strong> Importing a file will <span style={{ color: 'var(--danger)' }}>overwrite</span> your current data. Make sure you have a backup if needed.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DataManagement;
