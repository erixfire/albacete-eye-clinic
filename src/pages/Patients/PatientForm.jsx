import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, AlertTriangle, CheckCircle, User } from 'lucide-react';

const TABS = ['Personal', 'Contact & Address', 'Emergency', 'Medical'];

// Which tab each validated field lives on
const FIELD_TAB = {
  full_name:      0,
  date_of_birth:  0,
  gender:         0,
  contact_number: 1,
  email:          1,
};

const EMPTY = {
  full_name: '', date_of_birth: '', gender: '', civil_status: '',
  contact_number: '', email: '', address: '', city: '',
  emergency_contact_name: '', emergency_contact_number: '', emergency_relation: '',
  blood_type: '', known_allergies: '', medical_history_notes: '',
  philhealth_no: '', branch: 'jaro', is_active: 1,
};

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function PatientForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isEdit     = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState(0);
  const [patientCode, setPatientCode] = useState('');

  // Unsaved-changes guard
  const [dirty, setDirty]       = useState(false);
  const initialForm             = useRef(EMPTY);

  // Duplicate-name warning
  const [dupWarning, setDupWarning] = useState('');
  const dupTimer                    = useRef(null);

  // ── Load patient for edit ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/patients/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const p = d.patient || d;
        const filled = { ...EMPTY, ...p };
        setForm(filled);
        initialForm.current = filled;
        setPatientCode(p.patient_code || '');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // ── Unsaved-changes: browser unload ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // ── Field setter ──────────────────────────────────────────────────────────
  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setDirty(true);
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }, [errors]);

  // ── Duplicate-name check ──────────────────────────────────────────────────
  const checkDuplicate = useCallback((name) => {
    clearTimeout(dupTimer.current);
    setDupWarning('');
    if (!name || name.length < 3) return;
    dupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?q=${encodeURIComponent(name)}&limit=3`, { credentials: 'include' });
        if (!res.ok) return;
        const { patients } = await res.json();
        const others = (patients || []).filter(p => String(p.id) !== String(id));
        if (others.length > 0) {
          setDupWarning(`Similar record found: ${others.map(p => p.full_name).join(', ')}`);
        }
      } catch { /* ignore */ }
    }, 600);
  }, [id]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())      errs.full_name      = 'Full name is required.';
    if (!form.contact_number.trim()) errs.contact_number = 'Contact number is required.';
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      errs.email = 'Invalid email address.';
    return errs;
  };

  // ── Navigate-away guard ───────────────────────────────────────────────────
  const safeNavigate = (path) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
    navigate(path);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Jump to the first tab that has an error
      const firstErrTab = Math.min(
        ...Object.keys(errs).map(k => FIELD_TAB[k] ?? 99).filter(n => n < 99)
      );
      if (firstErrTab < 99) setTab(firstErrTab);
      return;
    }
    setSaving(true);
    const res = await fetch(isEdit ? `/api/patients/${id}` : '/api/patients', {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      navigate(isEdit ? `/patients/${id}` : `/patients/${data.id}`);
    } else {
      setErrors({ general: data.error || 'Failed to save patient.' });
    }
  };

  // ── Field component ───────────────────────────────────────────────────────
  const Field = ({ label, name, type = 'text', options, required, full, placeholder, hint, readOnly }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {options ? (
        <select
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          disabled={readOnly}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
          } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          onBlur={name === 'full_name' ? () => checkDuplicate(form.full_name) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
          } ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
        />
      )}
      {hint && !errors[name] && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const age = calcAge(form.date_of_birth);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => safeNavigate(isEdit ? `/patients/${id}` : '/patients')}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? 'Edit Patient' : 'New Patient'}
          </h1>
          {isEdit && patientCode && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{patientCode}</p>
          )}
        </div>
        {/* is_active toggle — admin edit only */}
        {isEdit && user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => set('is_active', form.is_active ? 0 : 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              form.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            }`}
          >
            {form.is_active ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
            {form.is_active ? 'Active' : 'Inactive'}
          </button>
        )}
      </div>

      {/* Global error */}
      {errors.general && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle size={15} />
          {errors.general}
        </div>
      )}

      {/* Duplicate name warning */}
      {dupWarning && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle size={15} />
          <span><strong>Possible duplicate:</strong> {dupWarning}. Please verify before creating.</span>
        </div>
      )}

      {/* Dirty indicator */}
      {dirty && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs rounded-xl">
          You have unsaved changes.
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t, i) => {
          const hasErr = Object.keys(errors).some(k => FIELD_TAB[k] === i);
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(i)}
              className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                tab === i ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
              {hasErr && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* ── Tab 0: Personal ── */}
          {tab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="full_name" required full placeholder="e.g. Juan Dela Cruz" />

              {/* DOB + live age */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={e => set('date_of_birth', e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {age !== null && (
                    <span className="flex-shrink-0 text-xs font-bold text-primary bg-primary-soft px-2.5 py-1.5 rounded-lg">
                      {age} yrs
                    </span>
                  )}
                </div>
              </div>

              <Field label="Gender" name="gender" options={['Male', 'Female', 'Other']} />
              <Field label="Civil Status" name="civil_status" options={['Single', 'Married', 'Widowed', 'Separated']} />
              <Field
                label="Branch"
                name="branch"
                options={[
                  { value: 'jaro',     label: 'Jaro' },
                  { value: 'cabatuan', label: 'Cabatuan' },
                ]}
              />
              <Field label="PhilHealth No." name="philhealth_no" placeholder="XX-XXXXXXXXX-X" />
            </div>
          )}

          {/* ── Tab 1: Contact & Address ── */}
          {tab === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Contact Number"
                name="contact_number"
                required
                type="tel"
                placeholder="09XX XXX XXXX"
              />
              <Field label="Email" name="email" type="email" placeholder="patient@email.com" />
              <Field label="Address" name="address" full placeholder="House No., Street, Barangay" />
              <Field label="City / Municipality" name="city" placeholder="e.g. Iloilo City" />
            </div>
          )}

          {/* ── Tab 2: Emergency ── */}
          {tab === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Emergency Contact Name"   name="emergency_contact_name"   placeholder="Full name" />
              <Field label="Emergency Contact Number" name="emergency_contact_number" type="tel" placeholder="09XX XXX XXXX" />
              <Field label="Relationship"             name="emergency_relation"        placeholder="e.g. Spouse, Parent" />
            </div>
          )}

          {/* ── Tab 3: Medical ── */}
          {tab === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Blood Type"
                name="blood_type"
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              <Field
                label="Known Allergies"
                name="known_allergies"
                type="textarea"
                full
                placeholder="List any known allergies (drugs, food, etc.)…"
              />
              <Field
                label="Medical History Notes"
                name="medical_history_notes"
                type="textarea"
                full
                placeholder="Previous conditions, surgeries, chronic illnesses…"
              />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-4">
          {/* Progress dots */}
          <div className="flex gap-1">
            {TABS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition ${
                  i === tab ? 'bg-primary' : i < tab ? 'bg-primary/40' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {tab > 0 && (
              <button
                type="button"
                onClick={() => setTab(t => t - 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}
            {tab < TABS.length - 1 ? (
              <button
                type="button"
                onClick={() => setTab(t => t + 1)}
                className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition"
              >
                <Save size={15} />
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Patient'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
