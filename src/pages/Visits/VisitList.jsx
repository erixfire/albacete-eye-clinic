import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronRight, Activity, Plus, Calendar, User } from 'lucide-react';
import { AnimatedPage } from '../../components/AnimatedPage';

const C = {
  primary:'#0891b2', primaryDark:'#0e7490', primaryBg:'#e0f2fe',
  border:'#f1f5f9', borderMid:'#e2e8f0', bg:'#f8fafc', white:'#fff',
  text:'#0f172a', textMid:'#475569', textSoft:'#94a3b8',
};

const STATUS_COLORS = {
  scheduled:    { bg:'#eff6ff', color:'#1d4ed8' },
  'checked-in': { bg:'#fefce8', color:'#a16207' },
  seen:         { bg:'#f5f3ff', color:'#6d28d9' },
  done:         { bg:'#f0fdf4', color:'#15803d' },
  cancelled:    { bg:'#fef2f2', color:'#dc2626' },
};

const inputStyle = {
  width:'100%', padding:'9px 12px 9px 36px', border:`1.5px solid ${C.borderMid}`,
  borderRadius:'10px', fontSize:'13px', outline:'none', fontFamily:'inherit',
  background:C.bg, color:C.text, boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s',
};
const fi = e=>{ e.target.style.borderColor=C.primary; e.target.style.boxShadow='0 0 0 3px rgba(8,145,178,0.12)'; e.target.style.background='#fff'; };
const fo = e=>{ e.target.style.borderColor=C.borderMid; e.target.style.boxShadow='none'; e.target.style.background=C.bg; };

