import { Link } from 'react-router-dom';
import { CheckCircle2, Users, BarChart3, Shield, Zap, ArrowRight, Star, GitBranch, Clock, Bell } from 'lucide-react';

const features = [
  { icon: <GitBranch size={22} />, title: 'Kanban Boards', desc: 'Drag tasks across columns — To Do, In Progress, In Review, Done. Visualize your workflow instantly.', color: '#6366f1' },
  { icon: <Users size={22} />, title: 'Team Collaboration', desc: 'Invite members by email, assign roles (Admin/Member), and manage access per project.', color: '#8b5cf6' },
  { icon: <Shield size={22} />, title: 'Role-Based Access', desc: 'Granular permissions — Admins control the project, Members focus on execution.', color: '#ec4899' },
  { icon: <Bell size={22} />, title: 'Overdue Alerts', desc: 'Dashboard surfaces overdue and upcoming tasks so nothing slips through the cracks.', color: '#f59e0b' },
  { icon: <BarChart3 size={22} />, title: 'Progress Tracking', desc: 'Per-project completion bars and a stats ring show exactly how far you've come.', color: '#10b981' },
  { icon: <Clock size={22} />, title: 'Due Date Tracking', desc: 'Set deadlines per task, track estimated hours, and see what's due this week at a glance.', color: '#3b82f6' },
];

const steps = [
  { n: '01', title: 'Create a Project', desc: 'Name it, color-code it, set a deadline — your project is live in seconds.' },
  { n: '02', title: 'Invite Your Team', desc: 'Add members by email and assign them Admin or Member roles instantly.' },
  { n: '03', title: 'Assign & Track Tasks', desc: 'Create tasks, assign them, set priorities and due dates, then watch progress unfold.' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            boxShadow: '0 0 18px rgba(99,102,241,0.4)'
          }}>✦</div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18 }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px',
        background: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 60%),
          var(--bg-primary)
        `,
        position: 'relative',
      }}>
        {/* Floating badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          fontSize: 13, color: 'var(--accent)', fontWeight: 600,
          animation: 'fadeIn 0.6s ease',
        }}>
          <Zap size={14} /> Built for modern teams · Free to use
        </div>

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: 'clamp(40px, 7vw, 78px)', fontWeight: 800,
          lineHeight: 1.1, marginBottom: 24, maxWidth: 820,
          animation: 'slideUp 0.6s ease 0.1s both',
        }}>
          Manage Tasks.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 50%, var(--pink) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Ship Faster Together.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7,
          marginBottom: 40, animation: 'slideUp 0.6s ease 0.2s both',
        }}>
          TaskFlow is a collaborative task manager with Kanban boards, role-based access,
          overdue tracking, and a real-time dashboard — everything your team needs in one place.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp 0.6s ease 0.3s both' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: 16, padding: '14px 32px' }}>
            Sign In
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 40, color: 'var(--text-muted)', fontSize: 13, animation: 'fadeIn 0.8s ease 0.5s both' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
          <span style={{ marginLeft: 8 }}>Loved by teams building great products</span>
        </div>

        {/* App preview card */}
        <div style={{
          marginTop: 72, width: '100%', maxWidth: 900,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.8s ease 0.4s both',
        }}>
          {/* Fake browser bar */}
          <div style={{ background: 'var(--bg-elevated)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260, margin: '0 auto' }}>
              app.taskflow.io/dashboard
            </div>
          </div>
          {/* Mock dashboard */}
          <div style={{ padding: 24, background: 'var(--bg-primary)' }}>
            {/* Mock stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Projects', value: '8', color: '#6366f1' },
                { label: 'My Tasks', value: '24', color: '#3b82f6' },
                { label: 'Completed', value: '18', color: '#10b981' },
                { label: 'Overdue', value: '2', color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Mock kanban columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'To Do', color: 'var(--text-muted)', tasks: ['Design mockups', 'API spec'] },
                { label: 'In Progress', color: 'var(--info)', tasks: ['Auth flow', 'DB schema'] },
                { label: 'In Review', color: 'var(--warning)', tasks: ['Dashboard UI'] },
                { label: 'Done', color: 'var(--success)', tasks: ['Project setup', 'CI pipeline', 'Wireframes'] },
              ].map(col => (
                <div key={col.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.label}</span>
                  </div>
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {col.tasks.map(t => (
                      <div key={t} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 11, fontWeight: 500 }}>{t}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Everything you need</p>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800 }}>Built for serious teams</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              From solo founders to cross-functional teams — TaskFlow scales with how you work.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
                padding: 28, transition: 'all 0.2s ease', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 60 }}>Up and running in minutes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'var(--accent-glow)', border: '2px solid rgba(99,102,241,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--accent)',
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        margin: '0 24px 80px', borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        padding: '72px 24px', textAlign: 'center',
        boxShadow: '0 0 80px rgba(99,102,241,0.08) inset',
      }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, marginBottom: 16 }}>
          Ready to ship faster?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
          Join your team on TaskFlow. Create an account in seconds — no credit card required.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16, padding: '14px 36px', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
          Create Free Account <ArrowRight size={18} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          {['✓ Free forever', '✓ No credit card', '✓ Unlimited projects'].map(t => <span key={t}>{t}</span>)}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✦</div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15 }}>Task<span style={{ color: 'var(--accent)' }}>Flow</span></span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2025 TaskFlow. Built for teams that ship.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Sign In</Link>
          <Link to="/register" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
