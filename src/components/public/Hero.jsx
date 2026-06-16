import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-circle hero__bg-circle--1" />
        <div className="hero__bg-circle hero__bg-circle--2" />
      </div>
      <div className="hero__inner container">
        {/* Content */}
        <div className="hero__content">
          <div className="hero__label">
            <span className="hero__label-dot" aria-hidden="true" />
            Clínica certificada · Albacete
          </div>
          <h1 className="hero__title" id="hero-title">
            Tu visión merece<br />el mejor <em>cuidado</em>
          </h1>
          <p className="hero__subtitle">
            Especialistas en oftalmología con más de 20 años de experiencia. Diagnóstico avanzado,
            cirugía láser y atención personalizada para toda la familia.
          </p>
          <div className="hero__actions">
            <a href="#cita" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Reservar Cita
            </a>
            <a href="#servicios" className="btn-ghost">
              Ver Servicios
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </div>
          <div className="hero__stats" aria-label="Estadísticas de la clínica">
            <div className="hero__stat">
              <div className="hero__stat-num">20+</div>
              <div className="hero__stat-label">Años de experiencia</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-num">8.500+</div>
              <div className="hero__stat-label">Pacientes atendidos</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-num">4.9★</div>
              <div className="hero__stat-label">Valoración media</div>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__eye-graphic">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              <defs>
                <radialGradient id="iris" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05"/>
                </radialGradient>
                <radialGradient id="pupil" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#2a4a7a"/>
                  <stop offset="100%" stopColor="var(--color-primary)"/>
                </radialGradient>
              </defs>
              <ellipse cx="110" cy="110" rx="90" ry="75" fill="white" stroke="var(--color-border)" strokeWidth="1.5"/>
              <circle cx="110" cy="110" r="52" fill="url(#iris)" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
              <circle cx="110" cy="110" r="44" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="110" cy="110" r="36" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.2"/>
              <circle cx="110" cy="110" r="22" fill="url(#pupil)"/>
              <circle cx="120" cy="100" r="7" fill="white" opacity="0.85"/>
              <circle cx="101" cy="118" r="3" fill="white" opacity="0.4"/>
              <line x1="20" y1="110" x2="55" y2="110" stroke="var(--color-accent)" strokeWidth="1" opacity="0.4" strokeDasharray="3 2"/>
              <line x1="165" y1="110" x2="200" y2="110" stroke="var(--color-accent)" strokeWidth="1" opacity="0.4" strokeDasharray="3 2"/>
            </svg>
            {/* Floating cards */}
            <div className="hero__float-card hero__float-card--1">
              <div className="hero__float-icon hero__float-icon--accent" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <div className="hero__float-title">Diagnóstico OCT</div>
                <div className="hero__float-sub">Alta resolución</div>
              </div>
            </div>
            <div className="hero__float-card hero__float-card--2">
              <div className="hero__float-icon hero__float-icon--success" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 12 2 2 4-4"/>
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                </svg>
              </div>
              <div>
                <div className="hero__float-title">Cirugía Láser</div>
                <div className="hero__float-sub">LASIK · PRK · SMILE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
