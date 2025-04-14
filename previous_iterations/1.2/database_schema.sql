-- ===========================
-- Enable Extensions
-- ===========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;  -- Enable pgvector

-- ===========================
-- Clients Table
-- ===========================
CREATE TABLE clients (
    client_id TEXT PRIMARY KEY,  -- Last 4 SSN + Last Name
    name VARCHAR(255),
    birth_date DATE,
    section VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Personal Identifying Information
-- ===========================
CREATE TABLE personal_identifying_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    name TEXT,
    birth_date DATE,
    address TEXT,
    phone_number TEXT,
    email TEXT,
    social_security_number TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Medical History
-- ===========================
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
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
    functional_assessments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Medical Visits
-- ===========================
CREATE TABLE medical_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    date DATE,
    physician TEXT,
    location TEXT,
    reason_for_visit TEXT,
    notes TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Work History
-- ===========================
CREATE TABLE work_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    employer TEXT,
    job_title TEXT,
    start_date DATE,
    end_date DATE,
    reason_for_leaving TEXT,
    job_duties TEXT,
    supervisors TEXT,
    colleagues TEXT,
    work_environment TEXT,
    performance_reviews TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Family History
-- ===========================
CREATE TABLE family_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    family_member_name TEXT,
    relationship TEXT,
    health_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    surgeries TEXT,
    hospitalizations TEXT,
    physicians TEXT,
    therapists TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Education History
-- ===========================
CREATE TABLE education_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    institution TEXT,
    degree TEXT,
    field_of_study TEXT,
    graduation_date DATE,
    courses_taken TEXT,
    academic_achievements TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Legal History
-- ===========================
CREATE TABLE legal_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    case_number TEXT,
    court TEXT,
    case_type TEXT,
    case_status TEXT,
    judge TEXT,
    attorneys TEXT,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Financial Information
-- ===========================
CREATE TABLE financial_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    income_source TEXT,
    income_amount DECIMAL(10, 2),
    expenses DECIMAL(10, 2),
    assets DECIMAL(10, 2),
    liabilities DECIMAL(10, 2),
    bank_statements TEXT,
    tax_returns TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Embeddings for RAG Pipeline
-- ===========================
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,  -- E.g., 'PersonalIdentifyingInformation', 'MedicalHistory'
    content TEXT,  -- Raw text or summary used for embedding
    embedding VECTOR(1536),  -- Vector representation (based on model dimensions)
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- Create Indexes for Fast Retrieval
-- ===========================
-- Index for client ID for faster lookup
CREATE INDEX IF NOT EXISTS idx_embeddings_client_id
    ON embeddings(client_id);

-- Index for table_name for efficient filtering
CREATE INDEX IF NOT EXISTS idx_embeddings_table_name
    ON embeddings(table_name);

-- Vector search using HNSW for fast nearest-neighbor queries
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
    ON embeddings USING hnsw (embedding vector_l2_ops);
