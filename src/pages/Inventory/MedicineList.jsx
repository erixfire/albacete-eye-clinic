import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, Plus, AlertTriangle, Clock,
  TrendingDown, TrendingUp, X, History, RefreshCw
} from 'lucide-react';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../../components/AnimatedPage';
import { motion } from 'framer-motion';

const C = {
  primary:     '#0891b2',
  primaryDark: '#0e7490',
  primaryBg:   '#e0f2fe',
  border:      '#f1f5f9',
  borderMid:   '#e2e8f0',
  bg:          '#f8fafc',
  white:       '#fff',
  text:        '#0f172a',
  textMid:     '#475569',
  textSoft:    '#94a3b8',
  danger:      '#dc2626',
  dangerBg:    '#fef2f2',
  warn:        '#d97706',
  warnBg:      '#fef3c7',
  amber:       '#b45309',
  amberBg:     '#fef9c3',
};

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: `1.5px solid ${C.borderMid}`, borderRadius: '10px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  background: '#fafafa', color: C.text, boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};
const focusIn  = e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(8,145,178,0.12)`; e.target.style.background = '#fff'; };
const focusOut = e => { e.target.style.borderColor = C.borderMid; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafafa'; };

// ─── Add/Edit Modal ─────────────────────────────────────────────────────────
function MedicineModal({ medicine, onClose, onSaved }) {
  const isEdit = !!medicine?.id;
  const [form, setForm] = useState({
    name:           medicine?.name           || '',
    generic_name:   medicine?.generic_name   || '',
    category:       medicine?.category       || '',
    manufacturer:   medicine?.manufacturer   || '',
    unit:           medicine?.unit           || '',
    unit_price:     medicine?.unit_price     ?? '',
    stock_quantity: medicine?.stock_quantity ?? '',
    reorder_level:  medicine?.reorder_level  ?? 10,
    batch_number:   medicine?.batch_number   || '',
    expiry_date:    medicine?.expiry_date    || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Medicine name is required.'); return; }
    setLoading(true); setError('');
    const res = await fetch(
      isEdit ? `/api/medicines/${medicine.id}` : '/api/medicines',
      { method: isEdit ? 'PUT' : 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form,
          unit_price:     form.unit_price     !== '' ? Number(form.unit_price)     : 0,
          stock_quantity: form.stock_quantity !== '' ? Number(form.stock_quantity) : 0,
          reorder_level:  form.reorder_level  !== '' ? Number(form.reorder_level)  : 10,
        }),
      }
    );
    setLoading(false);
    if (res.ok) onSaved();
    else { const d = await res.json().catch(()=>({})); setError(d.error || 'Save failed.'); }
  };

  const fields = [
    { key:'name',           label:'Medicine Name *', type:'text',   full:true },
    { key:'generic_name',   label:'Generic Name',    type:'text' },
    { key:'category',       label:'Category',        type:'text' },
    { key:'manufacturer',   label:'Manufacturer',    type:'text' },
    { key:'unit',           label:'Unit (tab/mL)',   type:'text' },
    { key:'unit_price',     label:'Unit Price (₱)',  type:'number' },
    { key:'stock_quantity', label:'Initial Stock',   type:'number' },
    { key:'reorder_level',  label:'Reorder Level',   type:'number' },
    { key:'batch_number',   label:'Batch No.',       type:'text' },
    { key:'expiry_date',    label:'Expiry Date',     type:'date' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', padding:'16px' }}>
      <div style={{ background:C.white, borderRadius:'20px', boxShadow:'0 25px 60px rgba(0,0,0,0.2)', width:'100%', maxWidth:'520px', maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:`1px solid ${C.border}` }}>
          <h2 style={{ fontSize:'16px', fontWeight:800, color:C.text, margin:0 }}>{isEdit?'Edit Medicine':'Add Medicine'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex' }}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{ overflowY:'auto', flex:1, padding:'20px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : undefined }}>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:C.textMid, marginBottom:'5px', letterSpacing:'0.04em' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e=>set(f.key, e.target.value)}
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
              </div>
            ))}
          </div>
          {error && <p style={{ marginTop:'12px', fontSize:'13px', color:C.danger, background:C.dangerBg, padding:'10px 14px', borderRadius:'10px' }}>{error}</p>}
        </form>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', padding:'14px 24px', borderTop:`1px solid ${C.border}` }}>
          <button type="button" onClick={onClose} style={{ padding:'8px 16px', fontSize:'13px', color:C.textMid, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding:'9px 20px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, fontFamily:'inherit', boxShadow:'0 3px 10px rgba(8,145,178,0.3)' }}>
            {loading?'Saving…':isEdit?'Save Changes':'Add Medicine'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Stock Modal ─────────────────────────────────────────────────────
function AdjustModal({ medicine, onClose, onSaved }) {
  const [delta,   setDelta]   = useState('');
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handle = async (e) => {
    e.preventDefault();
    if (!delta || delta === '0') { setError('Enter a non-zero amount.'); return; }
    if (!reason.trim()) { setError('Reason is required.'); return; }
    setLoading(true); setError('');
    const res = await fetch(`/api/medicines/${medicine.id}/adjust`, {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ delta: Number(delta), reason }),
    });
    setLoading(false);
    if (res.ok) onSaved();
    else { const d = await res.json().catch(()=>({})); setError(d.error || 'Adjustment failed.'); }
  };

  const numDelta = Number(delta);
  const preview  = delta && medicine ? medicine.stock_quantity + numDelta : null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', padding:'16px' }}>
      <div style={{ background:C.white, borderRadius:'20px', boxShadow:'0 25px 60px rgba(0,0,0,0.2)', width:'100%', maxWidth:'380px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:`1px solid ${C.border}` }}>
          <h2 style={{ fontSize:'15px', fontWeight:800, color:C.text, margin:0 }}>Adjust Stock</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex' }}><X size={18}/></button>
        </div>
        <form onSubmit={handle} style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ background:C.bg, borderRadius:'12px', padding:'14px 16px' }}>
            <p style={{ fontWeight:700, color:C.text, margin:'0 0 2px', fontSize:'14px' }}>{medicine.name}</p>
            <p style={{ fontSize:'12px', color:C.textSoft, margin:0 }}>{medicine.generic_name}</p>
            <p style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'8px 0 0' }}>
              {medicine.stock_quantity} <span style={{ fontSize:'13px', fontWeight:500, color:C.textSoft }}>{medicine.unit}</span>
            </p>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:C.textMid, marginBottom:'8px', letterSpacing:'0.04em' }}>ADJUSTMENT AMOUNT</label>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <button type="button" onClick={()=>setDelta(v=>v===''?'-1':String(Number(v)-1))}
                style={{ padding:'9px 14px', background:'#fef2f2', color:C.danger, border:'none', borderRadius:'10px', fontWeight:800, fontSize:'16px', cursor:'pointer', fontFamily:'inherit' }}>−</button>
              <input type="number" value={delta} onChange={e=>setDelta(e.target.value)}
                placeholder="e.g. 10 or -5"
                style={{ ...inputStyle, textAlign:'center', fontFamily:'monospace', flex:1 }}
                onFocus={focusIn} onBlur={focusOut}/>
              <button type="button" onClick={()=>setDelta(v=>v===''?'1':String(Number(v)+1))}
                style={{ padding:'9px 14px', background:'#f0fdf4', color:'#16a34a', border:'none', borderRadius:'10px', fontWeight:800, fontSize:'16px', cursor:'pointer', fontFamily:'inherit' }}>+</button>
            </div>
            {preview !== null && preview >= 0 && (
              <p style={{ fontSize:'12px', textAlign:'center', marginTop:'6px', color: preview <= medicine.reorder_level ? C.warn : '#16a34a', fontWeight:600 }}>
                New stock: {preview} {medicine.unit}
              </p>
            )}
            {preview !== null && preview < 0 && (
              <p style={{ fontSize:'12px', textAlign:'center', marginTop:'6px', color:C.danger, fontWeight:600 }}>Cannot go below 0</p>
            )}
          </div>

          <div>
            <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:C.textMid, marginBottom:'6px', letterSpacing:'0.04em' }}>REASON *</label>
            <select value={reason} onChange={e=>setReason(e.target.value)}
              style={{ ...inputStyle, marginBottom:'8px' }} onFocus={focusIn} onBlur={focusOut}>
              <option value="">— select reason —</option>
              <option>Stock replenishment</option>
              <option>Dispensed to patient</option>
              <option>Expired / disposed</option>
              <option>Inventory correction</option>
              <option>Damaged / lost</option>
              <option>Transfer between branches</option>
            </select>
            <input type="text" value={reason.startsWith('—')?'':reason} onChange={e=>setReason(e.target.value)}
              placeholder="Or type custom reason…" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
          </div>

          {error && <p style={{ fontSize:'13px', color:C.danger, background:C.dangerBg, padding:'10px 14px', borderRadius:'10px', margin:0 }}>{error}</p>}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', paddingTop:'4px' }}>
            <button type="button" onClick={onClose} style={{ padding:'8px 16px', fontSize:'13px', color:C.textMid, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={loading||(preview!==null&&preview<0)}
              style={{ padding:'9px 20px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:(loading||(preview!==null&&preview<0))?'not-allowed':'pointer', opacity:(loading||(preview!==null&&preview<0))?0.5:1, fontFamily:'inherit', boxShadow:'0 3px 10px rgba(8,145,178,0.3)' }}>
              {loading?'Saving…':'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── History Drawer ─────────────────────────────────────────────────────────
function HistoryDrawer({ medicine, onClose }) {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/medicines/${medicine.id}/history`, { credentials:'include' })
      .then(r=>r.json()).then(d=>setTxns(d.transactions||[])).catch(()=>{})
      .finally(()=>setLoading(false));
  }, [medicine.id]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', padding:'16px' }}>
      <div style={{ background:C.white, borderRadius:'20px', boxShadow:'0 25px 60px rgba(0,0,0,0.2)', width:'100%', maxWidth:'440px', maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:`1px solid ${C.border}` }}>
          <div>
            <h2 style={{ fontSize:'15px', fontWeight:800, color:C.text, margin:0 }}>Stock History</h2>
            <p style={{ fontSize:'12px', color:C.textSoft, margin:'3px 0 0' }}>{medicine.name}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft, display:'flex' }}><X size={18}/></button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'12px 16px' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
              <div style={{ width:'32px', height:'32px', border:`3px solid ${C.primaryBg}`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
            </div>
          ) : txns.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:C.textSoft }}>
              <History size={32} style={{ margin:'0 auto 8px', opacity:0.3 }}/>
              <p style={{ fontSize:'13px', margin:0 }}>No transactions yet</p>
            </div>
          ) : txns.map(t => (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', borderRadius:'12px', background:C.bg, marginBottom:'8px' }}>
              <div style={{ padding:'7px', borderRadius:'9px', background: t.delta>0?'#dcfce7':'#fee2e2', color: t.delta>0?'#16a34a':C.danger, display:'flex', flexShrink:0 }}>
                {t.delta>0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                  <span style={{ fontSize:'14px', fontWeight:800, color: t.delta>0?'#16a34a':C.danger }}>{t.delta>0?'+':''}{t.delta}</span>
                  <span style={{ fontSize:'11px', color:C.textSoft, flexShrink:0 }}>{t.stock_before} → {t.stock_after}</span>
                </div>
                <p style={{ fontSize:'12px', color:C.textMid, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.reason}</p>
                <p style={{ fontSize:'10px', color:C.textSoft, margin:'2px 0 0' }}>{t.user_name||'System'} · {new Date(t.created_at).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MedicineList() {
  const [medicines,    setMedicines]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [q,            setQ]            = useState('');
  const [addModal,     setAddModal]     = useState(false);
  const [adjustModal,  setAdjustModal]  = useState(null);
  const [historyModal, setHistoryModal] = useState(null);

  const fetchMeds = useCallback(async () => {
    setLoading(true);
    let url = '/api/medicines';
    if (filter==='low')      url += '?lowStock=true';
    if (filter==='expiring') url += '?expiring=true';
    const res = await fetch(url, { credentials:'include' });
    if (res.ok) setMedicines(await res.json());
    setLoading(false);
  }, [filter]);
  useEffect(()=>{ fetchMeds(); }, [fetchMeds]);

  const filtered = medicines.filter(m =>
    !q ||
    m.name?.toLowerCase().includes(q.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(q.toLowerCase()) ||
    m.category?.toLowerCase().includes(q.toLowerCase())
  );
  const isLow      = m => m.stock_quantity <= m.reorder_level;
  const isExpired  = m => m.expiry_date && new Date(m.expiry_date) < new Date();
  const isExpiring = m => m.expiry_date && !isExpired(m) && new Date(m.expiry_date) <= new Date(Date.now()+30*24*60*60*1000);

  return (
    <AnimatedPage>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:C.text, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Inventory</h1>
          <p style={{ fontSize:'13px', color:C.textSoft, margin:0 }}>Medicines, stock levels &amp; expiry tracking.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button onClick={fetchMeds} title="Refresh"
            style={{ padding:'9px', background:C.white, border:`1px solid ${C.borderMid}`, borderRadius:'10px', cursor:'pointer', display:'flex', color:C.textSoft, transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.textSoft; }}>
            <RefreshCw size={15}/>
          </button>
          <button onClick={()=>setAddModal(true)}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, color:'white', border:'none', borderRadius:'11px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 3px 12px rgba(8,145,178,0.35)', fontFamily:'inherit', transition:'opacity 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <Plus size={15}/> Add Medicine
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:'6px' }}>
          {[
            { id:'all',      label:'All',          icon:Package },
            { id:'low',      label:'Low Stock',     icon:TrendingDown },
            { id:'expiring', label:'Expiring Soon', icon:Clock },
          ].map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'8px 14px', borderRadius:'10px', fontSize:'13px', fontWeight:700,
                border: filter===f.id ? `1.5px solid ${C.primary}` : `1.5px solid ${C.borderMid}`,
                background: filter===f.id ? C.primary : C.white,
                color: filter===f.id ? 'white' : C.textMid,
                cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit',
                boxShadow: filter===f.id ? '0 2px 8px rgba(8,145,178,0.25)' : 'none',
                transition:'all 0.15s',
              }}>
              <f.icon size={13}/>{f.label}
            </button>
          ))}
        </div>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textSoft, pointerEvents:'none' }}/>
          <input type="text" value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search name, generic, category…"
            style={{ ...inputStyle, paddingLeft:'36px' }}
            onFocus={focusIn} onBlur={focusOut}/>
        </div>
      </div>

      {/* Grid */}
      <motion.div variants={staggeredContainer} initial="initial" animate="animate"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
        {loading ? (
          [1,2,3,4,5,6].map(i=>(
            <div key={i} style={{ height:'220px', borderRadius:'18px', background:C.border, animation:'pulse 1.5s ease-in-out infinite' }}/>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:'1/-1', padding:'80px 20px', textAlign:'center', color:C.textSoft }}>
            <Package size={56} style={{ margin:'0 auto 12px', opacity:0.15 }}/>
            <p style={{ fontSize:'14px', margin:0 }}>No medicines found.</p>
          </div>
        ) : filtered.map(med => (
          <motion.div key={med.id} variants={staggeredItem}
            style={{ background:C.white, borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', transition:'box-shadow 0.2s, transform 0.2s', overflow:'hidden' }}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform='translateY(0)'; }}>

            <div style={{ padding:'18px 18px 14px', flex:1 }}>
              {/* Icon + badges */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'14px' }}>
                <div style={{ background:C.primaryBg, color:C.primary, padding:'9px', borderRadius:'11px', display:'flex' }}>
                  <Package size={18}/>
                </div>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', justifyContent:'flex-end' }}>
                  {isExpired(med) && <span style={{ fontSize:'9px', fontWeight:800, background:'#fee2e2', color:C.danger, padding:'2px 7px', borderRadius:'999px', letterSpacing:'0.04em' }}>EXPIRED</span>}
                  {isExpiring(med) && <span style={{ fontSize:'9px', fontWeight:800, background:'#ffedd5', color:'#c2410c', padding:'2px 7px', borderRadius:'999px', letterSpacing:'0.04em' }}>EXP SOON</span>}
                  {isLow(med) && <span style={{ fontSize:'9px', fontWeight:800, background:C.warnBg, color:C.warn, padding:'2px 7px', borderRadius:'999px', display:'flex', alignItems:'center', gap:'3px', letterSpacing:'0.04em' }}><AlertTriangle size={8}/>LOW</span>}
                </div>
              </div>

              <h3 style={{ fontWeight:700, color:C.text, margin:'0 0 2px', fontSize:'15px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{med.name}</h3>
              <p style={{ fontSize:'12px', color:C.textSoft, fontWeight:500, margin:0 }}>{med.generic_name||'—'}</p>
              {med.category && <p style={{ fontSize:'11px', color:C.textSoft, margin:'2px 0 0' }}>{med.category}</p>}

              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'16px' }}>
                <div>
                  <p style={{ fontSize:'30px', fontWeight:800, color: isLow(med)?C.warn:C.text, margin:0, lineHeight:1, letterSpacing:'-0.02em' }}>{med.stock_quantity}</p>
                  <p style={{ fontSize:'9px', fontWeight:800, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.1em', margin:'4px 0 0' }}>{med.unit||'Units'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'9px', fontWeight:800, color:C.textSoft, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>Expiry</p>
                  <p style={{ fontSize:'12px', fontWeight:700, color: isExpired(med)?C.danger:isExpiring(med)?'#ea580c':C.textMid, margin:0 }}>
                    {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop:'12px' }}>
                <div style={{ height:'5px', background:C.border, borderRadius:'999px', overflow:'hidden' }}>
                  <div style={{ height:'100%', background: isLow(med)?'#f59e0b':C.primary, borderRadius:'999px', width:`${Math.min(100,(med.stock_quantity/Math.max(med.reorder_level*2,1))*100)}%`, transition:'width 0.4s' }}/>
                </div>
                <p style={{ fontSize:'9px', color:C.textSoft, margin:'3px 0 0' }}>Reorder at {med.reorder_level}</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding:'0 14px 14px', display:'flex', gap:'8px' }}>
              <button onClick={()=>setAdjustModal(med)}
                style={{ flex:1, padding:'9px', background:C.bg, border:`1px solid ${C.borderMid}`, borderRadius:'10px', fontSize:'12px', fontWeight:700, color:C.textMid, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontFamily:'inherit', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=C.primary; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor=C.primary; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.bg; e.currentTarget.style.color=C.textMid; e.currentTarget.style.borderColor=C.borderMid; }}>
                <TrendingUp size={13}/> Adjust Stock
              </button>
              <button onClick={()=>setHistoryModal(med)}
                style={{ padding:'9px 12px', background:C.bg, border:`1px solid ${C.borderMid}`, borderRadius:'10px', cursor:'pointer', display:'flex', color:C.textSoft, transition:'all 0.15s', fontFamily:'inherit' }}
                title="Transaction History"
                onMouseEnter={e=>{ e.currentTarget.style.background=C.primaryBg; e.currentTarget.style.color=C.primary; e.currentTarget.style.borderColor=C.primary; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.bg; e.currentTarget.style.color=C.textSoft; e.currentTarget.style.borderColor=C.borderMid; }}>
                <History size={14}/>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {addModal     && <MedicineModal onClose={()=>setAddModal(false)}    onSaved={()=>{ setAddModal(false);    fetchMeds(); }}/>}
      {adjustModal  && <AdjustModal   medicine={adjustModal}  onClose={()=>setAdjustModal(null)}  onSaved={()=>{ setAdjustModal(null);  fetchMeds(); }}/>}
      {historyModal && <HistoryDrawer medicine={historyModal} onClose={()=>setHistoryModal(null)}/>}
    </AnimatedPage>
  );
}
