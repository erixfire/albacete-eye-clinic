import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Pill, Settings, LogOut, Menu, X, Eye, Activity, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from '../components/GlobalSearch';

const NAV = [
  { name:'Dashboard',    path:'/dashboard',    icon:LayoutDashboard, roles:['admin','doctor','nurse','pharmacist','frontdesk'] },
  { name:'Patients',     path:'/patients',     icon:Users,           roles:['admin','doctor','nurse','frontdesk'] },
  { name:'Visits',       path:'/visits',       icon:Activity,        roles:['admin','doctor','nurse','frontdesk'] },
  { name:'Appointments', path:'/appointments', icon:Calendar,        roles:['admin','doctor','nurse','frontdesk'] },
  { name:'Inventory',    path:'/inventory',    icon:Pill,            roles:['admin','pharmacist'] },
  { name:'Admin',        path:'/admin',        icon:Settings,        roles:['admin'] },
];

// Mobile header height in px — keep in sync with the fixed bar below
const MOBILE_HEADER_H = 56;

function Sidebar({ user, onNav, onLogout, onSearch }) {
  const items = NAV.filter(i => i.roles.includes(user?.role));
  return (
    <div style={{ width:'220px', height:'100%', background:'#fff', borderRight:'1px solid #f1f5f9', display:'flex', flexDirection:'column', flexShrink:0 }}>
      {/* Brand */}
      <div style={{ padding:'24px 18px 18px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #f8fafc' }}>
        <div style={{ background:'linear-gradient(135deg,#0891b2,#0c4a6e)', padding:'9px', borderRadius:'12px', display:'flex', boxShadow:'0 3px 10px rgba(8,145,178,0.3)' }}>
          <Eye size={20} color="white"/>
        </div>
        <div>
          <p style={{ fontWeight:800, fontSize:'15px', color:'#0f172a', margin:0, lineHeight:1, letterSpacing:'-0.01em' }}>Albacete</p>
          <p style={{ fontSize:'9px', color:'#94a3b8', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', margin:'3px 0 0' }}>Eye Clinic</p>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px', overflowY:'auto' }}>
        {items.map(item => (
          <NavLink key={item.path} to={item.path} onClick={onNav}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:'10px',
              padding:'9px 12px', borderRadius:'10px', textDecoration:'none',
              fontSize:'13px', fontWeight:600, transition:'all 0.15s',
              background: isActive ? '#e0f2fe' : 'transparent',
              color: isActive ? '#0891b2' : '#64748b',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} color={isActive?'#0891b2':'#94a3b8'}/>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Search shortcut */}
      <div style={{ padding:'0 10px 8px' }}>
        <button onClick={onSearch}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'10px', cursor:'pointer', fontFamily:'inherit', fontSize:'12px', color:'#94a3b8', transition:'all 0.15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#0891b2'; e.currentTarget.style.color='#0891b2'; e.currentTarget.style.background='#e0f2fe'; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.background='#f1f5f9'; }}>
          <Search size={13}/>
          <span style={{ flex:1, textAlign:'left' }}>Quick search…</span>
          <kbd style={{ fontSize:'10px', background:'white', border:'1px solid #e2e8f0', borderRadius:'4px', padding:'1px 5px', color:'#64748b', fontFamily:'monospace' }}>⌘K</kbd>
        </button>
      </div>

      {/* User footer */}
      <div style={{ margin:'10px', background:'#f8fafc', borderRadius:'14px', padding:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'13px', flexShrink:0, boxShadow:'0 2px 8px rgba(8,145,178,0.3)' }}>
            {user?.full_name?.charAt(0)}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontWeight:700, fontSize:'12px', color:'#0f172a', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name}</p>
            <p style={{ fontSize:'10px', color:'#94a3b8', margin:'2px 0 0', textTransform:'capitalize', fontWeight:600 }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
          padding:'7px', background:'transparent', border:'1px solid #e2e8f0',
          borderRadius:'9px', fontSize:'12px', fontWeight:600, color:'#64748b',
          cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit',
        }}
          onMouseEnter={e=>{ e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#dc2626'; e.currentTarget.style.borderColor='#fecaca'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='#e2e8f0'; }}>
          <LogOut size={13}/> Logout
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open,         setOpen]         = React.useState(false);
  const [searchOpen,   setSearchOpen]   = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 768);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const handleSearch = () => setSearchOpen(true);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Noto Sans',system-ui,sans-serif" }}>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)}/>

      {/* Desktop sidebar — sticky so it doesn't scroll away */}
      {!isMobile && (
        <div style={{ position:'sticky', top:0, height:'100vh', flexShrink:0 }}>
          <Sidebar user={user} onNav={()=>{}} onLogout={handleLogout} onSearch={handleSearch}/>
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:50,
          height:`${MOBILE_HEADER_H}px`,
          background:'#fff', borderBottom:'1px solid #f1f5f9',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ background:'linear-gradient(135deg,#0891b2,#0c4a6e)', padding:'7px', borderRadius:'10px', display:'flex' }}>
              <Eye size={17} color="white"/>
            </div>
            <span style={{ fontWeight:800, fontSize:'15px', color:'#0f172a', letterSpacing:'-0.01em' }}>Albacete</span>
          </div>
          <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', display:'flex' }}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      )}

      {/* Mobile drawer */}
      {isMobile && open && (
        <div style={{ position:'fixed', inset:0, zIndex:40 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(2px)' }} onClick={()=>setOpen(false)}/>
          <div style={{ position:'absolute', top:0, left:0, bottom:0, zIndex:50 }}>
            <Sidebar user={user} onNav={()=>setOpen(false)} onLogout={handleLogout} onSearch={()=>{ setOpen(false); setSearchOpen(true); }}/>
          </div>
        </div>
      )}

      {/* Main content — push down by header height on mobile */}
      <main style={{
        flex:1, minWidth:0, overflowY:'auto',
        paddingTop: isMobile ? `${MOBILE_HEADER_H}px` : '0',
      }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
