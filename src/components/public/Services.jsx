import './Services.css';

const SERVICES = [
  {
    id: 'checkup',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    title: 'Comprehensive Eye Exam',
    desc: 'Complete evaluation of visual acuity, eye pressure and retinal health. Walk-in consultations and scheduled appointments available.',
  },
  {
    id: 'refraction',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.5 9.5a3 3 0 1 1 5 2.5c-.6.5-1 1.3-1 2.5"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
    title: 'Refraction & Optical',
    desc: 'Precise prescription testing for eyeglasses and contact lenses. Correction of myopia, hyperopia and astigmatism.',
  },
  {
    id: 'cataracts',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
    title: 'Cataract Surgery',
    desc: 'Surgical removal of cataracts with intraocular lens implant. Restore clear vision safely and effectively.',
  },
  {
    id: 'glaucoma',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Glaucoma Management',
    desc: 'Early detection and monitoring of glaucoma through tonometry and optic nerve evaluation to prevent vision loss.',
  },
  {
    id: 'paediatric',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Paediatric Eye Care',
    desc: 'Specialist eye check-ups for children. Early detection and treatment of strabismus, amblyopia and refractive errors.',
  },
  {
    id: 'medical',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Multi-Specialty Clinics',
    desc: 'Beyond eye care, we offer OB-GYN and other medical specialty services at our Cabatuan branch. One clinic, complete care.',
  },
];

export default function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag">Our Specialities</div>
          <h2 className="section-title" id="services-title">
            Complete <em>eye &amp; medical</em> care
          </h2>
          <p className="section-desc">
            From routine eye exams to surgical procedures and multi-specialty consultations &mdash; all under one roof in Iloilo City.
          </p>
        </div>
        <div className="services__grid">
          {SERVICES.map(({ id, icon, title, desc }, i) => (
            <div key={id} className={`service-card reveal reveal-d${(i % 3) + 1}`}>
              <div className="service-card__icon" aria-hidden="true">{icon}</div>
              <h3 className="service-card__title">{title}</h3>
              <p className="service-card__desc">{desc}</p>
              <span className="service-card__link" aria-label={`Learn more about ${title}`}>
                Learn more &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
