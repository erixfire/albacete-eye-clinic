import React, { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';

const NAV_ITEMS = [
  { id: 'home', label: '🏠 Home' },
  { id: 'services', label: '👁 Services' },
  { id: 'contact', label: '📍 Contact' },
  { id: 'admin', label: '🗂 Admin' },
];

const SERVICE_ITEMS = [
  { icon: '🔬', title: 'Comprehensive Eye Exam', text: 'Routine examinations, refraction, visual screening for adults and children.' },
  { icon: '👁', title: 'Glaucoma & Retina', text: 'Eye pressure screening, diabetic eye monitoring, retinal evaluation.' },
  { icon: '🏥', title: 'Surgical Coordination', text: 'Pre-op consultation, procedure scheduling, post-operative follow-up.' },
  { icon: '🔄', title: 'Follow-up Care', text: 'Ongoing treatment plans, medication review, progress monitoring.' },
  { icon: '📋', title: 'Patient Intake', text: 'Structured name, mobile, date, concern, and insurance capture.' },
  { icon: '📊', title: 'Front Desk Dashboard', text: 'Staff appointment queue backed by Cloudflare D1, accessible on any device.' },
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
  { icon: '🏥', title: 'Clinic', text: 'Albacete Eye Center & Medical Clinics' },
  { icon: '📍', title: 'Location', text: 'JEA Building, E. Lopez St, Jaro, Iloilo City (beside Jollibee)' },
  { icon: '📞', title: 'Phone', text: '+63 963 862 9414' },
  { icon: '📘', title: 'Facebook', text: '@AlbaceteEyeClinic', href: 'https://www.facebook.com/AlbaceteEyeClinic/' },
];

const GALLERY = [
  { src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/80ceed31f437ab9db8814d4df4b63ca5ba15fb36.jpg', alt: 'Eye doctor consulting a patient' },
  { src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/f35f2a2aba3d3d0493183d10505572519256f53a.jpg', alt: 'Eye exam with diagnostic equipment' },
];

const EMPTY_FORM = { name: '', phone: '', date: '', time: '', doctor: '', type: '', reason: '', insurance: '' };

const formatDateLabel = (d) => {
  if (!d) return '';
  return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const statusLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending');

function BookingForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleFieldChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const goToReview = (e) => {
    e.preventDefault();
    if (e.currentTarget.reportValidity()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, status: 'pending' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm(EMPTY_FORM);
      setStep(1);
      onSuccess('Appointment booked! Check the admin panel.');
    } catch (err) {
      onSuccess('Could not save appointment. Check Pages Functions and D1 binding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-widget card" id="booking-form">
      <div className="booking-widget-header">
        <div className="booking-icon">📅</div>
        <div>
          <p className="section-label">Book Appointment</p>
          <h3>Quick scheduling</h3>
        </div>
      </div>

      <div className="step-bar">
        <div className={`step-dot${step >= 1 ? ' done' : ''}`}>1</div>
        <div className="step-line" />
        <div className={`step-dot${step >= 2 ? ' done' : ''}`}>2</div>
      </div>

      {step === 1 ? (
        <form onSubmit={goToReview} autoComplete="off" className="booking-form">
          <label>Full name<input name="name" type="text" placeholder="Maria Santos" required value={form.name} onChange={handleFieldChange} /></label>
          <label>Mobile number<input name="phone" type="tel" placeholder="09xx xxx xxxx" required value={form.phone} onChange={handleFieldChange} /></label>
          <div className="form-row">
            <label>Date<input name="date" type="date" min={minDate} required value={form.date} onChange={handleFieldChange} /></label>
            <label>Time<input name="time" type="time" required value={form.time} onChange={handleFieldChange} /></label>
          </div>
          <label>Doctor
            <select name="doctor" required value={form.doctor} onChange={handleFieldChange}>
              <option value="" disabled>Select doctor</option>
              {DOCTOR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label>Visit type
            <select name="type" required value={form.type} onChange={handleFieldChange}>
              <option value="" disabled>Select type</option>
              {APPOINTMENT_TYPES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label>Main concern<textarea name="reason" placeholder="Blurry vision, follow-up, post-op concern…" required value={form.reason} onChange={handleFieldChange} /></label>
          <label>Insurance / HMO <span className="optional">(optional)</span><input name="insurance" type="text" placeholder="PhilHealth, Maxicare, etc." value={form.insurance} onChange={handleFieldChange} /></label>
          <button type="submit" className="primary-btn full-width">Review → </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="review-block">
            <div className="review-row"><span>Name</span><strong>{form.name}</strong></div>
            <div className="review-row"><span>Mobile</span><strong>{form.phone}</strong></div>
            <div className="review-row"><span>Date & Time</span><strong>{formatDateLabel(form.date)} · {form.time}</strong></div>
            <div className="review-row"><span>Doctor</span><strong>{form.doctor}</strong></div>
            <div className="review-row"><span>Type</span><strong>{form.type}</strong></div>
            <div className="review-row"><span>Concern</span><strong>{form.reason}</strong></div>
            {form.insurance && <div className="review-row"><span>Insurance</span><strong>{form.insurance}</strong></div>}
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setStep(1)} disabled={isSubmitting}>← Edit</button>
            <button type="submit" className="primary-btn" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Confirm Booking'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [todayLabel, setTodayLabel] = useState('Today');
  const [toast, setToast] = useState({ open: false, message: '' });
  const [adminSearch, setAdminSearch] = useState('');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const toastRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    setTodayLabel(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  useEffect(() => () => toastRef.current && window.clearTimeout(toastRef.current), []);

  const loadAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const res = await fetch('/appointments', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch { setAppointments([]); }
    finally { setIsLoadingAppointments(false); }
  };

  useEffect(() => { loadAppointments(); }, []);

  const sorted = useMemo(() =>
    [...appointments].sort((a, b) => new Date(`${a.date}T${a.time||'00:00'}`) - new Date(`${b.date}T${b.time||'00:00'}`)),
  [appointments]);

  const filtered = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((a) => (a.name||'').toLowerCase().includes(q) || (a.date||'').includes(q));
  }, [adminSearch, sorted]);

  const showToast = (message) => {
    setToast({ open: true, message });
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000);
  };

  const jumpTo = (view) => { setActiveView(view); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Cancel this appointment?')) return;
    try {
      const res = await fetch(`/appointments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await loadAppointments();
      showToast('Appointment cancelled.');
    } catch { showToast('Could not cancel.'); }
  };

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">

        {/* TOP HEADER */}
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-icon" aria-hidden="true">
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
          <nav className="topnav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} type="button"
                className={activeView === item.id ? 'nav-link active' : 'nav-link'}
                onClick={() => jumpTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="page-grid">

          {/* LEFT COLUMN — content */}
          <main className="left-col">

            {activeView === 'home' && (
              <>
                {/* Hero */}
                <section className="hero-card card">
                  <div className="hero-images">
                    {GALLERY.map((g, i) => (
                      <img key={i} src={g.src} alt={g.alt} className={i === 0 ? 'hero-img-main' : 'hero-img-sub'} loading="lazy" />
                    ))}
                  </div>
                  <div className="hero-copy">
                    <span className="soft-badge">📍 Jaro, Iloilo City</span>
                    <h2>Eye care appointments made simple for patients and staff.</h2>
                    <p>Walk-in or schedule ahead — our online booking goes directly to the clinic's appointment queue.</p>
                    <div className="hero-actions">
                      <a href="#booking-form" className="primary-btn">Book now ↓</a>
                      <button type="button" className="secondary-btn" onClick={() => jumpTo('contact')}>📞 Contact us</button>
                    </div>
                  </div>
                </section>

                {/* Quick stats */}
                <section className="stats-row">
                  <div className="stat-chip"><strong>{sorted.length}</strong><span>Upcoming</span></div>
                  <div className="stat-chip"><strong>Mon–Sat</strong><span>Open days</span></div>
                  <div className="stat-chip"><strong>D1</strong><span>Live database</span></div>
                  <div className="stat-chip"><strong>Jaro</strong><span>Iloilo City</span></div>
                </section>

                {/* Services preview */}
                <section className="services-section card">
                  <p className="section-label">Services</p>
                  <h3>What we offer</h3>
                  <div className="services-grid">
                    {SERVICE_ITEMS.map((s) => (
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
                  {SERVICE_ITEMS.map((s) => (
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
                  {CONTACT_CARDS.map((c) => (
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
                    width="100%" height="220" style={{border:0, borderRadius:'16px'}} allowFullScreen loading="lazy"
                  />
                </div>
              </section>
            )}

            {activeView === 'admin' && (
              <section className="admin-section card">
                <div className="section-header-row">
                  <div><p className="section-label">Admin</p><h3>Appointment queue · {todayLabel}</h3></div>
                  <button type="button" className="secondary-btn sm" onClick={loadAppointments}>↻ Refresh</button>
                </div>
                <input type="text" className="admin-search" placeholder="Search patient name or date…" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
                <div className="admin-list">
                  {isLoadingAppointments ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div className="admin-card skeleton-card" key={i} aria-hidden="true">
                        <div className="skeleton sk-title" /><div className="skeleton sk-line" /><div className="skeleton sk-line short" />
                      </div>
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="empty-state">📭 No appointments yet. Use the booking form to add one.</div>
                  ) : (
                    filtered.map((appt) => (
                      <article className="admin-card" key={appt.id ?? `${appt.name}-${appt.date}`}>
                        <div className="admin-card-top">
                          <div className="admin-name-row">
                            <h4>{appt.name || 'Unnamed'}</h4>
                            <span className={`badge badge-${appt.status||'pending'}`}>{statusLabel(appt.status)}</span>
                          </div>
                          <p className="admin-sub">{appt.doctor || 'Doctor TBA'} · {appt.type || 'Consultation'}</p>
                          <p className="admin-reason">{appt.reason || 'No concern specified'}</p>
                        </div>
                        <div className="admin-card-bottom">
                          <div className="admin-pills">
                            <span>📅 {formatDateLabel(appt.date)}</span>
                            <span>🕐 {appt.time || 'TBA'}</span>
                            <span>📞 {appt.phone || '—'}</span>
                            {appt.insurance && <span>🏥 {appt.insurance}</span>}
                          </div>
                          <button type="button" className="danger-btn sm" onClick={() => handleDelete(appt.id)}>Cancel</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

          </main>

          {/* RIGHT COLUMN — always-visible sticky booking form */}
          <aside className="right-col">
            <BookingForm onSuccess={(msg) => { showToast(msg); loadAppointments(); }} />

            {/* Clinic info card below form */}
            <div className="clinic-info-card card">
              <p className="section-label">Clinic info</p>
              <ul className="clinic-info-list">
                <li>📍 JEA Building, E. Lopez St, Jaro</li>
                <li>📞 +63 963 862 9414</li>
                <li>📘 <a href="https://www.facebook.com/AlbaceteEyeClinic/" target="_blank" rel="noopener noreferrer">@AlbaceteEyeClinic</a></li>
              </ul>
            </div>
          </aside>
        </div>

        {/* BOTTOM NAV for mobile */}
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button"
              className={activeView === item.id ? 'bnav-btn active' : 'bnav-btn'}
              onClick={() => jumpTo(item.id)}>
              {item.label}
            </button>
          ))}
          <a href="#booking-form" className="bnav-btn bnav-book">📅 Book</a>
        </nav>

      </div>

      <div className={`toast${toast.open ? ' show' : ''}`} role="status" aria-live="polite">{toast.message}</div>
    </>
  );
}

export default App;
