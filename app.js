// app.js for Albacete Eye Center & Medical Clinics glassmorphism UI

const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const views = Array.from(document.querySelectorAll('.view'));
const miniApptsContainer = document.getElementById('mini-appointments');
const adminTableBody = document.getElementById('admin-table-body');
const todaySubtitle = document.getElementById('today-subtitle');
const appointments = [];

function setActiveView(viewName) {
  navButtons.forEach(btn => {
    const target = btn.getAttribute('data-view-target');
    btn.setAttribute('data-active', target === viewName ? 'true' : 'false');
  });
  views.forEach(view => {
    const v = view.getAttribute('data-view');
    view.setAttribute('data-visible', v === viewName ? 'true' : 'false');
  });
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-view-target');
    setActiveView(target);
  });
});

Array.from(document.querySelectorAll('[data-scroll-to]')).forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-scroll-to');
    setActiveView(target);
    const section = document.querySelector('.glass-panel');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function updateTodaySubtitle() {
  const now = new Date();
  const label = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  todaySubtitle.textContent = `Today: ${label}`;
}

function renderAppointments() {
  miniApptsContainer.innerHTML = '';
  adminTableBody.innerHTML = '';

  if (appointments.length === 0) {
    miniApptsContainer.innerHTML = '<div class="hint">No upcoming appointments yet. Add one in the form to see your glass schedule.</div>';
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:0.9rem;">No booked appointments yet—add one in <strong>Book</strong>.</td></tr>';
    return;
  }

  const sorted = [...appointments].sort((a, b) => {
    const ad = `${a.date}T${a.time || '00:00'}`;
    const bd = `${b.date}T${b.time || '00:00'}`;
    return new Date(ad) - new Date(bd);
  });

  sorted.slice(0, 4).forEach(appt => {
    const chip = document.createElement('div');
    chip.className = 'appt-chip';
    chip.innerHTML = `
      <div class="appt-main">
        <span class="appt-name">${appt.name || 'Unnamed patient'}</span>
        <span class="appt-meta">${formatDateLabel(appt.date)} · ${appt.time || 'TBA'} · ${appt.doctor || 'Any doctor'}</span>
      </div>
      <span class="appt-badge">${appt.type || 'Consultation'}</span>
    `;
    miniApptsContainer.appendChild(chip);
  });

  sorted.forEach(appt => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${appt.name || 'Unnamed patient'}</td>
      <td>${formatDateLabel(appt.date)}</td>
      <td>${appt.time || 'TBA'}</td>
      <td>${appt.doctor || '-'}</td>
      <td>${appt.type || '-'}</td>
    `;
    adminTableBody.appendChild(tr);
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.setAttribute('data-open', 'true');
  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => hideToast(), 2600);
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.setAttribute('data-open', 'false');
}

window.hideToast = hideToast;

const form = document.getElementById('appointment-form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const appt = {
      name: data.get('name')?.toString().trim(),
      phone: data.get('phone')?.toString().trim(),
      date: data.get('date')?.toString(),
      time: data.get('time')?.toString(),
      doctor: data.get('doctor')?.toString(),
      type: data.get('type')?.toString(),
      reason: data.get('reason')?.toString(),
      insurance: data.get('insurance')?.toString(),
    };
    appointments.push(appt);
    renderAppointments();
    showToast();
    form.reset();
  });
}

updateTodaySubtitle();
renderAppointments();
