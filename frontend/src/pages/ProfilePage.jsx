import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

const getInitials = (name='') => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const setPw = k => e => setPwForm(p=>({...p,[k]:e.target.value}));

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="page" style={{ animation:'fadeIn 0.3s ease', maxWidth:680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar avatar-lg" style={{ width:72, height:72, objectFit:'cover' }} />
        ) : (
          <div className="avatar avatar-lg" style={{ width:72, height:72, fontSize:26 }}>{getInitials(user?.name)}</div>
        )}
        <div>
          <p style={{ fontWeight:700, fontSize:18 }}>{user?.name}</p>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>{user?.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <User size={18} style={{ color:'var(--accent)' }}/><h2 style={{ fontSize:16, fontWeight:700 }}>Personal Info</h2>
        </div>
        <form onSubmit={handleProfile} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={set('name')} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input className="form-input" value={form.avatar} onChange={set('avatar')} placeholder="https://example.com/avatar.png"/>
            <span className="form-error" style={{ color:'var(--text-muted)', fontSize:11 }}>Provide a direct link to an image</span>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity:0.6 }}/>
            <span className="form-error" style={{ color:'var(--text-muted)', fontSize:11 }}>Email cannot be changed</span>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={14}/>{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <Lock size={18} style={{ color:'var(--accent)' }}/><h2 style={{ fontSize:16, fontWeight:700 }}>Change Password</h2>
        </div>
        <form onSubmit={handlePassword} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required/>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwForm.newPassword} onChange={setPw('newPassword')} placeholder="Min 6 chars" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New</label>
              <input type="password" className="form-input" value={pwForm.confirm} onChange={setPw('confirm')} required/>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPw}>
              <Lock size={14}/>{savingPw ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
