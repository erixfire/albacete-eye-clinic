import './FAQ.css';

const FAQS = [
  {
    q: 'Do you accept PhilHealth?',
    a: <>Yes! Albacete Eye Center &amp; Medical Clinics is <strong>PhilHealth accredited</strong>. We process PhilHealth claims directly here at the clinic — just bring your PhilHealth ID or member data record. Our staff will assist you with the paperwork.</>
  },
  {
    q: 'Do I need an appointment or can I walk in?',
    a: <><strong>Walk-ins are always welcome!</strong> You may visit any of our branches during clinic hours (Mon–Sat, 8:00 AM – 5:00 PM) without a prior appointment. However, scheduling in advance is recommended for surgical procedures and specialized consultations to reduce your waiting time.</>
  },
  {
    q: 'How long does a consultation take?',
    a: <>A typical <strong>comprehensive eye exam takes 20–40 minutes</strong>. If additional tests are needed (dilated eye exam, tonometry), please allow up to an hour. Surgical procedures are scheduled separately and will be fully explained before your procedure.</>
  },
  {
    q: 'What should I bring on my first visit?',
    a: <><strong>Bring the following</strong> if available: (1) PhilHealth ID or MDR, (2) HMO card if applicable, (3) Senior Citizen or PWD ID for discount, (4) your current eyeglasses or contact lenses, (5) any previous eye prescriptions or medical records. Don&rsquo;t worry if you don&rsquo;t have all of these — you can still be seen.</>
  },
  {
    q: 'Do you offer discounts for senior citizens and PWDs?',
    a: <><strong>Yes!</strong> We honor the <strong>20% Senior Citizen discount</strong> and <strong>20% PWD discount</strong> as required by Philippine law. Please bring your official Senior Citizen ID or PWD ID card when you visit.</>
  },
  {
    q: 'What are your payment options?',
    a: <>We accept <strong>cash</strong>, <strong>PhilHealth</strong>, and <strong>HMO coverage</strong>. Our consultations are priced affordably to ensure everyone in our community has access to quality eye care. Contact us for specific pricing inquiries.</>
  },
];

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default function FAQ() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div className="faq__inner">
          <div className="faq__aside">
            <div className="section-tag reveal">FAQ</div>
            <h2 className="section-title reveal" id="faq-title">
              Frequently<br />asked <em>questions</em>
            </h2>
            <p className="section-desc reveal">
              Everything you need to know before your visit. Can&rsquo;t find your answer?
              Call us or message us on Facebook — we&rsquo;re happy to help.
            </p>

            <div className="faq__contact-cta reveal">
              <div className="faq__cta-title">Still have questions?</div>
              <p className="faq__cta-desc">
                Our friendly staff is available during clinic hours to answer any questions you have.
              </p>
              <div className="faq__cta-btns">
                <a href="tel:09638629414" className="faq__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.63 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 5.91 5.91l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call: 0963 862 9414
                </a>
                <a href="https://www.facebook.com/AlbaceteEyeClinic/" target="_blank" rel="noopener noreferrer" className="faq__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Message on Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="faq__list" role="list">
            {FAQS.map(({ q, a }, i) => (
              <details key={q} className={`faq__item reveal reveal-d${(i % 3) + 1}`}>
                <summary className="faq__question">
                  {q}
                  <div className="faq__chevron"><ChevronIcon /></div>
                </summary>
                <div className="faq__answer">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
