import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';

function fmt(val, sign = true) {
  if (val === null || val === undefined || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return (sign && n > 0 ? '+' : '') + n.toFixed(2);
}

export default function RxPrint() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [rx, setRx]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch(`/api/prescriptions/${id}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setRx)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );

  if (error || !rx) return (
    <div className="text-center py-20">
      <AlertCircle size={40} className="mx-auto mb-3 text-red-300" />
      <p className="text-gray-500">{error || 'Prescription not found'}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm underline">Go back</button>
    </div>
  );

  const meds = rx.medications ? JSON.parse(rx.medications) : [];
  const hasGlasses = rx.glasses_od_sphere !== null || rx.glasses_os_sphere !== null;
  const rxDate = rx.rx_date || rx.visit_date || new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* Screen toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Prescription Slip</p>
          <p className="text-xs text-gray-400">{rx.patient_name} · {rxDate}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          <Printer size={15} /> Print Slip
        </button>
      </div>

      {/* ───────────────── PRINTABLE SLIP ───────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-8 print:px-8 print:py-6 print:max-w-full">

        {/* Clinic Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 uppercase">
            Albacete Eye Center &amp; Medical Clinics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            JEA Bldg, E. Lopez St., Jaro, Iloilo City &nbsp;·&nbsp; 0963 862 9414
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 tracking-widest uppercase">Prescription</p>
        </div>

        {/* Patient + Doctor Row */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Patient</p>
            <p className="font-bold text-gray-900 text-base">{rx.patient_name}</p>
            <p className="text-xs text-gray-500">
              {rx.patient_code}
              {rx.date_of_birth ? ` · DOB: ${rx.date_of_birth}` : ''}
              {rx.gender ? ` · ${rx.gender}` : ''}
            </p>
            {rx.philhealth_no && (
              <p className="text-xs text-gray-400 mt-0.5">PhilHealth: {rx.philhealth_no}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(rxDate + 'T00:00:00').toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-2">Physician</p>
            <p className="font-semibold text-gray-900">Dr. {rx.doctor_name}</p>
          </div>
        </div>

        {/* Eyeglass Rx */}
        {hasGlasses && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Eyeglass Prescription</p>
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-1.5 text-left text-xs font-bold">Eye</th>
                  <th className="border border-gray-300 px-3 py-1.5 text-center text-xs font-bold">Sphere</th>
                  <th className="border border-gray-300 px-3 py-1.5 text-center text-xs font-bold">Cylinder</th>
                  <th className="border border-gray-300 px-3 py-1.5 text-center text-xs font-bold">Axis</th>
                  <th className="border border-gray-300 px-3 py-1.5 text-center text-xs font-bold">Add</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold text-xs">OD (Right)</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_od_sphere)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_od_cylinder)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_od_axis, false)}°</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm" rowSpan={2}>{fmt(rx.glasses_add)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold text-xs">OS (Left)</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_os_sphere)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_os_cylinder)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono text-sm">{fmt(rx.glasses_os_axis, false)}°</td>
                </tr>
              </tbody>
            </table>
            {rx.glasses_pd && (
              <p className="text-xs text-gray-600 mt-1.5"><span className="font-semibold">PD:</span> {rx.glasses_pd} mm</p>
            )}
            {rx.glasses_notes && (
              <p className="text-xs text-gray-500 italic mt-1">{rx.glasses_notes}</p>
            )}
          </div>
        )}

        {/* Medications */}
        {meds.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Medications</p>
            <div className="space-y-3">
              {meds.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-400 font-mono text-sm pt-0.5">{i + 1}.</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-600">
                      {m.dosage && <span>{m.dosage}</span>}
                      {m.frequency && <span> &mdash; {m.frequency}</span>}
                      {m.duration && <span> for {m.duration}</span>}
                    </p>
                    {m.notes && <p className="text-xs text-gray-400 italic">{m.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {rx.instructions && (
          <div className="mb-6 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Instructions</p>
            <p className="text-sm text-gray-700">{rx.instructions}</p>
          </div>
        )}

        {/* Diagnosis note */}
        {rx.diagnosis && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnosis / Impression</p>
            <p className="text-sm text-gray-700">{rx.diagnosis}</p>
          </div>
        )}

        {/* Signature Block */}
        <div className="mt-10 pt-6 border-t border-gray-300 flex justify-end">
          <div className="text-center w-56">
            <div className="border-b border-gray-700 mb-1 h-10" />
            <p className="font-bold text-gray-900 text-sm">Dr. {rx.doctor_name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Physician&apos;s Signature &amp; License No.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-3 border-t border-gray-200 text-center">
          <p className="text-[9px] text-gray-400 tracking-wide">
            This prescription is valid for 30 days from date of issue. &nbsp;·&nbsp;
            Albacete Eye Center &amp; Medical Clinics &nbsp;·&nbsp; Iloilo City, Philippines
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A5; margin: 12mm 14mm; }
          body * { visibility: hidden; }
          .max-w-2xl, .max-w-2xl * { visibility: visible; }
          .max-w-2xl { position: absolute; inset: 0; }
        }
      `}</style>
    </>
  );
}
