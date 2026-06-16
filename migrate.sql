-- ============================================================
-- Albacete Eye Center -- Migration v4
-- Based on confirmed live tables:
--   _cf_KV, appointments, attachments, eye_exams,
--   inventory_transactions, medicines, patients, prescriptions,
--   specializations, suppliers, users, visit_custom_fields, visits
-- Run: wrangler d1 execute albacete-clinic-db-v2 --remote --file=migrate.sql
-- ============================================================

-- ── 1. Patch patients table ─────────────────────────────────
ALTER TABLE patients ADD COLUMN patient_no         TEXT NOT NULL DEFAULT '';
ALTER TABLE patients ADD COLUMN middle_name        TEXT NOT NULL DEFAULT '';
ALTER TABLE patients ADD COLUMN sex                TEXT;
ALTER TABLE patients ADD COLUMN civil_status       TEXT;
ALTER TABLE patients ADD COLUMN city               TEXT;
ALTER TABLE patients ADD COLUMN emergency_name     TEXT;
ALTER TABLE patients ADD COLUMN emergency_phone    TEXT;
ALTER TABLE patients ADD COLUMN emergency_relation TEXT;
ALTER TABLE patients ADD COLUMN philhealth_no      TEXT;
ALTER TABLE patients ADD COLUMN photo_url          TEXT;
ALTER TABLE patients ADD COLUMN branch             TEXT NOT NULL DEFAULT 'jaro';
ALTER TABLE patients ADD COLUMN is_active          INTEGER NOT NULL DEFAULT 1;

-- Back-fill patient_no for existing rows
UPDATE patients
   SET patient_no = 'AEC-2026-' || printf('%05d', id)
 WHERE patient_no = '';

-- ── 2. New tables not yet in live DB ──────────────────────────

CREATE TABLE IF NOT EXISTS procedures (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id        INTEGER REFERENCES visits(id),
  doctor_id       INTEGER NOT NULL REFERENCES users(id),
  procedure_name  TEXT    NOT NULL,
  procedure_date  TEXT    NOT NULL,
  eye             TEXT,
  outcome         TEXT,
  complications   TEXT,
  post_op_notes   TEXT,
  follow_up_date  TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id  INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id    INTEGER REFERENCES visits(id),
  uploader_id INTEGER NOT NULL REFERENCES users(id),
  doc_type    TEXT    NOT NULL DEFAULT 'other',
  filename    TEXT    NOT NULL,
  storage_key TEXT    NOT NULL,
  mime_type   TEXT,
  file_size   INTEGER,
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  action      TEXT    NOT NULL,
  entity      TEXT    NOT NULL,
  entity_id   INTEGER NOT NULL,
  details     TEXT,
  ip_address  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- appointment_requests is the public booking table (different from appointments)
CREATE TABLE IF NOT EXISTS appointment_requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT    NOT NULL,
  apellidos       TEXT    NOT NULL DEFAULT '',
  telefono        TEXT    NOT NULL,
  email           TEXT    NOT NULL DEFAULT '',
  servicio        TEXT    NOT NULL,
  branch          TEXT    NOT NULL DEFAULT 'jaro',
  fecha_preferida TEXT,
  turno           TEXT,
  notas           TEXT    NOT NULL DEFAULT '',
  status          TEXT    NOT NULL DEFAULT 'pending',
  patient_id      INTEGER REFERENCES patients(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── 3. Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_name    ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_no      ON patients(patient_no);
CREATE INDEX IF NOT EXISTS idx_patients_phone   ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_branch  ON patients(branch);
CREATE INDEX IF NOT EXISTS idx_procedures_patient ON procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_docs_patient     ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appt_req_status  ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appt_req_created ON appointment_requests(created_at DESC);
