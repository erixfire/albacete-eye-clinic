import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'book', label: 'Book' },
  { id: 'contact', label: 'Contact' },
  { id: 'admin', label: 'Admin' },
];

const SERVICE_ITEMS = [
  {
    title: 'Comprehensive eye consultations',
    text: 'Routine eye examinations, refraction, visual screening, and primary ophthalmology consultations for adults and children.',
  },
  {
    title: 'Glaucoma and retina evaluation',
    text: 'Focused screening support for eye pressure, diabetic eye monitoring, retinal concerns, and early detection workflows.',
  },
  {
    title: 'Surgical care coordination',
    text: 'Consultation booking, procedure preparation, and post-operative follow-up scheduling in one organized system.',
  },
  {
    title: 'Follow-up and continuity care',
    text: 'Easy revisit scheduling for ongoing treatment plans, medication review, and progress monitoring.',
  },
  {
    title: 'Clinic scheduling assistance',
    text: 'Patient appointment intake with structured doctor, date, time, concern, and insurance capture.',
  },
  {
    title: 'Front desk appointment dashboard',
    text: 'Staff can review the upcoming appointment list in a clean mobile-friendly admin panel backed by Cloudflare D1.',
  },
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

const CLINIC_HIGHLIGHTS = [
  {
    title: 'Fast first step',
    text: 'Patients immediately see where to book, reducing friction for mobile users who only need schedule essentials.',
  },
  {
    title: 'Clinic essentials visible',
    text: 'Location, phone, social page, appointment types, and doctor options are surfaced in concise sections.',
  },
  {
    title: 'Built for Pages + D1',
    text: 'The interface already posts to /appointments so the booking flow stays connected to your Cloudflare stack.',
  },
];

const CONTACT_CARDS = [
  {
    title: 'Clinic name',
    text: 'Albacete Eye Center & Medical Clinics',
  },
  {
    title: 'Location',
    text: 'JEA Building, E. Lopez Street, Jaro, Iloilo City, beside Jollibee.',
  },
  {
    title: 'Phone',
    text: '+63 963 862 9414',
  },
  {
    title: 'Facebook',
    text: '@AlbaceteEyeClinic',
    href: 'https://www.facebook.com/AlbaceteEyeClinic/',
  },
  {
    title: 'Branch note',
    text: 'Patients should confirm updated schedules, announcements, and clinic advisories through the official Facebook page.',
  },
  {
    title: 'Booking note',
    text: 'The online form collects patient name, mobile, date, time, doctor, visit type, reason, and insurance details.',
  },
];

const GALLERY = [
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/80ceed31f437ab9db8814d4df4b63ca5ba15fb36.jpg',
    alt: 'Eye doctor consulting a patient in a clinic',
    eyebrow: 'Patient care',
    title: 'Comfort-first consultations',
  },
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/f35f2a2aba3d3d0493183d10505572519256f53a.jpg',
    alt: 'Eye exam being performed with diagnostic equipment',
    eyebrow: 'Diagnostics',
    title: 'Modern eye examination flow',
  },
  {
    src: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/858d7ba1300b302e33f95e00a0c798ae1e520d27.jpg',
    alt: 'Eye clinic examination room with ophthalmology equipment',
    eyebrow: 'Clinic space',
    title: 'Clean and organized exam rooms',
  },
];

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

