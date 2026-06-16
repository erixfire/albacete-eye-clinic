import './WhyUs.css';

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: 'Specialist team', desc: 'Ophthalmologists trained at leading European centres with over 20 years of clinical experience.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, title: 'Latest technology', desc: 'Swept-Source OCT, excimer laser and high-resolution corneal topography.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Safety & ethics first', desc: 'Rigorous safety protocols. We only recommend a procedure if it is genuinely right for you.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Central location', desc: 'In the heart of Albacete, with parking and full wheelchair accessibility.' },
];

export default function WhyUs() {
  return (
    <section className="why" id="about" aria-labelledby="why-title">
      <div className="container">
        <div className="why__inner">
          <div>
            <div className="section-tag reveal">Why choose us</div>
            <h2 className="section-title reveal" id="why-title">
              Technology and <em>expertise</em> at your service
            </h2>
            <p className="section-desc reveal">
              We combine the latest technological advances with a warm, personal approach.
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
                <div className="why__badge-title">4.9/5 on Google Reviews</div>
                <div className="why__badge-sub">Based on 320+ verified reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
