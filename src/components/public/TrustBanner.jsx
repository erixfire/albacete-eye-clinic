import './TrustBanner.css';

const ITEMS = [
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    text: 'PhilHealth Accredited',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    text: 'HMO Accepted',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    text: 'Senior / PWD Discount',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    text: 'Walk-ins Welcome',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    text: 'Mon – Sat, 8 AM – 5 PM',
  },
];

export default function TrustBanner() {
  return (
    <div className="trust-banner" role="complementary" aria-label="Clinic highlights">
      <div className="trust-banner__inner container">
        {ITEMS.map(({ icon, text }, i) => (
          <div key={text} className="trust-banner__item">
            {i > 0 && <div className="trust-banner__divider" aria-hidden="true" />}
            <span className="trust-banner__icon" aria-hidden="true">{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
