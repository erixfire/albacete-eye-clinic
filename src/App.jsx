import React, { useEffect, useState } from 'react';
import './styles.css';

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const NAV_ITEMS = [
  { id: 'home', label: 'Overview' },
  { id: 'book', label: 'Book' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'contact', label: 'Contact' },
  { id: 'admin', label: 'Admin' },
];

function App() {
  const [activeView, setActiveView] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [todayLabel, setTodayLabel] = useState('Loading schedule…');

  useEffect(() => {
    const now = new Date();
    const label = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    setTodayLabel(`Today: ${label}`);
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch('/appointments', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load appointments from D1', err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const sortedAppointments = [...appointments].sort((a, b) => {
    const ad = `${a.date || ''}T${a.time || '00:00'}`;
    const bd = `${b.date || ''}T${b.time || '00:00'}`;
    return new Date(ad) - new Date(bd);
  });

  const miniAppointments = sortedAppointments.slice(0, 4);

  const showToast = (message) => {
    setToast({ open: true, message });
    window.clearTimeout(showToast._timeout);
    showToast._timeout = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 2600);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const appt = {
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
        body: JSON.stringify(appt),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      await loadAppointments();
      event.currentTarget.reset();
      showToast('Slot saved to the D1-backed schedule.');
    } catch (err) {
      console.error('Failed to save appointment', err);
      showToast('Could not save appointment. Check D1 / Functions logs.');
    }
  };

  return (
    <>
      <div className="blur-orbit" />
      <div className="page-shell">
        <header>
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" opacity="0.35"></circle>
                <path d="M4.5 12c1.6-3.1 4.3-5 7.5-5s5.9 1.9 7.5 5c-1.6 3.1-4.3 5-7.5 5s-5.9-1.9-7.5-5Z"></path>
                <circle cx="12" cy="12" r="2.2"></circle>
              </svg>
            </div>
            <div className="brand-meta">
              <div className="brand-title">ALBACETE EYE CENTER &amp; MEDICAL CLINICS</div>
              <div className="brand-sub">JEA Bldg, E Lopez St, Jaro, Iloilo City · Beside Jollibee</div>
            </div>
          </div>
          <nav aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="nav-btn"
                data-active={activeView === item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                <span className="dot" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <main>
          <section className="hero-card">
            <div className="hero-card-inner">
              <div className="hero-pill-row">
                <span className="pill">
                  <span className="pill-dot"></span>
                  Early detection save lives
                </span>
                <span className="pill">Eye center &amp; medical clinics · Jaro, Iloilo</span>
              </div>
              <h1>
                Eye care and medical services in <span className="accent">one calm center</span>.
              </h1>
              <p className="hero-copy">
                Albacete Eye Center &amp; Medical Clinics provides comprehensive eye care, from vision
                assessment and refraction to glaucoma screening, alongside internal medicine, OB‑Gyne,
                pediatrics, psychiatry and surgery.
              </p>
              <div className="hero-grid">
                <div className="cta-stack">
                  <button className="btn-primary" type="button" onClick={() => setActiveView('book')}>
                    Book an appointment
                    <span aria-hidden="true">→</span>
                  </button>
                  <button className="btn-ghost" type="button" onClick={() => setActiveView('contact')}>
                    View clinic details
                    <span aria-hidden="true">•</span>
                    <span>JEA Bldg · E Lopez St</span>
                  </button>
                  <div className="hero-metrics">
                    <div>
                      <div className="badge">
                        <span className="badge-dot"></span>
                        <span>Schedule updates via Facebook</span>
                      </div>
                    </div>
                    <div>
                      <div className="badge" style={{ borderColor: 'rgba(234, 179, 8, 0.8)' }}>
                        <span className="badge-dot" style={{ background: '#facc15' }}></span>
                        <span>Jaro &amp; Cabatuan branches</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-panel">
                  <div className="glass-panel-inner">
                    <div className="panel-header">
                      <div className="panel-title-group">
                        <div className="panel-title">Today at a glance</div>
                        <div className="panel-subtitle" id="today-subtitle">
                          {todayLabel}
                        </div>
                      </div>
                      <div className="status-pill">
                        <span className="status-dot"></span>
                        <span>Online booking live</span>
                      </div>
                    </div>
                    <div className="appointments-list" id="mini-appointments">
                      {miniAppointments.length === 0 ? (
                        <div className="hint">
                          No upcoming appointments yet. Add one in the form to see your glass schedule.
                        </div>
                      ) : (
                        miniAppointments.map((appt) => (
                          <div key={appt.id ?? `${appt.date}-${appt.time}-${appt.name}`} className="appt-chip">
                            <div className="appt-main">
                              <span className="appt-name">{appt.name || 'Unnamed patient'}</span>
                              <span className="appt-meta">
                                {formatDateLabel(appt.date)} · {appt.time || 'TBA'} ·{' '}
                                {appt.doctor || 'Any doctor'}
                              </span>
                            </div>
                            <span className="appt-badge">{appt.type || 'Consultation'}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="status-bar">
                      <span>
                        Tap <strong>Book</strong> to add a real patient into the timeline.
                      </span>
                      <span>Slots auto‑sort by date and time.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel">
            <div className="glass-panel-inner">
              {activeView === 'home' && (
                <div className="view" data-visible="true">
                  <div className="view-title">Clinic operating rhythm</div>
                  <div className="view-copy">
                    Albacete Eye Center &amp; Medical Clinics is built around smooth flow: structured mornings for
                    diagnostics, procedure blocks mid‑day, and calm afternoon review slots for follow‑ups and
                    pediatric care.
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <li>• Morning: visual field tests, refractions, retinal imaging.</li>
                    <li>• Midday: cataract, LASIK and injection blocks with buffered turnover.</li>
                    <li>• Afternoon: contact lens fitting, pediatric consults, post‑op checks.</li>
                  </ul>
                </div>
              )}

              {activeView === 'book' && (
                <div className="view" data-visible="true">
                  <div className="view-title">Book a new appointment</div>
                  <div className="view-copy">
                    Capture every important detail up front so consultations stay focused on care—not paperwork.
                  </div>
                  <form id="appointment-form" autoComplete="off" onSubmit={handleSubmit}>
                    <div className="field-row">
                      <label>
                        <span className="label-text">
                          <span className="label-main">Full name</span>
                          <span className="label-extra">As appears on ID</span>
                        </span>
                        <input name="name" type="text" placeholder="e.g. Maria Santos" required />
                      </label>
                      <label>
                        <span className="label-text">
                          <span className="label-main">Mobile number</span>
                          <span className="label-extra">For SMS reminders</span>
                        </span>
                        <input name="phone" type="tel" placeholder="09•• ••• ••••" required />
                      </label>
                    </div>
                    <div className="field-row">
                      <label>
                        <span className="label-text">
                          <span className="label-main">Preferred date</span>
                        </span>
                        <input name="date" type="date" required />
                      </label>
                      <label>
                        <span className="label-text">
                          <span className="label-main">Preferred time</span>
                          <span className="label-extra">Clinic hours vary · see Facebook</span>
                        </span>
                        <input name="time" type="time" required />
                      </label>
                    </div>
                    <div className="field-row">
                      <label>
                        <span className="label-text">
                          <span className="label-main">Doctor</span>
                        </span>
                        <select name="doctor" required defaultValue="">
                          <option value="" disabled>
                            Select ophthalmologist
                          </option>
                          <option>Dr. Thomas Louie F. Albacete – Ophthalmology &amp; Surgery</option>
                          <option>Eye Center Team – comprehensive eye care</option>
                        </select>
                      </label>
                      <label>
                        <span className="label-text">
                          <span className="label-main">Appointment type</span>
                        </span>
                        <select name="type" required defaultValue="">
                          <option value="" disabled>
                            Select type
                          </option>
                          <option>Initial eye consultation</option>
                          <option>Follow‑up</option>
                          <option>Post‑operative check</option>
                          <option>Screening package</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      <span className="label-text">
                        <span className="label-main">Main concern</span>
                        <span className="label-extra">Short description</span>
                      </span>
                      <textarea
                        name="reason"
                        placeholder="Blurry distance vision, diabetic eye screening, pediatric check‑up…"
                        required
                      ></textarea>
                    </label>
                    <label>
                      <span className="label-text">
                        <span className="label-main">Insurance / HMO (optional)</span>
                      </span>
                      <input name="insurance" type="text" placeholder="Provider &amp; card number" />
                    </label>
                    <div className="status-bar" style={{ marginTop: '0.5rem' }}>
                      <span className="hint">Backed by D1 via Cloudflare Pages Functions.</span>
                      <button className="btn-primary" type="submit">
                        Save to schedule
                        <span aria-hidden="true">⟲</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeView === 'doctors' && (
                <div className="view" data-visible="true">
                  <div className="view-title">Ophthalmology &amp; medical team</div>
                  <div className="view-copy">Highlight your core consultants and the services they focus on.</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                      gap: 'var(--space-3)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div
                      className="tag"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.35rem',
                        padding: '0.6rem 0.75rem',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#e5f4ff' }}>Dr. Thomas Louie F. Albacete</div>
                      <div>Ophthalmology · Surgery</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Comprehensive ophthalmology and surgical eye care, serving patients in Jaro and nearby
                        Iloilo communities.
                      </div>
                    </div>
                    <div
                      className="tag"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.35rem',
                        padding: '0.6rem 0.75rem',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#e5f4ff' }}>Eye Center Team</div>
                      <div>Comprehensive eye care</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Vision tests, refractions, and glaucoma screening, plus coordination with your chosen HMO or
                        PhilHealth as applicable.
                      </div>
                    </div>
                    <div
                      className="tag"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.35rem',
                        padding: '0.6rem 0.75rem',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#e5f4ff' }}>Medical Clinics</div>
                      <div>Internal Med · OB‑Gyne · Pediatrics · Psychiatry · Surgery</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Multi‑specialty care under one roof, so referrals and follow‑ups stay within the same clinic
                        network.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'contact' && (
                <div className="view" data-visible="true">
                  <div className="view-title">Clinic details &amp; contact</div>
                  <div className="view-copy">
                    Use this block as your central source of truth for address, branches and official contact
                    channels.
                  </div>
                  <div className="field-row">
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#e5f4ff' }}>Address</strong>
                        <br />
                        JEA Bldg, E Lopez St, Jaro, Iloilo City, Iloilo
                        <br />
                        <span>Beside Jollibee E Lopez Street</span>
                      </div>
                      <div>
                        <strong style={{ color: '#e5f4ff' }}>Clinic type</strong>
                        <br />
                        Eye center &amp; medical clinics (Ophthalmology, Internal Med, OB‑Gyne, Pediatrics, Psychiatry,
                        Surgery)
                      </div>
                      <div>
                        <strong style={{ color: '#e5f4ff' }}>Contact</strong>
                        <br />
                        Call / Text: +63 963 862 9414
                        <br />
                        Facebook:{' '}
                        <a
                          href="https://www.facebook.com/AlbaceteEyeClinic/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @AlbaceteEyeClinic
                        </a>
                      </div>
                      <div>
                        <strong style={{ color: '#e5f4ff' }}>Schedule</strong>
                        <br />
                        By appointment · Check the Facebook page for the latest Jaro &amp; Cabatuan schedules.
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: '1rem',
                        border: '1px solid rgba(148, 163, 184, 0.6)',
                        background: 'rgba(15, 23, 42, 0.96)',
                        padding: 'var(--space-3)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Embed your Google Maps location for “ALBACETE EYE CENTER &amp; MEDICAL CLINICS ILOILO” here, or
                      keep this as a compact directions card while wiring Cloudflare Pages.
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'admin' && (
                <div className="view" data-visible="true">
                  <div className="view-title">Admin schedule view</div>
                  <div className="view-copy">
                    This lightweight table mirrors the appointment list you collect in the booking form and is backed
                    by D1, while clinic hours and branch schedules stay synced with your Facebook announcements.
                  </div>
                  <div className="table-shell">
                    <table aria-label="Appointments table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Doctor</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody id="admin-table-body">
                        {sortedAppointments.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '0.9rem' }}
                            >
                              No booked appointments yet—add one in <strong>Book</strong>.
                            </td>
                          </tr>
                        ) : (
                          sortedAppointments.map((appt) => (
                            <tr key={appt.id ?? `${appt.date}-${appt.time}-${appt.name}`}>
                              <td>{appt.name || 'Unnamed patient'}</td>
                              <td>{formatDateLabel(appt.date)}</td>
                              <td>{appt.time || 'TBA'}</td>
                              <td>{appt.doctor || '-'}</td>
                              <td>{appt.type || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer>
          <span>Albacete Eye Center &amp; Medical Clinics · sample appointment shell for Cloudflare Pages &amp; D1.</span>
          <span>React + Vite front‑end wired to Cloudflare D1 via Functions.</span>
        </footer>
      </div>

      <div className="toast" data-open={toast.open} role="status" aria-live="polite">
        <div className="toast-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 13 9 17 19 7"></path>
            <circle cx="12" cy="12" r="9"></circle>
          </svg>
        </div>
        <div className="toast-body">
          <div className="toast-title">Appointment status</div>
          <div className="toast-text">{toast.message}</div>
        </div>
        <button type="button" aria-label="Dismiss notification" onClick={() => setToast({ ...toast, open: false })}>
          ×
        </button>
      </div>
    </>
  );
}

export default App;
