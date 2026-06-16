import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, ChevronRight, Plus, Inbox, XCircle, RefreshCw, ClipboardList } from 'lucide-react';
import AppointmentForm from './AppointmentForm';
import AppointmentRequestCard from './AppointmentRequestCard';

const C = {
  primary:'#0891b2', primaryDark:'#0e7490', primaryBg:'#e0f2fe',
  border:'#f1f5f9', borderMid:'#e2e8f0', bg:'#f8fafc', white:'#fff',
  text:'#0f172a', textMid:'#475569', textSoft:'#94a3b8',
  danger:'#dc2626', dangerBg:'#fef2f2',
};

const STATUS_COLORS = {
  scheduled:    { bg:'#eff6ff', color:'#1d4ed8' },
  'checked-in': { bg:'#fefce8', color:'#a16207' },
  seen:         { bg:'#f5f3ff', color:'#6d28d9' },
  done:         { bg:'#f0fdf4', color:'#15803d' },
  cancelled:    { bg:'#fef2f2', color:'#dc2626' },
};

const STATUS_NEXT = { scheduled:'checked-in', 'checked-in':'seen', seen:'done' };
const STATUS_LABEL_NEXT = { scheduled:'Check In', 'checked-in':'Mark Seen', seen:'Mark Done' };

const inputStyle = {
  padding:'8px 12px', border:`1.5px solid ${C.borderMid}`, borderRadius:'10px',
  fontSize:'13px', outline:'none', fontFamily:'inherit', background:C.bg,
  color:C.text, boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s',
};
const fi = e=>{ e.target.style.borderColor=C.primary; e.target.style.boxShadow='0 0 0 3px rgba(8,145,178,0.12)'; e.target.style.background='#fff'; };
const fo = e=>{ e.target.style.borderColor=C.borderMid; e.target.style.boxShadow='none'; e.target.style.background=C.bg; };

