import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Navbar.css';

const NAV_LINKS = [
  { href: '#services',     label: 'Mga Serbisyo' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#about',        label: 'About'        },
  { href: '#testimonials', label: 'Reviews'      },
  { href: '#appointment',  label: 'Book'         },
];

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { theme, toggle }         = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>

      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} aria-label="Main navigation">
        <div className="nav__inner">
          {/* Logo */}
          <a href="/" className="nav__logo" aria-label="Albacete Eye Center & Medical Clinics – Home">
            <div className="nav__logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              </svg>
            </div>
            <div className="nav__logo-text">
              <span className="nav__logo-name">Albacete Eye Center</span>
              <span className="nav__logo-sub">&amp; Medical Clinics · Iloilo City</span>
            </div>
          </a>

          {/* Desktop links */}
          <nav className="nav__links" aria-label="Site sections">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="nav__link">{label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div className="nav__actions">
            <a href="tel:09638629414" className="nav__phone" aria-label="Call 0963 862 9414">
              <PhoneIcon /> 0963 862 9414
            </a>
            <button className="nav__theme-toggle" onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <a href="#appointment" className="nav__cta">Book Now</a>
            <button className="nav__hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu">
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="nav__mobile" role="dialog" aria-label="Mobile menu">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="nav__mobile-link" onClick={close}>{label}</a>
          ))}
          <a href="tel:09638629414" className="nav__mobile-phone" onClick={close}>
            <PhoneIcon /> 0963 862 9414
          </a>
          <a href="#appointment" className="nav__mobile-cta" onClick={close}>
            Book Appointment →
          </a>
        </div>
      )}
    </>
  );
}
