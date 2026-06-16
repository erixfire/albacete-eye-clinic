import './WhyUs.css';

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: 'Equipo especializado', desc: 'Oftalmólogos con formación en centros europeos y más de 20 años de experiencia clínica.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, title: 'Tecnología de última generación', desc: 'OCT Swept-Source, láser excimer y topografía corneal de alta resolución.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Máxima seguridad y ética', desc: 'Protocolos rigurosos de seguridad. Solo recomendaremos una intervención si es lo mejor para ti.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Céntrico y accesible', desc: 'En el centro de Albacete, con parking y acceso para personas con movilidad reducida.' },
];

export default function WhyUs() {
  return (
    <section className="why" id="nosotros" aria-labelledby="why-title">
      <div className="container">
        <div className="why__inner">
          <div>
            <div className="section-tag reveal">Por qué elegirnos</div>
            <h2 className="section-title reveal" id="why-title">
              Tecnología y <em>experiencia</em> a tu servicio
            </h2>
            <p className="section-desc reveal">
              Combinamos los últimos avances tecnológicos con un trato cercano y humano.
            </p>
            <div className="why__features">
              {FEATURES.map(({ icon, title, desc }, i) => (
                <div key={title} className={`why__feature reveal reveal-d${i + 1}`}>
                  <div className="why__feature-icon" aria-hidden="true">{icon}</div>
                  <div>
                    <div className="why__feature-title">{title}</div>
                    <div className="why__feature-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why__visual reveal" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 500" fill="none" style={{position:'absolute',inset:0,opacity:0.6}}>
              <defs>
                <radialGradient id="wg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="transparent"/>
                </radialGradient>
              </defs>
              <circle cx="200" cy="250" r="200" fill="url(#wg)"/>
              <circle cx="200" cy="250" r="120" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2"/>
              <circle cx="200" cy="250" r="80" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15"/>
              <circle cx="200" cy="250" r="40" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.2"/>
              <line x1="80" y1="250" x2="140" y2="250" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" strokeDasharray="4 3"/>
              <line x1="260" y1="250" x2="320" y2="250" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" strokeDasharray="4 3"/>
            </svg>
            <div className="why__badge">
              <div className="why__badge-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div className="why__badge-title">4.9/5 en Google Reviews</div>
                <div className="why__badge-sub">Basado en +320 opiniones verificadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
