-- Main client table with composite primary key
CREATE TABLE clients (
    client_id TEXT PRIMARY KEY,  -- Last 4 of SSN + Last Name
    name TEXT,
    birth_date DATE,
    section TEXT
);

-- Personal info
CREATE TABLE personal_identifying_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    name TEXT,
    birth_date DATE,
    address TEXT,
    phone_number TEXT,
    email TEXT,
    social_security_number TEXT
);

-- Medical history
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    functional_assessments TEXT
);

-- Each medical visit is separate and linked to a client
CREATE TABLE medical_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    date TEXT,
    physician TEXT,
    location TEXT,
    reason_for_visit TEXT,
    notes TEXT,
    recommendations TEXT
);

-- Work history
CREATE TABLE work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    employer TEXT,
    job_title TEXT,
    start_date TEXT,
    end_date TEXT,
    reason_for_leaving TEXT,
    job_duties TEXT,
    supervisors TEXT,
    colleagues TEXT,
    work_environment TEXT,
    performance_reviews TEXT
);

-- Family history
CREATE TABLE family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    family_member_name TEXT,
    relationship TEXT,
    health_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    surgeries TEXT,
    hospitalizations TEXT,
    physicians TEXT,
    therapists TEXT
);

-- Education history
CREATE TABLE education_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    institution TEXT,
    degree TEXT,
    field_of_study TEXT,
    graduation_date TEXT,
    courses_taken TEXT,
    academic_achievements TEXT
);

-- Legal history
CREATE TABLE legal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    case_number TEXT,
    court TEXT,
    case_type TEXT,
    case_status TEXT,
    judge TEXT,
    attorneys TEXT,
    outcome TEXT
);

-- Financial information
CREATE TABLE financial_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT REFERENCES clients(client_id) ON DELETE CASCADE,
    income_source TEXT,
    income_amount TEXT,
    expenses TEXT,
    assets TEXT,
    liabilities TEXT,
    bank_statements TEXT,
    tax_returns TEXT
);
