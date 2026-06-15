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
        {[1,2,3,4].map(i => <div key={i} className="h-32 glass-panel rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 glass-panel rounded-2xl" />
        <div className="h-96 glass-panel rounded-2xl" />
      </div>
    </AnimatedPage>
  );

  const stats = [
    { label: 'Today\'s Appointments', value: summary?.today_appointments || 0, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', link: '/appointments' },
    { label: 'Total Patients', value: summary?.total_patients || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10', link: '/patients' },
    { label: 'Low Stock Items', value: summary?.low_stock_count || 0, icon: AlertTriangle, color: 'text-accent', bg: 'bg-accent/10', link: '/inventory?filter=low' },
    { label: 'Expiring Soon', value: summary?.expiring_meds_count || 0, icon: Clock, color: 'text-red-700', bg: 'bg-red-50', link: '/inventory?filter=expiring' },
  ];

  return (
    <AnimatedPage className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-gray-900 serif-text">Clinic Overview</h1>
        <p className="text-gray-600 text-sm mt-2">Welcome back. Here is your daily summary.</p>
      </motion.div>

      <motion.div 
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggeredItem}>
            <Link to={stat.link} className="block glass-panel p-6 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={22} />
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
              </div>
              <p className="text-4xl font-bold text-gray-900 serif-text">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-2">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Recent Appointments */}
        <motion.div variants={staggeredItem} className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/40">
            <h3 className="font-bold text-gray-900 serif-text text-lg">Recent Appointments</h3>
            <Link to="/appointments" className="text-primary text-sm font-semibold hover:text-accent transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-black/5 flex-1">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-accent-soft flex items-center justify-center font-bold shadow-inner">
                      {appt.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{appt.patient_name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{appt.specialization_name} • Dr. {appt.doctor_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5 shadow-sm ${
                      appt.status === 'scheduled' ? 'bg-white text-primary border border-black/5' :
                      appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-gray-400">
                <Calendar className="mx-auto mb-3 opacity-20" size={56} />
                <p>No appointments scheduled</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Inventory Quick Actions */}
        <motion.div variants={staggeredItem} className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Package size={22} className="text-accent-soft" />
              </div>
              <h3 className="font-bold serif-text text-lg text-accent-soft">Inventory Alert</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 relative z-10">
              {summary?.low_stock_count > 0 
                ? `You have ${summary.low_stock_count} items below reorder level. Please check and restock.`
                : "All medicine stock levels are currently healthy."}
            </p>
            <Link to="/inventory" className="block w-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-center py-3 rounded-xl text-sm font-bold backdrop-blur-sm relative z-10">
              Manage Inventory
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold text-gray-900 mb-5 serif-text text-lg px-2">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/patients" className="flex items-center justify-between p-4 rounded-2xl bg-white/50 hover:bg-primary hover:text-white transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span className="text-sm font-medium">New Patient Visit</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-accent-soft transition-colors" />
              </Link>
              <Link to="/appointments" className="flex items-center justify-between p-4 rounded-2xl bg-white/50 hover:bg-primary hover:text-white transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Schedule Appointment</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-accent-soft transition-colors" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
};

export default Dashboard;
