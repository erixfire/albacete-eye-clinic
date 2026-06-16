import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, User, Phone, MapPin, Heart, Eye } from 'lucide-react';

const SECTIONS = ['Personal', 'Contact', 'Emergency', 'Medical'];

const EMPTY = {
  first_name:'', last_name:'', middle_name:'', dob:'', sex:'', civil_status:'',
  phone:'', email:'', address:'', city:'',
  emergency_name:'', emergency_phone:'', emergency_relation:'',
  blood_type:'', allergies:'', medical_history:'', philhealth_no:'', branch:'jaro',
};

export default function PatientForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit   = Boolean(id);
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/patients/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setForm({ ...EMPTY, ...d.patient }); })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim())  errs.last_name  = 'Required';
    if (!form.phone.trim())      errs.phone      = 'Required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setTab(0); return; }
    setSaving(true);
    const url    = isEdit ? `/api/patients/${id}` : '/api/patients';
    const method = isEdit ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) navigate(isEdit ? `/patients/${id}` : `/patients/${data.id}`);
    else setErrors({ general: data.error || 'Failed to save patient' });
  };

  const Field = ({ label, name, type='text', options, required, half, placeholder }) => (
    <div className={half ? '' : 'sm:col-span-2'}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {options ? (
        <select value={form[name]} onChange={set(name)}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]} onChange={