import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

/* ── Constants ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'home',     label: '🏠 Home' },
  { id: 'services', label: '👁 Services' },
  { id: 'contact',  label: '📍 Contact' },
  { id: 'admin',    label: '🗂 Admin' },
];

const SERVICE_ITEMS = [
  { icon: '🔬', title: 'Comprehensive Eye Exam',  text: 'Routine examinations, refraction, visual screening for adults and children.' },
  { icon: '👁', title: 'Glaucoma & Retina',        text: 'Eye pressure screening, diabetic eye monitoring, retinal evaluation.' },
  { icon: '🏥', title: 'Surgical Coordination',    text: 'Pre-op consultation, procedure scheduling, post-operative follow-up.' },
  { icon: '🔄', title: 'Follow-up Care',           text: 'Ongoing treatment plans, medication review, progress monitoring.' },
  { icon: '📋', title: 'Patient Intake',           text: 'Structured name, mobile, date, concern, and insurance capture.' },
  { icon: '📊', title: 'Front Desk Dashboard',     text: 'Staff appointment queue backed by Cloudflare D1, accessible on any device.' },
];

const DOCTOR_OPTIONS = [
  'Dr. Thomas Louie F. Albacete – Ophthalmology & Surgery',
  'Next available eye clinic doctor',
];

const APPOINTMENT_TYPES = [
  'Initial consultation',
  'Comprehensive eye exam',
  'Follow-up visit',
  'Post-operative check',
  'Glaucoma / retina screening',
  'General eye concern',
];

const CONTACT_CARDS = [
  { icon: '🏥', title: 'Clinic',   text: 'Albacete Eye Center & Medical Clinics' },
  { icon: '📍', title: 'Location', text: 'JEA Building, E. Lopez St, Jaro, Iloilo City (beside Jollibee)' },
  { icon: '📞', title: 'Phone',    text: '+63 963 862 9414' },
  { icon: '📘', title: 'Facebook', text: '@AlbaceteEyeClinic', href: 'https://www.facebook.com/AlbaceteEyeClinic/' },
];

const GALLERY = [
  { src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/80ceed31f437ab9db8814d4df4b63ca5ba15fb36.jpg', alt: 'Eye doctor consulting a patient' },
  { src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/f35f2a2aba3d3d0493183d10505572519256f53a.jpg', alt: 'Eye exam with diagnostic equipment' },
];

const STATUS_COLORS = { pending: 'warning', confirmed: 'success', cancelled: 'danger' };
const CLINIC_START = 8;
const CLINIC_END   = 17;
const SLOT_MINS    = 30;

/* ── Helpers ───────────────────────────────────────────────── */
function generateSlots() {
  const slots = [];
  for (let h = CLINIC_START; h < CLINIC_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINS) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}
const ALL_SLOTS = generateSlots();
const AM_SLOTS  = ALL_SLOTS.filter(s => parseInt(s) < 12);
const PM_SLOTS  = ALL_SLOTS.filter(s => parseInt(s) >= 12);

const fmt12 = t => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const toISO      = d => d.toISOString().split('T')[0];
const addDays    = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const statusLabel = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending';

const formatDateLabel = d => d
  ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })
  : '';

const formatDateFull = d => d
  ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' })
  : '';

