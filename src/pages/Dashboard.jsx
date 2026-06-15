import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, apptRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/appointments?limit=5')
        ]);
        if (sumRes.ok) setSummary(await sumRes.json());
        if (apptRes.ok) setRecentAppointments(await apptRes.json());
      } catch (e) {
        console.error('Failed to fetch dashboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );

  const stats = [
    { label: 'Today\'s Appointments', value: summary?.today_appointments || 0, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', link: '/appointments' },
    { label: 'Total Patients', value: summary?.total_patients || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/patients' },
    { label: 'Low Stock Items', value: summary?.low_stock_count || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', link: '/inventory?filter=low' },
    { label: 'Expiring Soon', value: summary?.expiring_meds_count || 0, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50', link: '/inventory?filter=expiring' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinic Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-gray-400 transition-colors" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {appt.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{appt.patient_name}</p>
                      <p className="text-xs text-gray-500">{appt.specialization_name} • {appt.doctor_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      appt.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                      appt.status === 'completed' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Calendar className="mx-auto mb-2 opacity-20" size={48} />
                <p>No appointments scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} />
              <h3 className="font-bold">Inventory Alert</h3>
            </div>
            <p className="text-primary-soft text-sm leading-relaxed mb-6">
              {summary?.low_stock_count > 0 
                ? `You have ${summary.low_stock_count} items below reorder level. Please check and restock.`
                : "All medicine stock levels are currently healthy."}
            </p>
            <Link to="/inventory" className="block w-full bg-white/10 hover:bg-white/20 transition-colors text-center py-2 rounded-xl text-sm font-bold backdrop-blur-sm">
              Manage Inventory
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/patients" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-soft hover:text-primary transition-all group">
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span className="text-sm font-medium">New Patient Visit</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/appointments" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-soft hover:text-primary transition-all group">
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Schedule Appointment</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
