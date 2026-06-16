import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div>
          <div className="footer__logo-row" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="16" rx="15" ry="15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <circle cx="16" cy="16" r="4" fill="rgba(255,255,255,0.7)"/>
            </svg>
            <span>ALBACETE EYE CENTER</span>
          </div>
          <div className="footer__brand-name">&amp; Medical Clinics</div>
          <p className="footer__brand-desc">
            Trusted eye care and multi-specialty medical clinic serving patients in Iloilo City and nearby communities.
          </p>
        </div>
        <div>
          <div className="footer__col-title">Services</div>
          <div className="footer__links">
            {['Eye Exam','Refraction & Optical','Cataract Surgery','Glaucoma','Paediatric Eye Care','OB-GYN'].map((s) => (
              <a key={s} href="#services" className="footer__link">{s}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="footer__col-title">Clinic</div>
          <div className="footer__links">
            <a href="#about" className="footer__link">About us</a>
            <a href="#testimonials" className="footer__link">Reviews</a>
            <a href="#appointment" className="footer__link">Book appointment</a>
            <a href="https://www.facebook.com/AlbaceteEyeClinic/" target="_blank" rel="noopener noreferrer" className="footer__link">Facebook Page</a>
          </div>
        </div>
        <div>
          <div className="footer__col-title">Contact</div>
          <div className="footer__links">
            <span className="footer__link">0963 862 9414</span>
            <span className="footer__link">JEA Bldg, E. Lopez St., Jaro, Iloilo City</span>
            <span className="footer__link">Cabatuan, Iloilo (2nd Branch)</span>
            <span className="footer__link">Mon&ndash;Sat: 8:00 AM &ndash; 5:00 PM</span>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>&copy; 2026 Albacete Eye Center &amp; Medical Clinics, Iloilo City, Philippines. All rights reserved.</span>
        <span>Powered by Cloudflare Pages</span>
      </div>
    </footer>
  );
}
