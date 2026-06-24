import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, ChevronRight, Eye, Phone, Calendar, Download } from 'lucide-react';

const C = {
  primary:'#0891b2', primaryDark:'#0e7490', primaryBg:'#e0f2fe',
  border:'#f1f5f9', borderMid:'#e2e8f0', bg:'#f8fafc', white:'#fff',
  text:'#0f172a', textMid:'#475569', textSoft:'#94a3b8',
};

const inputStyle = {
  width:'100%', padding:'9px 12px 9px 36px',
  border:`1.5px solid ${C.borderMid}`, borderRadius:'10px',
  fontSize:'13px', outline:'none', fontFamily:'inherit',
  background:C.bg, color:C.text, boxSizing:'border-box',
  transition:'border-color 0.15s, box-shadow 0.15s',
};
const fi = e=>{ e.target.style.borderColor=C.primary; e.target.style.boxShadow='0 0 0 3px rgba(8,145,178,0.12)'; e.target.style.background='#fff'; };
const fo = e=>{ e.target.style.borderColor=C.borderMid; e.target.style.boxShadow='none'; e.target.style.background=C.bg; };

export default function PatientList() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');
  const [branch, setBranch]     = useState('');
  const [page, setPage]         = useState(1);
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, branch, page, limit });
    const res = await fetch(`/api/patients?${params}`, { credentials:'include' });
    if (res.ok) { const d = await res.json(); setPatients(d.patients); setTotal(d.total); }
    setLoading(false);
  }, [q, branch, page]);
  useEffect(()=>{ fetchPatients(); }, [fetchPatients]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ q, branch, limit: 5000, export: 'csv' });
      const res = await fetch(`/api/patients?${params}`, { credentials: 'include' });
      if (!res.ok) return;
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `patients-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const selectStyle = {
    padding:'9px 12px', border:`1.5px solid ${C.borderMid}`, borderRadius:'10px',
    fontSize:'13px', outline:'none', fontFamily:'inherit', background:C.bg,
    color:C.text, cursor:'pointer', transition:'border-color 0.15s',
    appearance:'none', WebkitAppearance:'none', paddingRight:'32px',
  };

  return (
    <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'24px 20px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Patients</h1>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>{total} total records</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {['admin','doctor','nurse','frontdesk'].includes(user?.role) && (
            <button onClick={exportCsv} disabled={exporting}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 14px', background:C.white, color:C.textMid, border:`1px solid ${C.borderMid}`, borderRadius:'11px', fontWeight:600, fontSize:'13px', cursor:exporting?'not-allowed':'pointer', opacity:exporting?0.6:1, fontFamily:'inherit', transition:'all 0.15s' }}
              onMouseEnter={e=>{ if(!exporting){ e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.textMid; }}>
              <Download size={14}/> {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          )}
          {['admin','doctor','nurse','frontdesk'].includes(user?.role) && (
            <Link to="/patients/new" style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'11px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 3px 12px rgba(8,145,178,0.35)', userSelect:'none' }}>
                <UserPlus size={15}/> New Patient
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'18px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={14} style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:C.textSoft, pointerEvents:'none' }}/>
          <input type="text" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search by name, code, or phone…"
            style={inputStyle} onFocus={fi} onBlur={fo}/>
        </div>
        <div style={{ position:'relative' }}>
          <select value={branch} onChange={e=>{ setBranch(e.target.value); setPage(1); }}
            style={selectStyle} onFocus={fi} onBlur={fo}>
            <option value="">All Branches</option>
            <option value="jaro">Jaro</option>
            <option value="cabatuan">Cabatuan</option>
          </select>
          <ChevronRight size={13} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%) rotate(90deg)', color:C.textSoft, pointerEvents:'none' }}/>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:C.white, borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
            <div style={{ width:'32px', height:'32px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          </div>
        ) : patients.length===0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:C.textSoft }}>
            <Eye size={40} style={{ margin:'0 auto 12px', opacity:0.25 }}/>
            <p style={{ fontWeight:600, margin:'0 0 4px', color:C.textMid }}>No patients found</p>
            <p style={{ fontSize:'13px', margin:0 }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                  {['Patient','Code','Contact','Last Visit','Branch',''].map((h,i)=>(
                    <th key={i} style={{ textAlign:'left', padding:'12px 16px', fontSize:'11px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} onClick={()=>navigate(`/patients/${p.id}`)}
                    style={{ borderBottom:`1px solid ${C.bg}`, cursor:'pointer', transition:'background 0.12s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:C.primaryBg, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', flexShrink:0 }}>
                          {p.full_name?.split(' ').map(n=>n[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, color:C.text, margin:0, fontSize:'13px' }}>{p.full_name}</p>
                          {p.date_of_birth && <p style={{ fontSize:'11px', color:C.textSoft, margin:'1px 0 0' }}>DOB: {p.date_of_birth}</p>}
                        </div>
                        {p.gender && (
                          <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'999px',
                            background: p.gender==='Male'?'#eff6ff':p.gender==='Female'?'#fdf2f8':'#f1f5f9',
                            color:      p.gender==='Male'?'#1d4ed8':p.gender==='Female'?'#be185d':C.textMid,
                          }}>{p.gender}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:'11px', fontFamily:'monospace', color:C.textMid, background:C.bg, padding:'3px 8px', borderRadius:'6px', border:`1px solid ${C.border}` }}>{p.patient_code}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:C.textMid }}>
                        <Phone size={11} color={C.textSoft}/> {p.contact_number||'\u2014'}
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:C.textMid }}>
                        <Calendar size={11} color={C.textSoft}/>
                        {p.last_visit ? new Date(p.last_visit).toLocaleDateString() : <span style={{ color:C.textSoft }}>No visits</span>}
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:'12px', textTransform:'capitalize', color:C.textMid }}>{p.branch||'jaro'}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <ChevronRight size={15} color={C.border}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total>limit && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:'12px', color:C.textSoft }}>Showing {((page-1)*limit)+1}\u2013{Math.min(page*limit,total)} of {total}</span>
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
    </div>
  );
}
