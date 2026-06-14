-- ============================================================
-- Albacete Eye Clinic · D1 Schema
-- Run: wrangler d1 execute albacete-clinic-db --remote --file=schema.sql
-- ============================================================

-- ── Admins (clinic staff logins)
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('superadmin','staff')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Sessions (cookie-based auth)
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ── Appointments
-- NOTE: retain_until is added via ALTER TABLE in migrate.sql for existing DBs.
-- New databases get it here automatically.
CREATE TABLE IF NOT EXISTS appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL DEFAULT '',
  date         TEXT NOT NULL,
  time         TEXT NOT NULL,
  doctor       TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL DEFAULT '',
  reason       TEXT NOT NULL DEFAULT '',
  insurance    TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK(status IN ('pending','confirmed','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_appt_date   ON appointments(date, time);
CREATE INDEX IF NOT EXISTS idx_appt_status ON appointments(status);

-- ── Consent Logs (RA 10173 — proof of patient consent)
CREATE TABLE IF NOT EXISTS consent_logs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  ip_address     TEXT    NOT NULL DEFAULT '',
  user_agent     TEXT    NOT NULL DEFAULT '',
  consent_text   TEXT    NOT NULL,
  consented_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_appt ON consent_logs(appointment_id);

-- ── Audit Logs (RA 10173 — access & modification trail for SPI)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id    INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_id   INTEGER,
  detail      TEXT NOT NULL DEFAULT '',
  ip_address  TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_admin    ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_target   ON audit_logs(target_id);

-- ── Seed superadmin
-- Default password: Admin1234!
-- ⚠️  Change this password immediately after first login!
INSERT OR IGNORE INTO admins (username, password_hash, full_name, role)
VALUES (
  'admin',
  '7f8b2c1a9d4e6f3b0a5c8e2d7f4b1a9c3e6d8f2b5a7c0e3d6f9b2a4c7e0d3f6',
  'Clinic Administrator',
  'superadmin'
);
