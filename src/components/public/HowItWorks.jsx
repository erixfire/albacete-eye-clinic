import './HowItWorks.css';

const STEPS = [
  {
    num: 1,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Book or Walk In',
    desc: 'Call us at 0963 862 9414, message us on Facebook, fill out our online form, or simply walk in to any of our two branches. We always accommodate you.',
    note: '2–3 min to book',
  },
  {
    num: 2,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Meet the Doctor',
    desc: 'Our specialist, Dr. Thomas Louie Albacete, will conduct a thorough and gentle examination. Ask any questions — we take the time to explain everything clearly.',
    note: '20–40 min consultation',
  },
  {
    num: 3,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m9 12 2 2 4-4"/>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
      </svg>
    ),
    title: 'Get Your Treatment',
    desc: 'Receive your prescription, glasses fitting, treatment plan, or schedule your procedure. PhilHealth and HMO claims are processed right here at the clinic.',
    note: 'Same-day results available',
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works" aria-labelledby="hiw-title">
      <div className="container">
        <div className="section-header section-header--center reveal">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title" id="hiw-title">
            Your journey to<br /><em>better vision</em> in 3 steps
          </h2>
          <p className="section-desc" style={{ marginInline: 'auto' }}>
            Simple and straightforward &mdash; whether it&rsquo;s your first visit or your follow-up,
            we make the process easy for you and your family.
          </p>
        </div>

        <div className="hiw__inner">
          <div className="hiw__connector" aria-hidden="true" />
          {STEPS.map(({ num, icon, title, desc, note }, i) => (
            <div key={num} className={`hiw__step reveal reveal-d${i + 1}`}>
              <div className="hiw__step-num" aria-label={`Step ${num}`}>{num}</div>
              <div className="hiw__icon" aria-hidden="true">{icon}</div>
              <h3 className="hiw__step-title">{title}</h3>
              <p className="hiw__step-desc">{desc}</p>
              {note && <span className="hiw__step-note">{note}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
