-- Albacete Clinic - D1 Schema

-- Specializations
CREATE TABLE specializations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Users / Staff
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','doctor','nurse','pharmacist')),
  specialization_id INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id)
);

-- Patients
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  contact_number TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_number TEXT,
  blood_type TEXT,
  known_allergies TEXT,
  medical_history_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Visits / Encounters
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  specialization_id INTEGER NOT NULL,
  visit_date TEXT DEFAULT CURRENT_TIMESTAMP,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  follow_up_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id),
  FOREIGN KEY (specialization_id) REFERENCES specializations(id)
);

-- Eye Exam (Ophthalmology-specific)
CREATE TABLE eye_exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL UNIQUE,
  va_right_uncorrected TEXT,
  va_right_corrected TEXT,
  va_left_uncorrected TEXT,
  va_left_corrected TEXT,
  iop_right REAL,
  iop_left REAL,
  refraction_right TEXT,
  refraction_left TEXT,
  anterior_segment_right TEXT,
  anterior_segment_left TEXT,
  fundus_right TEXT,
  fundus_left TEXT,
  pupil_exam TEXT,
  color_vision_test TEXT,
  additional_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Custom fields for other specialties
CREATE TABLE visit_custom_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT
);

-- Medicines / Inventory
CREATE TABLE medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT,
  manufacturer TEXT,
  supplier_id INTEGER,
  unit TEXT,
  unit_price REAL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  batch_number TEXT,
  expiry_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('in','out','adjustment')),
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  performed_by INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Prescriptions
CREATE TABLE prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL,
  medicine_id INTEGER NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  quantity_prescribed INTEGER,
  instructions TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- Appointments
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  specialization_id INTEGER NOT NULL,
  appointment_date TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled','no_show')),
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id),
  FOREIGN KEY (specialization_id) REFERENCES specializations(id)
);

-- Attachments
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  visit_id INTEGER,
  file_name TEXT NOT NULL,
  file_type TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  description TEXT,
  uploaded_by INTEGER,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Seed Data
INSERT INTO specializations (name, description) VALUES 
('Ophthalmology', 'Eye care and vision'),
('General Medicine', 'Primary healthcare'),
('Dermatology', 'Skin, hair, and nails'),
('ENT', 'Ear, Nose, and Throat'),
('Pediatrics', 'Children healthcare');

-- Initial Admin (Password: Admin123! - hashed using PBKDF2 placeholder for now)
-- Actually, I'll need to generate a real hash later or use a known one if I have a helper.
-- For now, let's put a dummy hash and I'll update it when I implement the auth.
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('System Admin', 'admin@albaceteclinic.com', 'REPLACE_WITH_HASH', 'admin');
