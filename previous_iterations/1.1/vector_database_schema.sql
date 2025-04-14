-- ===========================
-- Enable pgvector if not already enabled
-- ===========================
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================
-- Clients Table
-- ===========================
CREATE TABLE IF NOT EXISTS Clients (
    client_id TEXT PRIMARY KEY, -- last4_ssn_lastname format
    name VARCHAR(255),
    birth_date DATE,
    section CHAR(1)
);

-- ===========================
-- Personal Identifying Information
-- ===========================
CREATE TABLE IF NOT EXISTS PersonalIdentifyingInformation (
    personal_info_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    name VARCHAR(255),
    birth_date DATE,
    address TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    social_security_number VARCHAR(11)
);

-- ===========================
-- Medical History
-- ===========================
CREATE TABLE IF NOT EXISTS MedicalHistory (
    medical_history_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    allergies TEXT,
    surgeries TEXT,
    hospitalizations TEXT,
    physicians TEXT,
    therapists TEXT,
    lab_results TEXT,
    imaging_results TEXT,
    mental_health_evaluations TEXT,
    functional_assessments TEXT
);

-- ===========================
-- Work History
-- ===========================
CREATE TABLE IF NOT EXISTS WorkHistory (
    work_history_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    employer VARCHAR(255),
    job_title VARCHAR(255),
    start_date DATE,
    end_date DATE,
    reason_for_leaving TEXT,
    job_duties TEXT,
    supervisors TEXT,
    colleagues TEXT,
    work_environment TEXT,
    performance_reviews TEXT
);

-- ===========================
-- Family History
-- ===========================
CREATE TABLE IF NOT EXISTS FamilyHistory (
    family_history_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    family_member_name VARCHAR(255),
    relationship VARCHAR(255),
    health_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    surgeries TEXT,
    hospitalizations TEXT,
    physicians TEXT,
    therapists TEXT
);

-- ===========================
-- Education History
-- ===========================
CREATE TABLE IF NOT EXISTS EducationHistory (
    education_history_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    institution VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_date DATE,
    courses_taken TEXT,
    academic_achievements TEXT
);

-- ===========================
-- Legal History
-- ===========================
CREATE TABLE IF NOT EXISTS LegalHistory (
    legal_history_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    case_number VARCHAR(255),
    court VARCHAR(255),
    case_type VARCHAR(255),
    case_status VARCHAR(255),
    judge VARCHAR(255),
    attorneys TEXT,
    outcome TEXT
);

-- ===========================
-- Financial Information
-- ===========================
CREATE TABLE IF NOT EXISTS FinancialInformation (
    financial_info_id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    income_source TEXT,
    income_amount DECIMAL(10, 2),
    expenses DECIMAL(10, 2),
    assets DECIMAL(10, 2),
    liabilities DECIMAL(10, 2),
    bank_statements TEXT,
    tax_returns TEXT
);

-- ===========================
-- === UNIFIED EMBEDDINGS TABLE ===
-- ===========================
CREATE TABLE IF NOT EXISTS Embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES Clients(client_id) ON DELETE CASCADE,
    table_name TEXT NOT NULL, -- e.g., 'PersonalIdentifyingInformation', 'MedicalHistory'
    content TEXT, -- Raw text or summary used for embedding
    embedding VECTOR(1536), -- Vector representation (dimension size based on model)
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Create Indexes for Fast Retrieval
-- ===========================
-- Index for client ID for faster lookup
CREATE INDEX IF NOT EXISTS idx_embeddings_client_id
    ON Embeddings(client_id);

-- Index for table_name for efficient filtering
CREATE INDEX IF NOT EXISTS idx_embeddings_table_name
    ON Embeddings(table_name);

-- Vector search using HNSW for faster embedding queries
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
    ON Embeddings USING hnsw (embedding vector_l2_ops);
