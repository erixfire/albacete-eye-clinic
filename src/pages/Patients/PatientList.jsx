import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  Filter,
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patients Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view patient medical records.</p>
        </div>
        <Link to="/patients/new" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-primary-h transition-colors">
          <UserPlus size={18} />
          Add New Patient
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by name, code, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender/Age</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Added On</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">
                          {patient.full_name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/patients/${patient.id}`} className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors">
                            {patient.full_name}
                          </Link>
                          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{patient.patient_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {patient.contact_number || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {patient.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 font-medium capitalize">{patient.gender || 'N/A'}</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.date_of_birth ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${patient.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary-soft rounded-lg transition-colors">
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No patients found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting your search or add a new patient.</p>
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
