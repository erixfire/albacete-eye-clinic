import { useState } from 'react';
import './BookingForm.css';

const SERVICES = [
  { value: 'checkup',    label: 'Comprehensive Eye Exam' },
  { value: 'refraction', label: 'Refraction & Optical (Eyeglasses)' },
  { value: 'cataracts',  label: 'Cataract Surgery Consultation' },
  { value: 'glaucoma',   label: 'Glaucoma Check / Management' },
  { value: 'paediatric', label: 'Paediatric Eye Care (Child)' },
  { value: 'obgyn',      label: 'OB-GYN (Cabatuan Branch)' },
  { value: 'other',      label: 'Other / Not sure yet' },
];

export default function BookingForm() {
  const [form, setForm]           = useState({ firstName:'', lastName:'', phone:'', email:'', service:'', branch:'', date:'', notes:'' });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())  errs.firstName = 'First name is required';
    if (!form.phone.trim())      errs.phone     = 'Phone number is required';
    if (!form.service)           errs.service   = 'Please choose a service';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: form.firstName, apellidos: form.lastName,
          telefono: form.phone, email: form.email,
          servicio: form.service, branch: form.branch,
          fecha: form.date, notas: form.notes,
        }),
      });
      if (res.ok) setSubmitted(true);
      else setErrors({ general: 'Submission failed. Please call 0963 862 9414 or message us on Facebook.' });
    } catch {
      setErrors({ general: 'Connection error. Please call 0963 862 9414 or message us on Facebook.' });
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="booking-success" role="alert">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="m9 12 2 2 4-4"/>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
        </svg>
        <div>
          <div className="booking-success__title">Appointment request received!</div>
          <div className="booking-success__sub">
            We will contact you shortly to confirm. You can also reach us at <strong>0963 862 9414</strong> or message us on Facebook.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate aria-label="Appointment booking form">
      {errors.general && (
        <div className="booking-form__error" role="alert">{errors.general}</div>
      )}

      <div className="booking-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="bf-firstName">First name <span className="req" aria-hidden="true">*</span></label>
          <input className={`form-input${errors.firstName ? ' form-input--error' : ''}`}
            type="text" id="bf-firstName" value={form.firstName} onChange={set('firstName')}
            placeholder="Your first name" autoComplete="given-name" required aria-required="true"
            aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'err-fname' : undefined}/>
          {errors.firstName && <span id="err-fname" className="form-error" role="alert">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bf-lastName">Last name</label>
          <input className="form-input" type="text" id="bf-lastName" value={form.lastName}
            onChange={set('lastName')} placeholder="Your last name" autoComplete="family-name"/>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bf-phone">Phone number <span className="req" aria-hidden="true">*</span></label>
          <input className={`form-input${errors.phone ? ' form-input--error' : ''}`}
            type="tel" id="bf-phone" value={form.phone} onChange={set('phone')}
            placeholder="09XX XXX XXXX" autoComplete="tel" required aria-required="true"
            inputMode="tel"
            aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'err-phone' : undefined}/>
          {errors.phone && <span id="err-phone" className="form-error" role="alert">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bf-email">Email (optional)</label>
          <input className="form-input" type="email" id="bf-email" value={form.email}
            onChange={set('email')} placeholder="you@email.com" autoComplete="email"/>
        </div>

        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="bf-service">Service needed <span className="req" aria-hidden="true">*</span></label>
          <select className={`form-input form-select${errors.service ? ' form-input--error' : ''}`}
            id="bf-service" value={form.service} onChange={set('service')} required
            aria-required="true" aria-invalid={!!errors.service}>
            <option value="" disabled>Choose a service…</option>
            {SERVICES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.service && <span className="form-error" role="alert">{errors.service}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bf-branch">Preferred branch</label>
          <select className="form-input form-select" id="bf-branch" value={form.branch} onChange={set('branch')}>
            <option value="">No preference</option>
            <option value="jaro">Jaro – JEA Bldg, E. Lopez St., Iloilo City</option>
            <option value="cabatuan">Cabatuan, Iloilo</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bf-date">Preferred date</label>
          <input className="form-input" type="date" id="bf-date" value={form.date}
            onChange={set('date')} min={minDate}/>
        </div>

        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="bf-notes">Reason / Additional notes</label>
          <textarea className="form-input form-textarea" id="bf-notes" value={form.notes}
            onChange={set('notes')} placeholder="Briefly describe your concern (e.g., blurry vision, eye pain, follow-up)…"/>
        </div>
      </div>

      <button type="submit" className="booking-form__submit" disabled={loading}>
        {loading ? 'Sending your request…' : 'Submit Appointment Request →'}
      </button>
      <p className="booking-form__note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Your information is kept private and secure
      </p>
    </form>
  );
}