function App() {
  const [activeView, setActiveView] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [todayLabel, setTodayLabel] = useState('Today');
  const [toast, setToast] = useState({ open: false, message: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const label = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    setTodayLabel(`Today · ${label}`);
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch('/appointments', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load appointments', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const ad = `${a.date || ''}T${a.time || '00:00'}`;
      const bd = `${b.date || ''}T${b.time || '00:00'}`;
      return new Date(ad) - new Date(bd);
    });
  }, [appointments]);

  const showToast = (message) => {
    setToast({ open: true, message });
    window.clearTimeout(showToast._timeout);
    showToast._timeout = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2800);
  };

  const jumpTo = (view) => {
    setActiveView(view);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      date: formData.get('date')?.toString(),
      time: formData.get('time')?.toString(),
      doctor: formData.get('doctor')?.toString(),
      type: formData.get('type')?.toString(),
      reason: formData.get('reason')?.toString(),
      insurance: formData.get('insurance')?.toString(),
    };

    try {
      const res = await fetch('/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      await loadAppointments();
      event.currentTarget.reset();
      jumpTo('admin');
      showToast('Appointment saved to clinic schedule.');
    } catch (error) {
      console.error('Failed to save appointment', error);
      showToast('Could not save appointment. Check Pages Functions and D1 binding.');
    }
  };

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </div>
            <div>
              <p className="eyebrow">Albacete Eye Center &amp; Medical Clinics</p>
              <h1 className="site-title">Clearer eye care, simpler appointments.</h1>
            </div>
          </div>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`topnav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeView === item.id ? 'nav-link active' : 'nav-link'}
                onClick={() => jumpTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="layout-grid">
          <section className="hero-panel card">
            <div className="hero-copy-block">
              <span className="soft-badge">Jaro, Iloilo City</span>
              <h2>Appointments, clinic details, and patient intake in one streamlined eye care experience.</h2>
              <p>
                Albacete Eye Center &amp; Medical Clinics now combines a cleaner public-facing clinic page with a
                working Cloudflare Pages + D1 appointment workflow for front desk scheduling.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary-btn" onClick={() => jumpTo('book')}>
                  Book appointment
                </button>
                <button type="button" className="secondary-btn" onClick={() => jumpTo('services')}>
                  View services
                </button>
              </div>
            </div>

            <div className="hero-image-stack">
              <article className="feature-image-card large">
                <img src={GALLERY[0].src} alt={GALLERY[0].alt} loading="lazy" width="1500" height="1000" />
                <div className="image-meta">
                  <span>{GALLERY[0].eyebrow}</span>
                  <strong>{GALLERY[0].title}</strong>
                </div>
              </article>
              <div className="mini-image-row">
                {GALLERY.slice(1).map((item) => (
                  <article key={item.title} className="feature-image-card small">
                    <img src={item.src} alt={item.alt} loading="lazy" width="1024" height="768" />
                    <div className="image-meta compact">
                      <span>{item.eyebrow}</span>
                      <strong>{item.title}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="summary-panel card">
            <div className="panel-heading-row">
              <div>
                <p className="section-label">Schedule preview</p>
                <h3>{todayLabel}</h3>
              </div>
              <span className="live-pill">Booking live</span>
            </div>

            <div className="stat-list">
              <div className="stat-item">
                <span>Upcoming appointments</span>
                <strong>{sortedAppointments.length}</strong>
              </div>
              <div className="stat-item">
                <span>Main doctor</span>
                <strong>Dr. Thomas Louie F. Albacete</strong>
              </div>
              <div className="stat-item">
                <span>Contact</span>
                <strong>+63 963 862 9414</strong>
              </div>
            </div>

            <div className="timeline-list">
              {sortedAppointments.length === 0 ? (
                <p className="empty-note">No upcoming appointments yet. New bookings will appear here automatically.</p>
              ) : (
                sortedAppointments.slice(0, 5).map((appt) => (
                  <div className="timeline-item" key={appt.id ?? `${appt.name}-${appt.date}-${appt.time}`}>
                    <div>
                      <strong>{appt.name || 'Unnamed patient'}</strong>
                      <p>
                        {formatDateLabel(appt.date)} · {appt.time || 'TBA'} · {appt.doctor || 'Any doctor'}
                      </p>
                    </div>
                    <span>{appt.type || 'Consultation'}</span>
                  </div>
                ))
              )}
            </div>
          </aside>

          {activeView === 'home' && (
            <section className="content-panel card span-2">
              <div className="section-header">
                <div>
                  <p className="section-label">Clinic overview</p>
                  <h3>Essential details from the old interface, now organized for patients and staff.</h3>
                </div>
              </div>
              <div className="feature-grid">
                {CLINIC_HIGHLIGHTS.map((item) => (
                  <article className="info-card" key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeView === 'services' && (
            <section className="content-panel card span-2">
              <div className="section-header">
                <div>
                  <p className="section-label">Services</p>
                  <h3>Eye clinic services and patient care workflow.</h3>
                </div>
              </div>
              <div className="feature-grid">
                {SERVICE_ITEMS.map((item) => (
                  <article className="info-card" key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeView === 'book' && (
            <section className="content-panel card span-2">
              <div className="section-header">
                <div>
                  <p className="section-label">Appointment form</p>
                  <h3>Complete patient intake for the cloud-backed appointment system.</h3>
                </div>
              </div>
              <form className="booking-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="input-grid">
                  <label>
                    Full name
                    <input name="name" type="text" placeholder="Maria Santos" required />
                  </label>
                  <label>
                    Mobile number
                    <input name="phone" type="tel" placeholder="09xx xxx xxxx" required />
                  </label>
                  <label>
                    Preferred date
                    <input name="date" type="date" required />
                  </label>
                  <label>
                    Preferred time
                    <input name="time" type="time" required />
                  </label>
                  <label>
                    Doctor
                    <select name="doctor" required defaultValue="">
                      <option value="" disabled>Select doctor</option>
                      {DOCTOR_OPTIONS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Appointment type
                    <select name="type" required defaultValue="">
                      <option value="" disabled>Select type</option>
                      {APPOINTMENT_TYPES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>
                <label>
                  Main concern
                  <textarea
                    name="reason"
                    placeholder="Blurry vision, follow-up review, eye irritation, diabetic eye screening, post-op concern"
                    required
                  />
                </label>
                <label>
                  Insurance / HMO
                  <input name="insurance" type="text" placeholder="Optional" />
                </label>
                <div className="form-actions">
                  <p className="support-note">
                    This form submits to <code>/appointments</code> and saves to the D1 appointments table.
                  </p>
                  <button type="submit" className="primary-btn">Save appointment</button>
                </div>
              </form>
            </section>
          )}

          {activeView === 'contact' && (
            <section className="content-panel card span-2">
              <div className="section-header">
                <div>
                  <p className="section-label">Contact</p>
                  <h3>Clinic details, location, and booking reference information.</h3>
                </div>
              </div>
              <div className="contact-grid">
                {CONTACT_CARDS.map((item) => (
                  <article className="info-card" key={item.title}>
                    <h4>{item.title}</h4>
                    <p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">{item.text}</a>
                      ) : (
                        item.text
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeView === 'admin' && (
            <section className="content-panel card span-2">
              <div className="section-header">
                <div>
                  <p className="section-label">Admin schedule</p>
                  <h3>Responsive appointment queue for front desk review.</h3>
                </div>
              </div>
              <div className="admin-list">
                {sortedAppointments.length === 0 ? (
                  <p className="empty-note">No booked appointments yet. Add one in the booking form.</p>
                ) : (
                  sortedAppointments.map((appt) => (
                    <article className="admin-card" key={appt.id ?? `${appt.name}-${appt.date}-${appt.time}`}>
                      <div>
                        <h4>{appt.name || 'Unnamed patient'}</h4>
                        <p>{appt.doctor || 'Doctor not set'}</p>
                        <p>{appt.reason || 'No concern specified'}</p>
                      </div>
                      <div className="admin-meta">
                        <span>{formatDateLabel(appt.date)}</span>
                        <span>{appt.time || 'TBA'}</span>
                        <span>{appt.type || 'Consultation'}</span>
                        <span>{appt.phone || 'No phone'}</span>
                        <span>{appt.insurance || 'No insurance listed'}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      <div className={`toast ${toast.open ? 'show' : ''}`} role="status" aria-live="polite">
        {toast.message}
      </div>
    </>
  );
}

export default App;
