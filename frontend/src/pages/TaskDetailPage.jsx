import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Send, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['todo','in_progress','in_review','done'];
const LABEL = { todo:'To Do', in_progress:'In Progress', in_review:'In Review', done:'Done' };
const PRIORITY_OPTS = ['low','medium','high','critical'];
const getInitials = (name='') => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const fmtFull = d => { if (!d) return '—'; const p = parseISO(d); return isValid(p) ? format(p,'MMM d, yyyy') : '—'; };
const fmtTime = d => { if (!d) return ''; try { return format(new Date(d), 'MMM d, h:mm a'); } catch { return ''; } };

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [members, setMembers] = useState([]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      setTask(res.data.data.task);
    } catch { navigate(`/projects/${projectId}`); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTask();
    api.get(`/projects/${projectId}`).then(r => setMembers(r.data.data.project.members || []));
  }, [taskId]);

  const handleStatusChange = async (status) => {
    await api.put(`/projects/${projectId}/tasks/${taskId}`, { status });
    fetchTask(); toast.success(`Status → ${LABEL[status]}`);
  };

  const handleSave = async () => {
    await api.put(`/projects/${projectId}/tasks/${taskId}`, { ...editForm, assigneeId: editForm.assigneeId || null });
    setEditing(false); fetchTask(); toast.success('Task updated');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content: comment });
      setComment(''); fetchTask();
    } finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
    fetchTask();
  };

  if (loading) return <div className="page loading-page" style={{ minHeight:'60vh' }}><div className="spinner" style={{ width:36,height:36,borderWidth:3 }}/></div>;
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'done';

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ padding:'20px 32px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>navigate(`/projects/${projectId}`)}>
          <ChevronLeft size={15}/> Back to Board
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className={`badge badge-${task.status}`}>{LABEL[task.status]}</span>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            {isOverdue && <span className="badge" style={{ background:'var(--danger-bg)', color:'var(--danger)' }}>OVERDUE</span>}
          </div>
        </div>
        {!editing && <button className="btn btn-secondary btn-sm" onClick={()=>{setEditing(true);setEditForm({...task,tags:(task.tags||[]).join(', ')});}}>Edit Task</button>}
        {editing && <>
          <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:0, minHeight:'calc(100vh - 80px)' }}>
        {/* Main content */}
        <div style={{ padding:32, borderRight:'1px solid var(--border)' }}>
          {editing ? (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={editForm.title||''} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={5} value={editForm.description||''} onChange={e=>setEditForm(f=>({...f,description:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={editForm.status||''} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s} value={s}>{LABEL[s]}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Priority</label><select className="form-select" value={editForm.priority||''} onChange={e=>setEditForm(f=>({...f,priority:e.target.value}))}>{PRIORITY_OPTS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Assignee</label><select className="form-select" value={editForm.assigneeId||''} onChange={e=>setEditForm(f=>({...f,assigneeId:e.target.value}))}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={editForm.dueDate||''} onChange={e=>setEditForm(f=>({...f,dueDate:e.target.value}))}/></div>
              </div>
              <div className="form-group"><label className="form-label">Tags</label><input className="form-input" value={editForm.tags||''} onChange={e=>setEditForm(f=>({...f,tags:e.target.value}))} placeholder="bug, ui, backend"/></div>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize:26, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:12, lineHeight:1.3 }}>{task.title}</h1>
              {task.tags?.length > 0 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {task.tags.map(t=><span key={t} style={{ fontSize:11, background:'var(--bg-elevated)', padding:'2px 8px', borderRadius:4, color:'var(--text-secondary)' }}>{t}</span>)}
                </div>
              )}
              {task.description ? (
                <p style={{ color:'var(--text-secondary)', lineHeight:1.7, marginBottom:24, whiteSpace:'pre-wrap' }}>{task.description}</p>
              ) : (
                <p style={{ color:'var(--text-muted)', fontStyle:'italic', marginBottom:24, fontSize:14 }}>No description provided.</p>
              )}

              {/* Quick status change */}
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Move to</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {STATUSES.filter(s=>s!==task.status).map(s=>(
                    <button key={s} className="btn btn-secondary btn-sm" onClick={()=>handleStatusChange(s)}>{LABEL[s]}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Comments ({task.comments?.length || 0})</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
              {(task.comments||[]).map(c=>(
                <div key={c.id} style={{ display:'flex', gap:10 }}>
                  <div className="avatar avatar-sm" style={{ flexShrink:0 }}>{getInitials(c.author?.name)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{c.author?.name}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{fmtTime(c.createdAt)}</span>
                    </div>
                    <div style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'10px 14px', fontSize:14, lineHeight:1.6 }}>{c.content}</div>
                  </div>
                  {(c.authorId===user?.id) && (
                    <button className="btn btn-ghost btn-icon" style={{ flexShrink:0 }} onClick={()=>handleDeleteComment(c.id)}><Trash2 size={13}/></button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} style={{ display:'flex', gap:10 }}>
              <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
              <div style={{ flex:1, display:'flex', gap:8 }}>
                <input className="form-input" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." style={{ flex:1 }}/>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting||!comment.trim()}>
                  <Send size={14}/>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar details */}
        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text-muted)', marginBottom:10 }}>Details</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Assignee', value: task.assignee ? <div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="avatar avatar-sm">{getInitials(task.assignee.name)}</div><span style={{ fontSize:13 }}>{task.assignee.name}</span></div> : <span style={{ color:'var(--text-muted)', fontSize:13 }}>Unassigned</span> },
                { label:'Created by', value: <div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="avatar avatar-sm">{getInitials(task.creator?.name)}</div><span style={{ fontSize:13 }}>{task.creator?.name}</span></div> },
                { label:'Due Date', value: <span style={{ fontSize:13, color: isOverdue ? 'var(--danger)' : 'var(--text-primary)' }}>{fmtFull(task.dueDate)}</span> },
                { label:'Created', value: <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{fmtFull(task.createdAt)}</span> },
                { label:'Est. Hours', value: <span style={{ fontSize:13 }}>{task.estimatedHours ? `${task.estimatedHours}h` : '—'}</span> },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
          {task.completedAt && (
            <div style={{ background:'var(--success-bg)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, padding:'12px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <CheckCircle size={16} style={{ color:'var(--success)' }}/>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'var(--success)' }}>Completed</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{fmtTime(task.completedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
