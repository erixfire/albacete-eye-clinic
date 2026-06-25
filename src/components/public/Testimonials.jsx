import './Testimonials.css';

const REVIEWS = [
  {
    initials: 'MDS',
    name: 'Maria D. Santos', service: 'Cataract Surgery', location: 'Jaro, Iloilo City',
    text: 'Had my cataract surgery here and the results were amazing. The staff were professional and kind throughout the entire process. They handled my PhilHealth claim smoothly — no hassle at all. Highly recommended!',
  },
  {
    initials: 'JRP',
    name: 'James R. Peñaflor', service: 'Paediatric Eye Care', location: 'Cabatuan, Iloilo',
    text: 'My 6-year-old son has crossed eyes and Dr. Albacete was incredibly patient and gentle. The examination was thorough and the doctor explained everything clearly. We feel very well taken care of.',
  },
  {
    initials: 'RGA',
    name: 'Rosario G. Aguilar', service: 'Comprehensive Eye Exam', location: 'Molo, Iloilo City',
    text: 'First time having my eyes checked in 20 years. I was surprised how affordable it was — the senior citizen discount really helped. The staff made me feel welcome and comfortable the whole time.',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <div className="section-tag">Patient Reviews</div>
          <h2 className="section-title" id="testimonials-title">
            What our patients<br /><em>say about us</em>
          </h2>
          <p className="section-desc" style={{ marginInline: 'auto' }}>
            Real stories from real patients in our community — from Jaro, Cabatuan, and across Iloilo.
          </p>
        </div>

        <div className="testimonials__grid">
          {REVIEWS.map(({ initials, name, service, location, text }, i) => (
            <div key={name} className={`testimonial-card reveal reveal-d${i + 1}`}>
              <div className="testimonial-stars" aria-label="5 stars">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="testimonial-star" aria-hidden="true">★</span>
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">{initials}</div>
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
