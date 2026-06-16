import './Testimonials.css';

const TESTIMONIALS = [
  { initials: 'ML', color: 'var(--color-primary)', name: 'Maria L.', service: 'LASIK Surgery',
    text: 'I had my myopia corrected a year ago and the result was spectacular. The team explained everything clearly and my recovery was very quick.' },
  { initials: 'JR', color: 'var(--color-accent)', name: 'James R.', service: 'Paediatric Ophthalmology',
    text: 'My daughter has strabismus and the specialist was excellent — very professional and incredibly patient in explaining everything to us.' },
  { initials: 'AG', color: '#5a6472', name: 'Anthony G.', service: 'Cataract Surgery',
    text: 'Had cataracts removed from both eyes. Three days later my vision was incredible. I could not believe it. Highly recommended.' },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <div className="section-tag">Patient reviews</div>
          <h2 className="section-title" id="testimonials-title">
            What our <em>patients</em> say
          </h2>
        </div>
        <div className="testimonials__grid">
          {TESTIMONIALS.map(({ initials, color, name, service, text }, i) => (
            <div key={name} className={`testimonial-card reveal reveal-d${i + 1}`}>
              <div className="testimonial-stars" aria-label="5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="testimonial-text">&ldquo;{text}&rdquo;</p>
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
