import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, Stethoscope, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function AppointmentRequestCard({ request, onConverted, onDismissed }) {
  const [expanded, setExpanded]     = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [doctors, setDoctors]       = useState([]);
  const [specs, setSpecs]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    doctor_id: '',
    specialization_id: '',
    appointment_date: `${request.date}T${request.time}`,
    notes: request.reason || '',
  });

  useEffect(() => {
    if (!showConvert) return;
    Promise.all([
      fetch('/api/users?role=doctor', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/specializations', { credentials: 'include' }).then(r => r.json()),
    ]).then(([dc, sp]) => {
      setDoctors(dc.users || dc || []);
      setSpecs(sp.specializations || sp || []);
    }).catch(() => {});
  }, [showConvert]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleConvert = async () => {
    if (!form.doctor_id || !form.specialization_id || !form.appointment_date) {
      setError('Doctor, specialization and date are required.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/appointments/convert', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: request.id, ...form }),
    });
    setLoading(false);
    if (res.ok) {
      onConverted();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Conversion failed.');
    }
  };

  const handleDismiss = async () => {
    if (!confirm('Cancel this booking request?')) return;
    await fetch(`/appointments?id=${request.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    onDismissed();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {(request.name || '?').split(' ').map(n => n[0]).slice(0,2).join('')}
            </div>
            <div>
              <div className="font-semibold text-foreground">{request.name}</div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><Phone size={11}/>{request.phone}</span>
                <span className="flex items-center gap-1"><Calendar size={11}/>{request.date}</span>
                <span className="flex items-center gap-1"><Clock size={11}/>{request.time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2.5 py-1 rounded-full">Pending</span>
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition">
              {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            <button onClick={handleDismiss} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition" title="Dismiss">
              <X size={16}/>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-1">
            {request.doctor && <div><span className="font-medium">Requested doctor:</span> {request.doctor}</div>}
            {request.type   && <div><span className="font-medium">Type:</span> {request.type}</div>}
            {request.reason && <div><span className="font-medium">Reason:</span> {request.reason}</div>}
            {request.insurance && <div><span className="font-medium">Insurance:</span> {request.insurance}</div>}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowConvert(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            <Stethoscope size={14}/> Convert → Patient
          </button>
        </div>
      </div>

      {showConvert && (
        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign &amp; Schedule</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Doctor *</label>
              <select
                value={form.doctor_id}
                onChange={e => set('doctor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">— select —</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Specialization *</label>
              <select
                value={form.specialization_id}
                onChange={e => set('specialization_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">— select —</option>
                {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Appointment Date &amp; Time *</label>
            <input
              type="datetime-local"
              value={form.appointment_date}
              onChange={e => set('appointment_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowConvert(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
            <button
              onClick={handleConvert}
              disabled={loading}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Converting...' : 'Confirm & Create Patient'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
