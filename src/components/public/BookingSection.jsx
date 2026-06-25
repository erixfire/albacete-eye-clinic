import BookingForm from './BookingForm';
import './BookingSection.css';

const WAYS = [
  {
    tag: 'a', href: 'tel:09638629414',
    iconCls: 'contact-way__icon--blue',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    label: 'Call us directly',
    value: '0963 862 9414',
    sub: 'Fastest — Mon to Sat, 8AM–5PM',
    primary: true,
  },
  {
    tag: 'a', href: 'https://www.facebook.com/AlbaceteEyeClinic/', target: '_blank', rel: 'noopener noreferrer',
    iconCls: 'contact-way__icon--amber',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    label: 'Facebook Message',
    value: 'AlbaceteEyeClinic',
    sub: 'We reply within a few hours',
  },
  {
    tag: 'div',
    iconCls: 'contact-way__icon--green',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>,
    label: 'Jaro Branch',
    value: 'JEA Bldg, E. Lopez St., Jaro',
    sub: 'Iloilo City · Walk-ins welcome',
  },
  {
    tag: 'div',
    iconCls: 'contact-way__icon--gray',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>,
    label: 'Cabatuan Branch',
    value: 'Cabatuan, Iloilo',
    sub: 'Eye + OB-GYN services',
  },
];

export default function BookingSection() {
  return (
    <section className="booking-section" id="appointment" aria-labelledby="booking-title">
      <div className="container">
        <div className="booking-section__inner">
          <div className="booking-section__info">
            <div className="section-tag reveal">Mag-Book na</div>
            <h2 className="section-title reveal" id="booking-title">
              Book your appointment<br/><em>today</em>
            </h2>
            <p className="section-desc reveal">
              Choose how you want to reach us. Walk-ins are always welcome, but scheduling
              ahead means less waiting time for you. Simple at madali lang!
            </p>

            <div className="booking-section__ways">
              {WAYS.map(({ tag: Tag, href, target, rel, iconCls, icon, label, value, sub, primary }, i) => (
                <Tag
                  key={label}
                  {...(href ? { href } : {})}
                  {...(target ? { target } : {})}
                  {...(rel ? { rel } : {})}
                  className={`contact-way reveal reveal-d${i + 1}${primary ? ' contact-way--primary' : ''}`}
                  aria-label={`${label}: ${value}`}
                >
                  <div className={`contact-way__icon ${iconCls}`} aria-hidden="true">{icon}</div>
                  <div className="contact-way__body">
                    <div className="contact-way__label">{label}</div>
                    <div className="contact-way__value">{value}</div>
                    <div className="contact-way__sub">{sub}</div>
                  </div>
                  {href && (
                    <svg className="contact-way__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  )}
                </Tag>
              ))}
            </div>
          </div>

          <div className="booking-section__form-wrap reveal">
            <div className="booking-section__form-header">
              <h3 className="booking-section__form-title">Request an appointment</h3>
              <p className="booking-section__form-sub">Fill in your details and we&rsquo;ll confirm within a few hours. Estimated time: 2 minutes.</p>
            </div>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
