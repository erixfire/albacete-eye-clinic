import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

const TABS = ['Personal', 'Contact & Address', 'Emergency', 'Medical'];
const FIELD_TAB = { full_name:0, date_of_birth:0, gender:0, contact_number:1, email:1 };
const EMPTY = {
  full_name:'', date_of_birth:'', gender:'', civil_status:'',
  contact_number:'', email:'', address:'', city:'',
  emergency_contact_name:'', emergency_contact_number:'', emergency_relation:'',
  blood_type:'', known_allergies:'', medical_history_notes:'',
  philhealth_no:'', branch:'jaro', is_active:1,
};

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

// ── shared style tokens ──────────────────────────────────────────────────────
const inputBase = {
  width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0',
  borderRadius:'10px', fontSize:'13px', color:'#0f172a',
  outline:'none', fontFamily:'inherit', boxSizing:'border-box',
  background:'#fff', transition:'border-color 0.15s, box-shadow 0.15s',
};
const inputErr  = { borderColor:'#fca5a5', background:'#fef2f2' };
const inputRO   = { opacity:0.6, cursor:'not-allowed', background:'#f8fafc' };
const selectExt = {
  appearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
};
const focusOn  = e => Object.assign(e.target.style, { borderColor:'#0891b2', boxShadow:'0 0 0 3px rgba(8,145,178,0.12)' });
const focusOff = (hasErr) => e => Object.assign(e.target.style, { borderColor: hasErr ? '#fca5a5' : '#e2e8f0', boxShadow:'none' });

