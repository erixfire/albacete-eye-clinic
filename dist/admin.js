/* ============================================================
   Albacete Eye Clinic — Admin Dashboard JS
   Cloudflare Pages + D1 · Vanilla JS (no framework)
   ============================================================ */

'use strict';

/* ── State ──────────────────────────────────────────────────── */
const S = {
  admin:        null,
  appointments: [],
  users:        [],
  calWeekStart: mondayOfWeek(new Date()),
  toastTimer:   null,
};

/* ── DOM shortcuts ──────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── Helpers ────────────────────────────────────────────────── */
function toISO(d) { return d.toISOString().split('T')[0]; }

function mondayOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0,0,0,0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmt12(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtDateFull(iso) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function statusBadge(status) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'danger' };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  return `<span class="badge badge-${map[status] || 'warning'}">${label}</span>`;
}

function roleBadge(role) {
  return role === 'superadmin'
    ? '<span class="badge badge-accent">Superadmin</span>'
    : '<span class="badge badge-default">Staff</span>';
}

function showToast(msg, type = 'default') {
  const el = $('toast');
  el.textContent = msg;
  el.className = `toast show toast-${type}`;
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

function showModal(id) { $(id).classList.remove('hidden'); }
function hideModal(id) { $(id).classList.add('hidden'); }

function showTab(tab) {
  $$('.tab-section').forEach(s => s.classList.add('hidden'));
  $$('.nav-item').forEach(b => b.classList.remove('active'));
  $(`tab-${tab}`).classList.remove('hidden');
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  if (tab === 'calendar') renderCalendar();
  if (tab === 'users') loadUsers();
}

/* ── API calls ──────────────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (res.status === 401) { doLogout(); return null; }
  return res;
}

async function loadAppointments() {
  setLoading('appt-tbody', 10, 10);
  setLoading('recent-tbody', 3, 6);
  const res = await apiFetch('/admin/appointments');
  if (!res) return;
  const data = await res.json();
  S.appointments = Array.isArray(data) ? data : [];
  renderOverview();
  renderAppointmentsTable();
}

async function loadUsers() {
  if (S.admin?.role !== 'superadmin') {
    $('tab-users').innerHTML = '<div class="empty-state">🔒 Superadmin access required.</div>';
    return;
  }
  const res = await apiFetch('/admin/users');
  if (!res) return;
  const data = await res.json();
  S.users = Array.isArray(data) ? data : [];
  renderUsers();
}

async function updateStatus(id, status) {
  const res = await apiFetch(`/admin/appointments?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!res || !res.ok) { showToast('Failed to update status.', 'error'); return; }
  showToast(`Appointment ${status}.`, 'success');
  await loadAppointments();
}

async function deleteAppointment(id) {
  if (!confirm('Permanently delete this appointment?')) return;
  const res = await apiFetch(`/admin/appointments?id=${id}`, { method: 'DELETE' });
  if (!res || !res.ok) { showToast('Could not delete.', 'error'); return; }
  showToast('Appointment deleted.', 'success');
  hideModal('appt-modal');
  await loadAppointments();
}

async function deleteUser(id) {
  if (!confirm('Delete this staff user?')) return;
  const res = await apiFetch(`/admin/users?id=${id}`, { method: 'DELETE' });
  if (!res || !res.ok) { showToast('Could not delete user.', 'error'); return; }
  showToast('User deleted.', 'success');
  await loadUsers();
}

/* ── Skeleton loader ────────────────────────────────────────── */
function setLoading(tbodyId, rows, cols) {
  const tbody = $(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () =>
      '<td><div class="skel"></div></td>').join('')}</tr>`
  ).join('');
}

/* ── Render: Overview ───────────────────────────────────────── */
function renderOverview() {
  const today    = toISO(new Date());
  const weekEnd  = toISO(addDays(new Date(), 7));
  const all      = S.appointments;

  const todayApts     = all.filter(a => a.date === today);
  const pending       = all.filter(a => a.status === 'pending');
  const confirmed     = all.filter(a => a.status === 'confirmed');
  const cancelled     = all.filter(a => a.status === 'cancelled');
  const weekApts      = all.filter(a => a.date > today && a.date <= weekEnd);
  const upcoming      = all.filter(a => a.date > today && a.date <= weekEnd && a.status !== 'cancelled');

  $('stat-today').textContent     = todayApts.length;
  $('stat-total').textContent     = all.length;
  $('stat-pending').textContent   = pending.length;
  $('stat-confirmed').textContent = confirmed.length;
  $('stat-cancelled').textContent = cancelled.length;
  $('stat-week').textContent      = weekApts.length;

  // Today list
  const todayEl = $('today-list');
  $('today-count').textContent = todayApts.length;
  if (todayApts.length === 0) {
    todayEl.innerHTML = '<p class="list-empty">No appointments today.</p>';
  } else {
    todayEl.innerHTML = todayApts
      .sort((a,b) => a.time.localeCompare(b.time))
      .map(a => apptMiniCard(a))
      .join('');
  }

  // Upcoming list
  const upcomingEl = $('upcoming-list');
  $('upcoming-count').textContent = upcoming.length;
  if (upcoming.length === 0) {
    upcomingEl.innerHTML = '<p class="list-empty">No upcoming appointments.</p>';
  } else {
    upcomingEl.innerHTML = upcoming
      .sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      .slice(0, 8)
      .map(a => apptMiniCard(a))
      .join('');
  }

  // Recent bookings table (last 10 by created_at)
  const recent = [...all]
    .sort((a,b) => (b.created_at||'').localeCompare(a.created_at||''))
    .slice(0, 10);
  const tbody = $('recent-tbody');
  tbody.innerHTML = recent.length === 0
    ? `<tr><td colspan="6" class="td-empty">No bookings yet.</td></tr>`
    : recent.map(a => `
        <tr>
          <td><strong>${escHtml(a.name)}</strong><br><span class="td-sub">${escHtml(a.phone)}</span></td>
          <td>${fmtDate(a.date)}</td>
          <td>${fmt12(a.time)}</td>
          <td>${escHtml(a.type || 'Consultation')}</td>
          <td>${statusBadge(a.status)}</td>
          <td><button class="btn-link" onclick="openApptModal(${a.id})">View</button></td>
        </tr>
      `).join('');
}

function apptMiniCard(a) {
  return `
    <div class="mini-card" onclick="openApptModal(${a.id})">
      <div class="mini-time">${fmt12(a.time)}</div>
      <div class="mini-body">
        <strong>${escHtml(a.name)}</strong>
        <span>${escHtml(a.type || 'Consultation')}</span>
      </div>
      ${statusBadge(a.status)}
    </div>`;
}

/* ── Render: Appointments Table ─────────────────────────────── */
function renderAppointmentsTable() {
  const search  = ($('appt-search')?.value || '').trim().toLowerCase();
  const status  = $('appt-status-filter')?.value || 'all';
  const dateF   = $('appt-date-filter')?.value || '';
  const hasFilters = search || status !== 'all' || dateF;

  $('appt-clear-filters')?.classList.toggle('hidden', !hasFilters);

  let list = [...S.appointments].sort((a,b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );

  if (search) list = list.filter(a =>
    (a.name||'').toLowerCase().includes(search) ||
    (a.phone||'').includes(search) ||
    (a.date||'').includes(search)
  );
  if (status !== 'all') list = list.filter(a => (a.status||'pending') === status);
  if (dateF)            list = list.filter(a => a.date === dateF);

  $('appt-count').textContent = `${list.length} result${list.length !== 1 ? 's' : ''}`;

  const tbody = $('appt-tbody');
  const empty = $('appt-empty');

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = list.map(a => `
    <tr>
      <td class="td-id">#${a.id}</td>
      <td><strong>${escHtml(a.name)}</strong><br><span class="td-sub">${escHtml(a.reason || '')}${a.reason && a.reason.length > 40 ? '…' : ''}</span></td>
      <td>${escHtml(a.phone || '—')}</td>
      <td>${fmtDate(a.date)}</td>
      <td>${fmt12(a.time)}</td>
      <td>${escHtml(a.type || '—')}</td>
      <td class="td-sm">${escHtml((a.doctor||'').split('–')[0]?.trim() || '—')}</td>
      <td>${escHtml(a.insurance || '—')}</td>
      <td>${statusBadge(a.status)}</td>
      <td class="td-actions">
        <button class="btn-link" onclick="openApptModal(${a.id})">View</button>
        ${a.status !== 'confirmed' ? `<button class="btn-confirm sm" onclick="updateStatus(${a.id},'confirmed')">✓</button>` : ''}
        ${a.status === 'pending'   ? `<button class="btn-danger sm"  onclick="updateStatus(${a.id},'cancelled')">✕</button>` : ''}
      </td>
    </tr>
  `).join('');
}

/* ── Render: Appointment Modal ──────────────────────────────── */
window.openApptModal = function(id) {
  const a = S.appointments.find(x => x.id === id);
  if (!a) return;

  $('appt-modal-title').textContent = `Appointment #${a.id}`;

  $('appt-modal-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-row"><span>Patient</span><strong>${escHtml(a.name)}</strong></div>
      <div class="detail-row"><span>Phone</span><strong>${escHtml(a.phone || '—')}</strong></div>
      <div class="detail-row"><span>Date</span><strong>${fmtDateFull(a.date)}</strong></div>
      <div class="detail-row"><span>Time</span><strong>${fmt12(a.time)} (30 min)</strong></div>
      <div class="detail-row"><span>Type</span><strong>${escHtml(a.type || '—')}</strong></div>
      <div class="detail-row"><span>Doctor</span><strong>${escHtml(a.doctor || '—')}</strong></div>
      <div class="detail-row"><span>Insurance</span><strong>${escHtml(a.insurance || '—')}</strong></div>
      <div class="detail-row"><span>Status</span>${statusBadge(a.status)}</div>
      <div class="detail-row full"><span>Concern</span><p class="detail-reason">${escHtml(a.reason || 'None specified')}</p></div>
      <div class="detail-row"><span>Booked at</span><strong>${fmtDateTime(a.created_at)}</strong></div>
    </div>
  `;

  const footer = $('appt-modal-footer');
  footer.innerHTML = '';

  const close = btn('btn-secondary', '← Close', () => hideModal('appt-modal'));
  footer.appendChild(close);

  if (a.status !== 'confirmed') {
    const confirm = btn('btn-confirm', '✓ Confirm', async () => {
      await updateStatus(a.id, 'confirmed');
      hideModal('appt-modal');
    });
    footer.appendChild(confirm);
  }
  if (a.status === 'pending') {
    const cancel = btn('btn-danger', '✕ Cancel', async () => {
      await updateStatus(a.id, 'cancelled');
      hideModal('appt-modal');
    });
    footer.appendChild(cancel);
  }
  if (a.status === 'confirmed') {
    const revert = btn('btn-ghost', '↩ Revert', async () => {
      await updateStatus(a.id, 'pending');
      hideModal('appt-modal');
    });
    footer.appendChild(revert);
  }

  const del = btn('btn-danger ml-auto', '🗑 Delete', () => deleteAppointment(a.id));
  footer.appendChild(del);

  showModal('appt-modal');
};

function btn(cls, text, onClick) {
  const b = document.createElement('button');
  b.className = cls;
  b.textContent = text;
  b.addEventListener('click', onClick);
  return b;
}

/* ── Render: Calendar ───────────────────────────────────────── */
const SLOTS = (() => {
  const s = [];
  for (let h = 8; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      s.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return s;
})();

function renderCalendar() {
  const today   = toISO(new Date());
  const days    = Array.from({ length: 7 }, (_, i) => addDays(S.calWeekStart, i));
  const dayISOs = days.map(toISO);

  // Range label
  const f = days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const l = days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  $('cal-range').textContent = `${f} – ${l}`;

  // Build booked map
  const bmap = {};
  S.appointments.forEach(a => {
    if (a.date && a.time) {
      const k = `${a.date}|${a.time}`;
      if (!bmap[k]) bmap[k] = [];
      bmap[k].push(a);
    }
  });

  const grid = $('cal-grid');
  grid.innerHTML = '';

  // Build table
  const table = document.createElement('table');
  table.className = 'cal-table';

  // Header row
  const thead = table.createTHead();
  const hrow  = thead.insertRow();
  const thTime = document.createElement('th');
  thTime.className = 'cal-th-time';
  hrow.appendChild(thTime);

  days.forEach((day, i) => {
    const th = document.createElement('th');
    const iso = dayISOs[i];
    th.className = ['cal-th', iso === today ? 'today' : '', iso < today ? 'past' : ''].filter(Boolean).join(' ');
    th.innerHTML = `
      <span class="cal-dname">${day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
      <span class="cal-dnum ${iso === today ? 'today-num' : ''}">${day.getDate()}</span>
    `;
    hrow.appendChild(th);
  });

  // Time rows
  const tbody = table.createTBody();
  SLOTS.forEach(slot => {
    const tr = tbody.insertRow();
    const tdTime = tr.insertCell();
    tdTime.className = 'cal-time';
    tdTime.textContent = fmt12(slot);

    days.forEach((_, i) => {
      const iso     = dayISOs[i];
      const booked  = bmap[`${iso}|${slot}`] || [];
      const isBook  = booked.length > 0;
      const td      = tr.insertCell();
      const isPast  = iso < today;
      const isToday = iso === today;
      const statusC = isBook ? (booked[0].status || 'pending') : '';

      td.className = [
        'cal-cell',
        isBook  ? `booked ${statusC}` : '',
        isPast  ? 'past' : '',
        isToday ? 'today-col' : '',
      ].filter(Boolean).join(' ');

      if (isBook) {
        td.title = `${booked[0].name} – ${booked[0].type || 'Consultation'} [${booked[0].status}]`;
        td.innerHTML = `<span class="cal-name" onclick="openApptModal(${booked[0].id})">${escHtml(booked[0].name?.split(' ')[0] || '?')}</span>`;
      }
    });
  });

  grid.appendChild(table);
}

/* ── Render: Users ──────────────────────────────────────────── */
function renderUsers() {
  const tbody = $('users-tbody');
  const empty = $('users-empty');

  if (S.users.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = S.users.map(u => `
    <tr>
      <td class="td-id">#${u.id}</td>
      <td><strong>${escHtml(u.username)}</strong></td>
      <td>${escHtml(u.full_name || '—')}</td>
      <td>${roleBadge(u.role)}</td>
      <td class="td-sm">${fmtDate(u.created_at?.split('T')[0] || u.created_at || '')}</td>
      <td>
        ${u.id !== 1 ? `<button class="btn-danger sm" onclick="deleteUser(${u.id})">Delete</button>` : '<span class="td-muted">Protected</span>'}
      </td>
    </tr>
  `).join('');
}

/* ── Security: XSS escape ───────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Auth ───────────────────────────────────────────────────── */
async function checkSession() {
  try {
    const res = await fetch('/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const d = await res.json();
    return d.admin || null;
  } catch { return null; }
}

function setAdminUI(admin) {
  S.admin = admin;
  $('sidebar-name').textContent  = admin.full_name || admin.username;
  $('sidebar-role').textContent  = admin.role;
  $('sidebar-avatar').textContent = (admin.full_name || admin.username).charAt(0).toUpperCase();
  // Hide users tab for non-superadmin
  if (admin.role !== 'superadmin') {
    $('users-nav-item').style.display = 'none';
  }
  $('login-screen').classList.add('hidden');
  $('dashboard').classList.remove('hidden');
}

async function doLogin(username, password) {
  const btn = $('login-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  $('login-error').classList.add('hidden');

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      $('login-error').textContent = data.error || 'Login failed';
      $('login-error').classList.remove('hidden');
      return;
    }
    setAdminUI(data.admin);
    await loadAppointments();
  } catch {
    $('login-error').textContent = 'Network error. Try again.';
    $('login-error').classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
}

async function doLogout() {
  await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  S.admin = null;
  $('dashboard').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
  $('login-password').value = '';
}

/* ── Event listeners ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  // Set today label
  $('overview-date').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  // Check existing session
  const admin = await checkSession();
  if (admin) {
    setAdminUI(admin);
    await loadAppointments();
  }

  // Login form
  $('login-form').addEventListener('submit', e => {
    e.preventDefault();
    doLogin($('login-username').value, $('login-password').value);
  });

  // Password toggle
  $('pw-toggle').addEventListener('click', () => {
    const inp = $('login-password');
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    $('pw-toggle').textContent = isText ? '👁' : '🙈';
  });

  // Logout
  $('logout-btn').addEventListener('click', doLogout);
  $('mobile-logout').addEventListener('click', doLogout);

  // Sidebar navigation
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tab);
      $('sidebar').classList.remove('open'); // close on mobile
    });
  });

  // Mobile sidebar toggle
  $('sidebar-toggle').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
  });

  // Refresh buttons
  $('overview-refresh').addEventListener('click', loadAppointments);
  $('appt-refresh').addEventListener('click', loadAppointments);

  // Appointment filters
  ['appt-search', 'appt-status-filter', 'appt-date-filter'].forEach(id => {
    $(id)?.addEventListener('input', renderAppointmentsTable);
  });
  $('appt-clear-filters').addEventListener('click', () => {
    $('appt-search').value = '';
    $('appt-status-filter').value = 'all';
    $('appt-date-filter').value = '';
    renderAppointmentsTable();
  });

  // Calendar navigation
  $('cal-prev').addEventListener('click', () => {
    S.calWeekStart = addDays(S.calWeekStart, -7);
    renderCalendar();
  });
  $('cal-next').addEventListener('click', () => {
    S.calWeekStart = addDays(S.calWeekStart, 7);
    renderCalendar();
  });
  $('cal-today').addEventListener('click', () => {
    S.calWeekStart = mondayOfWeek(new Date());
    renderCalendar();
  });

  // Add user modal
  $('add-user-btn')?.addEventListener('click', () => {
    $('add-user-form').reset();
    $('user-modal-error').classList.add('hidden');
    showModal('user-modal');
  });

  $('save-user-btn').addEventListener('click', async () => {
    const form = $('add-user-form');
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    const btn = $('save-user-btn');
    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      const res = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        $('user-modal-error').textContent = data.error || data || 'Error';
        $('user-modal-error').classList.remove('hidden');
        return;
      }
      hideModal('user-modal');
      showToast(`User "${data.username}" created.`, 'success');
      await loadUsers();
    } catch {
      $('user-modal-error').textContent = 'Network error.';
      $('user-modal-error').classList.remove('hidden');
    } finally {
      btn.disabled = false; btn.textContent = 'Create User';
    }
  });

  // Close modals
  $$('.modal-close, [data-close]').forEach(el => {
    el.addEventListener('click', () => {
      hideModal(el.dataset.close || el.closest('.modal-overlay')?.id);
    });
  });
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) hideModal(overlay.id);
    });
  });

  // Expose globals needed by inline onclick handlers
  window.updateStatus  = updateStatus;
  window.deleteUser    = deleteUser;
});
