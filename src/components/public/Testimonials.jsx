import './Testimonials.css';

const TESTIMONIALS = [
  { initials: 'ML', color: 'var(--color-primary)', name: 'María L.', service: 'Cirugía LASIK',
    text: 'Me operé de miopía hace un año y el resultado fue espectacular. El equipo me explicó todo con detalle y la recuperación fue muy rápida.' },
  { initials: 'JR', color: 'var(--color-accent)', name: 'Javier R.', service: 'Oftalmología Pediátrica',
    text: 'Mi hija tiene estrabismo y el trato con la pediatra fue excelente. Muy profesionales y con mucha paciencia para explicarlo todo.' },
  { initials: 'AG', color: '#5a6472', name: 'Antonio G.', service: 'Cirugía de Cataratas',
    text: 'Operado de cataratas en ambos ojos. A los 3 días ya veía de maravilla. No me lo podía creer. Totalmente recomendable.' },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonios" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <div className="section-tag">Opiniones de pacientes</div>
          <h2 className="section-title" id="testimonials-title">
            Lo que dicen nuestros <em>pacientes</em>
          </h2>
        </div>
        <div className="testimonials__grid">
          {TESTIMONIALS.map(({ initials, color, name, service, text }, i) => (
            <div key={name} className={`testimonial-card reveal reveal-d${i + 1}`}>
              <div className="testimonial-stars" aria-label="5 estrellas">★★★★★</div>
              <p className="testimonial-text">"{text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: color }} aria-hidden="true">{initials}</div>
                <div>
                  <div className="testimonial-name">{name}</div>
                  <div className="testimonial-role">{service}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
