import { useState } from 'react';
import './BookingForm.css';

const SERVICIOS = [
  { value: 'revision',   label: 'Revisión Visual Completa' },
  { value: 'laser',      label: 'Cirugía Láser (LASIK/PRK)' },
  { value: 'cataratas',  label: 'Cataratas' },
  { value: 'glaucoma',   label: 'Glaucoma' },
  { value: 'retina',     label: 'Retina y Mácula' },
  { value: 'pediatrica', label: 'Oftalmología Pediátrica' },
  { value: 'otra',       label: 'Otra consulta' },
];

export default function BookingForm() {
  const [form, setForm] = useState({ nombre:'', apellidos:'', telefono:'', email:'', servicio:'', fecha:'', turno:'', notas:'' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim())   errs.nombre   = 'El nombre es obligatorio';
    if (!form.telefono.trim()) errs.telefono = 'El teléfono es obligatorio';
    if (!form.servicio)        errs.servicio = 'Selecciona un servicio';
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
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
      else setErrors({ general: 'Error al enviar. Inténtalo de nuevo o llámanos.' });
    } catch {
      setErrors({ general: 'Error de conexión. Por favor llámanos directamente.' });
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
          <div className="booking-success__title">¡Cita solicitada correctamente!</div>
          <div className="booking-success__sub">Te contactaremos en menos de 24 horas para confirmar.</div>
        </div>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate aria-label="Formulario de cita">
      {errors.general && (
        <div className="booking-form__error" role="alert">{errors.general}</div>
      )}
      <div className="booking-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">Nombre *</label>
          <input className={`form-input${errors.nombre ? ' form-input--error' : ''}`}
            type="text" id="nombre" value={form.nombre} onChange={set('nombre')}
            placeholder="Tu nombre" autoComplete="given-name" required/>
          {errors.nombre && <span className="form-error">{errors.nombre}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="apellidos">Apellidos</label>
          <input className="form-input" type="text" id="apellidos" value={form.apellidos}
            onChange={set('apellidos')} placeholder="Tus apellidos" autoComplete="family-name"/>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="telefono">Teléfono *</label>
          <input className={`form-input${errors.telefono ? ' form-input--error' : ''}`}
            type="tel" id="telefono" value={form.telefono} onChange={set('telefono')}
            placeholder="600 000 000" autoComplete="tel" required/>
          {errors.telefono && <span className="form-error">{errors.telefono}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-input" type="email" id="email" value={form.email}
            onChange={set('email')} placeholder="tu@email.com" autoComplete="email"/>
        </div>
        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="servicio">Servicio *</label>
          <select className={`form-input form-select${errors.servicio ? ' form-input--error' : ''}`}
            id="servicio" value={form.servicio} onChange={set('servicio')} required>
            <option value="" disabled>Selecciona un servicio</option>
            {SERVICIOS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.servicio && <span className="form-error">{errors.servicio}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fecha">Fecha preferida</label>
          <input className="form-input" type="date" id="fecha" value={form.fecha}
            onChange={set('fecha')} min={minDate}/>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="turno">Turno preferido</label>
          <select className="form-input form-select" id="turno" value={form.turno} onChange={set('turno')}>
            <option value="">Sin preferencia</option>
            <option value="manana">Mañana (9:00–13:00)</option>
            <option value="tarde">Tarde (15:00–20:00)</option>
          </select>
        </div>
        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="notas">Motivo o notas adicionales</label>
          <textarea className="form-input form-textarea" id="notas" value={form.notas}
            onChange={set('notas')} placeholder="Describe brevemente el motivo de tu visita..."/>
        </div>
      </div>
      <button type="submit" className="booking-form__submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Solicitar cita →'}
      </button>
      <p className="booking-form__note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Tus datos están protegidos conforme al RGPD
      </p>
    </form>
  );
}
