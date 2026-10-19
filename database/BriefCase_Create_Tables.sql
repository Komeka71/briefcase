-- =====================================================================
--  BriefCase - Law Firm Case Management System
--  Database creation script (MySQL 8.0.16+ / InnoDB)
--  Tables: 20  (CASE and USER are reserved words, so they are created
--  as CASES and USERS)
-- =====================================================================


CREATE DATABASE briefcase;
USE briefcase;

-- ---------------------------------------------------------------------
-- 1. Independent / reference tables
-- ---------------------------------------------------------------------

CREATE TABLE CLIENT (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    client_type VARCHAR(30) NOT NULL,  -- Individual / Organization
    phone VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255),
    date_of_registration DATE NOT NULL DEFAULT (CURRENT_DATE)
)

CREATE TABLE DEPARTMENT (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(255)
);

CREATE TABLE CASE_TYPE (
    case_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name    VARCHAR(100) NOT NULL UNIQUE,            
    description  VARCHAR(255)
)

CREATE TABLE CASE_STATUS (
    status_id   INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,              -- New / Filed / Hearing / Settled / Closed ...
    description VARCHAR(255)
)

CREATE TABLE DOCUMENT_TYPE (
    document_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name        VARCHAR(100) NOT NULL UNIQUE,        -- Evidence / Petition / Contract ...
    description      VARCHAR(255)
) 

CREATE TABLE PAYMENT_METHOD (
    method_id   INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL UNIQUE,              -- UPI / Cash / Card / Bank Transfer
    description VARCHAR(255)
) 

CREATE TABLE COURT (
    court_id   INT AUTO_INCREMENT PRIMARY KEY,
    court_name VARCHAR(150) NOT NULL,
    court_type VARCHAR(50),
    address    VARCHAR(255),
    city       VARCHAR(80),
    state      VARCHAR(80)
)

CREATE TABLE USERS (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL,                  -- Admin / Lawyer / Assistant / Staff
    status        VARCHAR(20),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) 

-- ---------------------------------------------------------------------
-- 2. Tables with foreign keys to the tables above
-- ---------------------------------------------------------------------

