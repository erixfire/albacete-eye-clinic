import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, User, ChevronRight, Plus, Inbox,
  CheckCircle, AlertCircle, XCircle, RefreshCw, ClipboardList
} from 'lucide-react';
import AppointmentForm from './AppointmentForm';
import AppointmentRequestCard from './AppointmentRequestCard';

const STATUS_STYLES = {
  scheduled:   'bg-blue-100 text-blue-700',
  'checked-in':'bg-yellow-100 text-yellow-700',
  seen:        'bg-purple-100 text-purple-700',
  done:        'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
};

const STATUS_NEXT = {
  scheduled:   'checked-in',
  'checked-in':'seen',
  seen:        'done',
};

const STATUS_LABEL_NEXT = {
  scheduled:   'Check In',
  'checked-in':'Mark Seen',
  seen:        'Mark Done',
};

export default function AppointmentList() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tab, setTab]         = useState('queue');
  const [appts, setAppts]     = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/appointments?date=${selectedDate}`, { credentials: 'include' });
    if (res.ok) setAppts(await res.json());
    setLoading(false);
  }, [selectedDate]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/appointments', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setRequests(data.filter(r => r.status === 'pending'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'queue')    fetchQueue();
    if (tab === 'requests') fetchRequests();
  }, [tab, fetchQueue, fetchRequests]);

  const advanceStatus = async (appt) => {
    const next = STATUS_NEXT[appt.status];
    if (!next) return;
    await fetch(`/api/appointments/${appt.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, notes: appt.notes }),
    });
    fetchQueue();
  };

  const cancelAppt = async (appt) => {
    if (!confirm(`Cancel appointment for ${appt.patient_name}?`)) return;
    await fetch(`/api/appointments/${appt.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchQueue();
  };

  const todayLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tab === 'queue' ? todayLabel : 'Pending public booking requests'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => tab === 'queue' ? fetchQueue() : fetchRequests()}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {['admin','frontdesk','nurse'].includes(user?.role) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
            >
              <Plus size={16} /> New Appointment
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'queue' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={15} /> Today's Queue
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'requests' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox size={15} /> Requests Inbox
          {requests.length > 0 && tab !== 'requests' && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Queue Tab */}
      {tab === 'queue' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().slice(0,10))}
                className="text-xs text-primary underline"
              >
                Back to today
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : appts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No appointments</p>
                <p className="text-sm">Nothing scheduled for {todayLabel}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Doctor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Specialization</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appts.map(appt => (
                      <tr key={appt.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Clock size={13} className="text-gray-400" />
                            {new Date(appt.appointment_date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/patients/${appt.patient_id}`}
                            className="flex items-center gap-2 group"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {appt.patient_name?.split(' ').map(n => n[0]).slice(0,2).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground group-hover:text-primary transition">
                                {appt.patient_name}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">{appt.patient_code}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <User size={13} className="text-gray-400" />
                            {appt.doctor_name}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500">{appt.specialization_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                            STATUS_STYLES[appt.status] || 'bg-gray-100 text-gray-600'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {STATUS_NEXT[appt.status] && (
                              <button
                                onClick={() => advanceStatus(appt)}
                                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                              >
                                {STATUS_LABEL_NEXT[appt.status]}
                              </button>
                            )}
                            {appt.status === 'checked-in' || appt.status === 'seen' ? (
                              <Link
                                to={`/visits/new?patient_id=${appt.patient_id}&appointment_id=${appt.id}`}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              >
                                Start Visit
                              </Link>
                            ) : null}
                            {appt.status !== 'done' && appt.status !== 'cancelled' && (
                              <button
                                onClick={() => cancelAppt(appt)}
                                className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition"
                                title="Cancel"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Requests Inbox Tab */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Inbox size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Inbox is clear</p>
              <p className="text-sm">No pending booking requests</p>
            </div>
          ) : requests.map(req => (
            <AppointmentRequestCard
              key={req.id}
              request={req}
              onConverted={() => { fetchRequests(); fetchQueue(); }}
              onDismissed={fetchRequests}
            />
          ))}
        </div>
      )}

      {/* New Appointment Modal */}
      {showForm && (
        <AppointmentForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchQueue(); }}
        />
      )}
    </div>
  );
}
