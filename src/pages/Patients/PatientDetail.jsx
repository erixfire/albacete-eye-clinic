import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Edit, Plus, Eye, Calendar, FileText,
  Phone, MapPin, Heart, User, Printer, ChevronRight,
  Activity, Pill, Scissors, AlertCircle
} from 'lucide-react';

const TABS = ['Overview', 'Visits', 'Eye Exams', 'Prescriptions', 'Procedures'];

function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-600',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red:    'bg-red-100 text-red-700',
    pink:   'bg-pink-100 text-pink-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300">&mdash;</span>}</span>
    </div>
  );
}

function statusColor(s) {
  const map = { scheduled: 'blue', 'checked-in': 'yellow', seen: 'green', done: 'green', cancelled: 'red' };
  return map[s] || 'gray';
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [tab, setTab]       = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/patients/${id}`, { credentials: 'include' })
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
      <p className="text-gray-500">{error || 'Patient not found'}</p>
      <button onClick={() => navigate('/patients')} className="mt-4 text-primary text-sm underline">Back to patients</button>
    </div>
  );

  const { patient, visits = [], eye_exams = [], prescriptions = [], procedures = [] } = data;
  const canEdit = ['admin', 'doctor', 'nurse', 'frontdesk'].includes(user?.role);
  const canAddVisit = ['admin', 'doctor', 'nurse'].includes(user?.role);

  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth)) / 31557600000)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/patients')}
          className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate">{patient.full_name}</h1>
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {patient.patient_code}
            </span>
            {patient.gender && (
              <Badge color={patient.gender === 'Male' ? 'blue' : patient.gender === 'Female' ? 'pink' : 'gray'}>
                {patient.gender}
              </Badge>
            )}
            {age && <Badge color="gray">{age} yrs</Badge>}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {patient.branch === 'cabatuan' ? 'Cabatuan Branch' : 'Jaro Branch'} · {visits.length} visit{visits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500" title="Print">
            <Printer size={17} />
          </button>
          {canEdit && (
            <Link to={`/patients/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              <Edit size={15} /> Edit
            </Link>
          )}
          {canAddVisit && (
            <Link to={`/visits/new?patient_id=${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
              <Plus size={15} /> New Visit
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              tab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            {t}
            {i === 1 && visits.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{visits.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Personal Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Full Name"  value={patient.full_name} />
                <InfoRow label="Date of Birth" value={patient.date_of_birth} />
                <InfoRow label="Gender"     value={patient.gender} />
                <InfoRow label="Civil Status" value={patient.civil_status} />
                <InfoRow label="Branch"     value={patient.branch} />
                <InfoRow label="PhilHealth" value={patient.philhealth_no} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone size={14} /> Contact
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Phone"   value={patient.contact_number} />
                <InfoRow label="Email"   value={patient.email} />
                <InfoRow label="Address" value={patient.address} />
                <InfoRow label="City"    value={patient.city} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> Emergency Contact
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Name"         value={patient.emergency_contact_name} />
                <InfoRow label="Phone"        value={patient.emergency_contact_number} />
                <InfoRow label="Relationship" value={patient.emergency_relation} />
              </div>
            </div>
          </div>

          {/* Medical Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart size={14} /> Medical
              </h3>
              <div className="space-y-4">
                <InfoRow label="Blood Type" value={patient.blood_type} />
                <div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Allergies</span>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{patient.known_allergies || <span className="text-gray-300">None recorded</span>}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Medical History</span>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{patient.medical_history_notes || <span className="text-gray-300">None recorded</span>}</p>
                </div>
              </div>
            </div>

            {/* Last visit quick view */}
            {visits[0] && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity size={14} /> Last Visit
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{visits[0].visit_date}</span>
                    <Badge color={statusColor(visits[0].status)}>{visits[0].status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{visits[0].chief_complaint || visits[0].diagnosis || '—'}</p>
                  <p className="text-xs text-gray-400">Dr. {visits[0].doctor_name}</p>
                  <Link to={`/visits/${visits[0].id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    View details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Visits */}
      {tab === 1 && (
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No visits yet</p>
              {canAddVisit && (
                <Link to={`/visits/new?patient_id=${id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Plus size={14} /> Schedule first visit
                </Link>
              )}
            </div>
          ) : visits.map(v => (
            <Link key={v.id} to={`/visits/${v.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{v.visit_date}</span>
                    <Badge color={statusColor(v.status)}>{v.status}</Badge>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{v.visit_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{v.chief_complaint || v.diagnosis || 'No complaint recorded'}</p>
                  <p className="text-xs text-gray-400 mt-1">Dr. {v.doctor_name}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tab: Eye Exams */}
      {tab === 2 && (
        <div className="space-y-4">
          {eye_exams.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Eye size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No eye exam records</p>
            </div>
          ) : eye_exams.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{e.exam_date}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">VA OD</p>
                  <p className="font-mono font-semibold">{e.va_od_distance || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">VA OS</p>
                  <p className="font-mono font-semibold">{e.va_os_distance || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">IOP OD</p>
                  <p className="font-mono font-semibold">{e.iop_od ? `${e.iop_od} mmHg` : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">IOP OS</p>
                  <p className="font-mono font-semibold">{e.iop_os ? `${e.iop_os} mmHg` : '—'}</p>
                </div>
              </div>
              {(e.ref_od_sphere !== null || e.ref_os_sphere !== null) && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-bold text-blue-700 mb-1">Refraction OD</p>
                    <p className="font-mono">{e.ref_od_sphere > 0 ? '+' : ''}{e.ref_od_sphere} {e.ref_od_cylinder} × {e.ref_od_axis}°</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-bold text-blue-700 mb-1">Refraction OS</p>
                    <p className="font-mono">{e.ref_os_sphere > 0 ? '+' : ''}{e.ref_os_sphere} {e.ref_os_cylinder} × {e.ref_os_axis}°</p>
                  </div>
                </div>
              )}
              {e.extra_notes && <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">{e.extra_notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Prescriptions */}
      {tab === 3 && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Pill size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No prescriptions</p>
            </div>
          ) : prescriptions.map(rx => (
            <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">{rx.rx_date}</h3>
                <span className="text-xs text-gray-400">Dr. {rx.doctor_name}</span>
              </div>
              {(rx.glasses_od_sphere !== null || rx.glasses_os_sphere !== null) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-xs">
                    <p className="font-bold text-gray-600 mb-1">OD (Right)</p>
                    <p className="font-mono">{rx.glasses_od_sphere > 0 ? '+' : ''}{rx.glasses_od_sphere} {rx.glasses_od_cylinder} × {rx.glasses_od_axis}°</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs">
                    <p className="font-bold text-gray-600 mb-1">OS (Left)</p>
                    <p className="font-mono">{rx.glasses_os_sphere > 0 ? '+' : ''}{rx.glasses_os_sphere} {rx.glasses_os_cylinder} × {rx.glasses_os_axis}°</p>
                  </div>
                </div>
              )}
              {rx.medications && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Medications</p>
                  <div className="space-y-1">
                    {JSON.parse(rx.medications).map((m, i) => (
                      <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-semibold">{m.name}</span> — {m.dosage} · {m.frequency} · {m.duration}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rx.instructions && <p className="mt-3 text-xs text-gray-500 italic">{rx.instructions}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Procedures */}
      {tab === 4 && (
        <div className="space-y-4">
          {procedures.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Scissors size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No procedures recorded</p>
            </div>
          ) : procedures.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{p.procedure_name}</h3>
                  <p className="text-xs text-gray-400">{p.procedure_date} · Dr. {p.doctor_name}</p>
                </div>
                {p.eye && <Badge color="blue">{p.eye}</Badge>}
              </div>
              {p.outcome      && <p className="text-xs text-gray-600"><span className="font-semibold">Outcome:</span> {p.outcome}</p>}
              {p.complications && <p className="text-xs text-red-500"><span className="font-semibold">Complications:</span> {p.complications}</p>}
              {p.post_op_notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-xl p-3">{p.post_op_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
