import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Calendar, FolderKanban, ArrowRight
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const priorityColors = { low: '#10b981', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };
const statusColors = { todo: '#55556a', in_progress: '#3b82f6', in_review: '#f59e0b', done: '#10b981' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const fmtDate = (d) => {
  if (!d) return '';
  const parsed = typeof d === 'string' ? parseISO(d) : d;
  return isValid(parsed) ? format(parsed, 'MMM d') : '';
};

const isOverdue = (d) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page loading-page" style={{ minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );

  const { stats, dueSoon = [], overdueList = [], recentTasks = [], projectStats = [], statusBreakdown = {} } = data || {};

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: <FolderKanban size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'My Tasks', value: stats?.totalTasks ?? 0, icon: <LayoutDashboard size={22} />, color: '#3b82f6', bg: 'var(--info-bg)' },
    { label: 'Completed', value: stats?.doneTasks ?? 0, icon: <CheckCircle2 size={22} />, color: '#10b981', bg: 'var(--success-bg)' },
    { label: 'Overdue', value: stats?.overdueTasks ?? 0, icon: <AlertTriangle size={22} />, color: '#ef4444', bg: 'var(--danger-bg)' },
  ];

  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tasks today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Status breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Tasks by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = statusBreakdown[key] || 0;
              const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm" style={{ marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: statusColors[key] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion rate */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent)" strokeWidth="2.5"
                strokeDasharray={`${stats?.completionRate || 0} 100`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>{stats?.completionRate || 0}%</span>
            </div>
          </div>
          <p style={{ marginTop: 12, fontWeight: 600 }}>Completion Rate</p>
          <p className="text-sm text-muted">{stats?.doneTasks} of {stats?.totalTasks} tasks done</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Overdue tasks */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />Overdue ({overdueList.length})
            </h3>
          </div>
          {overdueList.length === 0 ? (
            <p className="text-sm text-muted">No overdue tasks 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdueList.slice(0, 5).map(task => (
                <div key={task.id} className="task-card" onClick={() => navigate(`/projects/${task.projectId}/tasks/${task.id}`)}>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 10 }}>
                      {fmtDate(task.dueDate)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.project?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due soon */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>
              <Calendar size={16} style={{ display: 'inline', marginRight: 6 }} />Due This Week ({dueSoon.length})
            </h3>
          </div>
          {dueSoon.length === 0 ? (
            <p className="text-sm text-muted">No upcoming deadlines</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dueSoon.slice(0, 5).map(task => (
                <div key={task.id} className="task-card" onClick={() => navigate(`/projects/${task.projectId}/tasks/${task.id}`)}>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects progress */}
      {projectStats.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Project Progress</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projectStats.slice(0, 5).map(proj => (
              <div key={proj.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${proj.id}`)}>
                <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: proj.color }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{proj.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{proj.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${proj.progress}%`, background: proj.color }} />
                </div>
                <div className="flex gap-3 mt-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>{proj.taskCounts.done}/{proj.taskCounts.total} tasks</span>
                  <span style={{ color: proj.taskCounts.in_progress > 0 ? 'var(--info)' : 'inherit' }}>
                    {proj.taskCounts.in_progress} in progress
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
