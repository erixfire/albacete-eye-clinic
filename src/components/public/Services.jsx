import './Services.css';

const SERVICES = [
  {
    id: 'checkup',
    iconClass: 'icon-blue',
    badge: { text: 'Most Popular', cls: 'service-card__badge--popular' },
    popular: true,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    title: 'Comprehensive Eye Exam',
    desc: 'Complete evaluation of visual acuity, eye pressure, and retinal health. Walk-in and scheduled appointments available.',
    tag: 'PhilHealth Covered',
    tagCls: 'service-card__tag icon-green',
  },
  {
    id: 'refraction',
    iconClass: 'icon-amber',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.5 9.5a3 3 0 1 1 5 2.5c-.6.5-1 1.3-1 2.5"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
    title: 'Refraction & Optical',
    desc: 'Precise prescription testing for eyeglasses and contact lenses. Correction of myopia, hyperopia, and astigmatism.',
    tag: 'Affordable',
    tagCls: 'service-card__tag icon-amber',
  },
  {
    id: 'cataracts',
    iconClass: 'icon-purple',
    badge: { text: 'PhilHealth', cls: 'service-card__badge--philhealth' },
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>,
    title: 'Cataract Surgery',
    desc: 'Surgical removal of cataracts with intraocular lens implant. Restore clear vision safely and effectively.',
    tag: 'PhilHealth Covered',
    tagCls: 'service-card__tag icon-green',
  },
  {
    id: 'glaucoma',
    iconClass: 'icon-rose',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Glaucoma Management',
    desc: 'Early detection and monitoring of glaucoma through tonometry and optic nerve evaluation to prevent vision loss.',
    tag: 'Specialist Care',
    tagCls: 'service-card__tag icon-rose',
  },
  {
    id: 'paediatric',
    iconClass: 'icon-teal',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Paediatric Eye Care',
    desc: "Specialist eye check-ups for children. Early detection of strabismus, amblyopia, and refractive errors. Gentle and child-friendly approach.",
    tag: 'All Ages',
    tagCls: 'service-card__tag icon-teal',
  },
  {
    id: 'medical',
    iconClass: 'icon-green',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    title: 'Multi-Specialty Clinics',
    desc: 'Beyond eye care, our Cabatuan branch offers OB-GYN and other medical specialties for complete family healthcare — one clinic, complete care.',
    tag: 'Cabatuan Branch',
    tagCls: 'service-card__tag icon-amber',
  },
];

export default function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag">Aming Mga Serbisyo</div>
          <h2 className="section-title" id="services-title">
            Complete <em>eye &amp; medical</em> care<br/>
            for every family
          </h2>
          <p className="section-desc">
            From routine eye exams to surgical procedures &mdash; all accessible and affordable,
            right here in Iloilo City. Lahat ng pamilya, iniingatan namin.
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map(({ id, iconClass, icon, title, desc, badge, popular, tag, tagCls }, i) => (
            <div key={id} className={`service-card reveal reveal-d${(i % 3) + 1}${popular ? ' service-card--popular' : ''}`}>
              {badge && (
                <span className={`service-card__badge ${badge.cls}`} aria-label={badge.text}>
                  {badge.text}
                </span>
              )}
              <div className={`service-card__icon ${iconClass}`} aria-hidden="true">{icon}</div>
              <h3 className="service-card__title">{title}</h3>
              <p className="service-card__desc">{desc}</p>
              <div className="service-card__footer">
                <span className="service-card__link" aria-label={`Learn more about ${title}`}>
                  Learn more →
                </span>
                {tag && <span className={tagCls}>{tag}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
