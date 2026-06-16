import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

const S = {
  overlay: {
    position:'fixed', inset:0, zIndex:50,
    display:'flex', alignItems:'center', justifyContent:'center',
    background:'rgba(0,0,0,0.45)', backdropFilter:'blur(3px)', padding:'16px',
  },
  modal: {
    background:'#fff', borderRadius:'20px',
    boxShadow:'0 20px 60px rgba(0,0,0,0.18)',
    width:'100%', maxWidth:'520px',
    maxHeight:'90vh', display:'flex', flexDirection:'column',
  },
  header: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'20px 24px 16px', borderBottom:'1px solid #f1f5f9',
  },
  title: { fontWeight:800, fontSize:'17px', color:'#0f172a', margin:0 },
  closeBtn: {
    background:'none', border:'none', cursor:'pointer',
    color:'#94a3b8', display:'flex', padding:'4px', borderRadius:'8px',
    transition:'all 0.15s',
  },
  body: { flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'16px' },
  label: { display:'block', fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px' },
  required: { color:'#ef4444', marginLeft:'2px' },
  inputBase: {
    width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0',
    borderRadius:'10px', fontSize:'13px', color:'#0f172a',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
    background:'#fff', transition:'border-color 0.15s, box-shadow 0.15s',
  },
  searchWrap: { position:'relative', marginBottom:'6px' },
  searchIcon: { position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' },
  searchInput: { paddingLeft:'32px' },
  select: { appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' },
  listSelect: { height:'100px' },
  textarea: { resize:'none', lineHeight:'1.5' },
  errorBox: {
    background:'#fef2f2', border:'1px solid #fecaca',
    borderRadius:'10px', padding:'10px 14px',
    fontSize:'13px', color:'#dc2626',
  },
  footer: {
    display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'10px',
    padding:'14px 24px 18px', borderTop:'1px solid #f1f5f9',
  },
  cancelBtn: {
    padding:'8px 16px', background:'none', border:'1px solid #e2e8f0',
    borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#64748b',
    cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
  },
  saveBtn: {
    padding:'9px 20px',
    background:'linear-gradient(135deg,#0891b2,#0c4a6e)',
    border:'none', borderRadius:'10px',
    fontSize:'13px', fontWeight:700, color:'#fff',
    cursor:'pointer', fontFamily:'inherit', transition:'opacity 0.15s',
    boxShadow:'0 3px 10px rgba(8,145,178,0.3)',
  },
};

export default function AppointmentForm({ onClose, onSaved, initialPatientId = null }) {
  const [patients, setPatients]     = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [specializations, setSpecs] = useState([]);
  const [patientQ, setPatientQ]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const defaultDate = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({
    patient_id: initialPatientId || '',
    doctor_id: '',
    specialization_id: '',
    appointment_date: defaultDate,
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/patients?limit=50', { credentials:'include' }).then(r => r.json()),
      fetch('/api/users?role=doctor',  { credentials:'include' }).then(r => r.json()),
      fetch('/api/specializations',    { credentials:'include' }).then(r => r.json()),
    ]).then(([pd, dc, sp]) => {
      setPatients(pd.patients || pd || []);
      setDoctors(dc.users    || dc || []);
      setSpecs(sp.specializations || sp || []);
    }).catch(() => {});
  }, []);

  const filteredPatients = patients.filter(p =>
    !patientQ ||
    p.full_name?.toLowerCase().includes(patientQ.toLowerCase()) ||
    p.patient_code?.toLowerCase().includes(patientQ.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const focusStyle  = { borderColor:'#0891b2', boxShadow:'0 0 0 3px rgba(8,145,178,0.12)' };
  const addFocus    = e => Object.assign(e.target.style, focusStyle);
  const removeFocus = e => Object.assign(e.target.style, { borderColor:'#e2e8f0', boxShadow:'none' });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!form.patient_id || !form.doctor_id || !form.specialization_id || !form.appointment_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/appointments', {
      method:'POST', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { onSaved(); }
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Failed to save appointment.');
    }
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <h2 style={S.title}>New Appointment</h2>
          <button style={S.closeBtn} onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            <X size={18}/>
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>

          {/* Patient */}
          <div>
            <label style={S.label}>Patient<span style={S.required}>*</span></label>
            <div style={S.searchWrap}>
              <Search size={13} style={S.searchIcon}/>
              <input
                type="text" value={patientQ}
                onChange={e => setPatientQ(e.target.value)}
                placeholder="Search patient…"
                style={{...S.inputBase, ...S.searchInput}}
                onFocus={addFocus} onBlur={removeFocus}
              />
            </div>
            <select
              value={form.patient_id}
              onChange={e => set('patient_id', e.target.value)}
              size={4}
              style={{...S.inputBase, ...S.listSelect, padding:'6px 8px'}}
            >
              <option value="">— select patient —</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div>
            <label style={S.label}>Doctor<span style={S.required}>*</span></label>
            <select
              value={form.doctor_id}
              onChange={e => set('doctor_id', e.target.value)}
              style={{...S.inputBase, ...S.select}}
              onFocus={addFocus} onBlur={removeFocus}
            >
              <option value="">— select doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
              ))}
            </select>
          </div>

          {/* Specialization */}
          <div>
            <label style={S.label}>Specialization<span style={S.required}>*</span></label>
            <select
              value={form.specialization_id}
              onChange={e => set('specialization_id', e.target.value)}
              style={{...S.inputBase, ...S.select}}
              onFocus={addFocus} onBlur={removeFocus}
            >
              <option value="">— select —</option>
              {specializations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label style={S.label}>Date &amp; Time<span style={S.required}>*</span></label>
            <input
              type="datetime-local"
              value={form.appointment_date}
              onChange={e => set('appointment_date', e.target.value)}
              style={S.inputBase}
              onFocus={addFocus} onBlur={removeFocus}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={S.label}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Chief complaint or special instructions…"
              style={{...S.inputBase, ...S.textarea}}
              onFocus={addFocus} onBlur={removeFocus}
            />
          </div>

          {error && <div style={S.errorBox}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            Cancel
          </button>
          <button
            style={{...S.saveBtn, opacity: loading ? 0.6 : 1}}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Schedule Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
