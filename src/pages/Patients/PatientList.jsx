import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { AnimatedPage } from '../../components/AnimatedPage';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patients${searchTerm ? `?q=${searchTerm}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (e) {
        console.error('Failed to fetch patients', e);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 serif-text">Patients Directory</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and view patient medical records.</p>
        </div>
        <Link to="/patients/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-300 hover:scale-105">
          <UserPlus size={18} />
          Add New Patient
        </Link>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-black/5 flex flex-col sm:flex-row gap-4 bg-white/40">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, code, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 border border-black/5 rounded-2xl leading-5 bg-white/60 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-inner"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-black/5 rounded-2xl text-sm font-bold text-gray-700 hover:bg-white transition-all bg-white/60 backdrop-blur-sm shadow-sm">
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/5">
            <thead className="bg-white/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Gender/Age</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Added On</th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200/50 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200/50 rounded" />
                          <div className="h-3 w-20 bg-gray-200/50 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200/50 rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200/50 rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200/50 rounded" /></td>
                    <td className="px-6 py-5"></td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary text-accent-soft flex items-center justify-center font-bold shadow-inner text-lg">
                          {patient.full_name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/patients/${patient.id}`} className="text-base font-bold text-gray-900 hover:text-accent transition-colors serif-text">
                            {patient.full_name}
                          </Link>
                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{patient.patient_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Phone size={14} className="text-gray-400" />
                          {patient.contact_number || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Mail size={14} className="text-gray-400" />
                          {patient.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-bold capitalize">{patient.gender || 'N/A'}</span>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {patient.date_of_birth ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${patient.id}`} className="p-2 text-gray-400 hover:text-accent hover:bg-white rounded-xl transition-all shadow-sm">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-sm font-bold text-gray-900 serif-text">No patients found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new patient.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default PatientList;
