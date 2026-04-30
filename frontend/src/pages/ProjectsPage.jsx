import { useState, useEffect, useRef } from 'react';
import { Plus, Search, X, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#f59e0b','#10b981','#14b8a6','#3b82f6','#06b6d4'];
const STATUS_OPTS = ['active','on_hold','completed','archived'];
const PRIORITY_OPTS = ['low','medium','high','critical'];

function ProjectModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name:'', description:'', status:'active', priority:'medium', color:'#6366f1', startDate:'', dueDate:'', ...initial });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (initial) setForm(f => ({ ...f, ...initial })); }, [initial]);

  if (!open) return null;
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); } catch {} finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial?.id ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Website Redesign" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="What is this project about?" rows={3} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={set('status')}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={set('priority')}>
                  {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.startDate} onChange={set('startDate')} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={set('dueDate')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PROJECT_COLORS.map(c => (
                  <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: form.color === c ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (initial?.id ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/projects', { params }).then(r => setProjects(r.data.data.projects)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [search, statusFilter]);

  const handleCreate = async (form) => {
    await api.post('/projects', form);
    toast.success('Project created!');
    fetchProjects();
  };

  const handleEdit = async (form) => {
    await api.put(`/projects/${editProject.id}`, form);
    toast.success('Project updated!');
    setEditProject(null);
    fetchProjects();
  };

  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button id="new-project-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-ghost btn-icon" style={{ padding: 2 }} onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-title">No projects yet</div>
          <p className="empty-desc">Create your first project to start organizing tasks with your team.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(proj => (
            <div key={proj.id} className="project-card"
              style={{ '--project-color': proj.color }}
              onClick={() => navigate(`/projects/${proj.id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div className="project-name">{proj.name}</div>
                  <span className={`badge badge-${proj.status}`} style={{ fontSize: 10 }}>{proj.status.replace('_',' ')}</span>
                </div>
                <span className={`badge badge-${proj.priority}`}>{proj.priority}</span>
              </div>
              {proj.description && <p className="project-desc">{proj.description}</p>}
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${proj.taskCounts?.total ? Math.round(proj.taskCounts.done/proj.taskCounts.total*100) : 0}%` }} /></div>
              <div className="project-meta" style={{ marginTop: 12 }}>
                <div className="member-stack">
                  {(proj.members || []).slice(0, 4).map(m => (
                    <div key={m.id} className="avatar avatar-sm" title={m.name}>{getInitials(m.name)}</div>
                  ))}
                  {proj.members?.length > 4 && <div className="avatar avatar-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 10 }}>+{proj.members.length - 4}</div>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {proj.taskCounts?.total ?? 0} tasks · {proj.userRole}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
      <ProjectModal open={!!editProject} onClose={() => setEditProject(null)} onSave={handleEdit} initial={editProject} />
    </div>
  );
}
