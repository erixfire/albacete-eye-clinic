-- ============================================================
-- Albacete Eye Center & Medical Clinics — D1 Schema
-- Run with: wrangler d1 execute DB --file=schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  role       TEXT    NOT NULL CHECK(role IN ('admin','doctor','nurse','pharmacist','frontdesk')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Patients ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_no         TEXT    NOT NULL UNIQUE,  -- e.g. AEC-2026-00001
  first_name         TEXT    NOT NULL,
  last_name          TEXT    NOT NULL,
  middle_name        TEXT    DEFAULT '',
  dob                TEXT,
  sex                TEXT    CHECK(sex IN ('Male','Female','Other')),
  civil_status       TEXT,
  phone              TEXT,
  email              TEXT,
  address            TEXT,
  city               TEXT,
  emergency_name     TEXT,
  emergency_phone    TEXT,
  emergency_relation TEXT,
  blood_type         TEXT,
  allergies          TEXT,
  medical_history    TEXT,
  philhealth_no      TEXT,
  photo_url          TEXT,
  branch             TEXT    DEFAULT 'jaro' CHECK(branch IN ('jaro','cabatuan')),
  is_active          INTEGER NOT NULL DEFAULT 1,
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_patients_name     ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_no       ON patients(patient_no);
CREATE INDEX IF NOT EXISTS idx_patients_phone    ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_branch   ON patients(branch);

-- ── Visits ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       INTEGER NOT NULL REFERENCES users(id),
  visit_date      TEXT    NOT NULL DEFAULT (date('now')),
  visit_type      TEXT    NOT NULL DEFAULT 'consult'
                          CHECK(visit_type IN ('consult','follow-up','procedure','emergency')),
  chief_complaint TEXT,
  diagnosis       TEXT,
  treatment       TEXT,
  notes           TEXT,
  status          TEXT    NOT NULL DEFAULT 'scheduled'
                          CHECK(status IN ('scheduled','checked-in','seen','done','cancelled')),
  follow_up_date  TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_visits_patient    ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date       ON visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_doctor     ON visits(doctor_id);

-- ── Eye Examination Records ──────────────────────────────────
CREATE TABLE IF NOT EXISTS eye_exams (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id          INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id        INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exam_date         TEXT    NOT NULL DEFAULT (date('now')),
  -- Visual Acuity
  va_od_distance    TEXT,  -- e.g. 20/20
  va_os_distance    TEXT,
  va_od_near        TEXT,
  va_os_near        TEXT,
  -- Refraction
  ref_od_sphere     REAL,
  ref_od_cylinder   REAL,
  ref_od_axis       INTEGER,
  ref_os_sphere     REAL,
  ref_os_cylinder   REAL,
  ref_os_axis       INTEGER,
  ref_add           REAL,   -- reading addition
  -- IOP (eye pressure)
  iop_od            REAL,
  iop_os            REAL,
  iop_method        TEXT    DEFAULT 'non-contact',
  -- Slit lamp / fundus
  slit_lamp_od      TEXT,
  slit_lamp_os      TEXT,
  fundus_od         TEXT,
  fundus_os         TEXT,
  oct_notes         TEXT,
  -- Color vision / other
  color_vision      TEXT,
  confrontation     TEXT,
  extra_notes       TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_eye_exams_patient ON eye_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_eye_exams_visit   ON eye_exams(visit_id);

-- ── Prescriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id        INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       INTEGER NOT NULL REFERENCES users(id),
  rx_date         TEXT    NOT NULL DEFAULT (date('now')),
  -- Eyeglass Rx
  glasses_od_sphere   REAL,
  glasses_od_cylinder REAL,
  glasses_od_axis     INTEGER,
  glasses_os_sphere   REAL,
  glasses_os_cylinder REAL,
  glasses_os_axis     INTEGER,
  glasses_add         REAL,
  glasses_pd          TEXT,
  glasses_notes       TEXT,
  -- Medications
  medications     TEXT,  -- JSON array: [{name, dosage, frequency, duration, notes}]
  instructions    TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rx_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_rx_visit   ON prescriptions(visit_id);

-- ── Surgical / Procedure Records ─────────────────────────────
CREATE TABLE IF NOT EXISTS procedures (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id        INTEGER REFERENCES visits(id),
  doctor_id       INTEGER NOT NULL REFERENCES users(id),
  procedure_name  TEXT    NOT NULL,
  procedure_date  TEXT    NOT NULL,
  eye             TEXT    CHECK(eye IN ('OD','OS','OU','N/A')),
  outcome         TEXT,
  complications   TEXT,
  post_op_notes   TEXT,
  follow_up_date  TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_procedures_patient ON procedures(patient_id);

-- ── Documents / Attachments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id        INTEGER REFERENCES visits(id),
  uploader_id     INTEGER NOT NULL REFERENCES users(id),
  doc_type        TEXT    NOT NULL
                          CHECK(doc_type IN ('lab','imaging','referral','consent','other')),
  filename        TEXT    NOT NULL,
  storage_key     TEXT    NOT NULL,  -- R2 object key
  mime_type       TEXT,
  file_size       INTEGER,
  notes           TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_docs_patient ON documents(patient_id);

-- ── Audit Log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  action      TEXT    NOT NULL,  -- 'view','create','update','delete','print'
  entity      TEXT    NOT NULL,  -- 'patient','visit','prescription', etc.
  entity_id   INTEGER NOT NULL,
  details     TEXT,
  ip_address  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_entity   ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user     ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_log(created_at DESC);

-- ── Appointment Requests (public booking form) ───────────────
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
  status          TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending','confirmed','cancelled')),
  patient_id      INTEGER REFERENCES patients(id),  -- linked once converted
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appt_req_status  ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appt_req_created ON appointment_requests(created_at DESC);
