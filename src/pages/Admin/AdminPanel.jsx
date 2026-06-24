import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Key, Plus, Eye, EyeOff, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedPage } from '../../components/AnimatedPage';

const C = {
  primary:'#0891b2', primaryDark:'#0e7490', primaryBg:'#e0f2fe',
  border:'#f1f5f9', borderMid:'#e2e8f0', bg:'#f8fafc', white:'#fff',
  text:'#0f172a', textMid:'#475569', textSoft:'#94a3b8',
  success:'#16a34a', successBg:'#dcfce7',
  error:'#dc2626',   errorBg:'#fef2f2',
};

const ROLE_LABELS  = { admin:'Admin', doctor:'Doctor', nurse:'Nurse', pharmacist:'Pharmacist', frontdesk:'Front Desk' };
const ROLE_COLORS  = {
  admin:     { bg:'#fdf2f8', color:'#9d174d' },
  doctor:    { bg:'#e0f2fe', color:'#0369a1' },
  nurse:     { bg:'#dcfce7', color:'#166534' },
  pharmacist:{ bg:'#fef3c7', color:'#92400e' },
  frontdesk: { bg:'#f1f5f9', color:'#334155' },
};
const ACTION_COLORS = {
  create:{ bg:'#dcfce7', color:'#166534' },
  update:{ bg:'#dbeafe', color:'#1d4ed8' },
  delete:{ bg:'#fee2e2', color:'#dc2626' },
  view:  { bg:'#f1f5f9', color:'#475569' },
  print: { bg:'#fef3c7', color:'#92400e' },
};

const inputBase = {
  width:'100%', padding:'9px 12px', border:`1.5px solid #e2e8f0`,
  borderRadius:'10px', fontSize:'13px', outline:'none', fontFamily:'inherit',
  color:'#0f172a', background:'#f8fafc', boxSizing:'border-box',
  transition:'border-color 0.15s, box-shadow 0.15s',
};
const labelBase = {
  display:'block', fontSize:'11px', fontWeight:700,
  color:'#64748b', marginBottom:'5px', letterSpacing:'0.04em', textTransform:'uppercase',
};
const fi = e => { e.target.style.borderColor='#0891b2'; e.target.style.boxShadow='0 0 0 3px rgba(8,145,178,0.12)'; e.target.style.background='#fff'; };
const fo = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; };

