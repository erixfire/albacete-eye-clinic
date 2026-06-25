import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            Now Accepting Patients &middot; Jaro &amp; Cabatuan
          </div>

          <h1 className="hero__title" id="hero-title">
            Your vision,<br />our <em>expert care</em>.
          </h1>

          <p className="hero__subtitle">
            Albacete Eye Center &amp; Medical Clinics — specialist eye exams,
            cataract surgery, and complete family eye care. Affordable,
            accessible, and right here in your community.
          </p>

          <div className="hero__actions">
            <a href="#appointment" className="hero__btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Book Appointment
            </a>
            <a href="tel:09638629414" className="hero__btn-call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              0963 862 9414
            </a>
          </div>

          <div className="hero__trust" aria-label="Accepted insurance and payment">
            <span className="hero__trust-label">Accepted:</span>
            {['PhilHealth', 'HMO', 'Cash', 'Senior / PWD Discount'].map(t => (
              <span key={t} className="hero__trust-tag">{t}</span>
            ))}
          </div>

          <div className="hero__stats" aria-label="Clinic highlights">
            <div className="hero__stat">
              <div className="hero__stat-num">2</div>
              <div className="hero__stat-label">Clinic Branches</div>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat">
              <div className="hero__stat-num">3,500+</div>
              <div className="hero__stat-label">Patients Served</div>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat">
              <div className="hero__stat-num">Mon–Sat</div>
              <div className="hero__stat-label">8:00 AM – 5:00 PM</div>
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__card-stack">
            <div className="hero__main-card">
              <div className="hero__eye-wrapper">
                <svg width="200" height="155" viewBox="0 0 200 155" fill="none">
                  <defs>
                    <radialGradient id="eyeIris" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.6"/>
                      <stop offset="70%"  stopColor="#0ea5e9" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04"/>
                    </radialGradient>
                    <radialGradient id="pupilGrad" cx="38%" cy="32%" r="60%">
                      <stop offset="0%"   stopColor="#0c1a2e"/>
                      <stop offset="100%" stopColor="#0369a1"/>
                    </radialGradient>
                  </defs>
                  <path d="M8 77 C55 22, 145 22, 192 77 C145 132, 55 132, 8 77Z"
                    fill="rgba(255,255,255,0.06)" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5"/>
                  <circle cx="100" cy="77" r="44" fill="url(#eyeIris)" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5"/>
                  <circle cx="100" cy="77" r="26" fill="url(#pupilGrad)"/>
                  <circle cx="113" cy="65" r="10" fill="white" opacity="0.7"/>
                  <circle cx="88"  cy="87" r="4"  fill="white" opacity="0.3"/>
                </svg>
              </div>
              <div className="hero__card-status">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 12 2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                </svg>
                Vision Check Ready
              </div>
            </div>

            <div className="hero__float-card hero__float-card--doctor">
              <div className="hero__float-avatar">TLA</div>
              <div>
                <div className="hero__float-title">Dr. T.L. Albacete</div>
                <div className="hero__float-sub">Ophthalmologist &amp; Surgeon</div>
              </div>
            </div>

            <div className="hero__float-card hero__float-card--branch">
              <div className="hero__float-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
                </svg>
              </div>
              <div>
                <div className="hero__float-title">2 Branches Open</div>
                <div className="hero__float-sub">Jaro &middot; Cabatuan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
