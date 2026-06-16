import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Navbar.css';

const NavLinks = ({ mobile = false, onClose }) => {
  const links = [
    { href: '#servicios', label: 'Servicios' },
    { href: '#nosotros',  label: 'Nosotros'  },
    { href: '#testimonios', label: 'Opiniones' },
    { href: '#cita',     label: 'Cita'      },
  ];
  return links.map(({ href, label }) => (
    <a
      key={href}
      href={href}
      className={mobile ? 'nav__mobile-link' : 'nav__link'}
      onClick={onClose}
    >
      {label}
    </a>
  ));
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} aria-label="Navegación principal">
        <div className="nav__inner">
          {/* Logo */}
          <a href="/" className="nav__logo" aria-label="Clínica Oftalmológica Albacete">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <ellipse cx="16" cy="16" rx="15" ry="15" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <ellipse cx="16" cy="16" rx="8" ry="8" fill="var(--color-primary)" opacity="0.12"/>
              <circle cx="16" cy="16" r="4" fill="var(--color-primary)"/>
              <circle cx="18.5" cy="13.5" r="1.5" fill="white" opacity="0.8"/>
              <path d="M4 16 C8 9, 24 9, 28 16 C24 23, 8 23, 4 16Z" stroke="var(--color-primary)" strokeWidth="1.2" fill="none" opacity="0.4"/>
            </svg>
            <span>Clínica Oftalmológica<br/><strong>Albacete</strong></span>
          </a>

          {/* Desktop links */}
          <div className="nav__links" role="list">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="nav__actions">
            <button
              className="nav__theme-toggle"
              onClick={toggle}
              aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <a href="#cita" className="nav__cta">Pedir Cita</a>
            <button
              className="nav__hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav__mobile" role="dialog" aria-label="Menú móvil">
          <NavLinks mobile onClose={closeMenu} />
          <a href="#cita" className="nav__mobile-cta" onClick={closeMenu}>Pedir Cita →</a>
        </div>
      )}
    </>
  );
}
