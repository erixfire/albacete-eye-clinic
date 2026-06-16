import React, { useEffect, useState } from 'react';
import { Users, Calendar, AlertTriangle, Clock, ArrowRight, ChevronRight, Package, Activity, Inbox, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const STATUS = {
  scheduled:    { bg:'#eff6ff', color:'#1d4ed8' },
  'checked-in': { bg:'#fefce8', color:'#a16207' },
  seen:         { bg:'#f5f3ff', color:'#6d28d9' },
  done:         { bg:'#f0fdf4', color:'#15803d' },
  cancelled:    { bg:'#fef2f2', color:'#dc2626' },
  open:         { bg:'#eff6ff', color:'#1d4ed8' },
  completed:    { bg:'#f0fdf4', color:'#15803d' },
};

function StatCard({ label, value, icon: Icon, iconBg, iconColor, link, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={link} style={{ textDecoration:'none', display:'block', height:'100%' }}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
        background: accent ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#fff',
        border: accent ? 'none' : '1px solid #f1f5f9',
        borderRadius:'18px', padding:'22px',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.12)' : accent ? '0 4px 20px rgba(8,145,178,0.3)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition:'all 0.2s', height:'100%', boxSizing:'border-box',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ background: accent ? 'rgba(255,255,255,0.2)' : iconBg, color: accent ? 'white' : iconColor, padding:'10px', borderRadius:'12px', display:'flex' }}>
            <Icon size={20}/>
          </div>
          <ChevronRight size={16} style={{ color: accent ? 'rgba(255,255,255,0.5)' : '#cbd5e1', marginTop:'2px' }}/>
        </div>
        <p style={{ fontSize:'32px', fontWeight:800, color: accent ? 'white' : '#0f172a', margin:'0 0 4px', letterSpacing:'-0.02em' }}>{value.toLocaleString()}</p>
        <p style={{ fontSize:'13px', fontWeight:500, color: accent ? 'rgba(255,255,255,0.8)' : '#64748b', margin:0 }}>{label}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [spinning,  setSpinning]  = useState(false);

  const fetchDashboard = async () => {
    setSpinning(true); setLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary', { credentials:'include' });
      if (res.ok) setSummary(await res.json());
    } catch(e) { console.error(e); }
    finally { setLoading(false); setLastFetch(new Date()); setSpinning(false); }
  };
  useEffect(()=>{ fetchDashboard(); },[]);

  const isClinic     = ['admin','doctor','nurse','frontdesk'].includes(user?.role);
  const isPharmacist = ['admin','pharmacist'].includes(user?.role);

  if (loading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
      {[1,2,3,4,5,6].map(i=>(
        <div key={i} style={{ height:'120px', borderRadius:'18px', background:'#f1f5f9', animation:'pulse 1.5s ease-in-out infinite' }}/>
      ))}
    </div>
  );

  const stats = [
    { label:"Today's Appointments", value:summary?.today_appointments??0, icon:Calendar,      iconBg:'#e0f2fe', iconColor:'#0891b2', link:'/appointments', show:isClinic },
    { label:"Today's Visits",       value:summary?.today_visits??0,        icon:Activity,      iconBg:'#ede9fe', iconColor:'#7c3aed', link:'/appointments', show:isClinic },
    { label:'Total Patients',       value:summary?.total_patients??0,       icon:Users,         iconBg:'#dcfce7', iconColor:'#16a34a', link:'/patients',     show:isClinic },
    { label:'Pending Requests',     value:summary?.pending_requests??0,     icon:Inbox,         iconBg:summary?.pending_requests>0?'#fef3c7':'#f8fafc', iconColor:summary?.pending_requests>0?'#d97706':'#94a3b8', link:'/appointments', show:isClinic },
    { label:'Low Stock Items',      value:summary?.low_stock_count??0,       icon:AlertTriangle, iconBg:summary?.low_stock_count>0?'#fff7ed':'#f8fafc',  iconColor:summary?.low_stock_count>0?'#ea580c':'#94a3b8',  link:'/inventory',   show:isPharmacist },
    { label:'Expiring Soon',        value:summary?.expiring_meds_count??0,  icon:Clock,         iconBg:summary?.expiring_meds_count>0?'#fef2f2':'#f8fafc', iconColor:summary?.expiring_meds_count>0?'#dc2626':'#94a3b8', link:'/inventory', show:isPharmacist },
  ].filter(s=>s.show);

  const recentVisits  = summary?.recent_visits  || [];
  const lowStockItems = summary?.low_stock_items || [];

  const cols = stats.length <= 3 ? stats.length : stats.length <= 4 ? 2 : 3;

  return (
    <AnimatedPage>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:'#0f172a', margin:'0 0 4px', letterSpacing:'-0.02em' }}>
            Good {new Date().getHours()<12?'morning':'afternoon'}, {user?.full_name?.split(' ')[0]} &#128075;
          </h1>
          <p style={{ fontSize:'13px', color:'#94a3b8', margin:0 }}>
            {new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            {lastFetch && <span style={{ marginLeft:'12px' }}>&#183; Updated {lastFetch.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}</span>}
          </p>
        </div>
        <button onClick={fetchDashboard}
          style={{ padding:'9px 16px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', fontWeight:600, color:'#475569', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', fontFamily:'inherit', transition:'all 0.15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#0891b2'; e.currentTarget.style.color='#0891b2'; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#475569'; }}>
          <RefreshCw size={14} style={{ animation: spinning?'spin 1s linear infinite':undefined }}/> Refresh
        </button>
      </motion.div>

      {/* Stat grid — always fills rows cleanly */}
      <motion.div variants={staggeredContainer} initial="initial" animate="animate"
        style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:'14px', marginBottom:'28px' }}>
        {stats.map((s,i) => (
          <motion.div key={s.label} variants={staggeredItem} style={{ minWidth:0 }}>
            <StatCard {...s} accent={i===0}/>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom grid */}
      <div style={{ display:'grid', gridTemplateColumns: isClinic?'1fr 320px':'1fr', gap:'20px', alignItems:'start' }}>

        {isClinic && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            style={{ background:'#fff', borderRadius:'18px', border:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
            <div style={{ padding:'18px 22px 16px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ background:'#e0f2fe', padding:'7px', borderRadius:'9px', display:'flex' }}><Activity size={15} color="#0891b2"/></div>
                <h3 style={{ fontWeight:700, color:'#0f172a', margin:0, fontSize:'15px' }}>Recent Visits</h3>
              </div>
              <Link to="/appointments" style={{ color:'#0891b2', fontSize:'12px', fontWeight:700, display:'flex', alignItems:'center', gap:'4px', textDecoration:'none' }}>
                View all <ArrowRight size={13}/>
              </Link>
            </div>
            <div>
              {recentVisits.length > 0 ? recentVisits.map(v => {
                const sc = STATUS[v.status]||{bg:'#f1f5f9',color:'#475569'};
                return (
                  <Link key={v.id} to={`/patients/${v.patient_id}`} style={{ textDecoration:'none' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 22px', borderBottom:'1px solid #fafafa', transition:'background 0.12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
                        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#0e7490)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', flexShrink:0 }}>
                          {v.patient_name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, color:'#0f172a', margin:0, fontSize:'14px' }}>{v.patient_name}</p>
                          <p style={{ fontSize:'12px', color:'#94a3b8', margin:'2px 0 0' }}>{v.chief_complaint||'General consultation'}{v.doctor_name?` \u2022 Dr. ${v.doctor_name}`:''}</p>
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:'11px', color:'#94a3b8', margin:'0 0 4px' }}>{new Date(v.visit_date).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</p>
                        <span style={{ padding:'2px 8px', borderRadius:'6px', background:sc.bg, color:sc.color, fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{v.status}</span>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div style={{ padding:'48px 20px', textAlign:'center', color:'#cbd5e1' }}>
                  <Activity size={36} style={{ margin:'0 auto 8px', opacity:0.4 }}/>
                  <p style={{ fontSize:'13px', margin:0, color:'#94a3b8' }}>No visits recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {isClinic && summary?.pending_requests>0 && (
            <Link to="/appointments" style={{ textDecoration:'none' }}>
              <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fde68a', borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.filter='brightness(0.97)'}
                onMouseLeave={e=>e.currentTarget.style.filter='none'}>
                <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
                  <div style={{ background:'#fcd34d', padding:'8px', borderRadius:'10px', display:'flex' }}><Inbox size={17} color="#92400e"/></div>
                  <div>
                    <p style={{ fontWeight:700, color:'#92400e', margin:'0 0 2px', fontSize:'14px' }}>{summary.pending_requests} Pending Request{summary.pending_requests!==1?'s':''}</p>
                    <p style={{ fontSize:'12px', color:'#b45309', margin:0 }}>Tap to open Requests Inbox</p>
                  </div>
                </div>
                <ChevronRight size={16} color="#d97706"/>
              </div>
            </Link>
          )}

          {isPharmacist && (
            <div style={{ background:'linear-gradient(160deg,#0c4a6e,#0891b2)', borderRadius:'18px', padding:'20px', color:'white', boxShadow:'0 4px 20px rgba(8,145,178,0.3)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                <div style={{ background:'rgba(255,255,255,0.15)', padding:'8px', borderRadius:'10px', display:'flex' }}><Package size={17}/></div>
                <h3 style={{ fontWeight:700, margin:0, fontSize:'15px' }}>Inventory</h3>
              </div>
              {lowStockItems.length>0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' }}>
                  {lowStockItems.map(m=>(
                    <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'13px' }}>
                      <span style={{ color:'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                      <span style={{ background:'rgba(239,68,68,0.3)', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'999px', marginLeft:'8px', flexShrink:0 }}>{m.stock_quantity} {m.unit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>
                  <TrendingUp size={14}/> All stock levels healthy
                </div>
              )}
              <Link to="/inventory" style={{ display:'block', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(4px)', color:'white', textAlign:'center', padding:'9px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
                Manage Inventory
              </Link>
            </div>
          )}

          <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:'18px', padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontWeight:700, color:'#0f172a', margin:'0 0 12px', fontSize:'15px' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {(isClinic ? [
                {to:'/patients/new', label:'Register New Patient', icon:Users,    color:'#0891b2', bg:'#e0f2fe'},
                {to:'/appointments', label:'Schedule Appointment', icon:Calendar, color:'#7c3aed', bg:'#ede9fe'},
              ] : []).concat(isPharmacist ? [{to:'/inventory', label:'Update Stock', icon:Package, color:'#16a34a', bg:'#dcfce7'}] : [])
              .map(({to,label,icon:Icon,color,bg})=>(
                <Link key={to} to={to} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'11px', border:'1px solid #f1f5f9', transition:'all 0.15s', cursor:'pointer' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=bg; e.currentTarget.style.borderColor=color; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#f1f5f9'; }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ background:bg, padding:'7px', borderRadius:'8px', display:'flex' }}><Icon size={14} color={color}/></div>
                      <span style={{ fontSize:'13px', fontWeight:600, color:'#374151' }}>{label}</span>
                    </div>
                    <ChevronRight size={14} color="#cbd5e1"/>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
