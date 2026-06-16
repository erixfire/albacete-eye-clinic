import './Services.css';

const SERVICES = [
  {
    id: 'revision',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    title: 'Revisión Visual Completa',
    desc: 'Evaluación exhaustiva de agudeza visual, presión ocular y fondo de ojo para detectar cualquier anomalía.',
  },
  {
    id: 'laser',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M9.5 9.5a3 3 0 1 1 5 2.5c-.6.5-1 1.3-1 2.5"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
    title: 'Cirugía Láser (LASIK/PRK)',
    desc: 'Corrección de miopía, hipermetropía y astigmatismo. Libertad de gafas con tecnología de última generación.',
  },
  {
    id: 'cataratas',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
    title: 'Cataratas',
    desc: 'Cirugía con implante de lente intraocular premium. Recupera la nitidez visual de forma segura y eficaz.',
  },
  {
    id: 'glaucoma',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Glaucoma',
    desc: 'Diagnóstico precoz y tratamiento mediante OCT y tonometría de última generación.',
  },
  {
    id: 'retina',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    title: 'Retina y Mácula',
    desc: 'Tratamiento de la degeneración macular, retinopatía diabética y desprendimientos con técnicas mínimamente invasivas.',
  },
  {
    id: 'pediatrica',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Oftalmología Pediátrica',
    desc: 'Revisiones especializadas para niños. Detección temprana de estrabismo, ambliopía y problemas refractivos.',
  },
];

export default function Services() {
  return (
    <section className="services" id="servicios" aria-labelledby="services-title">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag">Especialidades</div>
          <h2 className="section-title" id="services-title">
            Servicios <em>oftalmológicos</em> completos
          </h2>
          <p className="section-desc">
            Desde revisiones preventivas hasta cirugía refractiva, cubrimos todas las necesidades de tu salud visual.
          </p>
        </div>
        <div className="services__grid">
          {SERVICES.map(({ id, icon, title, desc }, i) => (
            <div key={id} className={`service-card reveal reveal-d${(i % 3) + 1}`}>
              <div className="service-card__icon" aria-hidden="true">{icon}</div>
              <h3 className="service-card__title">{title}</h3>
              <p className="service-card__desc">{desc}</p>
              <span className="service-card__link" aria-label={`Más información sobre ${title}`}>
                Más información →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
