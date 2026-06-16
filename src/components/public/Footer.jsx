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
            <span>CLÍNICA OFTALMOLÓGICA</span>
          </div>
          <div className="footer__brand-name">Albacete</div>
          <p className="footer__brand-desc">
            Especialistas en salud visual con más de 20 años cuidando la vista de las familias de Albacete.
          </p>
        </div>
        <div>
          <div className="footer__col-title">Servicios</div>
          <div className="footer__links">
            {['Revisión Visual','Cirugía Láser','Cataratas','Glaucoma','Retina'].map((s) => (
              <a key={s} href="#servicios" className="footer__link">{s}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="footer__col-title">Clínica</div>
          <div className="footer__links">
            <a href="#nosotros" className="footer__link">Sobre nosotros</a>
            <a href="#testimonios" className="footer__link">Opiniones</a>
            <a href="#cita" className="footer__link">Pedir cita</a>
            <a href="/privacidad" className="footer__link">Política de privacidad</a>
          </div>
        </div>
        <div>
          <div className="footer__col-title">Contacto</div>
          <div className="footer__links">
            <span className="footer__link">967 000 000</span>
            <span className="footer__link">info@clinica-albacete.es</span>
            <span className="footer__link">Calle Mayor 12, Albacete</span>
            <span className="footer__link">Lun–Vie: 9:00–20:00</span>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Clínica Oftalmológica Albacete. Todos los derechos reservados.</span>
        <span>Cloudflare Pages · Diseñado con precisión médica</span>
      </div>
    </footer>
  );
}
