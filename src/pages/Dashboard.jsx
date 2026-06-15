import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ChevronRight,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';

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
    <AnimatedPage className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-slate-200" />
        <div className="h-96 bg-white rounded-xl border border-slate-200" />
      </div>
    </AnimatedPage>
  );

  const stats = [
    { label: 'Today\'s Appointments', value: summary?.today_appointments || 0, icon: Calendar, color: 'text-primary', bg: 'bg-blue-50', link: '/appointments' },
    { label: 'Total Patients', value: summary?.total_patients || 0, icon: Users, color: 'text-primary', bg: 'bg-blue-50', link: '/patients' },
    { label: 'Low Stock Items', value: summary?.low_stock_count || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', link: '/inventory?filter=low' },
    { label: 'Expiring Soon', value: summary?.expiring_meds_count || 0, icon: Clock, color: 'text-red-600', bg: 'bg-red-50', link: '/inventory?filter=expiring' },
  ];

  return (
    <AnimatedPage className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Here is what's happening at the clinic today.</p>
      </motion.div>

      <motion.div 
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggeredItem}>
            <Link to={stat.link} className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon size={20} />
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" size={18} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Appointments */}
        <motion.div variants={staggeredItem} className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-primary text-sm font-medium hover:text-primary-h transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">
                      {appt.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{appt.patient_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{appt.specialization_name} • Dr. {appt.doctor_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mt-1 ${
                      appt.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                      appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Calendar className="mx-auto mb-2 opacity-30" size={40} />
                <p className="text-sm">No appointments scheduled</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Inventory Quick Actions */}
        <motion.div variants={staggeredItem} className="space-y-6">
          <div className="bg-primary p-6 rounded-xl text-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package size={20} />
              </div>
              <h3 className="font-semibold text-white">Inventory Status</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-5">
              {summary?.low_stock_count > 0 
                ? `You have ${summary.low_stock_count} items below reorder level.`
                : "All medicine stock levels are currently healthy."}
            </p>
            <Link to="/inventory" className="block w-full bg-white text-primary text-center py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors">
              Manage Inventory
            </Link>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/patients" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary hover:bg-blue-50 hover:text-primary transition-all duration-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary">
                  <Users size={16} />
                  <span className="text-sm font-medium">New Patient Visit</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/appointments" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary hover:bg-blue-50 hover:text-primary transition-all duration-200 group">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Schedule Appointment</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
};

export default Dashboard;
