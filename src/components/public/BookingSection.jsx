import BookingForm from './BookingForm';
import './BookingSection.css';

const CONTACTS = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label: 'Teléfono', value: '967 000 000' },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', value: 'info@clinica-albacete.es' },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>, label: 'Dirección', value: 'Calle Mayor 12, Albacete' },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Horario', value: 'Lun–Vie: 9:00–20:00' },
];

export default function BookingSection() {
  return (
    <section className="booking-section" id="cita" aria-labelledby="booking-section-title">
      <div className="container">
        <div className="booking-section__inner">
          {/* Info column */}
          <div className="booking-section__info">
            <div className="section-tag reveal">Reserva tu cita</div>
            <h2 className="section-title reveal" id="booking-section-title">
              Tu primera consulta,<br/><em>sin esperas</em>
            </h2>
            <p className="section-desc reveal">
              Rellena el formulario y te confirmamos tu cita en menos de 24 horas.
              Primera consulta desde <strong>49€</strong>.
            </p>
            <div className="booking-section__contacts">
              {CONTACTS.map(({ icon, label, value }, i) => (
                <div key={label} className={`contact-card reveal reveal-d${i + 1}`}>
                  <div className="contact-card__icon" aria-hidden="true">{icon}</div>
                  <div>
                    <div className="contact-card__label">{label}</div>
                    <div className="contact-card__value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Form column */}
          <div className="booking-section__form-wrap reveal">
            <div className="booking-section__form-header">
              <h3 className="booking-section__form-title">Solicitar cita</h3>
              <p className="booking-section__form-sub">Tiempo estimado: 2 minutos</p>
            </div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