export default function PatientForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit   = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState(0);
  const [patientCode, setPatientCode] = useState('');
  const [dirty, setDirty]       = useState(false);
  const initialForm             = useRef(EMPTY);
  const [dupWarning, setDupWarning] = useState('');
  const dupTimer                    = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/patients/${id}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => {
        const p = d.patient || d;
        const filled = { ...EMPTY, ...p };
        setForm(filled); initialForm.current = filled;
        setPatientCode(p.patient_code || '');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    const handler = e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setDirty(true);
    if (errors[k]) setErrors(e => { const n={...e}; delete n[k]; return n; });
  }, [errors]);

  const checkDuplicate = useCallback((name) => {
    clearTimeout(dupTimer.current);
    setDupWarning('');
    if (!name || name.length < 3) return;
    dupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?q=${encodeURIComponent(name)}&limit=3`, { credentials:'include' });
        if (!res.ok) return;
        const { patients } = await res.json();
        const others = (patients || []).filter(p => String(p.id) !== String(id));
        if (others.length > 0) setDupWarning(`Similar record found: ${others.map(p => p.full_name).join(', ')}`);
      } catch { /* ignore duplicate check errors */ }
    }, 600);
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())      errs.full_name      = 'Full name is required.';
    if (!form.contact_number.trim()) errs.contact_number = 'Contact number is required.';
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Invalid email address.';
    return errs;
  };

  const safeNavigate = (path) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstErrTab = Math.min(...Object.keys(errs).map(k => FIELD_TAB[k] ?? 99).filter(n => n < 99));
      if (firstErrTab < 99) setTab(firstErrTab);
      return;
    }
    setSaving(true);
    const res = await fetch(isEdit ? `/api/patients/${id}` : '/api/patients', {
      method: isEdit ? 'PUT' : 'POST',
      credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setDirty(false); navigate(isEdit ? `/patients/${id}` : `/patients/${data.id}`); }
    else setErrors({ general: data.error || 'Failed to save patient.' });
  };

  // ── Field sub-component ─────────────────────────────────────────────────
  const Field = ({ label, name, type='text', options, required, full, placeholder, hint, readOnly }) => {
    const hasErr = Boolean(errors[name]);
    const baseStyle = {
      ...inputBase,
      ...(hasErr ? inputErr : {}),
      ...(readOnly ? inputRO : {}),
    };
    return (
      <div style={full ? { gridColumn:'1 / -1' } : {}}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px' }}>
          {label}{required && <span style={{ color:'#ef4444', marginLeft:'2px' }}>*</span>}
        </label>
        {options ? (
          <select
            value={form[name]}
            onChange={e => set(name, e.target.value)}
            disabled={readOnly}
            style={{...baseStyle, ...selectExt}}
            onFocus={focusOn} onBlur={focusOff(hasErr)}
          >
            <option value="">Select…</option>
            {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={form[name]}
            onChange={e => set(name, e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{...baseStyle, resize:'none', lineHeight:'1.5'}}
            onFocus={focusOn} onBlur={focusOff(hasErr)}
          />
        ) : (
          <input
            type={type}
            value={form[name]}
            onChange={e => set(name, e.target.value)}
            onBlur={e => { focusOff(hasErr)(e); if (name==='full_name') checkDuplicate(form.full_name); }}
            placeholder={placeholder}
            readOnly={readOnly}
            style={baseStyle}
            onFocus={focusOn}
          />
        )}
        {hint && !hasErr && <p style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>{hint}</p>}
        {hasErr && <p style={{ fontSize:'12px', color:'#ef4444', marginTop:'4px' }}>{errors[name]}</p>}
      </div>
    );
  };

  const age = calcAge(form.date_of_birth);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px' }}>
      <div style={{ width:'32px', height:'32px', border:'3px solid #e2e8f0', borderTopColor:'#0891b2', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:'740px', margin:'0 auto', padding:'8px 0 40px' }}>

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <button
          type="button"
          onClick={() => safeNavigate(isEdit ? `/patients/${id}` : '/patients')}
          style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'7px', cursor:'pointer', display:'flex', color:'#64748b', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#64748b'; }}
        >
          <ArrowLeft size={17}/>
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontWeight:800, fontSize:'24px', color:'#0f172a', margin:0, letterSpacing:'-0.02em' }}>
            {isEdit ? 'Edit Patient' : 'New Patient'}
          </h1>
          {isEdit && patientCode && (
            <p style={{ fontSize:'12px', color:'#94a3b8', fontFamily:'monospace', margin:'3px 0 0' }}>{patientCode}</p>
          )}
        </div>
        {isEdit && user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => set('is_active', form.is_active ? 0 : 1)}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              padding:'7px 14px', borderRadius:'10px',
              fontSize:'12px', fontWeight:700, cursor:'pointer', border:'1px solid',
              ...(form.is_active
                ? { background:'#ecfdf5', color:'#059669', borderColor:'#a7f3d0' }
                : { background:'#fef2f2', color:'#dc2626', borderColor:'#fecaca' }),
            }}
          >
            {form.is_active ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
            {form.is_active ? 'Active' : 'Inactive'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {errors.general && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'11px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'14px' }}>
          <AlertTriangle size={15}/> {errors.general}
        </div>
      )}
      {dupWarning && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', padding:'11px 14px', fontSize:'13px', color:'#92400e', marginBottom:'14px' }}>
          <AlertTriangle size={15}/>
          <span><strong>Possible duplicate:</strong> {dupWarning}. Please verify before creating.</span>
        </div>
      )}
      {dirty && (
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'8px 14px', fontSize:'12px', color:'#2563eb', marginBottom:'14px' }}>
          You have unsaved changes.
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display:'flex', gap:'4px', background:'#f1f5f9', padding:'4px', borderRadius:'14px', marginBottom:'20px' }}>
        {TABS.map((t, i) => {
          const hasErr = Object.keys(errors).some(k => FIELD_TAB[k] === i);
          return (
            <button
              key={t} type="button" onClick={() => setTab(i)}
              style={{
                flex:1, padding:'8px 4px', fontSize:'12px', fontWeight:700,
                border:'none', borderRadius:'10px', cursor:'pointer',
                fontFamily:'inherit', position:'relative', transition:'all 0.15s',
                ...(tab === i
                  ? { background:'#fff', color:'#0891b2', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }
                  : { background:'transparent', color:'#64748b' }),
              }}
            >
              {t}
              {hasErr && (
                <span style={{ position:'absolute', top:'6px', right:'6px', width:'7px', height:'7px', background:'#ef4444', borderRadius:'50%' }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit}>
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', padding:'24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

            {/* Tab 0: Personal */}
            {tab === 0 && (<>
              <Field label="Full Name" name="full_name" required full placeholder="e.g. Juan Dela Cruz"/>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px' }}>Date of Birth</label>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <input
                    type="date" value={form.date_of_birth}
                    onChange={e => set('date_of_birth', e.target.value)}
                    style={{ ...inputBase, flex:1 }}
                    onFocus={focusOn} onBlur={focusOff(false)}
                  />
                  {age !== null && (
                    <span style={{ flexShrink:0, fontSize:'12px', fontWeight:700, color:'#0891b2', background:'#e0f2fe', padding:'5px 10px', borderRadius:'8px', whiteSpace:'nowrap' }}>
                      {age} yrs
                    </span>
                  )}
                </div>
              </div>
              <Field label="Gender"       name="gender"       options={['Male','Female','Other']}/>
              <Field label="Civil Status" name="civil_status" options={['Single','Married','Widowed','Separated']}/>
              <Field label="Branch" name="branch" options={[{value:'jaro',label:'Jaro'},{value:'cabatuan',label:'Cabatuan'}]}/>
              <Field label="PhilHealth No." name="philhealth_no" placeholder="XX-XXXXXXXXX-X"/>
            </>)}

            {/* Tab 1: Contact & Address */}
            {tab === 1 && (<>
              <Field label="Contact Number" name="contact_number" required type="tel" placeholder="09XX XXX XXXX"/>
              <Field label="Email" name="email" type="email" placeholder="patient@email.com"/>
              <Field label="Address" name="address" full placeholder="House No., Street, Barangay"/>
              <Field label="City / Municipality" name="city" placeholder="e.g. Iloilo City"/>
            </>)}

            {/* Tab 2: Emergency */}
            {tab === 2 && (<>
              <Field label="Emergency Contact Name"   name="emergency_contact_name"   placeholder="Full name"/>
              <Field label="Emergency Contact Number" name="emergency_contact_number" type="tel" placeholder="09XX XXX XXXX"/>
              <Field label="Relationship" name="emergency_relation" placeholder="e.g. Spouse, Parent"/>
            </>)}

            {/* Tab 3: Medical */}
            {tab === 3 && (<>
              <Field label="Blood Type" name="blood_type" options={['A+','A-','B+','B-','AB+','AB-','O+','O-']}/>
              <Field label="Known Allergies"       name="known_allergies"       type="textarea" full placeholder="List any known allergies…"/>
              <Field label="Medical History Notes" name="medical_history_notes" type="textarea" full placeholder="Previous conditions, surgeries…"/>
            </>)}

          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'16px' }}>
          {/* Progress bar */}
          <div style={{ display:'flex', gap:'6px' }}>
            {TABS.map((_, i) => (
              <div key={i} style={{
                height:'4px', width:'36px', borderRadius:'4px',
                background: i === tab ? '#0891b2' : i < tab ? 'rgba(8,145,178,0.35)' : '#e2e8f0',
                transition:'background 0.2s',
              }}/>
            ))}
          </div>

          <div style={{ display:'flex', gap:'8px' }}>
            {tab > 0 && (
              <button
                type="button" onClick={() => setTab(t => t - 1)}
                style={{ padding:'8px 18px', fontSize:'13px', fontWeight:600, border:'1px solid #e2e8f0', borderRadius:'10px', background:'#fff', cursor:'pointer', color:'#64748b', fontFamily:'inherit', transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >
                Back
              </button>
            )}
            {tab < TABS.length - 1 ? (
              <button
                type="button" onClick={() => setTab(t => t + 1)}
                style={{ padding:'8px 18px', fontSize:'13px', fontWeight:700, border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(8,145,178,0.28)', transition:'opacity 0.15s' }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit" disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 20px', fontSize:'13px', fontWeight:700, border:'none', borderRadius:'10px', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 10px rgba(8,145,178,0.28)', opacity: saving ? 0.6 : 1, transition:'opacity 0.15s' }}
              >
                <Save size={14}/>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Patient'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
