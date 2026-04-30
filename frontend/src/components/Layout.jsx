import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, User, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">✦</div>
          <span className="logo-text">Task<span>Flow</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Main</div>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={17} /> Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FolderKanban size={17} /> Projects
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-section-label">Account</div>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={17} /> Profile
            </NavLink>
            <button className="nav-item btn-ghost w-full" style={{ border: 'none', textAlign: 'left' }} onClick={handleLogout}>
              <LogOut size={17} /> Logout
            </button>
          </div>
        </nav>

        <div className="sidebar-user">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar" style={{ objectFit:'cover' }} />
          ) : (
            <div className="avatar">{getInitials(user?.name)}</div>
          )}
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
