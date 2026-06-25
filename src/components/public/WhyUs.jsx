import './WhyUs.css';

const FEATURES = [
  {
    iconClass: 'icon-blue',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    title: 'Specialist Ophthalmologist',
    desc: 'Led by Dr. Thomas Louie F. Albacete, an Ophthalmology & Surgery specialist also affiliated with APMC Iloilo — expert care you can trust.',
  },
  {
    iconClass: 'icon-amber',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>,
    title: 'Two Convenient Branches',
    desc: 'Visit us at JEA Building, E. Lopez St., Jaro, Iloilo City or our Cabatuan branch — whichever is more convenient for you and your family.',
  },
  {
    iconClass: 'icon-green',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'PhilHealth & HMO Accredited',
    desc: 'We process PhilHealth claims and accept HMO coverage directly. Senior Citizen and PWD discounts are honored at all branches.',
  },
  {
    iconClass: 'icon-teal',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Friendly & Bilingual Staff',
    desc: 'Our team speaks Filipino and English so every patient feels at home and fully understood. We serve patients of all ages and backgrounds.',
  },
];

const STATS = [
  { val: '3,500+', lbl: 'Patients & Followers', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, accent: true },
  { val: '2',      lbl: 'Clinic Branches',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg> },
  { val: '6',      lbl: 'Days a Week Open',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { val: '✓',      lbl: 'PhilHealth Accredited', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

export default function WhyUs() {
  return (
    <section className="why" id="about" aria-labelledby="why-title">
      <div className="container">
        <div className="why__inner">
          <div>
            <div className="section-tag reveal">Bakit Kami?</div>
            <h2 className="section-title reveal" id="why-title">
              Trusted eye care in<br/><em>Iloilo City</em>
            </h2>
            <p className="section-desc reveal">
              Albacete Eye Center &amp; Medical Clinics has been serving patients across Iloilo and
              nearby communities with specialist eye care and multi-specialty medicine.
              Narito kami para sa inyong buong pamilya.
            </p>
            <div className="why__features">
              {FEATURES.map(({ iconClass, icon, title, desc }, i) => (
                <div key={title} className={`why__feature reveal reveal-d${i + 1}`}>
                  <div className={`why__feature-icon ${iconClass}`} aria-hidden="true">{icon}</div>
                  <div>
                    <div className="why__feature-title">{title}</div>
                    <div className="why__feature-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="why__visual reveal" aria-hidden="true">
            <div className="why__visual-bg" />
            <div className="why__stat-grid">
              {STATS.map(({ val, lbl, icon, accent }) => (
                <div key={lbl} className={`why__stat-card${accent ? ' why__stat-card--accent' : ''}`}>
                  <div className="why__stat-icon">{icon}</div>
                  <div className="why__stat-val">{val}</div>
                  <div className="why__stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