export default function AppointmentList() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('queue');
  const [appts, setAppts]       = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/appointments?date=${selectedDate}`, { credentials:'include' });
    if (res.ok) setAppts(await res.json());
    setLoading(false);
  }, [selectedDate]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/appointments', { credentials:'include' });
    if (res.ok) { const d = await res.json(); setRequests(d.filter(r=>r.status==='pending')); }
    setLoading(false);
  }, []);

  useEffect(()=>{
    if (tab==='queue')    fetchQueue();
    if (tab==='requests') fetchRequests();
  }, [tab, fetchQueue, fetchRequests]);

  const advanceStatus = async (appt) => {
    const next = STATUS_NEXT[appt.status];
    if (!next) return;
    await fetch(`/api/appointments/${appt.id}`, { method:'PUT', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status:next, notes:appt.notes }) });
    fetchQueue();
  };

  const cancelAppt = async (appt) => {
    if (!confirm(`Cancel appointment for ${appt.patient_name}?`)) return;
    await fetch(`/api/appointments/${appt.id}`, { method:'DELETE', credentials:'include' });
    fetchQueue();
  };

  const todayLabel = new Date(selectedDate+'T00:00:00').toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});
  const isToday = selectedDate === new Date().toISOString().slice(0,10);

  const Spinner = () => (
    <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
      <div style={{ width:'32px', height:'32px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ maxWidth:'960px', margin:'0 auto', padding:'24px 20px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Appointments</h1>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>
            {tab==='queue' ? todayLabel : 'Pending public booking requests'}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button onClick={()=>tab==='queue'?fetchQueue():fetchRequests()}
            title="Refresh"
            style={{ padding:'9px', background:C.white, border:`1px solid ${C.borderMid}`, borderRadius:'10px', cursor:'pointer', display:'flex', color:C.textSoft, transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.textSoft; }}>
            <RefreshCw size={15}/>
          </button>
          {['admin','frontdesk','nurse'].includes(user?.role) && (
            <button onClick={()=>setShowForm(true)}
              style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'11px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 3px 12px rgba(8,145,178,0.35)', fontFamily:'inherit' }}>
              <Plus size={15}/> New Appointment
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', padding:'4px', background:C.bg, borderRadius:'12px', width:'fit-content', border:`1px solid ${C.border}` }}>
        {[
          { id:'queue',    label:"Today's Queue", icon:Calendar },
          { id:'requests', label:'Requests Inbox', icon:Inbox },
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              padding:'8px 16px', borderRadius:'9px', fontSize:'13px', fontWeight:600,
              border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
              background: tab===t.id ? C.white : 'transparent',
              color: tab===t.id ? C.primary : C.textSoft,
              boxShadow: tab===t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            <t.icon size={14}/>
            {t.label}
            {t.id==='requests' && requests.length>0 && tab!=='requests' && (
              <span style={{ background:C.danger, color:'white', fontSize:'10px', fontWeight:800, padding:'1px 6px', borderRadius:'999px', lineHeight:'1.4' }}>{requests.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Queue Tab */}
      {tab==='queue' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
              style={inputStyle} onFocus={fi} onBlur={fo}/>
            {!isToday && (
              <button onClick={()=>setSelectedDate(new Date().toISOString().slice(0,10))}
                style={{ fontSize:'12px', color:C.primary, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, textDecoration:'underline' }}>
                Back to today
              </button>
            )}
          </div>

          <div style={{ background:C.white, borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
            {loading ? <Spinner/> : appts.length===0 ? (
              <div style={{ textAlign:'center', padding:'64px 20px', color:C.textSoft }}>
                <ClipboardList size={40} style={{ margin:'0 auto 12px', opacity:0.25 }}/>
                <p style={{ fontWeight:600, margin:'0 0 4px', color:C.textMid }}>No appointments</p>
                <p style={{ fontSize:'13px', margin:0 }}>Nothing scheduled for {todayLabel}</p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                      {['Time','Patient','Doctor','Status','Actions'].map(h=>(
                        <th key={h} style={{ textAlign:h==='Actions'?'right':'left', padding:'12px 16px', fontSize:'11px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map((appt,i) => {
                      const sc = STATUS_COLORS[appt.status]||{bg:'#f1f5f9',color:C.textMid};
                      return (
                        <tr key={appt.id} style={{ borderBottom:`1px solid ${C.bg}`, transition:'background 0.12s' }}
                          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', fontWeight:600, color:C.textMid }}>
                              <Clock size={12} color={C.textSoft}/>
                              {new Date(appt.appointment_date).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <Link to={`/patients/${appt.patient_id}`} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}
                              onClick={e=>e.stopPropagation()}>
                              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:C.primaryBg, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'12px', flexShrink:0 }}>
                                {appt.patient_name?.split(' ').map(n=>n[0]).slice(0,2).join('')}
                              </div>
                              <div>
                                <p style={{ fontWeight:600, color:C.text, margin:0, fontSize:'13px' }}>{appt.patient_name}</p>
                                <p style={{ fontSize:'11px', color:C.textSoft, margin:'1px 0 0', fontFamily:'monospace' }}>{appt.patient_code}</p>
                              </div>
                            </Link>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', color:C.textMid }}>
                              <User size={12} color={C.textSoft}/>
                              {appt.doctor_name||'—'}
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px', background:sc.bg, color:sc.color, textTransform:'capitalize', letterSpacing:'0.02em' }}>
                              {appt.status}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px' }}>
                              {STATUS_NEXT[appt.status] && (
                                <button onClick={()=>advanceStatus(appt)}
                                  style={{ padding:'6px 12px', fontSize:'11px', fontWeight:700, background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit' }}>
                                  {STATUS_LABEL_NEXT[appt.status]}
                                </button>
                              )}
                              {(appt.status==='checked-in'||appt.status==='seen') && (
                                <Link to={`/visits/new?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}
                                  style={{ padding:'6px 12px', fontSize:'11px', fontWeight:700, background:'#16a34a', color:'white', borderRadius:'8px', textDecoration:'none', display:'inline-block' }}>
                                  Start Visit
                                </Link>
                              )}
                              {appt.status!=='done'&&appt.status!=='cancelled' && (
                                <button onClick={()=>cancelAppt(appt)} title="Cancel"
                                  style={{ padding:'5px', background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex', borderRadius:'6px', transition:'color 0.15s' }}
                                  onMouseEnter={e=>e.currentTarget.style.color=C.danger}
                                  onMouseLeave={e=>e.currentTarget.style.color=C.textSoft}>
                                  <XCircle size={16}/>
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
        </>
      )}

      {/* Requests Tab */}
      {tab==='requests' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {loading ? <Spinner/> : requests.length===0 ? (
            <div style={{ textAlign:'center', padding:'64px 20px', color:C.textSoft }}>
              <Inbox size={40} style={{ margin:'0 auto 12px', opacity:0.25 }}/>
              <p style={{ fontWeight:600, margin:'0 0 4px', color:C.textMid }}>Inbox is clear</p>
              <p style={{ fontSize:'13px', margin:0 }}>No pending booking requests</p>
            </div>
          ) : requests.map(req=>(
            <AppointmentRequestCard key={req.id} request={req}
              onConverted={()=>{ fetchRequests(); fetchQueue(); }}
              onDismissed={fetchRequests}/>
          ))}
        </div>
      )}

      {showForm && (
        <AppointmentForm onClose={()=>setShowForm(false)} onSaved={()=>{ setShowForm(false); fetchQueue(); }}/>
      )}
    </div>
  );
}
