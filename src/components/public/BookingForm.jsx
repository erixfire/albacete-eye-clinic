import { useState } from 'react';
import './BookingForm.css';

const SERVICES = [
  { value: 'checkup',    label: 'Comprehensive Eye Exam' },
  { value: 'refraction', label: 'Refraction & Optical' },
  { value: 'cataracts',  label: 'Cataract Surgery' },
  { value: 'glaucoma',   label: 'Glaucoma Management' },
  { value: 'paediatric', label: 'Paediatric Eye Care' },
  { value: 'obgyn',      label: 'OB-GYN (Cabatuan Branch)' },
  { value: 'other',      label: 'Other enquiry' },
];

export default function BookingForm() {
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', email:'', service:'', branch:'', date:'', slot:'', notes:'' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.phone.trim())     errs.phone     = 'Phone number is required';
    if (!form.service)          errs.service   = 'Please select a service';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: form.firstName,
          apellidos: form.lastName,
          telefono: form.phone,
          email: form.email,
          servicio: form.service,
          branch: form.branch,
          fecha: form.date,
          turno: form.slot,
          notas: form.notes,
        }),
      });
      if (res.ok) setSubmitted(true);
      else setErrors({ general: 'Submission failed. Please call us at 0963 862 9414 or message us on Facebook.' });
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="m9 12 2 2 4-4"/>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
        </svg>
        <div>
          <div className="booking-success__title">Appointment requested!</div>
          <div className="booking-success__sub">We will contact you to confirm. You can also reach us at 0963 862 9414.</div>
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
          <label className="form-label" htmlFor="firstName">First name *</label>
          <input className={`form-input${errors.firstName ? ' form-input--error' : ''}`}
            type="text" id="firstName" value={form.firstName} onChange={set('firstName')}
            placeholder="Your first name" autoComplete="given-name" required/>
          {errors.firstName && <span className="form-error">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="lastName">Last name</label>
          <input className="form-input" type="text" id="lastName" value={form.lastName}
            onChange={set('lastName')} placeholder="Your last name" autoComplete="family-name"/>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone *</label>
          <input className={`form-input${errors.phone ? ' form-input--error' : ''}`}
            type="tel" id="phone" value={form.phone} onChange={set('phone')}
            placeholder="09XX XXX XXXX" autoComplete="tel" required/>
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-input" type="email" id="email" value={form.email}
            onChange={set('email')} placeholder="you@email.com" autoComplete="email"/>
        </div>
        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="service">Service *</label>
          <select className={`form-input form-select${errors.service ? ' form-input--error' : ''}`}
            id="service" value={form.service} onChange={set('service')} required>
            <option value="" disabled>Select a service</option>
            {SERVICES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.service && <span className="form-error">{errors.service}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="branch">Preferred branch</label>
          <select className="form-input form-select" id="branch" value={form.branch} onChange={set('branch')}>
            <option value="">No preference</option>
            <option value="jaro">Jaro, Iloilo City (JEA Bldg, E. Lopez St.)</option>
            <option value="cabatuan">Cabatuan, Iloilo</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="date">Preferred date</label>
          <input className="form-input" type="date" id="date" value={form.date}
            onChange={set('date')} min={minDate}/>
        </div>
        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="notes">Reason or additional notes</label>
          <textarea className="form-input form-textarea" id="notes" value={form.notes}
            onChange={set('notes')} placeholder="Briefly describe the reason for your visit..."/>
        </div>
      </div>
      <button type="submit" className="booking-form__submit" disabled={loading}>
        {loading ? 'Sending...' : 'Request appointment →'}
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
