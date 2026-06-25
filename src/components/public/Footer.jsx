import './Footer.css';

const SERVICES = ['Eye Exam', 'Refraction & Optical', 'Cataract Surgery', 'Glaucoma', 'Paediatric Eye Care', 'OB-GYN'];
const CLINIC   = [
  { href: '#about',        label: 'About Us'         },
  { href: '#testimonials', label: 'Patient Reviews'  },
  { href: '#faq',          label: 'FAQs'             },
  { href: '#appointment',  label: 'Book Appointment' },
  { href: 'https://www.facebook.com/AlbaceteEyeClinic/', label: 'Facebook Page', ext: true },
];

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        {/* Brand */}
        <div>
          <div className="footer__logo" aria-label="Albacete Eye Center">
            <div className="footer__logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              </svg>
            </div>
            <div>
              <div className="footer__logo-name">Albacete Eye Center</div>
              <div className="footer__logo-sub">&amp; Medical Clinics</div>
            </div>
          </div>
          <p className="footer__brand-desc">
            Trusted eye care and multi-specialty medical clinic serving patients in Iloilo City
            and nearby communities. Narito kami para sa buong pamilya.
          </p>
          <div className="footer__social" aria-label="Social links">
            <a href="https://www.facebook.com/AlbaceteEyeClinic/" target="_blank" rel="noopener noreferrer"
              className="footer__social-btn" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="tel:09638629414" className="footer__social-btn" aria-label="Call us">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="footer__col-title">Services</div>
          <div className="footer__links">
            {SERVICES.map(s => (
              <a key={s} href="#services" className="footer__link">{s}</a>
            ))}
          </div>
        </div>

        {/* Clinic links */}
        <div>
          <div className="footer__col-title">Clinic</div>
          <div className="footer__links">
            {CLINIC.map(({ href, label, ext }) => (
              <a key={label} href={href} className="footer__link"
                {...(ext ? { target:'_blank', rel:'noopener noreferrer' } : {})}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="footer__col-title">Contact</div>
          <div className="footer__links">
            <a href="tel:09638629414" className="footer__link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              0963 862 9414
            </a>
            <span className="footer__link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
              </svg>
              JEA Bldg, E. Lopez St., Jaro, Iloilo City
            </span>
            <span className="footer__link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
              </svg>
              Cabatuan, Iloilo (2nd Branch)
            </span>
          </div>
          <div className="footer__hours-badge" aria-label="Clinic hours">
            <div className="footer__hours-dot" aria-hidden="true" />
            Mon – Sat: 8:00 AM – 5:00 PM
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>&copy; 2026 Albacete Eye Center &amp; Medical Clinics, Iloilo City, Philippines. All rights reserved.</span>
        <span>PhilHealth Accredited · Senior/PWD Discounts Honored</span>
      </div>
    </footer>
  );
}
