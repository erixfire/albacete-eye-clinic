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
            <span>ALBACETE EYE CLINIC</span>
          </div>
          <div className="footer__brand-name">Albacete</div>
          <p className="footer__brand-desc">
            Eye care specialists with over 20 years looking after the vision of families across Albacete.
          </p>
        </div>
        <div>
          <div className="footer__col-title">Services</div>
          <div className="footer__links">
            {['Eye Exam','Laser Surgery','Cataracts','Glaucoma','Retina'].map((s) => (
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
            <a href="/privacy" className="footer__link">Privacy policy</a>
          </div>
        </div>
        <div>
          <div className="footer__col-title">Contact</div>
          <div className="footer__links">
            <span className="footer__link">967 000 000</span>
            <span className="footer__link">info@albacete-eyeclinic.com</span>
            <span className="footer__link">Calle Mayor 12, Albacete</span>
            <span className="footer__link">Mon&ndash;Fri: 9:00&ndash;20:00</span>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>&copy; 2026 Albacete Eye Clinic. All rights reserved.</span>
        <span>Cloudflare Pages &middot; Built with clinical precision</span>
      </div>
    </footer>
  );
}