// ─────────────────────────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const { user: me } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser,  setEditUser]  = useState(null);
  const [form,      setForm]      = useState({ full_name:'', email:'', password:'', role:'frontdesk' });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [showPw,    setShowPw]    = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users', { credentials:'include' });
    if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
    setLoading(false);
  }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ full_name:'', email:'', password:'', role:'frontdesk' });
    setError(''); setShowPw(false); setShowModal(true);
  };
  const openEdit = u => {
    setEditUser(u);
    setForm({ full_name:u.full_name, email:u.email, password:'', role:u.role });
    setError(''); setShowPw(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    if (!editUser && !form.password) { setError('Password is required for new users'); return; }
    if (form.password && form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true); setError('');
    try {
      const url    = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users';
      const method = editUser ? 'PUT' : 'POST';
      const body   = editUser
        ? { full_name: form.full_name, role: form.role }
        : { full_name: form.full_name, email: form.email, password: form.password, role: form.role };
      const res = await fetch(url, { method, credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Operation failed'); return; }
      setShowModal(false); fetchUsers();
    } finally { setSaving(false); }
  };

  const toggleActive = async u => {
    if (u.id === me?.id) return;
    await fetch(`/api/admin/users/${u.id}`, {
      method:'PUT', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ is_active: u.is_active ? 0 : 1 }),
    });
    fetchUsers();
  };

  const btnBase = (active) => ({
    padding:'5px 11px', border:`1px solid ${active ? '#fecaca' : '#e2e8f0'}`,
    borderRadius:'7px', background: active ? '#fef2f2' : C.white,
    color: active ? '#dc2626' : '#475569',
    fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
  });

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:C.text, margin:'0 0 2px' }}>Staff Accounts</h2>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>{users.length} registered users</p>
        </div>
        <button onClick={openCreate}
          style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 16px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(8,145,178,0.3)' }}>
          <Plus size={14}/> Add User
        </button>
      </div>

      <div style={{ background:C.white, borderRadius:'16px', border:`1px solid ${C.border}`, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center' }}>
            <div style={{ width:'28px', height:'28px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.frontdesk;
                  return (
                    <tr key={u.id} style={{ borderBottom:`1px solid ${C.bg}` }}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', flexShrink:0 }}>
                            {u.full_name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight:600, fontSize:'13px', color:C.text }}>{u.full_name}</span>
                          {u.id === me?.id && <span style={{ fontSize:'10px', background:C.primaryBg, color:C.primary, fontWeight:700, padding:'1px 6px', borderRadius:'999px' }}>You</span>}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:'13px', color:C.textMid }}>{u.email}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'999px', background:rc.bg, color:rc.color }}>{ROLE_LABELS[u.role] || u.role}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'999px', background:u.is_active ? C.successBg : C.errorBg, color:u.is_active ? C.success : C.error }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button onClick={() => openEdit(u)} style={btnBase(false)}>Edit</button>
                          {u.id !== me?.id && (
                            <button onClick={() => toggleActive(u)} style={btnBase(!!u.is_active)}>
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(3px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:C.white, borderRadius:'18px', padding:'28px', width:'100%', maxWidth:'440px', boxShadow:'0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 style={{ fontWeight:800, fontSize:'17px', color:C.text, margin:0 }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex', padding:'4px' }}><X size={20}/></button>
            </div>

            {error && (
              <div style={{ padding:'10px 13px', background:C.errorBg, border:`1px solid #fecaca`, borderRadius:'9px', marginBottom:'16px', fontSize:'13px', color:C.error, fontWeight:600, display:'flex', alignItems:'center', gap:'7px' }}>
                <AlertTriangle size={14}/> {error}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={labelBase}>Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({...f, full_name:e.target.value}))}
                  placeholder="e.g. Dr. Maria Santos" style={inputBase} onFocus={fi} onBlur={fo}/>
              </div>
              <div>
                <label style={labelBase}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))}
                  placeholder="user@albacete.com" disabled={!!editUser}
                  style={{...inputBase, opacity:editUser?0.6:1, cursor:editUser?'not-allowed':'text'}}
                  onFocus={!editUser ? fi : undefined} onBlur={!editUser ? fo : undefined}/>
              </div>
              {!editUser && (
                <div>
                  <label style={labelBase}>Password</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm(f => ({...f, password:e.target.value}))}
                      placeholder="Min. 8 characters" style={{...inputBase, paddingRight:'40px'}} onFocus={fi} onBlur={fo}/>
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex' }}>
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label style={labelBase}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role:e.target.value}))}
                  style={{...inputBase, cursor:'pointer', appearance:'none', WebkitAppearance:'none'}} onFocus={fi} onBlur={fo}>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="frontdesk">Front Desk</option>
                </select>
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px', marginTop:'22px' }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex:1, padding:'10px', border:`1px solid ${C.borderMid}`, borderRadius:'10px', background:C.white, color:C.textMid, fontWeight:600, fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                style={{ flex:2, padding:'10px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, fontFamily:'inherit' }}>
                {saving ? 'Saving…' : editUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Audit Log Tab
// ─────────────────────────────────────────────────────────────────
function AuditTab() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [entity,  setEntity]  = useState('');
  const [total,   setTotal]   = useState(0);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit, ...(entity && { entity }) });
    const res = await fetch(`/api/audit-log?${params}`, { credentials:'include' });
    if (res.ok) { const d = await res.json(); setLogs(d.logs || []); setTotal(d.total || 0); }
    setLoading(false);
  }, [page, entity]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:C.text, margin:'0 0 2px' }}>Audit Log</h2>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>{total.toLocaleString()} total entries</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1); }}
            style={{ padding:'8px 12px', border:`1px solid ${C.borderMid}`, borderRadius:'9px', fontSize:'12px', fontFamily:'inherit', background:C.bg, color:C.text, cursor:'pointer', outline:'none' }}>
            <option value="">All Entities</option>
            <option value="patient">Patients</option>
            <option value="visit">Visits</option>
            <option value="prescription">Prescriptions</option>
            <option value="medicine">Medicines</option>
            <option value="patient_list">List Views</option>
          </select>
          <button onClick={fetchLogs}
            style={{ padding:'8px 10px', border:`1px solid ${C.borderMid}`, borderRadius:'9px', background:C.white, color:C.textMid, cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontFamily:'inherit', fontSize:'12px', fontWeight:600 }}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      <div style={{ background:C.white, borderRadius:'16px', border:`1px solid ${C.border}`, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center' }}>
            <div style={{ width:'28px', height:'28px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:C.textSoft }}>
            <Shield size={36} style={{ margin:'0 auto 10px', opacity:0.3 }}/>
            <p style={{ fontSize:'13px', margin:0 }}>No audit entries found</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
                  {['Time','User','Action','Entity','Details','IP'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontSize:'10px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => {
                  const ac = ACTION_COLORS[l.action] || ACTION_COLORS.view;
                  return (
                    <tr key={l.id} style={{ borderBottom:`1px solid ${C.bg}` }}>
                      <td style={{ padding:'10px 14px', fontSize:'11px', color:C.textSoft, whiteSpace:'nowrap' }}>
                        {new Date(l.created_at).toLocaleString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', fontWeight:600, color:C.text, whiteSpace:'nowrap' }}>
                        {l.user_name || `#${l.user_id}`}
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'999px', textTransform:'uppercase', background:ac.bg, color:ac.color }}>{l.action}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:C.textMid }}>{l.entity}</td>
                      <td style={{ padding:'10px 14px', fontSize:'11px', color:C.textSoft, maxWidth:'220px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {l.details || '—'}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:'11px', color:C.textSoft, fontFamily:'monospace' }}>
                        {l.ip_address || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(total > limit || page > 1) && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:'12px', color:C.textSoft }}>
              Showing {((page-1)*limit)+1}–{Math.min(page*limit, total)} of {total.toLocaleString()}
            </span>
            <div style={{ display:'flex', gap:'8px' }}>
              {[{label:'Previous',disabled:page===1,fn:()=>setPage(p=>p-1)},{label:'Next',disabled:page*limit>=total,fn:()=>setPage(p=>p+1)}].map(b=>(
                <button key={b.label} disabled={b.disabled} onClick={b.fn}
                  style={{ padding:'6px 14px', fontSize:'12px', fontWeight:600, border:`1px solid ${C.borderMid}`, borderRadius:'7px', background:C.white, color:b.disabled?C.textSoft:C.textMid, cursor:b.disabled?'not-allowed':'pointer', opacity:b.disabled?0.5:1, fontFamily:'inherit' }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Account Tab
// ─────────────────────────────────────────────────────────────────
function AccountTab() {
  const { user } = useAuth();
  const [form,    setForm]    = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw,  setShowPw]  = useState({ current:false, new:false, confirm:false });

  const pwFields = [
    { key:'current_password', showKey:'current', label:'Current Password',     placeholder:'Enter current password' },
    { key:'new_password',     showKey:'new',     label:'New Password',          placeholder:'Min. 8 characters' },
    { key:'confirm_password', showKey:'confirm', label:'Confirm New Password',  placeholder:'Repeat new password' },
  ];

  const handleSubmit = async () => {
    setError(''); setSuccess(false);
    if (!form.current_password || !form.new_password || !form.confirm_password) { setError('All fields are required'); return; }
    if (form.new_password.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (form.new_password !== form.confirm_password) { setError('New passwords do not match'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ current_password:form.current_password, new_password:form.new_password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to change password'); return; }
      setSuccess(true);
      setForm({ current_password:'', new_password:'', confirm_password:'' });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth:'480px' }}>
      <div style={{ marginBottom:'20px' }}>
        <h2 style={{ fontSize:'18px', fontWeight:800, color:C.text, margin:'0 0 2px' }}>My Account</h2>
        <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>Update your login password</p>
      </div>

      <div style={{ background:C.white, borderRadius:'16px', border:`1px solid ${C.border}`, padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:C.bg, borderRadius:'12px', marginBottom:'22px' }}>
          <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'17px', flexShrink:0 }}>
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight:700, color:C.text, margin:0, fontSize:'14px' }}>{user?.full_name}</p>
            <p style={{ fontSize:'12px', color:C.textSoft, margin:'2px 0 0', textTransform:'capitalize' }}>{ROLE_LABELS[user?.role] || user?.role} · {user?.email}</p>
          </div>
        </div>

        {error && (
          <div style={{ padding:'10px 13px', background:C.errorBg, border:`1px solid #fecaca`, borderRadius:'9px', marginBottom:'16px', fontSize:'13px', color:C.error, fontWeight:600, display:'flex', alignItems:'center', gap:'7px' }}>
            <AlertTriangle size={14}/> {error}
          </div>
        )}
        {success && (
          <div style={{ padding:'10px 13px', background:C.successBg, border:`1px solid #bbf7d0`, borderRadius:'9px', marginBottom:'16px', fontSize:'13px', color:C.success, fontWeight:600, display:'flex', alignItems:'center', gap:'7px' }}>
            <Check size={14}/> Password changed successfully
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {pwFields.map(({ key, showKey, label, placeholder }) => (
            <div key={key}>
              <label style={labelBase}>{label}</label>
              <div style={{ position:'relative' }}>
                <input type={showPw[showKey] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={e => setForm(f => ({...f, [key]:e.target.value}))}
                  placeholder={placeholder}
                  style={{...inputBase, paddingRight:'40px'}} onFocus={fi} onBlur={fo}/>
                <button type="button" onClick={() => setShowPw(s => ({...s, [showKey]:!s[showKey]}))}
                  style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex' }}>
                  {showPw[showKey] ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={saving}
          style={{ width:'100%', marginTop:'20px', padding:'11px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, fontFamily:'inherit', boxShadow:'0 3px 12px rgba(8,145,178,0.25)' }}>
          {saving ? 'Changing Password…' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:'users',   label:'Users',      icon:Users  },
  { id:'audit',   label:'Audit Log',  icon:Shield },
  { id:'account', label:'My Account', icon:Key    },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('users');

  return (
    <AnimatedPage>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Administration</h1>
        <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>Manage staff accounts, review activity logs, and account settings</p>
      </div>

      <div style={{ display:'flex', gap:'4px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'4px', marginBottom:'24px', width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display:'flex', alignItems:'center', gap:'7px', padding:'8px 16px',
              borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:'13px', fontWeight:700, transition:'all 0.15s',
              background: tab === t.id ? C.white : 'transparent',
              color:      tab === t.id ? C.primary : C.textSoft,
              boxShadow:  tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            <t.icon size={14}/>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users'   && <UsersTab/>}
      {tab === 'audit'   && <AuditTab/>}
      {tab === 'account' && <AccountTab/>}
    </AnimatedPage>
  );
}
