import './WhyUs.css';

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    title: 'Specialist Ophthalmologist',
    desc: 'Led by Dr. Thomas Louie F. Albacete, Ophthalmology & Surgery specialist, also affiliated with APMC Iloilo.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    title: 'Two Convenient Branches',
    desc: 'Visit us at JEA Building, E. Lopez St., Jaro, Iloilo City or our Cabatuan branch — whichever is closest to you.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Multi-Specialty Services',
    desc: 'Beyond ophthalmology, our Cabatuan branch offers OB-GYN and other medical specialties for complete family care.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Mon – Sat, 8 AM – 5 PM',
    desc: 'Open six days a week for your convenience. Walk-ins welcome; appointments preferred for scheduled procedures.',
  },
];

export default function WhyUs() {
  return (
    <section className="why" id="about" aria-labelledby="why-title">
      <div className="container">
        <div className="why__inner">
          <div>
            <div className="section-tag reveal">Why choose us</div>
            <h2 className="section-title reveal" id="why-title">
              Trusted eye care in <em>Iloilo City</em>
            </h2>
            <p className="section-desc reveal">
              Albacete Eye Center &amp; Medical Clinics has been serving patients across Iloilo and nearby communities with specialist eye care and multi-specialty medicine.
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
            </svg>
            <div className="why__badge">
              <div className="why__badge-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div className="why__badge-title">3,500+ patients &amp; followers</div>
                <div className="why__badge-sub">Trusted by families across Iloilo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
