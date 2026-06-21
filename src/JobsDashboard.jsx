import React, { useState, useEffect, useRef } from 'react';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import api from './api';
import { 
  MoreVertical, 
  Search, 
  Calendar, 
  MapPin, 
  Briefcase, 
  User, 
  FileText, 
  ExternalLink, 
  X, 
  Check,
  Pencil,
  Filter,
  Sliders, 
  TrendingUp, 
  FileQuestion, 
  CheckCircle2, 
  AlertCircle,
  Link,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_KEYS = [
  { key: 'job_id', label: 'Job ID', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'work_location', label: 'Location', sortable: true },
  { key: 'work_style', label: 'Style', sortable: true },
  { key: 'experience_required', label: 'Exp (Yrs)', sortable: true },
  { key: 'skills', label: 'Skills Needed', sortable: true },
  { key: 'hr_name', label: 'HR Name', sortable: true },
  { key: 'hr_link', label: 'HR Profile', sortable: false },
  { key: 'resume', label: 'Resume', sortable: true },
  { key: 'reposted', label: 'Reposted', sortable: true },
  { key: 'date_listed', label: 'Date Listed', sortable: true },
  { key: 'date_applied', label: 'Date Applied', sortable: true },
  { key: 'job_link', label: 'Job Link', sortable: false },
  { key: 'application_link', label: 'Apply Link', sortable: false },
  { key: 'connect_request', label: 'Connect Status', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'eligible', label: 'Eligible', sortable: true },
  { key: 'score_reason', label: 'Score Reason', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'questions_list', label: 'Questions', sortable: false }
];

const DEFAULT_VISIBLE_KEYS = ALL_KEYS.reduce((acc, current) => {
  // Hide some columns by default to avoid initial horizontal clutter
  const hideByDefault = ['description', 'questions_list', 'job_id', 'hr_link', 'reposted', 'connect_request'];
  acc[current.key] = !hideByDefault.includes(current.key);
  return acc;
}, {});

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Applied': return 'rgba(16, 185, 129, 0.15)'; // Success-light
    case 'Awaiting': return 'rgba(245, 158, 11, 0.15)'; // Warning-light
    case 'No Interested': return 'rgba(239, 68, 68, 0.15)'; // Danger-light
    case 'In Development':
    default:
      return 'rgba(255, 255, 255, 0.05)'; // Muted / Default
  }
};

const getStatusTextColor = (status) => {
  switch (status) {
    case 'Applied': return '#34d399'; // Green
    case 'Awaiting': return '#fbbf24'; // Orange/Yellow
    case 'No Interested': return '#f87171'; // Red
    case 'In Development':
    default:
      return '#94a3b8'; // Slate
  }
};

function JobsDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, appliedCount: 0, avgScore: 0, eligibleCount: 0, styleBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [connectStatusFilter, setConnectStatusFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  
  // Multi-select state
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  
  // UI State
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };
  
  // Checklist sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(() => {
    const saved = localStorage.getItem('visible_job_keys_table');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_KEYS;
  });

  const sidebarRef = useRef(null);

  // Inline date editor state
  const [editingJobId, setEditingJobId] = useState(null);
  const [editDateValue, setEditDateValue] = useState('');

  // Start editing applied date
  const startEditingDate = (job) => {
    const jobId = job._id?.$oid || job._id;
    setEditingJobId(jobId);
    
    // Set default value for the HTML5 date input (expects YYYY-MM-DD format)
    const currentDate = job.date_applied && job.date_applied !== 'Pending' ? job.date_applied : '';
    setEditDateValue(currentDate);
  };

  // Save updated applied date to MongoDB
  const saveDateApplied = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}`, { date_applied: editDateValue || 'Pending' });

      // Update local state directly
      setJobs(prevJobs => prevJobs.map(job => {
        const currentId = job._id?.$oid || job._id;
        if (currentId === jobId) {
          return { ...job, date_applied: editDateValue || 'Pending' };
        }
        return job;
      }));

      // Re-fetch stats as total/rate might change (e.g. if we have applied vs pending count logic later)
      const statsRes = await api.get(`/stats`);
      setStats(statsRes.data);

      setEditingJobId(null);
      showToast('Date updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not update date. Please ensure the backend server is running.', 'error');
    }
  };

  // Update connection request status directly in MongoDB
  const updateConnectRequest = async (jobId, newStatus) => {
    try {
      const bodyPayload = { connect_request: newStatus };
      
      // Auto-populate date_applied if changing to Applied
      if (newStatus === 'Applied') {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        bodyPayload.date_applied = `${yyyy}-${mm}-${dd}`;
      }

      await api.patch(`/jobs/${jobId}`, bodyPayload);

      // Update local state directly for responsive UI
      setJobs(prevJobs => prevJobs.map(job => {
        const id = job._id?.$oid || job._id;
        if (id === jobId) {
          return { ...job, ...bodyPayload };
        }
        return job;
      }));

      // Re-fetch stats as counters might change
      const statsRes = await api.get(`/stats`);
      setStats(statsRes.data);
      showToast('Status updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not update status. Please ensure the backend server is running.', 'error');
    }
  };

  // Delete a job application from MongoDB and state
  const deleteJob = (jobId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job Application',
      message: 'Are you sure you want to permanently delete this job application? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.delete(`/jobs/${jobId}`);

          // Remove from local jobs state
          setJobs(prevJobs => prevJobs.filter(job => {
            const id = job._id?.$oid || job._id;
            return id !== jobId;
          }));

          // Re-fetch stats
          const statsRes = await api.get(`/stats`);
          setStats(statsRes.data);
          showToast('Job deleted successfully', 'success');
        } catch (err) {
          console.error(err);
          showToast('Could not delete job. Please ensure the backend server is running.', 'error');
        }
      }
    });
  };

  const deleteSelectedJobs = () => {
    if (selectedJobIds.size === 0) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Delete Jobs',
      message: `Are you sure you want to permanently delete ${selectedJobIds.size} selected jobs? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await api.post(`/jobs/bulk-delete`, { ids: Array.from(selectedJobIds) });

          // Clear selection and re-fetch
          setSelectedJobIds(new Set());
          fetchData();
          showToast(`${selectedJobIds.size} jobs deleted successfully`, 'success');
        } catch (err) {
          console.error(err);
          showToast('Could not delete selected jobs.', 'error');
        }
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setConnectStatusFilter('all');
    setMinScoreFilter('all');
    setEligibilityFilter('all');
    showToast('Filters cleared', 'info');
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === jobs.length && jobs.length > 0) {
      setSelectedJobIds(new Set());
    } else {
      const allIds = jobs.map(job => job._id?.$oid || job._id || job.job_id);
      setSelectedJobIds(new Set(allIds));
    }
  };

  const toggleSelectJob = (jobId) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  // Fetch jobs data & stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsUrl = `/jobs?sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&connectStatus=${connectStatusFilter}&minScore=${minScoreFilter}&eligibility=${eligibilityFilter}`;
      const statsUrl = `/stats`;
      
      const [jobsRes, statsRes] = await Promise.all([
        api.get(jobsUrl),
        api.get(statsUrl)
      ]);

      const jobsData = jobsRes.data;
      const statsData = statsRes.data;

      setJobs(jobsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure the backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy, sortOrder, searchTerm, statusFilter, connectStatusFilter, minScoreFilter, eligibilityFilter]);

  // Persist settings in local storage
  useEffect(() => {
    localStorage.setItem('visible_job_keys_table', JSON.stringify(visibleKeys));
  }, [visibleKeys]);

  // Handle outside click to close drawer
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.icon-button.menu')) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckboxChange = (key) => {
    setVisibleKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAllKeys = (visible) => {
    const updated = {};
    ALL_KEYS.forEach(k => {
      updated[k.key] = visible;
    });
    setVisibleKeys(updated);
  };

  const handleHeaderClick = (key, sortable) => {
    if (!sortable) return;
    if (sortBy === key) {
      // Toggle order
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc'); // Default to descending when changing keys
    }
  };

  const isVisible = (key) => visibleKeys[key] === true;

  // Render cell contents formatted and limited with tooltips
  const renderCellContent = (key, value, job) => {
    if (value === undefined || value === null) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;

    switch (key) {
      case 'title':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-title" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{value}</span>
            <div className="cell-tooltip"><strong>Job Title:</strong><br />{value}</div>
          </div>
        );

      case 'company':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-company" style={{ fontWeight: '500' }}>{value}</span>
            <div className="cell-tooltip"><strong>Company:</strong><br />{value}</div>
          </div>
        );

      case 'work_location':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-location">
              <MapPin size={12} inline="true" style={{ marginRight: '3px', verticalAlign: 'text-bottom', color: 'var(--text-muted)' }} />
              {value}
            </span>
            <div className="cell-tooltip"><strong>Location:</strong><br />{value}</div>
          </div>
        );

      case 'work_style':
        return <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}>{value}</span>;

      case 'experience_required':
        return <span>{value} yrs</span>;

      case 'skills':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-skills">
              {value.split(',').map((s, i) => (
                <span key={i} className="skill-tag">{s.trim()}</span>
              ))}
            </span>
            <div className="cell-tooltip">
              <strong>Skills Needed:</strong><br />
              {value.split(',').map((s, i) => (
                <div key={i} style={{ margin: '3px 0' }}>• {s.trim()}</div>
              ))}
            </div>
          </div>
        );

      case 'hr_name':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-generic">
              <User size={12} style={{ marginRight: '3px', verticalAlign: 'text-bottom', color: 'var(--text-muted)' }} />
              {value}
            </span>
            <div className="cell-tooltip"><strong>HR Recruiter Name:</strong><br />{value}</div>
          </div>
        );

      case 'hr_link':
        return value !== 'Unknown' ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="icon-link" title="Open HR Profile">
            <User size={14} />
          </a>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
        );

      case 'resume':
        return (
          <span style={{ color: value === 'Pending' ? 'var(--warning)' : 'var(--text-primary)' }}>
            <FileText size={12} style={{ marginRight: '3px', verticalAlign: 'text-bottom', opacity: 0.7 }} />
            {value}
          </span>
        );

      case 'reposted':
        return <span>{value ? 'Yes' : 'No'}</span>;

      case 'date_listed':
        const dateListedOnly = value.split(' ')[0];
        return (
          <div className="cell-value-wrapper">
            <span>
              <Calendar size={12} style={{ marginRight: '3px', verticalAlign: 'text-bottom', color: 'var(--text-muted)' }} />
              {dateListedOnly}
            </span>
            <div className="cell-tooltip"><strong>Date Listed:</strong><br />{value}</div>
          </div>
        );

      case 'date_applied':
        const jobId = job._id?.$oid || job._id;
        const isEditing = editingJobId === jobId;

        if (isEditing) {
          return (
            <div className="date-edit-container">
              <input 
                type="date" 
                value={editDateValue} 
                onChange={(e) => setEditDateValue(e.target.value)}
                className="date-edit-input"
              />
              <button 
                className="edit-action-btn save" 
                onClick={() => saveDateApplied(jobId)}
                title="Save Date"
              >
                <Check size={14} />
              </button>
              <button 
                className="edit-action-btn cancel" 
                onClick={() => setEditingJobId(null)}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '110px' }}>
            <span style={{ color: value === 'Pending' ? 'var(--text-muted)' : 'var(--success)', fontWeight: value !== 'Pending' ? '600' : 'normal' }}>
              {value}
            </span>
            <button 
              className="edit-trigger-btn" 
              onClick={() => startEditingDate(job)}
              title="Edit Applied Date"
            >
              <Pencil size={12} />
            </button>
          </div>
        );

      case 'job_link':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="icon-link" title="LinkedIn Job URL">
            <ExternalLink size={14} />
          </a>
        );

      case 'application_link':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="icon-link" title="Apply External URL" style={{ color: 'var(--accent)' }}>
            <Link size={14} />
          </a>
        );

      case 'connect_request':
        const currentJobId = job._id?.$oid || job._id;
        return (
          <select
            value={value || 'In Development'}
            onChange={(e) => updateConnectRequest(currentJobId, e.target.value)}
            className="cell-status-select"
            style={{
              backgroundColor: getStatusBgColor(value),
              color: getStatusTextColor(value),
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              fontSize: '0.75rem',
              cursor: 'pointer',
              outline: 'none',
              width: '130px',
              transition: 'var(--transition)'
            }}
          >
            <option value="In Development" style={{ backgroundColor: '#101726', color: '#f8fafc' }}>Not Applied</option>
            <option value="Applied" style={{ backgroundColor: '#101726', color: '#f8fafc' }}>Applied</option>
            <option value="Awaiting" style={{ backgroundColor: '#101726', color: '#f8fafc' }}>Awaiting</option>
            <option value="No Interested" style={{ backgroundColor: '#101726', color: '#f8fafc' }}>Not Interested</option>
          </select>
        );

      case 'score':
        const isHigh = value >= 8;
        return (
          <span className={`pill-badge ${isHigh ? 'score-high' : value < 5 ? 'score-low' : 'score-medium'}`}>
            {value} / 10
          </span>
        );

      case 'eligible':
        return (
          <span className={`pill-badge ${value ? 'eligible-true' : 'eligible-false'}`}>
            {value ? 'Eligible' : 'Not Eligible'}
          </span>
        );

      case 'score_reason':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-reason">{value}</span>
            <div className="cell-tooltip" style={{ maxWidth: '320px' }}>
              <strong>Match Evaluation:</strong><br />
              {value}
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-desc">{value}</span>
            <div className="cell-tooltip" style={{ maxWidth: '400px', maxHeight: '250px', overflowY: 'auto' }}>
              <strong>Job Description:</strong><br />
              {value}
            </div>
          </div>
        );

      case 'questions_list':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="cell-value-wrapper">
              <span className="pill-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                {value.length} Questions
              </span>
              <div className="cell-tooltip">
                <strong>Application Questions:</strong><br />
                {value.map((q, idx) => (
                  <div key={idx} style={{ margin: '5px 0' }}>{idx + 1}. {q}</div>
                ))}
              </div>
            </div>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>None</span>;

      default:
        return (
          <div className="cell-value-wrapper">
            <span className="cell-truncate w-generic">{String(value)}</span>
            <div className="cell-tooltip">{String(value)}</div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <nav style={{ display: 'flex', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} /> Back to Portal
        </button>
      </nav>

      <header className="dashboard-header">
        <div className="brand-section">
          <h1>Applied Jobs Database</h1>
          <p>Real-time analytics and tracking dashboard</p>
        </div>
        

      </header>

      {/* Connection error */}
      {error && (
        <div style={{
          background: 'var(--danger-light)', 
          border: '1px solid var(--danger)', 
          borderRadius: '12px', 
          padding: '1rem 1.5rem', 
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle color="var(--danger)" />
          <div>
            <strong>Backend Connection Error:</strong> {error}
            <button 
              onClick={fetchData} 
              style={{
                background: 'var(--danger)',
                border: 'none',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                marginLeft: '1rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Stats Board */}
      {!loading && !error && (
        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-icon-wrapper total">
              <Briefcase size={22} />
            </div>
            <div className="stat-info">
              <h3>Applied / Total Jobs</h3>
              <div className="stat-value">
                {stats.appliedCount} <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>/ {stats.totalJobs}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper score">
              <TrendingUp size={22} />
            </div>
            <div className="stat-info">
              <h3>Average Match Score</h3>
              <div className="stat-value">{stats.avgScore} / 10</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper eligible">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <h3>Eligible Jobs</h3>
              <div className="stat-value">
                {stats.eligibleCount} <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>({stats.totalJobs > 0 ? Math.round((stats.eligibleCount / stats.totalJobs) * 100) : 0}%)</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper onsite">
              <Calendar size={22} style={{ color: '#22d3ee' }} />
            </div>
            <div className="stat-info">
              <h3>Pending Applications</h3>
              <div className="stat-value">
                {stats.totalJobs - stats.appliedCount}
              </div>
            </div>
          </div>
        </section>
      )}


      <div className="controls-section" style={{ margin: '0 0 1.5rem 0', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        {/* Search bar */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search roles, companies, skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="status-filter-wrapper">
          <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={connectStatusFilter}
            onChange={(e) => setConnectStatusFilter(e.target.value)}
            className="status-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="In Development">Not Applied</option>
            <option value="Applied">Applied</option>
            <option value="Awaiting">Awaiting</option>
            <option value="No Interested">Not Interested</option>
          </select>
        </div>

        {/* Score Filter */}
        <div className="status-filter-wrapper">
          <TrendingUp size={15} style={{ color: 'var(--text-secondary)' }} />
          <label htmlFor="score-filter">Score:</label>
          <select
            id="score-filter"
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(e.target.value)}
            className="status-filter-select"
          >
            <option value="all">All Scores</option>
            <option value="5">&ge; 5</option>
            <option value="7">&ge; 7</option>
          </select>
        </div>

        {/* Eligibility Filter */}
        <div className="status-filter-wrapper">
          <CheckCircle2 size={15} style={{ color: 'var(--text-secondary)' }} />
          <label htmlFor="eligibility-filter">Eligibility:</label>
          <select
            id="eligibility-filter"
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="status-filter-select"
          >
            <option value="all">All Jobs</option>
            <option value="eligible">Eligible Only</option>
            <option value="not_eligible">Not Eligible</option>
          </select>
        </div>

        {/* Application Status Filter */}
        <div className="status-filter-wrapper">
          <Briefcase size={15} style={{ color: 'var(--text-secondary)' }} />
          <label htmlFor="app-status-filter">App Status:</label>
          <select
            id="app-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter-select"
          >
            <option value="all">All Jobs ({stats.totalJobs})</option>
            <option value="applied">Applied ({stats.appliedCount})</option>
            <option value="pending">Pending ({stats.totalJobs - stats.appliedCount})</option>
          </select>
        </div>

        {selectedJobIds.size > 0 && (
          <button 
            className="icon-button"
            onClick={deleteSelectedJobs}
            title={`Delete ${selectedJobIds.size} Selected Jobs`}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <Trash2 size={16} />
          </button>
        )}

        <div style={{ flex: 1 }}></div>

        <button 
          className="icon-button clear"
          onClick={clearFilters}
          title="Clear all filters"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Clear Filters
        </button>

        {/* 3 dots menu button */}
        <button 
          className="icon-button menu" 
          onClick={() => setIsSidebarOpen(true)}
          title="Configure Visible Columns"
        >
          <MoreVertical size={20} />
        </button>
      </div>
      {/* Main Jobs Display in List Table */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Fetching records from MongoDB...</p>
        </div>
      ) : (
        <div className="table-outer-wrapper">
          <div className="table-scroll-container">
            {jobs.length > 0 ? (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th className="sticky-sno-header" style={{ left: '0px', padding: '0.75rem 0.5rem', zIndex: 30, width: '35px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedJobIds.size === jobs.length && jobs.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th className="sticky-sno-header" style={{ left: '35px' }}>S.No</th>
                    {ALL_KEYS.map(({ key, label, sortable }) => {
                      if (!isVisible(key)) return null;
                      const isSorted = sortBy === key;
                      return (
                        <th 
                          key={key} 
                          className={sortable ? 'sortable' : ''}
                          onClick={() => handleHeaderClick(key, sortable)}
                        >
                          {label}
                          {sortable && isSorted && (
                            <span className="sort-indicator">
                              {sortOrder === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                          {sortable && !isSorted && (
                            <span className="sort-indicator" style={{ opacity: 0.15 }}>
                              ▼
                            </span>
                          )}
                        </th>
                      );
                    })}
                    <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => {
                    const rowId = job._id?.$oid || job._id || job.job_id || Math.random().toString();
                    return (
                      <tr key={rowId} className={selectedJobIds.has(rowId) ? 'selected-row' : ''}>
                        <td className="sticky-sno" style={{ left: '0px', padding: '0.75rem 0.5rem', background: selectedJobIds.has(rowId) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)', zIndex: 10, width: '35px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedJobIds.has(rowId)}
                            onChange={() => toggleSelectJob(rowId)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td className="sticky-sno" style={{ left: '35px', fontWeight: '600', color: 'var(--text-primary)', background: selectedJobIds.has(rowId) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)' }}>
                          {index + 1}
                        </td>
                        {ALL_KEYS.map(({ key }) => {
                          if (!isVisible(key)) return null;
                          return (
                            <td key={key}>
                              {renderCellContent(key, job[key], job)}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => deleteJob(rowId)}
                            className="icon-button"
                            title="Delete Job"
                            style={{
                              padding: '0.4rem',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '6px',
                              color: 'var(--danger)',
                              margin: '0 auto',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'var(--transition)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--danger)';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.borderColor = 'var(--danger)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                              e.currentTarget.style.color = 'var(--danger)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                <FileQuestion size={48} className="no-results-icon" />
                <h3>No Jobs Found</h3>
                <p>Try refining your search keyword or check the backend MongoDB database collection.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      <div 
        className={`checklist-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer Configuration */}
      <aside 
        ref={sidebarRef} 
        className={`checklist-drawer ${isSidebarOpen ? 'open' : ''}`}
      >
        <div className="drawer-header">
          <h2>Configure Columns</h2>
          <button className="drawer-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-actions">
          <button className="drawer-action-btn" onClick={() => selectAllKeys(true)}>
            Show All
          </button>
          <button className="drawer-action-btn" onClick={() => selectAllKeys(false)}>
            Hide All
          </button>
        </div>

        <div className="checklist-items">
          {ALL_KEYS.map(({ key, label }) => (
            <label key={key} className="checklist-item">
              <input 
                type="checkbox" 
                checked={!!visibleKeys[key]} 
                onChange={() => handleCheckboxChange(key)}
                className="checklist-checkbox"
              />
              <span className="checklist-label">{label}</span>
            </label>
          ))}
        </div>
      </aside>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default JobsDashboard;
