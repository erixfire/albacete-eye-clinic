-- ============================================================
-- Albacete Eye Center -- Migration v3
-- Run with: wrangler d1 execute albacete-clinic-db-v2 --remote --file=migrate.sql
-- ============================================================

-- ── 1. New columns on patients ───────────────────────────────
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

-- ── 2. New columns on appointment_requests ───────────────────
ALTER TABLE appointment_requests ADD COLUMN branch     TEXT NOT NULL DEFAULT 'jaro';
ALTER TABLE appointment_requests ADD COLUMN patient_id INTEGER REFERENCES patients(id);

-- ── 3. Brand new tables ────────────────────────────────────
CREATE TABLE IF NOT EXISTS eye_exams (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id        INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exam_date       TEXT    NOT NULL DEFAULT (date('now')),
  va_od_distance  TEXT, va_os_distance TEXT,
  va_od_near      TEXT, va_os_near     TEXT,
  ref_od_sphere   REAL,  ref_od_cylinder REAL, ref_od_axis INTEGER,
  ref_os_sphere   REAL,  ref_os_cylinder REAL, ref_os_axis INTEGER,
  ref_add         REAL,
  iop_od          REAL,  iop_os REAL,  iop_method TEXT DEFAULT 'non-contact',
  slit_lamp_od    TEXT,  slit_lamp_os  TEXT,
  fundus_od       TEXT,  fundus_os     TEXT,
  oct_notes       TEXT,  color_vision  TEXT,
  confrontation   TEXT,  extra_notes   TEXT,
  created_at      TEXT   NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id            INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id          INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id           INTEGER NOT NULL REFERENCES users(id),
  rx_date             TEXT    NOT NULL DEFAULT (date('now')),
  glasses_od_sphere   REAL,  glasses_od_cylinder REAL, glasses_od_axis INTEGER,
  glasses_os_sphere   REAL,  glasses_os_cylinder REAL, glasses_os_axis INTEGER,
  glasses_add         REAL,  glasses_pd TEXT,          glasses_notes TEXT,
  medications         TEXT,
  instructions        TEXT,
  created_at          TEXT   NOT NULL DEFAULT (datetime('now'))
);

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

-- ── 4. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_name    ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_no      ON patients(patient_no);
CREATE INDEX IF NOT EXISTS idx_patients_phone   ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_branch  ON patients(branch);
CREATE INDEX IF NOT EXISTS idx_visits_patient   ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date      ON visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_eye_exams_visit  ON eye_exams(visit_id);
CREATE INDEX IF NOT EXISTS idx_rx_patient       ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_docs_patient     ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_log(created_at DESC);
