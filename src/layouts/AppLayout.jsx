import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Pill, Settings, LogOut, Menu, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard, roles: ['admin','doctor','nurse','pharmacist','frontdesk'] },
    { name: 'Patients',     path: '/patients',     icon: Users,           roles: ['admin','doctor','nurse','frontdesk'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar,        roles: ['admin','doctor','nurse','frontdesk'] },
    { name: 'Inventory',    path: '/inventory',    icon: Pill,            roles: ['admin','pharmacist'] },
    { name: 'Admin',        path: '/admin',        icon: Settings,        roles: ['admin'] },
  ].filter(i => i.roles.includes(user?.role));

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const Sidebar = () => (
    <div style={{
      width: '220px', minHeight: '100vh', background: '#fff',
      borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', padding: '9px', borderRadius: '12px', display: 'flex' }}>
          <Eye size={22} color="white" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', margin: 0, lineHeight: 1 }}>Albacete</p>
          <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Eye Clinic</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
              background: isActive ? '#e0f2fe' : 'transparent',
              color: isActive ? '#0891b2' : '#475569',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={17} color={isActive ? '#0891b2' : '#94a3b8'} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ margin: '12px', background: '#f8fafc', borderRadius: '14px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#0891b2,#0e7490)',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0,
          }}>
            {user?.full_name?.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', padding: '7px', background: 'none', border: '1px solid #e2e8f0',
          borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#64748b',
          cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#dc2626'; e.currentTarget.style.borderColor='#fecaca'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='#e2e8f0'; }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', padding: '7px', borderRadius: '10px', display: 'flex' }}>
            <Eye size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Albacete</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 50 }}><Sidebar /></div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div className="md:p-0" style={{ paddingTop: '60px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
