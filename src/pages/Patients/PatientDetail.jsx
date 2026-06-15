import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Stethoscope
} from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (res.ok) {
          setPatient(await res.json());
        }
      } catch (e) {
        console.error('Failed to fetch patient', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-48 bg-gray-200 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 h-96 bg-gray-200 rounded-2xl" />
      <div className="h-96 bg-gray-200 rounded-2xl" />
    </div>
  </div>;

  if (!patient) return <div className="text-center py-20">Patient not found</div>;

  return (
    <div className="space-y-8">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-primary h-24 relative">
            <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary font-bold text-3xl">
                    {patient.full_name.charAt(0)}
                </div>
            </div>
        </div>
        <div className="pt-12 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{patient.patient_code}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        {patient.contact_number || 'No phone'}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        {patient.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        {patient.address || 'No address'}
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Link to={`/visits/new?patient_id=${patient.id}`} className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
                    <Stethoscope size={18} />
                    New Visit
                </Link>
                <button className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                    Edit Profile
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Visit History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Visit History
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {patient.visits && patient.visits.length > 0 ? (
                        patient.visits.map((visit) => (
                            <Link key={visit.id} to={`/visits/${visit.id}`} className="p-5 flex items-start justify-between hover:bg-gray-50 transition-colors group">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                        {new Date(visit.visit_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {visit.specialization_name} • Dr. {visit.doctor_name}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        <span className="font-semibold">Complaint:</span> {visit.chief_complaint || 'N/A'}
                                    </p>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors mt-1" />
                            </Link>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <Clock className="mx-auto mb-2 opacity-20" size={48} />
                            <p>No previous visits recorded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            {/* Medical Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle size={20} className="text-rose-500" />
                    Medical Information
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Type</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{patient.blood_type || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Known Allergies</p>
                        <p className={patient.known_allergies ? "text-sm font-bold text-rose-600 mt-1" : "text-sm text-gray-500 mt-1 italic"}>
                            {patient.known_allergies || 'None reported'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medical History</p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {patient.medical_history_notes || 'No notes available.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Attachments */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-amber-500" />
                        Documents
                    </h3>
                    <button className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Plus size={18} />
                    </button>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-center text-gray-400 py-4 italic border-2 border-dashed border-gray-50 rounded-xl">
                        Click + to upload reports, scans or photos.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
