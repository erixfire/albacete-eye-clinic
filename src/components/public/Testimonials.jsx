import './Testimonials.css';

const REVIEWS = [
  {
    initials: 'MDS', color: '#0284C7',
    name: 'Maria D. Santos', service: 'Cataract Surgery', location: 'Jaro, Iloilo City',
    text: 'Nagpagaling ako ng katarata dito at kahanga-hanga ang resulta. Mabait at propesyonal ang lahat ng staff. Inayos nila ang aking PhilHealth claim, walang hassle. Highly recommended!',
  },
  {
    initials: 'JRP', color: '#D97706',
    name: 'James R. Peñaflor', service: 'Paediatric Eye Care', location: 'Cabatuan, Iloilo',
    text: 'My 6-year-old son has crossed eyes and Dr. Albacete was incredibly patient and gentle. The examination was thorough and the doctor explained everything clearly in Filipino. We feel very well taken care of.',
  },
  {
    initials: 'RGA', color: '#059669',
    name: 'Rosario G. Aguilar', service: 'Comprehensive Eye Exam', location: 'Molo, Iloilo City',
    text: 'First time mag-check ng mata ko sa 20 years. Akala ko mahal pero ang affordable pala dito, especially may senior citizen discount ako. Mainit ang pagtanggap ng mga staff. Bumabalik ako next year!',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <div className="section-tag">Mga Testimonya</div>
          <h2 className="section-title" id="testimonials-title">
            What Iloilo patients<br/><em>say about us</em>
          </h2>
          <p className="section-desc" style={{ marginInline: 'auto' }}>
            Real stories from real patients in our community &mdash; from Jaro, Cabatuan, and across Iloilo.
          </p>
        </div>

        <div className="testimonials__grid">
          {REVIEWS.map(({ initials, color, name, service, location, text }, i) => (
            <div key={name} className={`testimonial-card reveal reveal-d${i + 1}`}>
              <div className="testimonial-stars" aria-label="5 stars">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="testimonial-star" aria-hidden="true">★</span>
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: color }} aria-hidden="true">
                  {initials}
                </div>
                <div>
                  <div className="testimonial-name">{name}</div>
                  <div className="testimonial-role">{service}</div>
                  <div className="testimonial-location">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ display:'inline', verticalAlign:'middle', marginRight:'3px' }}>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
                    </svg>
                    {location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