/* ── Month Calendar Picker ──────────────────────────────────── */
function MonthPicker({ selected, onSelect, bookedDates }) {
  const today  = useMemo(() => toISO(new Date()), []);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const year       = cursor.getFullYear();
  const month      = cursor.getMonth();
  const monthName  = cursor.toLocaleDateString(undefined, { month:'long', year:'numeric' });
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCursor(d => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return x; });
  const nextMonth = () => setCursor(d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; });

  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="month-picker">
      <div className="mpk-header">
        <button type="button" className="mpk-nav" onClick={prevMonth} aria-label="Previous month">‹</button>
        <span className="mpk-title">{monthName}</span>
        <button type="button" className="mpk-nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>
      <div className="mpk-dow">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="mpk-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const iso    = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isPast = iso < today;
          const isSun  = new Date(iso).getDay() === 0;
          const isSel  = iso === selected;
          const hasBook = bookedDates?.has(iso);
          return (
            <button
              key={iso} type="button"
              disabled={isPast || isSun}
              onClick={() => onSelect(iso)}
              aria-label={iso}
              aria-pressed={isSel}
              className={['mpk-day', isPast?'past':'', isSun?'sunday':'', isSel?'selected':'', hasBook&&!isSel?'has-booking':''].filter(Boolean).join(' ')}
            >
              {day}
              {hasBook && !isPast && !isSun && <span className="mpk-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Time Slot Pills ────────────────────────────────────────── */
function SlotPills({ date, appointments, selected, onSelect }) {
  const today = toISO(new Date());
  const now   = new Date();
  const curMin = now.getHours() * 60 + now.getMinutes();

  const bookedTimes = useMemo(() => {
    if (!date) return new Set();
    return new Set(
      appointments.filter(a => a.date === date && a.status !== 'cancelled').map(a => a.time)
    );
  }, [date, appointments]);

  const isSlotDisabled = useCallback((slot) => {
    if (!date || date < today) return true;
    if (bookedTimes.has(slot)) return true;
    if (date === today) {
      const [sh, sm] = slot.split(':').map(Number);
      if (sh * 60 + sm <= curMin) return true;
    }
    return false;
  }, [date, today, curMin, bookedTimes]);

  if (!date) return <div className="slot-empty">📅 Pick a date above to see available times</div>;

  const renderSlots = slots => slots.map(slot => {
    const disabled = isSlotDisabled(slot);
    const booked   = bookedTimes.has(slot);
    return (
      <button key={slot} type="button"
        disabled={disabled}
        onClick={() => !disabled && onSelect(slot)}
        aria-pressed={selected === slot}
        className={['slot-pill', booked?'booked':'', selected===slot?'selected':'', disabled&&!booked?'past':''].filter(Boolean).join(' ')}
      >
        {fmt12(slot)}
      </button>
    );
  });

  return (
    <div className="slot-pills-wrap">
      <div className="slot-period-label">Morning</div>
      <div className="slot-pills">{renderSlots(AM_SLOTS)}</div>
      <div className="slot-period-label">Afternoon</div>
      <div className="slot-pills">{renderSlots(PM_SLOTS)}</div>
      <div className="slot-legend">
        <span><span className="sleg available" />Available</span>
        <span><span className="sleg booked-dot" />Booked</span>
        <span><span className="sleg sel-dot" />Selected</span>
      </div>
    </div>
  );
}

/* ── Admin week-view calendar ───────────────────────────────── */
function WeekCalendar({ appointments }) {
  const today = useMemo(() => toISO(new Date()), []);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d;
  });
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const bookedMap = useMemo(() => {
    const m = {};
    appointments.forEach(a => {
      if (a.date && a.time) {
        const k = `${a.date}|${a.time}`;
        m[k] = (m[k] || []).concat(a);
      }
    });
    return m;
  }, [appointments]);

  const monthRange = () => {
    const f = days[0].toLocaleDateString(undefined, { month:'short', day:'numeric' });
    const l = days[6].toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
    return `${f} – ${l}`;
  };

  const goToday = () => setWeekStart(() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d; });

  return (
    <div className="week-cal">
      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={() => setWeekStart(w => addDays(w, -7))} aria-label="Previous week">‹</button>
        <span className="cal-range">{monthRange()}</span>
        <button type="button" className="cal-nav" onClick={() => setWeekStart(w => addDays(w, 7))} aria-label="Next week">›</button>
        <button type="button" className="secondary-btn sm cal-today" onClick={goToday}>Today</button>
      </div>
      <div className="cal-grid">
        <div className="cal-time-col">
          <div className="cal-corner" />
          {ALL_SLOTS.map(s => <div key={s} className="cal-time-label">{fmt12(s)}</div>)}
        </div>
        {days.map(day => {
          const iso     = toISO(day);
          const isPast  = iso < today;
          const isToday = iso === today;
          return (
            <div key={iso} className="cal-day-col">
              <div className={['cal-day-header', isToday&&'today', isPast&&'past'].filter(Boolean).join(' ')}>
                <span className="cal-day-name">{day.toLocaleDateString(undefined, { weekday:'short' })}</span>
                <span className="cal-day-num">{day.getDate()}</span>
              </div>
              {ALL_SLOTS.map(slot => {
                const booked   = bookedMap[`${iso}|${slot}`] || [];
                const isBooked = booked.length > 0;
                const statusClass = isBooked ? (booked[0].status || 'pending') : '';
                return (
                  <div key={slot}
                    className={['cal-cell', isBooked&&`booked ${statusClass}`, isPast&&'past', isToday&&'today-col'].filter(Boolean).join(' ')}
                    title={isBooked ? `${booked[0].name} – ${booked[0].type||'Consultation'} [${booked[0].status||'pending'}]` : ''}
                  >
                    {isBooked && <span className="cal-cell-name">{booked[0].name?.split(' ')[0]}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        <span className="legend-dot available" /> Available
        <span className="legend-dot booked" /> Pending
        <span className="legend-dot confirmed" /> Confirmed
      </div>
    </div>
  );
}

/* ── Booking Form ───────────────────────────────────────────── */
function BookingForm({ appointments, onSuccess }) {
  const EMPTY = { name:'', phone:'', date:'', time:'', doctor:DOCTOR_OPTIONS[0], type:'', reason:'', insurance:'' };
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const bookedDates = useMemo(() => {
    const s = new Set();
    appointments.forEach(a => { if (a.date && a.status !== 'cancelled') s.add(a.date); });
    return s;
  }, [appointments]);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const goReview = e => {
    e.preventDefault();
    if (!form.date || !form.time) return;
    if (e.currentTarget.reportValidity()) setStep(2);
  };

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, status: 'pending' }),
      });
      if (!res.ok) throw new Error(await res.text());
      setForm(EMPTY);
      setStep(1);
      onSuccess('✅ Appointment booked! We\'ll see you then.');
    } catch (err) {
      onSuccess(err.message?.includes('already booked') ? '⚠️ That slot is already taken. Pick another.' : '❌ Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="booking-widget card" id="booking-form">
      <div className="bw-header">
        <div className="bw-icon">📅</div>
        <div>
          <p className="section-label">Book Appointment</p>
          <h3>Albacete Eye Clinic</h3>
        </div>
        <span className="bw-badge">30 min</span>
      </div>

      <div className="step-track">
        <div className={`step-node${step >= 1 ? ' active' : ''}`}><span>1</span><p>Details</p></div>
        <div className="step-connector" />
        <div className={`step-node${step >= 2 ? ' active' : ''}`}><span>2</span><p>Confirm</p></div>
      </div>

      {step === 1 && (
        <form onSubmit={goReview} autoComplete="off" className="bw-form">
          <div className="bw-section">
            <p className="bw-section-title">👤 Patient info</p>
            <div className="bw-row">
              <label>Full name
                <input name="name" type="text" placeholder="Maria Santos" required value={form.name} onChange={set} />
              </label>
              <label>Mobile
                <input name="phone" type="tel" placeholder="09xx xxx xxxx" required value={form.phone} onChange={set} />
              </label>
            </div>
            <label>Visit type
              <select name="type" required value={form.type} onChange={set}>
                <option value="" disabled>Select type…</option>
                {APPOINTMENT_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label>Main concern
              <textarea name="reason" placeholder="Describe your concern…" required value={form.reason} onChange={set} />
            </label>
            <label>Insurance / HMO <span className="optional">(optional)</span>
              <input name="insurance" type="text" placeholder="PhilHealth, Maxicare…" value={form.insurance} onChange={set} />
            </label>
          </div>

          <div className="bw-section">
            <p className="bw-section-title">📅 Pick a date</p>
            <MonthPicker selected={form.date} onSelect={d => setForm(p => ({ ...p, date: d, time: '' }))} bookedDates={bookedDates} />
          </div>

          {form.date && (
            <div className="bw-section">
              <p className="bw-section-title">🕐 Pick a time · <span className="bw-date-label">{formatDateFull(form.date)}</span></p>
              <SlotPills date={form.date} appointments={appointments} selected={form.time} onSelect={t => setForm(p => ({ ...p, time: t }))} />
            </div>
          )}

          <button type="submit" className="primary-btn full-width" disabled={!form.date || !form.time}>
            {form.date && form.time
              ? `Review booking → ${formatDateLabel(form.date)} ${fmt12(form.time)}`
              : form.date ? 'Select a time to continue' : 'Select a date to continue'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="bw-form">
          <div className="review-card">
            <div className="review-slot">
              <span className="review-slot-icon">📅</span>
              <div>
                <strong>{formatDateFull(form.date)}</strong>
                <p>{fmt12(form.time)} · 30 minutes</p>
              </div>
            </div>
            <div className="review-divider" />
            <div className="review-rows">
              <div className="review-row"><span>Patient</span><strong>{form.name}</strong></div>
              <div className="review-row"><span>Mobile</span><strong>{form.phone}</strong></div>
              <div className="review-row"><span>Type</span><strong>{form.type}</strong></div>
              <div className="review-row"><span>Concern</span><strong>{form.reason}</strong></div>
              {form.insurance && <div className="review-row"><span>Insurance</span><strong>{form.insurance}</strong></div>}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setStep(1)} disabled={busy}>← Edit</button>
            <button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Saving…' : '✓ Confirm booking'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Admin Login Modal ──────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [creds, setCreds]   = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [busy,  setBusy]    = useState(false);
  const [show,  setShow]    = useState(false);

  const set = e => setCreds(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      onLogin(data.admin);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrap card">
      <div className="admin-login-icon">🔐</div>
      <h3>Admin Login</h3>
      <p className="admin-login-sub">Sign in to access the clinic dashboard</p>
      <form onSubmit={submit} className="admin-login-form">
        <label>Username
          <input name="username" type="text" autoComplete="username" required value={creds.username} onChange={set} placeholder="admin" />
        </label>
        <label>Password
          <div className="pw-wrap">
            <input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={creds.password} onChange={set} placeholder="••••••••" />
            <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)} aria-label="Toggle password">{show ? '🙈' : '👁'}</button>
          </div>
        </label>
        {error && <div className="login-error">⚠️ {error}</div>}
        <button type="submit" className="primary-btn full-width" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

/* ── Admin Stats Bar ────────────────────────────────────────── */
function AdminStats({ appointments }) {
  const today = toISO(new Date());
  const stats = useMemo(() => {
    const total     = appointments.length;
    const pending   = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const todayApts = appointments.filter(a => a.date === today).length;
    return { total, pending, confirmed, cancelled, todayApts };
  }, [appointments, today]);

  return (
    <div className="admin-stats">
      <div className="stat-chip accent"><strong>{stats.todayApts}</strong><span>Today</span></div>
      <div className="stat-chip"><strong>{stats.total}</strong><span>Total</span></div>
      <div className="stat-chip warning"><strong>{stats.pending}</strong><span>Pending</span></div>
      <div className="stat-chip success"><strong>{stats.confirmed}</strong><span>Confirmed</span></div>
      <div className="stat-chip danger"><strong>{stats.cancelled}</strong><span>Cancelled</span></div>
    </div>
  );
}

/* ── Admin Panel ────────────────────────────────────────────── */
function AdminPanel({ appointments, loading, onRefresh, onStatusUpdate, onDelete, onLogout, admin }) {
  const [search,      setSearch]      = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate,   setFilterDate]   = useState('');
  const [todayLabel, setTodayLabel]   = useState('');
  const [updatingId,  setUpdatingId]  = useState(null);

  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' }));
  }, []);

  const sorted = useMemo(() =>
    [...appointments].sort((a, b) => new Date(`${a.date}T${a.time||'00:00'}`) - new Date(`${b.date}T${b.time||'00:00'}`)),
  [appointments]);

  const filtered = useMemo(() => {
    let list = sorted;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(a => (a.name||'').toLowerCase().includes(q) || (a.date||'').includes(q) || (a.phone||'').includes(q));
    if (filterStatus !== 'all') list = list.filter(a => (a.status||'pending') === filterStatus);
    if (filterDate) list = list.filter(a => a.date === filterDate);
    return list;
  }, [search, sorted, filterStatus, filterDate]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    await onStatusUpdate(id, newStatus);
    setUpdatingId(null);
  };

  const clearFilters = () => { setSearch(''); setFilterStatus('all'); setFilterDate(''); };
  const hasFilters = search || filterStatus !== 'all' || filterDate;

  return (
    <section className="admin-section card">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <p className="section-label">Admin Panel · {admin?.full_name || 'Staff'}</p>
          <h3>{todayLabel}</h3>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="secondary-btn sm" onClick={onRefresh}>↻ Refresh</button>
          <button type="button" className="danger-btn sm" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      {/* Stats */}
      <AdminStats appointments={appointments} />

      {/* Week Calendar */}
      <div className="admin-cal-wrap">
        <p className="section-label" style={{ marginBottom: 8 }}>Dr. Albacete – Weekly Schedule</p>
        <WeekCalendar appointments={sorted} />
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text" className="admin-search"
          placeholder="Search name, phone, or date…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date" className="admin-filter-date"
          value={filterDate} onChange={e => setFilterDate(e.target.value)}
          title="Filter by date"
        />
        {hasFilters && (
          <button type="button" className="secondary-btn sm" onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="admin-results-count">
          {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
          {hasFilters ? ' (filtered)' : ''}
        </p>
      )}

      {/* Appointment List */}
      <div className="admin-list">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div className="admin-card skeleton-card" key={i} aria-hidden>
                <div className="skeleton sk-title" />
                <div className="skeleton sk-line" />
                <div className="skeleton sk-line short" />
              </div>
            ))
          : filtered.length === 0
            ? <div className="empty-state">📭 No appointments found{hasFilters ? ' for these filters.' : '.'}</div>
            : filtered.map(appt => (
                <article className="admin-card" key={appt.id ?? `${appt.name}-${appt.date}`}>
                  <div className="admin-card-top">
                    <div className="admin-name-row">
                      <h4>{appt.name || 'Unnamed'}</h4>
                      <span className={`badge badge-${STATUS_COLORS[appt.status] || 'warning'}`}>
                        {statusLabel(appt.status)}
                      </span>
                    </div>
                    <p className="admin-sub">{appt.doctor || 'Doctor TBA'} · {appt.type || 'Consultation'}</p>
                    <p className="admin-reason">{appt.reason || 'No concern specified'}</p>
                  </div>
                  <div className="admin-card-bottom">
                    <div className="admin-pills">
                      <span>📅 {formatDateLabel(appt.date)}</span>
                      <span>🕐 {fmt12(appt.time)}</span>
                      <span>⏱ 30 min</span>
                      <span>📞 {appt.phone || '—'}</span>
                      {appt.insurance && <span>🏥 {appt.insurance}</span>}
                    </div>
                    <div className="admin-card-actions">
                      {appt.status !== 'confirmed' && (
                        <button
                          type="button" className="confirm-btn sm"
                          disabled={updatingId === appt.id}
                          onClick={() => handleStatusChange(appt.id, 'confirmed')}
                        >
                          {updatingId === appt.id ? '…' : '✓ Confirm'}
                        </button>
                      )}
                      {appt.status === 'pending' && (
                        <button
                          type="button" className="danger-btn sm"
                          disabled={updatingId === appt.id}
                          onClick={() => onDelete(appt.id)}
                        >
                          Cancel
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          type="button" className="secondary-btn sm"
                          disabled={updatingId === appt.id}
                          onClick={() => handleStatusChange(appt.id, 'pending')}
                        >
                          ↩ Revert
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
        }
      </div>
    </section>
  );
}

/* ── App ────────────────────────────────────────────────────── */
function App() {
  const [activeView, setActiveView]   = useState('home');
  const [appointments, setAppts]      = useState([]);
  const [toast, setToast]             = useState({ open: false, message: '' });
  const [loading, setLoading]         = useState(true);
  const [adminUser, setAdminUser]     = useState(null);
  const [adminChecked, setAdminChecked] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  /* Check existing session on load */
  useEffect(() => {
    fetch('/auth/me', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.admin) setAdminUser(data.admin); })
      .catch(() => {})
      .finally(() => setAdminChecked(true));
  }, []);

  const loadAppts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = adminUser ? '/admin/appointments' : '/appointments';
      const r = await fetch(endpoint, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const d = await r.json();
      setAppts(Array.isArray(d) ? d : []);
    } catch {
      setAppts([]);
    } finally {
      setLoading(false);
    }
  }, [adminUser]);

  useEffect(() => { loadAppts(); }, [loadAppts]);

  const sorted = useMemo(() =>
    [...appointments].sort((a, b) => new Date(`${a.date}T${a.time||'00:00'}`) - new Date(`${b.date}T${b.time||'00:00'}`)),
  [appointments]);

  const showToast = useCallback(msg => {
    setToast({ open: true, message: msg });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(p => ({ ...p, open: false })), 3200);
  }, []);

  const jumpTo = v => { setActiveView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleLogin = admin => { setAdminUser(admin); loadAppts(); };

  const handleLogout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    setAdminUser(null);
    showToast('Signed out.');
    loadAppts();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`/admin/appointments?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      await loadAppts();
      showToast(`Appointment ${status}.`);
    } catch {
      showToast('Could not update status.');
    }
  };

  const handleDelete = async id => {
    if (!id || !confirm('Cancel this appointment?')) return;
    try {
      const endpoint = adminUser ? `/admin/appointments?id=${id}` : `/appointments?id=${id}`;
      await fetch(endpoint, { method: 'DELETE', credentials: 'same-origin' });
      await loadAppts();
      showToast('Appointment cancelled.');
    } catch {
      showToast('Could not cancel.');
    }
  };

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">

        <header className="topbar">
          <div className="brand-block">
            <div className="brand-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </div>
            <div>
              <p className="eyebrow">Albacete Eye Center & Medical Clinics</p>
              <h1 className="site-title">Clearer vision, simpler care.</h1>
            </div>
          </div>
          <nav className="topnav" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map(item => (
              <button key={item.id} type="button"
                className={activeView === item.id ? 'nav-link active' : 'nav-link'}
                onClick={() => jumpTo(item.id)}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                {item.label}
                {item.id === 'admin' && adminUser && <span className="nav-badge" />}
              </button>
            ))}
          </nav>
        </header>

        <div className="page-grid">
          <main className="left-col">

            {activeView === 'home' && (
              <>
                <section className="hero-card card">
                  <div className="hero-images">
                    {GALLERY.map((g, i) => (
                      <img key={i} src={g.src} alt={g.alt}
                        className={i === 0 ? 'hero-img-main' : 'hero-img-sub'} loading="lazy" />
                    ))}
                  </div>
                  <div className="hero-copy">
                    <span className="soft-badge">📍 Jaro, Iloilo City</span>
                    <h2>Eye care appointments made simple for patients and staff.</h2>
                    <p>Pick a 30-minute slot on the calendar — your booking goes straight to the clinic queue.</p>
                    <div className="hero-actions">
                      <a href="#booking-form" className="primary-btn">Book a slot ↓</a>
                      <button type="button" className="secondary-btn" onClick={() => jumpTo('contact')}>📞 Contact</button>
                    </div>
                  </div>
                </section>
                <section className="stats-row" aria-label="Clinic stats">
                  <div className="stat-chip"><strong>{sorted.length}</strong><span>Upcoming</span></div>
                  <div className="stat-chip"><strong>30 min</strong><span>Per slot</span></div>
                  <div className="stat-chip"><strong>8–5 PM</strong><span>Hours</span></div>
                  <div className="stat-chip"><strong>Mon–Sat</strong><span>Open days</span></div>
                </section>
                <section className="services-section card">
                  <p className="section-label">Services</p>
                  <h3>What we offer</h3>
                  <div className="services-grid">
                    {SERVICE_ITEMS.map(s => (
                      <div className="service-card" key={s.title}>
                        <span className="service-icon">{s.icon}</span>
                        <div><strong>{s.title}</strong><p>{s.text}</p></div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeView === 'services' && (
              <section className="services-section card">
                <p className="section-label">All Services</p>
                <h3>Eye clinic services &amp; care workflow</h3>
                <div className="services-grid">
                  {SERVICE_ITEMS.map(s => (
                    <div className="service-card" key={s.title}>
                      <span className="service-icon">{s.icon}</span>
                      <div><strong>{s.title}</strong><p>{s.text}</p></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeView === 'contact' && (
              <section className="contact-section card">
                <p className="section-label">Contact</p>
                <h3>Clinic details &amp; location</h3>
                <div className="contact-list">
                  {CONTACT_CARDS.map(c => (
                    <div className="contact-item" key={c.title}>
                      <span className="contact-icon">{c.icon}</span>
                      <div>
                        <span className="contact-label">{c.title}</span>
                        {c.href
                          ? <a href={c.href} target="_blank" rel="noopener noreferrer">{c.text}</a>
                          : <strong>{c.text}</strong>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="map-placeholder">
                  <iframe
                    title="Clinic location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5!2d122.563!3d10.734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSmFybywgSWxvaWxvIENpdHk!5e0!3m2!1sen!2sph!4v1"
                    width="100%" height="220"
                    style={{ border: 0, borderRadius: '16px' }}
                    allowFullScreen loading="lazy"
                  />
                </div>
              </section>
            )}

            {activeView === 'admin' && (
              adminChecked
                ? adminUser
                  ? <AdminPanel
                      appointments={appointments}
                      loading={loading}
                      onRefresh={loadAppts}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDelete}
                      onLogout={handleLogout}
                      admin={adminUser}
                    />
                  : <AdminLogin onLogin={handleLogin} />
                : <div className="empty-state">Checking session…</div>
            )}

          </main>

          <aside className="right-col">
            <BookingForm appointments={appointments} onSuccess={msg => { showToast(msg); loadAppts(); }} />
            <div className="clinic-info-card card">
              <p className="section-label">Clinic info</p>
              <ul className="clinic-info-list">
                <li>📍 JEA Building, E. Lopez St, Jaro</li>
                <li>📞 +63 963 862 9414</li>
                <li>🕐 Mon–Sat · 8:00 AM – 5:00 PM</li>
                <li>📘 <a href="https://www.facebook.com/AlbaceteEyeClinic/" target="_blank" rel="noopener noreferrer">@AlbaceteEyeClinic</a></li>
              </ul>
            </div>
          </aside>
        </div>

        <nav className="bottom-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(item => (
            <button key={item.id} type="button"
              className={activeView === item.id ? 'bnav-btn active' : 'bnav-btn'}
              onClick={() => jumpTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <a href="#booking-form" className="bnav-btn bnav-book">📅 Book</a>
        </nav>
      </div>

      <div className={`toast${toast.open ? ' show' : ''}`} role="status" aria-live="polite">
        {toast.message}
      </div>
    </>
  );
}

export default App;
