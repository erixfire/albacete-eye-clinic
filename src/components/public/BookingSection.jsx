import BookingForm from './BookingForm';
import './BookingSection.css';

const CONTACTS = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    label: 'Phone',
    value: '0963 862 9414',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    label: 'Facebook',
    value: 'fb.com/AlbaceteEyeClinic',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>,
    label: 'Jaro Branch',
    value: 'JEA Bldg, E. Lopez St., Jaro, Iloilo City',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>,
    label: 'Cabatuan Branch',
    value: 'Cabatuan, Iloilo',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    label: 'Hours',
    value: 'Mon–Sat: 8:00 AM – 5:00 PM',
  },
];

export default function BookingSection() {
  return (
    <section className="booking-section" id="appointment" aria-labelledby="booking-section-title">
      <div className="container">
        <div className="booking-section__inner">
          <div className="booking-section__info">
            <div className="section-tag reveal">Book an appointment</div>
            <h2 className="section-title reveal" id="booking-section-title">
              Your first consultation,<br/><em>no waiting</em>
            </h2>
            <p className="section-desc reveal">
              Fill in the form or message us on Facebook and we will confirm your appointment.
              You can also call us directly at <strong>0963 862 9414</strong>.
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
          <div className="booking-section__form-wrap reveal">
            <div className="booking-section__form-header">
              <h3 className="booking-section__form-title">Request an appointment</h3>
              <p className="booking-section__form-sub">Estimated time: 2 minutes</p>
            </div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
