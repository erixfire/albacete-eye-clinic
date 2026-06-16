import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronRight,
  Package,
  Activity,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedPage, staggeredContainer, staggeredItem } from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  scheduled:    'bg-blue-50 text-blue-700',
  'checked-in': 'bg-yellow-50 text-yellow-700',
  seen:         'bg-purple-50 text-purple-700',
  done:         'bg-emerald-50 text-emerald-700',
  cancelled:    'bg-red-50 text-red-500',
  open:         'bg-blue-50 text-blue-700',
  completed:    'bg-emerald-50 text-emerald-700',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
      if (res.ok) setSummary(await res.json());
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
      setLastFetch(new Date());
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return (
    <AnimatedPage className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-slate-200" />
        <div className="h-80 bg-white rounded-xl border border-slate-200" />
      </div>
    </AnimatedPage>
  );

  const isAdmin      = ['admin'].includes(user?.role);
  const isClinic     = ['admin','doctor','nurse','frontdesk'].includes(user?.role);
  const isPharmacist = ['admin','pharmacist'].includes(user?.role);

  const stats = [
    {
      label: "Today's Appointments",
      value: summary?.today_appointments ?? 0,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary-soft',
      link: '/appointments',
      show: isClinic,
    },
    {
      label: "Today's Visits",
      value: summary?.today_visits ?? 0,
      icon: Activity,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      link: '/appointments',
      show: isClinic,
    },
    {
      label: 'Total Patients',
      value: summary?.total_patients ?? 0,
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      link: '/patients',
      show: isClinic,
    },
    {
      label: 'Pending Requests',
      value: summary?.pending_requests ?? 0,
      icon: Inbox,
      color: summary?.pending_requests > 0 ? 'text-amber-600' : 'text-gray-400',
      bg:    summary?.pending_requests > 0 ? 'bg-amber-50'   : 'bg-gray-50',
      link: '/appointments',
      show: isClinic,
    },
    {
      label: 'Low Stock Items',
      value: summary?.low_stock_count ?? 0,
      icon: AlertTriangle,
      color: summary?.low_stock_count > 0 ? 'text-orange-600' : 'text-gray-400',
      bg:    summary?.low_stock_count > 0 ? 'bg-orange-50'   : 'bg-gray-50',
      link: '/inventory',
      show: isPharmacist,
    },
    {
      label: 'Expiring Soon',
      value: summary?.expiring_meds_count ?? 0,
      icon: Clock,
      color: summary?.expiring_meds_count > 0 ? 'text-red-600' : 'text-gray-400',
      bg:    summary?.expiring_meds_count > 0 ? 'bg-red-50'    : 'bg-gray-50',
      link: '/inventory',
      show: isPharmacist,
    },
  ].filter(s => s.show);

  const recentVisits  = summary?.recent_visits  || [];
  const lowStockItems = summary?.low_stock_items || [];

  return (
    <AnimatedPage className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening at the clinic today.
            {lastFetch && (
              <span className="ml-2 text-xs text-slate-400">
                Last updated {lastFetch.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggeredItem}>
            <Link
              to={stat.link}
              className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon size={20} />
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" size={18} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Lower Grid */}
      <motion.div
        variants={staggeredContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Visits */}
        {isClinic && (
          <motion.div variants={staggeredItem} className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Visits</h3>
              <Link to="/appointments" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                View appointments <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {recentVisits.length > 0 ? recentVisits.map(v => (
                <Link
                  key={v.id}
                  to={`/patients/${v.patient_id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {v.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {v.patient_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {v.chief_complaint || 'General consultation'}
                        {v.doctor_name ? ` • Dr. ${v.doctor_name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">
                      {new Date(v.visit_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mt-1 ${
                      STATUS_COLORS[v.status] || 'bg-slate-100 text-slate-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </Link>
              )) : (
                <div className="p-12 text-center text-slate-400">
                  <Activity className="mx-auto mb-2 opacity-30" size={40} />
                  <p className="text-sm">No visits recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Right Column */}
        <motion.div variants={staggeredItem} className="space-y-5">
          {/* Pending Requests Alert */}
          {isClinic && summary?.pending_requests > 0 && (
            <Link
              to="/appointments"
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Inbox size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">{summary.pending_requests} Pending Request{summary.pending_requests !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-600">Tap to open Requests Inbox</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-amber-400 group-hover:text-amber-600 transition" />
            </Link>
          )}

          {/* Inventory Status */}
          {isPharmacist && (
            <div className="bg-primary p-5 rounded-xl text-white shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package size={18} />
                </div>
                <h3 className="font-semibold">Inventory</h3>
              </div>
              {lowStockItems.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {lowStockItems.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span className="text-white/90 truncate">{m.name}</span>
                      <span className="ml-2 flex-shrink-0 bg-red-400/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {m.stock_quantity} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/80 text-sm mb-4">All stock levels healthy. ✓</p>
              )}
              <Link
                to="/inventory"
                className="block w-full bg-white text-primary text-center py-2 rounded-lg text-sm font-bold hover:bg-primary-soft transition-colors"
              >
                Manage Inventory
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              {isClinic && (
                <>
                  <Link to="/patients/new"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary hover:bg-primary-soft hover:text-primary transition-all group">
                    <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary">
                      <Users size={15} />
                      <span className="text-sm font-medium">Register New Patient</span>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link to="/appointments"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary hover:bg-primary-soft hover:text-primary transition-all group">
                    <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary">
                      <Calendar size={15} />
                      <span className="text-sm font-medium">Schedule Appointment</span>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                </>
              )}
              {isPharmacist && (
                <Link to="/inventory"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary hover:bg-primary-soft hover:text-primary transition-all group">
                  <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary">
                    <Package size={15} />
                    <span className="text-sm font-medium">Update Stock</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-primary transition-colors" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  );
};

export default Dashboard;
