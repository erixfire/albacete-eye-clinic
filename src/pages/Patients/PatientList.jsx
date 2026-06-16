import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, ChevronRight, Eye, Phone, Calendar, Building2 } from 'lucide-react';

export default function PatientList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');
  const [branch, setBranch]     = useState('');
  const [page, setPage]         = useState(1);
  const limit = 20;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, branch, page, limit });
    const res = await fetch(`/api/patients?${params}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setPatients(data.patients);
      setTotal(data.total);
    }
    setLoading(false);
  }, [q, branch, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSearch = (e) => { setQ(e.target.value); setPage(1); };

  const sexBadge = (sex) => {
    const map = { Male: 'bg-blue-100 text-blue-700', Female: 'bg-pink-100 text-pink-700', Other: 'bg-gray-100 text-gray-600' };
    return map[sex] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total records</p>
        </div>
        {['admin','doctor','nurse','frontdesk'].includes(user?.role) && (
          <Link to="/patients/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition">
            <UserPlus size={16} /> New Patient
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={q} onChange={handleSearch}
            placeholder="Search by name, ID, or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select value={branch} onChange={e => { setBranch(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Branches</option>
          <option value="jaro">Jaro</option>
          <option value="cabatuan">Cabatuan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Eye size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No patients found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Visit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Branch</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(p => (
                  <tr key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                          {p.first_name?.[0]}{p.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{p.last_name}, {p.first_name} {p.middle_name || ''}</div>
                          {p.dob && <div className="text-xs text-gray-400">DOB: {p.dob}</div>}
                        </div>
                        {p.sex && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sexBadge(p.sex)}`}>{p.sex}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{p.patient_no}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={12} /> {p.phone || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {p.last_visit ? new Date(p.last_visit).toLocaleDateString() : <span className="text-gray-300">No visits</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs capitalize text-gray-500">{p.branch}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing {((page-1)*limit)+1}–{Math.min(page*limit,total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button disabled={page*limit>=total} onClick={() => setPage(p=>p+1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
