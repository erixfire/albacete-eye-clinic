import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Printer, User, Eye, FileText, AlertCircle } from 'lucide-react';

function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-600',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red:    'bg-red-100 text-red-700',
  };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors[color]}`}>{children}</span>;
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-gray-50">
        {Icon && <Icon size={14} />} {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value || <span className="text-gray-300">&mdash;</span>}</p>
    </div>
  );
}

function statusColor(s) {
  const map = { scheduled: 'blue', 'checked-in': 'yellow', seen: 'green', done: 'green', cancelled: 'red' };
  return map[s] || 'gray';
}

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`/api/visits/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );

  if (error || !data) return (
    <div className="text-center py-20">
      <AlertCircle size={40} className="mx-auto mb-3 text-red-300" />
      <p className="text-gray-500">{error || 'Visit not found'}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm underline">Go back</button>
    </div>
  );

  const { visit, eye_exam, prescriptions = [] } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 print:px-0 print:py-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Visit Record</h1>
          <p className="text-sm text-gray-400">
            <Link to={`/patients/${visit.patient_id}`} className="hover:text-primary transition">
              {visit.first_name} {visit.last_name}
            </Link>
            {' · '}{visit.patient_no}
          </p>
        </div>
        <button onClick={() => window.print()}
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500" title="Print">
          <Printer size={17} />
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Albacete Eye Center & Medical Clinics</h1>
        <p className="text-sm text-gray-500">JEA Bldg, E. Lopez St., Jaro, Iloilo City · 0963 862 9414</p>
        <hr className="my-3" />
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">{visit.first_name} {visit.last_name}</p>
            <p className="text-sm text-gray-500">{visit.patient_no} · {visit.dob} · {visit.sex}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{visit.visit_date}</p>
            <p className="text-sm text-gray-500">Dr. {visit.doctor_name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Visit summary */}
        <Section title="Visit Summary" icon={FileText}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Row label="Date"       value={visit.visit_date} />
            <Row label="Type"       value={visit.visit_type} />
            <Row label="Doctor"     value={visit.doctor_name} />
            <Row label="Status"     value={
              <Badge color={statusColor(visit.status)}>{visit.status}</Badge>
            } />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Row label="Chief Complaint" value={visit.chief_complaint} />
            <Row label="Follow-up Date"  value={visit.follow_up_date} />
            <div className="md:col-span-2"><Row label="Diagnosis"    value={visit.diagnosis} /></div>
            <div className="md:col-span-2"><Row label="Treatment"    value={visit.treatment} /></div>
            <div className="md:col-span-2"><Row label="Notes"        value={visit.notes} /></div>
          </div>
        </Section>

        {/* Eye Exam */}
        {eye_exam && (
          <Section title="Eye Examination" icon={Eye}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[['VA OD (dist)', eye_exam.va_od_distance], ['VA OS (dist)', eye_exam.va_os_distance],
                ['IOP OD', eye_exam.iop_od ? `${eye_exam.iop_od} mmHg` : null],
                ['IOP OS', eye_exam.iop_os ? `${eye_exam.iop_os} mmHg` : null]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{l}</p>
                  <p className="font-mono font-semibold text-sm">{v || '—'}</p>
                </div>
              ))}
            </div>
            {(eye_exam.ref_od_sphere !== null || eye_exam.ref_os_sphere !== null) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3 text-xs">
                  <p className="font-bold text-blue-700 mb-1">Refraction OD</p>
                  <p className="font-mono">
                    {eye_exam.ref_od_sphere > 0 ? '+' : ''}{eye_exam.ref_od_sphere} DS &nbsp;
                    {eye_exam.ref_od_cylinder} DC × {eye_exam.ref_od_axis}°
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs">
                  <p className="font-bold text-blue-700 mb-1">Refraction OS</p>
                  <p className="font-mono">
                    {eye_exam.ref_os_sphere > 0 ? '+' : ''}{eye_exam.ref_os_sphere} DS &nbsp;
                    {eye_exam.ref_os_cylinder} DC × {eye_exam.ref_os_axis}°
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Row label="Slit Lamp OD"  value={eye_exam.slit_lamp_od} />
              <Row label="Slit Lamp OS"  value={eye_exam.slit_lamp_os} />
              <Row label="Fundus OD"     value={eye_exam.fundus_od} />
              <Row label="Fundus OS"     value={eye_exam.fundus_os} />
              <Row label="Color Vision"  value={eye_exam.color_vision} />
              <Row label="OCT Notes"     value={eye_exam.oct_notes} />
            </div>
            {eye_exam.extra_notes && (
              <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">{eye_exam.extra_notes}</p>
            )}
          </Section>
        )}

        {/* Prescriptions */}
        {prescriptions.length > 0 && (
          <Section title="Prescriptions" icon={FileText}>
            {prescriptions.map((rx, i) => (
              <div key={rx.id} className={i > 0 ? 'mt-5 pt-5 border-t border-gray-100' : ''}>
                {(rx.glasses_od_sphere !== null || rx.glasses_os_sphere !== null) && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-xs">
                      <p className="font-bold text-gray-600 mb-1">OD (Right)</p>
                      <p className="font-mono">{rx.glasses_od_sphere > 0 ? '+' : ''}{rx.glasses_od_sphere} {rx.glasses_od_cylinder} × {rx.glasses_od_axis}°</p>
                      {rx.glasses_add && <p className="mt-1">Add: +{rx.glasses_add}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-xs">
                      <p className="font-bold text-gray-600 mb-1">OS (Left)</p>
                      <p className="font-mono">{rx.glasses_os_sphere > 0 ? '+' : ''}{rx.glasses_os_sphere} {rx.glasses_os_cylinder} × {rx.glasses_os_axis}°</p>
                    </div>
                  </div>
                )}
                {rx.medications && (
                  <div className="space-y-1">
                    {JSON.parse(rx.medications).map((m, j) => (
                      <div key={j} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 flex gap-3">
                        <span className="font-semibold">{m.name}</span>
                        <span>{m.dosage}</span>
                        <span className="text-gray-400">{m.frequency} · {m.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
                {rx.instructions && <p className="mt-2 text-xs text-gray-500 italic">{rx.instructions}</p>}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
