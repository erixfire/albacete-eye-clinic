import React, { useEffect, useState } from 'react';
import {
  Users, Calendar, AlertTriangle, Clock,
  ArrowRight, ChevronRight, Package, Activity,
  Inbox, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  scheduled:    { bg: '#eff6ff', color: '#1d4ed8' },
  'checked-in': { bg: '#fefce8', color: '#a16207' },
  seen:         { bg: '#f5f3ff', color: '#6d28d9' },
  done:         { bg: '#f0fdf4', color: '#15803d' },
  cancelled:    { bg: '#fef2f2', color: '#dc2626' },
  open:         { bg: '#eff6ff', color: '#1d4ed8' },
  completed:    { bg: '#f0fdf4', color: '#15803d' },
};

/* Reusable inline-styled stat card */
function StatCard({ label, value, icon: Icon, iconBg, iconColor, link }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
        display: 'block',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ background: iconBg, color: iconColor, padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Icon size={20} />
          </div>
          <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
        </div>
        <p style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{value.toLocaleString()}</p>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{label}</p>
      </div>
    </Link>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
      if (res.ok) setSummary(await res.json());
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
      setLastFetch(new Date());
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return (
    <AnimatedPage className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />)}
      </div>
    </AnimatedPage>
  );

  const isAdmin      = user?.role === 'admin';
  const isClinic     = ['admin','doctor','nurse','frontdesk'].includes(user?.role);
  const isPharmacist = ['admin','pharmacist'].includes(user?.role);

  const stats = [
    { label: "Today's Appointments", value: summary?.today_appointments ?? 0, icon: Calendar,       iconBg: '#e0f2fe', iconColor: '#0891b2', link: '/appointments', show: isClinic },
    { label: "Today's Visits",       value: summary?.today_visits ?? 0,        icon: Activity,       iconBg: '#ede9fe', iconColor: '#7c3aed', link: '/appointments', show: isClinic },
    { label: 'Total Patients',       value: summary?.total_patients ?? 0,      icon: Users,          iconBg: '#e0f2fe', iconColor: '#0284c7', link: '/patients',     show: isClinic },
    { label: 'Pending Requests',     value: summary?.pending_requests ?? 0,    icon: Inbox,          iconBg: summary?.pending_requests > 0 ? '#fef3c7' : '#f1f5f9', iconColor: summary?.pending_requests > 0 ? '#d97706' : '#94a3b8', link: '/appointments', show: isClinic },
    { label: 'Low Stock Items',      value: summary?.low_stock_count ?? 0,     icon: AlertTriangle,  iconBg: summary?.low_stock_count > 0 ? '#fff7ed' : '#f1f5f9',  iconColor: summary?.low_stock_count > 0 ? '#ea580c' : '#94a3b8',  link: '/inventory',   show: isPharmacist },
    { label: 'Expiring Soon',        value: summary?.expiring_meds_count ?? 0, icon: Clock,          iconBg: summary?.expiring_meds_count > 0 ? '#fef2f2' : '#f1f5f9', iconColor: summary?.expiring_meds_count > 0 ? '#dc2626' : '#94a3b8', link: '/inventory', show: isPharmacist },
  ].filter(s => s.show);

  const recentVisits  = summary?.recent_visits  || [];
  const lowStockItems = summary?.low_stock_items || [];

  return (
    <AnimatedPage className="space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:'#0f172a', margin:0 }}>Overview</h1>
          <p style={{ fontSize:'13px', color:'#64748b', marginTop:'4px' }}>
            Here’s what’s happening at the clinic today.
            {lastFetch && <span style={{ marginLeft:'8px', color:'#94a3b8', fontSize:'12px' }}>Last updated {lastFetch.toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit' })}</span>}
          </p>
        </div>
        <button onClick={fetchDashboard}
          style={{ padding:'8px', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', borderRadius:'10px' }}
          title="Refresh">
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={staggeredContainer} initial="initial" animate="animate"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'16px' }}>
        {stats.map(s => (
          <motion.div key={s.label} variants={staggeredItem}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Lower section */}
      <div style={{ display:'grid', gridTemplateColumns: isClinic ? '1fr 340px' : '1fr', gap:'24px' }}>

        {/* Recent Visits */}
        {isClinic && (
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'18px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h3 style={{ fontWeight:700, color:'#0f172a', margin:0, fontSize:'15px' }}>Recent Visits</h3>
              <Link to="/appointments" style={{ color:'#0891b2', fontSize:'13px', fontWeight:600, display:'flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                View appointments <ArrowRight size={13} />
              </Link>
            </div>
            {recentVisits.length > 0 ? recentVisits.map(v => {
              const sc = STATUS_COLORS[v.status] || { bg:'#f1f5f9', color:'#475569' };
              return (
                <Link key={v.id} to={`/patients/${v.patient_id}`} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid #f8fafc', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#e0f2fe', color:'#0891b2', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'14px', flexShrink:0 }}>
                        {v.patient_name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight:600, color:'#0f172a', margin:0, fontSize:'14px' }}>{v.patient_name}</p>
                        <p style={{ fontSize:'12px', color:'#94a3b8', margin:0, marginTop:'2px' }}>
                          {v.chief_complaint || 'General consultation'}{v.doctor_name ? ` • Dr. ${v.doctor_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:'12px', color:'#94a3b8', margin:0 }}>
                        {new Date(v.visit_date).toLocaleDateString('en-PH', { month:'short', day:'numeric' })}
                      </p>
                      <span style={{ display:'inline-block', marginTop:'4px', padding:'2px 8px', borderRadius:'6px', background:sc.bg, color:sc.color, fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <div style={{ padding:'48px 20px', textAlign:'center', color:'#94a3b8' }}>
                <Activity size={36} style={{ margin:'0 auto 8px', opacity:0.3 }} />
                <p style={{ fontSize:'13px', margin:0 }}>No visits recorded yet</p>
              </div>
            )}
          </div>
        )}

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Pending requests alert */}
          {isClinic && summary?.pending_requests > 0 && (
            <Link to="/appointments" style={{ textDecoration:'none' }}>
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                onMouseLeave={e => e.currentTarget.style.background = '#fffbeb'}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ background:'#fde68a', padding:'8px', borderRadius:'10px' }}><Inbox size={18} style={{ color:'#92400e' }} /></div>
                  <div>
                    <p style={{ fontWeight:700, color:'#92400e', margin:0, fontSize:'14px' }}>{summary.pending_requests} Pending Request{summary.pending_requests !== 1 ? 's' : ''}</p>
                    <p style={{ fontSize:'12px', color:'#b45309', margin:0 }}>Tap to open Requests Inbox</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color:'#d97706' }} />
              </div>
            </Link>
          )}

          {/* Inventory panel */}
          {isPharmacist && (
            <div style={{ background:'linear-gradient(135deg, #0891b2, #0e7490)', borderRadius:'16px', padding:'20px', color:'white' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                <div style={{ background:'rgba(255,255,255,0.2)', padding:'8px', borderRadius:'10px' }}><Package size={18} /></div>
                <h3 style={{ fontWeight:700, margin:0, fontSize:'15px' }}>Inventory</h3>
              </div>
              {lowStockItems.length > 0 ? (
                <div style={{ marginBottom:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {lowStockItems.map(m => (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'13px' }}>
                      <span style={{ color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                      <span style={{ background:'rgba(239,68,68,0.3)', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'999px', marginLeft:'8px', flexShrink:0 }}>
                        {m.stock_quantity} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', marginBottom:'14px' }}>All stock levels healthy. ✓</p>
              )}
              <Link to="/inventory"
                style={{ display:'block', background:'white', color:'#0891b2', textAlign:'center', padding:'9px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none' }}>
                Manage Inventory
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'18px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight:700, color:'#0f172a', margin:'0 0 12px', fontSize:'15px' }}>Quick Links</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {isClinic && (
                <>
                  {[{to:'/patients/new', label:'Register New Patient', icon:Users},
                    {to:'/appointments', label:'Schedule Appointment', icon:Calendar}].map(({to, label, icon:Icon}) => (
                    <Link key={to} to={to} style={{ textDecoration:'none' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'10px', border:'1px solid #f1f5f9', transition:'all 0.15s', cursor:'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#e0f2fe'; e.currentTarget.style.borderColor='#0891b2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#f1f5f9'; }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', color:'#475569' }}>
                          <Icon size={15} />
                          <span style={{ fontSize:'13px', fontWeight:500 }}>{label}</span>
                        </div>
                        <ChevronRight size={14} style={{ color:'#cbd5e1' }} />
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {isPharmacist && (
                <Link to="/inventory" style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'10px', border:'1px solid #f1f5f9', transition:'all 0.15s', cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#e0f2fe'; e.currentTarget.style.borderColor='#0891b2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#f1f5f9'; }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', color:'#475569' }}>
                      <Package size={15} />
                      <span style={{ fontSize:'13px', fontWeight:500 }}>Update Stock</span>
                    </div>
                    <ChevronRight size={14} style={{ color:'#cbd5e1' }} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
