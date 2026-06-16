import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

export default function AppointmentForm({ onClose, onSaved, initialPatientId = null }) {
  const [patients, setPatients]           = useState([]);
  const [doctors, setDoctors]             = useState([]);
  const [specializations, setSpecs]       = useState([]);
  const [patientQ, setPatientQ]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    patient_id: initialPatientId || '',
    doctor_id: '',
    specialization_id: '',
    appointment_date: defaultDate,
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/patients?limit=50', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/users?role=doctor', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/specializations', { credentials: 'include' }).then(r => r.json()),
    ]).then(([pd, dc, sp]) => {
      setPatients(pd.patients || pd || []);
      setDoctors(dc.users || dc || []);
      setSpecs(sp.specializations || sp || []);
    }).catch(() => {});
  }, []);

  const filteredPatients = patients.filter(p =>
    !patientQ ||
    p.full_name?.toLowerCase().includes(patientQ.toLowerCase()) ||
    p.patient_code?.toLowerCase().includes(patientQ.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.patient_id || !form.doctor_id || !form.specialization_id || !form.appointment_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/appointments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Failed to save appointment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-foreground">New Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Patient <span className="text-red-500">*</span></label>
            <div className="relative mb-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={patientQ} onChange={e => setPatientQ(e.target.value)}
                placeholder="Search patient..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={form.patient_id}
              onChange={e => set('patient_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
              size={4}
            >
              <option value="">— select patient —</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor <span className="text-red-500">*</span></label>
            <select
              value={form.doctor_id}
              onChange={e => set('doctor_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">— select doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
              ))}
            </select>
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization <span className="text-red-500">*</span></label>
            <select
              value={form.specialization_id}
              onChange={e => set('specialization_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">— select —</option>
              {specializations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              value={form.appointment_date}
              onChange={e => set('appointment_date', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Chief complaint or special instructions..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Schedule Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
