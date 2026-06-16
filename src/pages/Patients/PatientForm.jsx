import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';

const TABS = ['Personal', 'Contact & Address', 'Emergency', 'Medical'];

const EMPTY = {
  full_name:'', date_of_birth:'', gender:'', civil_status:'',
  contact_number:'', email:'', address:'', city:'',
  emergency_contact_name:'', emergency_contact_number:'', emergency_relation:'',
  blood_type:'', known_allergies:'', medical_history_notes:'',
  philhealth_no:'', branch:'jaro',
};

export default function PatientForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]       = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/patients/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setForm({ ...EMPTY, ...d.patient }))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())      errs.full_name      = 'Required';
    if (!form.contact_number.trim()) errs.contact_number = 'Required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setTab(0); return; }
    setSaving(true);
    const res = await fetch(isEdit ? `/api/patients/${id}` : '/api/patients', {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) navigate(isEdit ? `/patients/${id}` : `/patients/${data.id}`);
    else setErrors({ general: data.error || 'Failed to save' });
  };

  const Field = ({ label, name, type='text', options, required, full, placeholder }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {options ? (
        <select value={form[name]} onChange={set(name)}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[name] ? 'border-red-300' : 'border-gray-200'}`}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={form[name]} onChange={set(name)} placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
      ) : (
        <input type={type} value={form[name]} onChange={set(name)} placeholder={placeholder}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[name] ? 'border-red-300' : 'border-gray-200'}`}/>
      )}
      {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]}</p>}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={18}/>
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{isEdit ? 'Edit Patient' : 'New Patient'}</h1>
          <p className="text-sm text-gray-500">Fill in the patient details below</p>
        </div>
      </div>

      {errors.general && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{errors.general}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              tab === i ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {tab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="full_name" required full placeholder="e.g. Juan Dela Cruz"/>
              <Field label="Date of Birth" name="date_of_birth" type="date"/>
              <Field label="Gender" name="gender" options={['Male','Female','Other']}/>
              <Field label="Civil Status" name="civil_status" options={['Single','Married','Widowed','Separated']}/>
              <Field label="Branch" name="branch" options={['jaro','cabatuan']}/>
              <Field label="PhilHealth No." name="philhealth_no" placeholder="XX-XXXXXXXXX-X"/>
            </div>
          )}
          {tab === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Number" name="contact_number" required type="tel" placeholder="09XX XXX XXXX"/>
              <Field label="Email" name="email" type="email" placeholder="patient@email.com"/>
              <Field label="Address" name="address" full placeholder="House No., Street, Barangay"/>
              <Field label="City / Municipality" name="city" placeholder="e.g. Iloilo City"/>
            </div>
          )}
          {tab === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Emergency Contact Name" name="emergency_contact_name" placeholder="Full name"/>
              <Field label="Emergency Contact Number" name="emergency_contact_number" type="tel" placeholder="09XX XXX XXXX"/>
              <Field label="Relationship" name="emergency_relation" placeholder="e.g. Spouse, Parent, Child"/>
            </div>
          )}
          {tab === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Blood Type" name="blood_type" options={['A+','A-','B+','B-','AB+','AB-','O+','O-']}/>
              <Field label="Known Allergies" name="known_allergies" type="textarea" full placeholder="List any known allergies..."/>
              <Field label="Medical History Notes" name="medical_history_notes" type="textarea" full placeholder="Previous conditions, surgeries, etc."/>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {TABS.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition ${
                i === tab ? 'bg-primary' : i < tab ? 'bg-primary/40' : 'bg-gray-200'
              }`}/>
            ))}
          </div>
          <div className="flex gap-2">
            {tab > 0 && (
              <button type="button" onClick={() => setTab(t => t-1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">Back</button>
            )}
            {tab < TABS.length - 1 ? (
              <button type="button" onClick={() => setTab(t => t+1)}
                className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition">Next</button>
            ) : (
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition">
                <Save size={15}/> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Patient'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