CREATE TABLE LAWYER (
    lawyer_id           INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    bar_registration_no VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(150) UNIQUE,
    phone               VARCHAR(20),
    specialization      VARCHAR(100),
    experience_years    INT,
    join_date           DATE,
    status              VARCHAR(20),                      -- Active / Inactive
    department_id       INT,
    CONSTRAINT chk_lawyer_experience CHECK (experience_years IS NULL OR experience_years >= 0),
    CONSTRAINT fk_lawyer_department FOREIGN KEY (department_id)
        REFERENCES DEPARTMENT(department_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

CREATE TABLE PARTY (
    party_id        INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    party_type      VARCHAR(30),                          -- Plaintiff / Defendant / Petitioner / Respondent
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         VARCHAR(255),
    is_organization BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      INT,
    CONSTRAINT fk_party_created_by FOREIGN KEY (created_by)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

-- ---------------------------------------------------------------------
-- 3. CASES (central entity)
-- ---------------------------------------------------------------------

CREATE TABLE CASES (
    case_id               INT AUTO_INCREMENT PRIMARY KEY,
    case_number           VARCHAR(50)  NOT NULL UNIQUE,
    title                 VARCHAR(200) NOT NULL,
    description           TEXT,
    case_type_id          INT,
    client_id             INT NOT NULL,
    current_status_id     INT,
    priority              VARCHAR(20),                    -- Low / Medium / High
    filed_date            DATE,
    expected_closure_date DATE,
    actual_closure_date   DATE,
    budget                DECIMAL(12,2),
    notes                 TEXT,
    CONSTRAINT chk_case_budget CHECK (budget IS NULL OR budget >= 0),
    CONSTRAINT chk_case_dates  CHECK (expected_closure_date IS NULL OR filed_date IS NULL
                                      OR expected_closure_date >= filed_date),
    CONSTRAINT fk_case_type   FOREIGN KEY (case_type_id)
        REFERENCES CASE_TYPE(case_type_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_case_client FOREIGN KEY (client_id)
        REFERENCES CLIENT(client_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_case_status FOREIGN KEY (current_status_id)
        REFERENCES CASE_STATUS(status_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

-- ---------------------------------------------------------------------
-- 4. Associative tables (M:N)
-- ---------------------------------------------------------------------

CREATE TABLE CASE_LAWYER (
    case_id       INT NOT NULL,
    lawyer_id     INT NOT NULL,
    role          VARCHAR(30),                            -- Lead Lawyer / Associate / Reviewer
    assigned_date DATE,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (case_id, lawyer_id),
    CONSTRAINT fk_caselawyer_case   FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_caselawyer_lawyer FOREIGN KEY (lawyer_id)
        REFERENCES LAWYER(lawyer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
)

CREATE TABLE CASE_PARTY (
    case_id  INT NOT NULL,
    party_id INT NOT NULL,
    role     VARCHAR(30),                                 -- Plaintiff / Defendant / Petitioner / Respondent
    notes    VARCHAR(255),
    PRIMARY KEY (case_id, party_id),
    CONSTRAINT fk_caseparty_case  FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_caseparty_party FOREIGN KEY (party_id)
        REFERENCES PARTY(party_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) 

-- ---------------------------------------------------------------------
-- 5. Appointments, documents, hearings
-- ---------------------------------------------------------------------

CREATE TABLE APPOINTMENT (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    client_id        INT  NOT NULL,
    lawyer_id        INT  NOT NULL,
    appointment_date DATE NOT NULL,
    start_time       TIME,
    end_time         TIME,
    purpose          VARCHAR(255),
    status           VARCHAR(20),
    notes            TEXT,
    CONSTRAINT chk_appt_time CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time),
    CONSTRAINT fk_appt_client FOREIGN KEY (client_id)
        REFERENCES CLIENT(client_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appt_lawyer FOREIGN KEY (lawyer_id)
        REFERENCES LAWYER(lawyer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
)

CREATE TABLE DOCUMENT (
    document_id      INT AUTO_INCREMENT PRIMARY KEY,
    case_id          INT NULL,                            -- NULL = general (non-case) document
    document_type_id INT,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    file_path        VARCHAR(500) NOT NULL,
    file_size        BIGINT,                              -- in bytes
    upload_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by      INT,
    is_confidential  BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_doc_size CHECK (file_size IS NULL OR file_size >= 0),
    CONSTRAINT fk_doc_case FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_doc_type FOREIGN KEY (document_type_id)
        REFERENCES DOCUMENT_TYPE(document_type_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_doc_uploaded_by FOREIGN KEY (uploaded_by)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

CREATE TABLE HEARING (
    hearing_id        INT AUTO_INCREMENT PRIMARY KEY,
    case_id           INT  NOT NULL,
    court_id          INT  NOT NULL,
    hearing_date      DATE NOT NULL,
    start_time        TIME,
    end_time          TIME,
    purpose           VARCHAR(255),
    outcome           VARCHAR(255),
    next_hearing_date DATE,
    notes             TEXT,
    CONSTRAINT chk_hearing_time CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time),
    CONSTRAINT chk_hearing_next CHECK (next_hearing_date IS NULL OR next_hearing_date >= hearing_date),
    CONSTRAINT fk_hearing_case  FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hearing_court FOREIGN KEY (court_id)
        REFERENCES COURT(court_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) 

-- ---------------------------------------------------------------------
-- 6. Billing
-- ---------------------------------------------------------------------

CREATE TABLE INVOICE (
    invoice_id     INT AUTO_INCREMENT PRIMARY KEY,
    case_id        INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date   DATE,
    due_date       DATE,
    amount         DECIMAL(12,2),
    status         VARCHAR(20),
    description    VARCHAR(255),
    CONSTRAINT chk_invoice_amount CHECK (amount IS NULL OR amount >= 0),
    CONSTRAINT chk_invoice_dates  CHECK (invoice_date IS NULL OR due_date IS NULL OR due_date >= invoice_date),
    CONSTRAINT fk_invoice_case FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) 

CREATE TABLE PAYMENT (
    payment_id        INT AUTO_INCREMENT PRIMARY KEY,
    case_id           INT NOT NULL,
    payment_method_id INT,
    invoice_id        INT NULL,                           -- NULL = payment not tied to an invoice
    payment_date      DATE,
    amount            DECIMAL(12,2) NOT NULL,
    payment_status    VARCHAR(20),
    description       VARCHAR(255),
    CONSTRAINT chk_payment_amount CHECK (amount >= 0),
    CONSTRAINT fk_payment_case    FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payment_method  FOREIGN KEY (payment_method_id)
        REFERENCES PAYMENT_METHOD(method_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id)
        REFERENCES INVOICE(invoice_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

-- ---------------------------------------------------------------------
-- 7. Workflow & audit
-- ---------------------------------------------------------------------

CREATE TABLE CASE_STATUS_HISTORY (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id    INT NOT NULL,
    status_id  INT NOT NULL,
    changed_by INT,
    changed_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks    VARCHAR(255),
    CONSTRAINT fk_hist_case   FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hist_status FOREIGN KEY (status_id)
        REFERENCES CASE_STATUS(status_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hist_user   FOREIGN KEY (changed_by)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
)

CREATE TABLE TASK (
    task_id     INT AUTO_INCREMENT PRIMARY KEY,
    case_id     INT NOT NULL,
    assigned_to INT,
    created_by  INT,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    due_date    DATE,
    priority    VARCHAR(20),
    status      VARCHAR(20),
    CONSTRAINT fk_task_case        FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_task_assigned_to FOREIGN KEY (assigned_to)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_task_created_by  FOREIGN KEY (created_by)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) 

-- ---------------------------------------------------------------------
-- 8. Optional: helpful indexes for common searches
-- ---------------------------------------------------------------------

CREATE INDEX idx_case_filed_date   ON CASES(filed_date);
CREATE INDEX idx_hearing_date      ON HEARING(hearing_date);
CREATE INDEX idx_task_due_date     ON TASK(due_date);
CREATE INDEX idx_invoice_due_date  ON INVOICE(due_date);
CREATE INDEX idx_payment_date      ON PAYMENT(payment_date);

-- ---------------------------------------------------------------------
-- 9. Optional: starter data for lookup tables
-- ---------------------------------------------------------------------

INSERT INTO CASE_STATUS (status_name, description) VALUES
    ('New',     'Case registered, not yet filed'),
    ('Filed',   'Case filed in court'),
    ('Hearing', 'Hearings in progress'),
    ('Settled', 'Case settled'),
    ('Closed',  'Case closed');

INSERT INTO CASE_TYPE (type_name, description) VALUES
    ('Criminal',  'Criminal matters'),
    ('Civil',     'Civil disputes'),
    ('Corporate', 'Corporate and commercial matters'),
    ('Family',    'Family law matters');

INSERT INTO DOCUMENT_TYPE (type_name, description) VALUES
    ('Evidence', 'Evidence submitted for a case'),
    ('Petition', 'Petitions and applications'),
    ('Contract', 'Agreements and contracts');

INSERT INTO PAYMENT_METHOD (method_name, description) VALUES
    ('UPI',           'Unified Payments Interface'),
    ('Cash',          'Cash payment'),
    ('Card',          'Debit / credit card'),
    ('Bank Transfer', 'NEFT / RTGS / IMPS');


