import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, Clock, FileText, Plus, ChevronRight, Phone, Mail, MapPin, 
  AlertCircle, Stethoscope, Upload, Loader2, Download, Trash2, ChevronDown
} from 'lucide-react';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../../components/AnimatedPage';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/patients/${id}`),
          fetch(`/api/patients/${id}/attachments`)
        ]);
        if (pRes.ok) setPatient(await pRes.json());
        if (aRes.ok) setAttachments(await aRes.json());
      } catch (e) {
        console.error('Failed to fetch patient data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'Uploaded via Patient Profile');

    try {
      const res = await fetch(`/api/patients/${id}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const newAttachment = await res.json();
        setAttachments([newAttachment, ...attachments]);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
      if (res.ok) {
        setAttachments(attachments.filter(a => a.id !== attachmentId));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return (
    <AnimatedPage className="space-y-8 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-96 bg-gray-200 rounded-2xl" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </AnimatedPage>
  );

  if (!patient) return <AnimatedPage><div className="text-center py-20">Patient not found</div></AnimatedPage>;

  return (
    <AnimatedPage className="space-y-8 pb-12">
      {/* Patient Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="bg-primary h-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90" />
            <div className="absolute -bottom-10 left-8 z-10">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary font-bold text-3xl">
                    {patient.full_name.charAt(0)}
                </div>
            </div>
        </div>
        <div className="pt-12 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
                <p className="text-sm font-medium text-primary uppercase tracking-wider">{patient.patient_code}</p>
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
      </motion.div>

      <motion.div 
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
            {/* Visit History */}
            <motion.div variants={staggeredItem} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Visit History
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {patient.visits && patient.visits.length > 0 ? (
                        patient.visits.map((visit) => (
                            <div key={visit.id} className="group">
                              <div 
                                onClick={() => setExpandedVisitId(expandedVisitId === visit.id ? null : visit.id)}
                                className="p-5 flex items-start justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                            {new Date(visit.visit_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </p>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-primary">
                                            {visit.specialization_name}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 font-medium pt-1">
                                          Dr. {visit.doctor_name}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                          <span className="font-semibold text-gray-700">Complaint:</span> {visit.chief_complaint || 'N/A'}
                                      </p>
                                  </div>
                                  <motion.div animate={{ rotate: expandedVisitId === visit.id ? 180 : 0 }}>
                                    <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors mt-1" />
                                  </motion.div>
                              </div>
                              <AnimatePresence>
                                {expandedVisitId === visit.id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-gray-50/50"
                                  >
                                    <div className="p-5 border-t border-gray-100 space-y-4">
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnosis</h4>
                                        <p className="text-sm text-gray-800 mt-1">{visit.diagnosis || 'No diagnosis recorded.'}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Treatment Plan</h4>
                                        <p className="text-sm text-gray-800 mt-1">{visit.treatment_plan || 'No treatment plan recorded.'}</p>
                                      </div>
                                      {visit.notes && (
                                        <div>
                                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</h4>
                                          <p className="text-sm text-gray-800 mt-1">{visit.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <Clock className="mx-auto mb-2 opacity-20" size={48} />
                            <p>No previous visits recorded</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>

        <div className="space-y-8">
            {/* Medical Info */}
            <motion.div variants={staggeredItem} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-500" />
                    Medical Information
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Type</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{patient.blood_type || 'Unknown'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Known Allergies</p>
                        <p className={patient.known_allergies ? "text-sm font-bold text-red-600 mt-1" : "text-sm text-gray-500 mt-1 italic"}>
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
            </motion.div>

            {/* Attachments */}
            <motion.div variants={staggeredItem} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-amber-500" />
                        Documents
                    </h3>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-primary-soft hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    </button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {attachments.length > 0 ? (
                      attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg text-primary shadow-sm flex-shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate" title={att.file_name}>
                                {att.file_name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                {new Date(att.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <a 
                              href={`/api/attachments/${att.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-primary bg-white rounded-md shadow-sm transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </a>
                            <button 
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1.5 text-gray-500 hover:text-red-500 bg-white rounded-md shadow-sm transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-6 italic border-2 border-dashed border-gray-100 rounded-xl">
                          No documents uploaded. Click + to add.
                      </p>
                    )}
                </div>
            </motion.div>
        </div>
      </motion.div>
    </AnimatedPage>
  );
};

export default PatientDetail;
