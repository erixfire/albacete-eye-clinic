import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, Users, ArrowRight } from 'lucide-react';

const C = {
  primary:'#0891b2', primaryBg:'#e0f2fe',
  border:'#f1f5f9', borderMid:'#e2e8f0', bg:'#f8fafc', white:'#fff',
  text:'#0f172a', textMid:'#475569', textSoft:'#94a3b8',
};

export default function GlobalSearch({ open: openProp, onClose }) {
  const [openSelf, setOpenSelf] = useState(false);
  const open   = openProp !== undefined ? openProp : openSelf;
  // doOpen reserved for future use
  const doClose = () => { onClose?.(); setOpenSelf(false); };

  const [q,       setQ]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor,  setCursor]  = useState(-1);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const navigate  = useNavigate();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (openProp !== undefined) { if (!openProp) onClose?.(); }
        else setOpenSelf(o => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openProp, onClose]);

  useEffect(() => {
    if (open) {
      setQ(''); setResults([]); setCursor(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (term) => {
    if (!term.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(term)}&limit=8`, { credentials:'include' });
      if (res.ok) { const d = await res.json(); setResults(d.patients || []); }
    } finally { setLoading(false); }
  }, []);

  const handleChange = e => {
    const val = e.target.value;
    setQ(val); setCursor(-1);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 250);
  };

  const go = id => { doClose(); navigate(`/patients/${id}`); };

  const handleKey = e => {
    if (e.key === 'Escape') { doClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)); }
    if (e.key === 'Enter' && cursor >= 0 && results[cursor]) go(results[cursor].id);
    if (e.key === 'Enter' && cursor === -1 && q.trim()) { doClose(); navigate(`/patients?q=${encodeURIComponent(q)}`); }
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'80px', paddingLeft:'16px', paddingRight:'16px' }}>
      {/* Backdrop */}
      <div onClick={() => doClose()} style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)' }}/>

      {/* Modal */}
      <div style={{ position:'relative', width:'100%', maxWidth:'560px', background:C.white, borderRadius:'18px', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', overflow:'hidden', border:`1px solid ${C.borderMid}` }}>
        {/* Search input */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderBottom:`1px solid ${C.border}` }}>
          <Search size={18} color={C.primary}/>
          <input
            ref={inputRef}
            value={q}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder="Search patients by name, code, or phone…"
            style={{ flex:1, border:'none', outline:'none', fontSize:'15px', fontFamily:'inherit', color:C.text, background:'transparent' }}
          />
          {loading && <div style={{ width:'16px', height:'16px', border:`2px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>}
          {!loading && <button onClick={() => doClose()} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex', padding:'2px' }}><X size={16}/></button>}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <p style={{ fontSize:'10px', fontWeight:700, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.08em', padding:'10px 18px 4px' }}>Patients</p>
            {results.map((p, i) => {
              const initials = p.full_name?.split(' ').map(n=>n[0]).slice(0,2).join('') || '?';
              const active = i === cursor;
              return (
                <div key={p.id} onClick={() => go(p.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:'12px', padding:'10px 18px',
                    cursor:'pointer', background: active ? C.primaryBg : 'transparent',
                    transition:'background 0.1s',
                  }}
                  onMouseEnter={e => { setCursor(i); e.currentTarget.style.background=C.primaryBg; }}
                  onMouseLeave={e => { if (cursor !== i) e.currentTarget.style.background='transparent'; }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', flexShrink:0 }}>
                    {initials}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:'14px', color:C.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.full_name}
                    </p>
                    <p style={{ fontSize:'11px', color:C.textSoft, margin:'1px 0 0', fontFamily:'monospace' }}>
                      {p.patient_code}{p.contact_number ? ` · ${p.contact_number}` : ''}{p.branch ? ` · ${p.branch}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={15} color={active ? C.primary : C.border}/>
                </div>
              );
            })}
            {q.trim() && (
              <div onClick={() => { doClose(); navigate(`/patients?q=${encodeURIComponent(q)}`); }}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 18px', borderTop:`1px solid ${C.border}`, cursor:'pointer', color:C.primary, fontSize:'13px', fontWeight:600, transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <ArrowRight size={14}/>
                View all results for &ldquo;{q}&rdquo;
              </div>
            )}
          </div>
        )}

        {!loading && q.trim() && results.length === 0 && (
          <div style={{ padding:'28px 18px', textAlign:'center', color:C.textSoft }}>
            <Users size={28} style={{ margin:'0 auto 8px', opacity:0.3 }}/>
            <p style={{ fontSize:'13px', margin:0 }}>No patients found for <strong>&ldquo;{q}&rdquo;</strong></p>
          </div>
        )}

        {!q && (
          <div style={{ padding:'14px 18px' }}>
            <p style={{ fontSize:'12px', color:C.textSoft, margin:'0 0 10px' }}>Quick tips</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {[['Search by name','e.g. Santos, Maria'],['Search by code','e.g. AEC-2026-00001'],['Search by phone','e.g. 09171234567']].map(([tip,eg])=>(
                <div key={tip} style={{ display:'flex', justifyContent:'space-between', padding:'7px 12px', background:C.bg, borderRadius:'9px', fontSize:'12px' }}>
                  <span style={{ color:C.textMid, fontWeight:600 }}>{tip}</span>
                  <span style={{ color:C.textSoft, fontFamily:'monospace' }}>{eg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', gap:'16px', padding:'10px 18px', borderTop:`1px solid ${C.border}`, background:C.bg }}>
          {[['↵','to select'],['↑↓','to navigate'],['esc','to close']].map(([key,label])=>(
            <div key={key} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:C.textSoft }}>
              <kbd style={{ background:C.white, border:`1px solid ${C.borderMid}`, borderRadius:'5px', padding:'1px 6px', fontFamily:'monospace', fontSize:'11px', color:C.textMid }}>{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
