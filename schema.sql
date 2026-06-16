-- ============================================================
-- Clínica Oftalmológica Albacete — D1 Schema
-- Run with: wrangler d1 execute DB --file=schema.sql
-- ============================================================

-- Existing tables (unchanged)
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  role       TEXT    NOT NULL CHECK(role IN ('admin','doctor','nurse','pharmacist')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  dob           TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  dni           TEXT UNIQUE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visits (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id    INTEGER NOT NULL REFERENCES patients(id),
  doctor_id     INTEGER NOT NULL REFERENCES users(id),
  visit_date    TEXT    NOT NULL,
  reason        TEXT,
  diagnosis     TEXT,
  treatment     TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  description   TEXT,
  quantity      INTEGER NOT NULL DEFAULT 0,
  unit          TEXT    NOT NULL DEFAULT 'unidades',
  min_stock     INTEGER NOT NULL DEFAULT 10,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── NEW: Public booking form submissions ──────────────────────
CREATE TABLE IF NOT EXISTS appointment_requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT    NOT NULL,
  apellidos       TEXT    NOT NULL DEFAULT '',
  telefono        TEXT    NOT NULL,
  email           TEXT    NOT NULL DEFAULT '',
  servicio        TEXT    NOT NULL,
  fecha_preferida TEXT,
  turno           TEXT,
  notas           TEXT    NOT NULL DEFAULT '',
  status          TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending','confirmed','cancelled')),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appt_req_status
  ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appt_req_created
  ON appointment_requests(created_at DESC);
