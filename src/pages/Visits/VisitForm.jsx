import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  Eye,
  Stethoscope,
  ChevronRight,
  Clipboard
} from 'lucide-react';

const VisitForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patient_id = searchParams.get('patient_id');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: patient_id || '',
    specialization_id: '1', // Default to Ophthalmology
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    follow_up_date: ''
  });

  const [eyeExamData, setEyeExamData] = useState({
    va_right_uncorrected: '',
    va_right_corrected: '',
    va_left_uncorrected: '',
    va_left_corrected: '',
    iop_right: '',
    iop_left: '',
    refraction_right: '',
    refraction_left: '',
    anterior_segment_right: '',
    anterior_segment_left: '',
    fundus_right: '',
    fundus_left: '',
    pupil_exam: '',
    color_vision_test: '',
    additional_notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (patient_id) {
            const pRes = await fetch(`/api/patients/${patient_id}`);
            if (pRes.ok) setPatient(await pRes.json());
        }
        // Normally we'd fetch specializations from API, but for now let's use the known ones
        setSpecializations([
          { id: 1, name: 'Ophthalmology' },
          { id: 2, name: 'General Medicine' },
          { id: 3, name: 'Dermatology' },
          { id: 4, name: 'ENT' },
          { id: 5, name: 'Pediatrics' }
        ]);
      } catch (e) {
        console.error('Fetch error', e);
      }
    };
    fetchData();
  }, [patient_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEyeExamChange = (e) => {
    const { name, value } = e.target;
    setEyeExamData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Visit
      const vRes = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!vRes.ok) {
          const data = await vRes.json();
          throw new Error(data.error || 'Failed to create visit');
      }
      
      const visit = await vRes.json();

      // 2. If Ophthalmology, Create Eye Exam
      if (formData.specialization_id === '1' || formData.specialization_id === 1) {
          const eeRes = await fetch(`/api/visits/${visit.id}/eye-exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eyeExamData)
          });
          if (!eeRes.ok) {
              console.error('Failed to save eye exam');
          }
      }

      navigate(`/patients/${formData.patient_id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!patient_id) return <div className="p-8 text-center">No patient selected. Please select a patient first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Encounter</h1>
          {patient && <p className="text-gray-500 text-sm">For {patient.full_name} ({patient.patient_code})</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Visit Details */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Clipboard size={18} className="text-primary" />
                Encounter Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {specializations.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, specialization_id: s.id }))}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                                    formData.specialization_id === s.id 
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                    : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
                                }`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Chief Complaint *</label>
                  <textarea
                    name="chief_complaint"
                    required
                    rows="2"
                    value={formData.chief_complaint}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Why is the patient visiting today?"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Ophthalmology Eye Exam Section */}
            {(formData.specialization_id === 1 || formData.specialization_id === '1') && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                  <Eye size={18} className="text-primary" />
                  Comprehensive Eye Exam
                </h3>
                
                <div className="space-y-8">
                  {/* Visual Acuity */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Visual Acuity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-gray-50 p-4 rounded-2xl">
                        <p className="text-sm font-bold text-gray-700">Right Eye (OD)</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">Uncorrected</label>
                            <input type="text" name="va_right_uncorrected" value={eyeExamData.va_right_uncorrected} onChange={handleEyeExamChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="20/20" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Corrected</label>
                            <input type="text" name="va_right_corrected" value={eyeExamData.va_right_corrected} onChange={handleEyeExamChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="20/20" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-2xl">
                        <p className="text-sm font-bold text-gray-700">Left Eye (OS)</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500">Uncorrected</label>
                            <input type="text" name="va_left_uncorrected" value={eyeExamData.va_left_uncorrected} onChange={handleEyeExamChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="20/20" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Corrected</label>
                            <input type="text" name="va_left_corrected" value={eyeExamData.va_left_corrected} onChange={handleEyeExamChange} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="20/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Intraocular Pressure */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Intraocular Pressure (mmHg)</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <input type="number" name="iop_right" value={eyeExamData.iop_right} onChange={handleEyeExamChange} className="px-4 py-2.5 border rounded-xl text-sm" placeholder="OD" />
                      <input type="number" name="iop_left" value={eyeExamData.iop_left} onChange={handleEyeExamChange} className="px-4 py-2.5 border rounded-xl text-sm" placeholder="OS" />
                    </div>
                  </div>

                  {/* Refraction */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Refraction / Prescription</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" name="refraction_right" value={eyeExamData.refraction_right} onChange={handleEyeExamChange} className="px-4 py-2.5 border rounded-xl text-sm" placeholder="OD (e.g. -2.00 -0.50 x 90)" />
                      <input type="text" name="refraction_left" value={eyeExamData.refraction_left} onChange={handleEyeExamChange} className="px-4 py-2.5 border rounded-xl text-sm" placeholder="OS (e.g. -1.75 -0.75 x 85)" />
                    </div>
                  </div>

                  {/* Anterior/Posterior */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anterior Segment</h4>
                      <textarea name="anterior_segment_right" value={eyeExamData.anterior_segment_right} onChange={handleEyeExamChange} rows="2" className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Observations..."></textarea>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fundus / Posterior</h4>
                      <textarea name="fundus_right" value={eyeExamData.fundus_right} onChange={handleEyeExamChange} rows="2" className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Observations..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Assessment & Plan</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
                  <textarea
                    name="diagnosis"
                    rows="2"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Treatment Plan</label>
                  <textarea
                    name="treatment_plan"
                    rows="3"
                    value={formData.treatment_plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Follow-up</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule Follow-up</label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-center">
                <p className="text-sm text-gray-500 leading-relaxed">
                    Double check all clinical data before saving. Visit records are permanent medical documents.
                </p>
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 px-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                <Save size={22} />
                {loading ? 'Saving Visit...' : 'Save Encounter'}
                </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;