export default function VisitList() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [visits, setVisits]   = useState([]);
  const [total,  setTotal]    = useState(0);
  const [loading, setLoading] = useState(true);
  const [q,      setQ]        = useState('');
  const [status, setStatus]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,   setPage]     = useState(1);
  const limit = 20;

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (q)        params.set('q', q);
    if (status)   params.set('status', status);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo)   params.set('date_to', dateTo);
    const res = await fetch(`/api/visits?${params}`, { credentials:'include' });
    if (res.ok) { const d = await res.json(); setVisits(d.visits || []); setTotal(d.total || 0); }
    setLoading(false);
  }, [q, status, dateFrom, dateTo, page]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const selectStyle = {
    padding:'9px 12px', border:`1.5px solid ${C.borderMid}`, borderRadius:'10px',
    fontSize:'13px', outline:'none', fontFamily:'inherit', background:C.bg,
    color:C.text, cursor:'pointer', transition:'border-color 0.15s', appearance:'none', WebkitAppearance:'none', paddingRight:'28px',
  };

  const dateInputStyle = {
    padding:'9px 12px', border:`1.5px solid ${C.borderMid}`, borderRadius:'10px',
    fontSize:'13px', outline:'none', fontFamily:'inherit', background:C.bg,
    color:C.text, transition:'border-color 0.15s',
  };

  const canAdd = ['admin','doctor','nurse'].includes(user?.role);

  return (
    <AnimatedPage>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Visits</h1>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>{total.toLocaleString()} total records</p>
        </div>
        {canAdd && (
          <Link to="/visits/new" style={{ textDecoration:'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'11px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 3px 12px rgba(8,145,178,0.35)' }}>
              <Plus size={15}/> New Visit
            </div>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'18px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1', minWidth:'200px' }}>
          <Search size={14} style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:C.textSoft, pointerEvents:'none' }}/>
          <input type="text" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search patient name or code…" style={inputStyle} onFocus={fi} onBlur={fo}/>
        </div>
        <div style={{ position:'relative' }}>
          <select value={status} onChange={e=>{ setStatus(e.target.value); setPage(1); }}
            style={selectStyle} onFocus={fi} onBlur={fo}>
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked-in">Checked In</option>
            <option value="seen">Seen</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronRight size={13} style={{ position:'absolute', right:'9px', top:'50%', transform:'translateY(-50%) rotate(90deg)', color:C.textSoft, pointerEvents:'none' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <input type="date" value={dateFrom} onChange={e=>{ setDateFrom(e.target.value); setPage(1); }}
            style={dateInputStyle} onFocus={fi} onBlur={fo} title="From date"/>
          <span style={{ fontSize:'12px', color:C.textSoft }}>–</span>
          <input type="date" value={dateTo} onChange={e=>{ setDateTo(e.target.value); setPage(1); }}
            style={dateInputStyle} onFocus={fi} onBlur={fo} title="To date"/>
        </div>
        {(q || status || dateFrom || dateTo) && (
          <button onClick={()=>{ setQ(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1); }}
            style={{ padding:'9px 14px', border:`1px solid ${C.borderMid}`, borderRadius:'10px', background:C.white, color:C.textMid, fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background:C.white, borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'48px' }}>
            <div style={{ width:'32px', height:'32px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          </div>
        ) : visits.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:C.textSoft }}>
            <Activity size={40} style={{ margin:'0 auto 12px', opacity:0.25 }}/>
            <p style={{ fontWeight:600, margin:'0 0 4px', color:C.textMid }}>No visits found</p>
            <p style={{ fontSize:'13px', margin:0 }}>
              {q || status || dateFrom || dateTo ? 'Try adjusting your filters' : 'No visits have been recorded yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                  {['Date','Patient','Doctor','Type','Chief Complaint','Status',''].map((h,i)=>(
                    <th key={i} style={{ textAlign:'left', padding:'12px 16px', fontSize:'11px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.map(v => {
                  const sc = STATUS_COLORS[v.status] || { bg:'#f1f5f9', color:C.textMid };
                  return (
                    <tr key={v.id} onClick={()=>navigate(`/visits/${v.id}`)}
                      style={{ borderBottom:`1px solid ${C.bg}`, cursor:'pointer', transition:'background 0.12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', fontWeight:600, color:C.textMid }}>
                          <Calendar size={12} color={C.textSoft}/>
                          {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:C.primaryBg, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'12px', flexShrink:0 }}>
                            {v.patient_name?.split(' ').map(n=>n[0]).slice(0,2).join('') || '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight:600, fontSize:'13px', color:C.text, margin:0 }}>{v.patient_name || '—'}</p>
                            {v.patient_code && <p style={{ fontSize:'11px', color:C.textSoft, margin:'1px 0 0', fontFamily:'monospace' }}>{v.patient_code}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', color:C.textMid }}>
                          <User size={12} color={C.textSoft}/>
                          {v.doctor_name || '—'}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:'12px', textTransform:'capitalize', color:C.textMid }}>{v.visit_type || 'consult'}</span>
                      </td>
                      <td style={{ padding:'12px 16px', maxWidth:'220px' }}>
                        <p style={{ fontSize:'12px', color:C.textMid, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {v.chief_complaint || <span style={{ color:C.textSoft, fontStyle:'italic' }}>None recorded</span>}
                        </p>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'999px', background:sc.bg, color:sc.color, textTransform:'capitalize' }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <ChevronRight size={15} color={C.border}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:'12px', color:C.textSoft }}>
              Showing {((page-1)*limit)+1}–{Math.min(page*limit, total)} of {total.toLocaleString()}
            </span>
            <div style={{ display:'flex', gap:'8px' }}>
              {[{label:'Previous',disabled:page===1,fn:()=>setPage(p=>p-1)},{label:'Next',disabled:page*limit>=total,fn:()=>setPage(p=>p+1)}].map(b=>(
                <button key={b.label} disabled={b.disabled} onClick={b.fn}
                  style={{ padding:'7px 14px', fontSize:'12px', fontWeight:600, borderRadius:'8px', border:`1px solid ${C.borderMid}`, background:C.white, color:b.disabled?C.textSoft:C.textMid, cursor:b.disabled?'not-allowed':'pointer', opacity:b.disabled?0.5:1, fontFamily:'inherit' }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
