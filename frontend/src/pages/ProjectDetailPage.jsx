import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Users, Settings, Trash2, ChevronLeft, UserPlus } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['todo','in_progress','in_review','done'];
const LABEL = { todo:'To Do', in_progress:'In Progress', in_review:'In Review', done:'Done' };
const PRIORITY_OPTS = ['low','medium','high','critical'];
const COL_COLORS = { todo:'var(--text-muted)', in_progress:'var(--info)', in_review:'var(--warning)', done:'var(--success)' };
const getInitials = (name='') => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const fmtDate = d => { if (!d) return ''; const p = parseISO(d); return isValid(p) ? format(p,'MMM d') : ''; };
const isPast = d => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));

// ---------- Task Modal ----------
function TaskModal({ open, onClose, onSave, initial, members }) {
  const [form, setForm] = useState({ title:'', description:'', status:'todo', priority:'medium', dueDate:'', assigneeId:'', estimatedHours:'', tags:'' });
  useEffect(() => { if (initial) setForm({ ...form, ...initial, tags: (initial.tags||[]).join(', '), dueDate: initial.dueDate||'' }); }, [initial]);
  if (!open) return null;
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const handleSubmit = async e => {
    e.preventDefault();
    await onSave({ ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [], estimatedHours: form.estimatedHours ? +form.estimatedHours : null, assigneeId: form.assigneeId || null });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial?.id ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={set('title')} placeholder="What needs to be done?" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3} value={form.description} onChange={set('description')} placeholder="Add more context..."/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={set('status')}>
                  {STATUSES.map(s=><option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={set('priority')}>
                  {PRIORITY_OPTS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-select" value={form.assigneeId} onChange={set('assigneeId')}>
                  <option value="">Unassigned</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={set('dueDate')}/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Est. Hours</label>
                <input type="number" min="0" step="0.5" className="form-input" value={form.estimatedHours} onChange={set('estimatedHours')} placeholder="0"/>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={set('tags')} placeholder="bug, frontend, api"/>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial?.id ? 'Save' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Add Member Modal ----------
function AddMemberModal({ open, onClose, onAdd }) {
  const [email, setEmail] = useState(''); const [role, setRole] = useState('member'); const [loading, setLoading] = useState(false);
  if (!open) return null;
  const handleSubmit = async e => { e.preventDefault(); setLoading(true); try { await onAdd(email, role); onClose(); setEmail(''); } finally { setLoading(false); } };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h2>Add Member</h2><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="colleague@company.com" required/></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="member">Member</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Adding...':'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [taskModal, setTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [userRole, setUserRole] = useState('member');

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setProject(pRes.data.data.project);
      setUserRole(pRes.data.data.userRole);
      setTasks(tRes.data.data.tasks);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const handleCreateTask = async (form) => { await api.post(`/projects/${projectId}/tasks`, form); toast.success('Task created!'); fetchAll(); };
  const handleEditTask = async (form) => { await api.put(`/projects/${projectId}/tasks/${editTask.id}`, form); toast.success('Task updated!'); setEditTask(null); fetchAll(); };
  const handleDeleteTask = async (taskId) => { if (!confirm('Delete this task?')) return; await api.delete(`/projects/${projectId}/tasks/${taskId}`); toast.success('Deleted'); fetchAll(); };
  const handleStatusChange = async (taskId, status) => { await api.put(`/projects/${projectId}/tasks/${taskId}`, { status }); fetchAll(); };
  const handleAddMember = async (email, role) => { await api.post(`/projects/${projectId}/members`, { email, role }); toast.success('Member added!'); fetchAll(); };
  const handleRemoveMember = async (memberId) => { if (!confirm('Remove member?')) return; await api.delete(`/projects/${projectId}/members/${memberId}`); toast.success('Member removed'); fetchAll(); };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const members = project?.members || [];
  const isAdmin = userRole === 'admin';
  const isOwner = project?.ownerId === user?.id;

  if (loading) return <div className="page loading-page" style={{ minHeight: '60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t=>t.status===s) }), {});

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}><ChevronLeft size={15}/> Projects</button>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:12, height:12, borderRadius:'50%', background:project.color }}/>
            <h1 style={{ fontSize:22, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{project.name}</h1>
            <span className={`badge badge-${project.status}`}>{project.status.replace('_',' ')}</span>
            <span className={`badge badge-${project.priority}`}>{project.priority}</span>
          </div>
          {project.description && <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>{project.description}</p>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setMemberModal(true)}><UserPlus size={14}/> Add Member</button>}
          {isOwner && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject} title="Delete Project"><Trash2 size={14}/></button>}
          <button className="btn btn-primary btn-sm" onClick={() => setTaskModal(true)}><Plus size={14}/> New Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 32px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
        <div className="tabs" style={{ marginBottom:0, borderBottom:'none' }}>
          {['board','list','members'].map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page">
        {/* BOARD VIEW */}
        {tab === 'board' && (
          <div className="board-container">
            {STATUSES.map(status => (
              <div key={status} className="board-column">
                <div className="column-header">
                  <div className="column-title">
                    <span style={{ width:8, height:8, borderRadius:'50%', background:COL_COLORS[status], display:'inline-block' }}/>
                    {LABEL[status]}
                  </div>
                  <span className="column-count">{tasksByStatus[status].length}</span>
                </div>
                <div className="column-tasks">
                  {tasksByStatus[status].map(task => (
                    <div key={task.id} className="task-card" onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {isAdmin && <button className="btn btn-ghost btn-icon" style={{ padding:2 }} onClick={e=>{e.stopPropagation();handleDeleteTask(task.id)}}><Trash2 size={13}/></button>}
                      </div>
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta" style={{ marginTop:8 }}>
                        {task.assignee && <div className="avatar avatar-sm" title={task.assignee.name}>{getInitials(task.assignee.name)}</div>}
                        {task.dueDate && <span className={`task-due ${isPast(task.dueDate) && task.status!=='done'?'overdue':''}`}>{fmtDate(task.dueDate)}</span>}
                      </div>
                      <div style={{ marginTop:8, display:'flex', gap:4 }}>
                        {STATUSES.filter(s=>s!==status).map(s=>(
                          <button key={s} onClick={e=>{e.stopPropagation();handleStatusChange(task.id,s)}}
                            className="btn btn-ghost btn-sm" style={{ fontSize:10, padding:'2px 6px', color:'var(--text-muted)' }}
                            title={`Move to ${LABEL[s]}`}>→{LABEL[s]}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm w-full" style={{ border:'1px dashed var(--border)', justifyContent:'center', marginTop:4 }}
                    onClick={()=>setTaskModal(true)}><Plus size={13}/> Add</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {tab === 'list' && (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {tasks.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks yet</div><p className="empty-desc">Create your first task for this project.</p></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id} style={{ cursor:'pointer' }} onClick={()=>navigate(`/projects/${projectId}/tasks/${task.id}`)}>
                        <td style={{ maxWidth:280 }}><div style={{ fontWeight:600, marginBottom:2 }}>{task.title}</div>{task.tags?.length>0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{task.tags.map(t=><span key={t} style={{ fontSize:10, background:'var(--bg-elevated)', padding:'1px 6px', borderRadius:4, color:'var(--text-muted)' }}>{t}</span>)}</div>}</td>
                        <td><span className={`badge badge-${task.status}`}>{LABEL[task.status]}</span></td>
                        <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                        <td>{task.assignee ? <div style={{ display:'flex', alignItems:'center', gap:6 }}><div className="avatar avatar-sm">{getInitials(task.assignee.name)}</div><span style={{ fontSize:13 }}>{task.assignee.name}</span></div> : <span style={{ color:'var(--text-muted)', fontSize:13 }}>Unassigned</span>}</td>
                        <td><span className={task.dueDate && isPast(task.dueDate) && task.status!=='done' ? 'text-danger text-sm' : 'text-sm text-muted'}>{fmtDate(task.dueDate) || '—'}</span></td>
                        <td>
                          <div style={{ display:'flex', gap:4 }} onClick={e=>e.stopPropagation()}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>setEditTask(task)}>Edit</button>
                            {isAdmin && <button className="btn btn-danger btn-sm" onClick={()=>handleDeleteTask(task.id)}><Trash2 size={12}/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEMBERS VIEW */}
        {tab === 'members' && (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Member</th><th>Email</th><th>Role</th>{isAdmin && <th>Actions</th>}</tr></thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="avatar avatar-sm">{getInitials(m.name)}</div><span style={{ fontWeight:600 }}>{m.name}{m.id===project.ownerId?' (Owner)':''}</span></div></td>
                      <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{m.email}</td>
                      <td><span className={`badge badge-${m.ProjectMember?.role||'member'}`}>{m.ProjectMember?.role||'member'}</span></td>
                      {isAdmin && <td><button className="btn btn-danger btn-sm" disabled={m.id===project.ownerId} onClick={()=>handleRemoveMember(m.id)}><Trash2 size={12}/></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TaskModal open={taskModal} onClose={()=>setTaskModal(false)} onSave={handleCreateTask} members={members} />
      <TaskModal open={!!editTask} onClose={()=>setEditTask(null)} onSave={handleEditTask} initial={editTask} members={members} />
      <AddMemberModal open={memberModal} onClose={()=>setMemberModal(false)} onAdd={handleAddMember} />
    </div>
  );
}
