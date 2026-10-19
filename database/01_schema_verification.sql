-- =====================================================================
-- BriefCase - Law Firm Case Management System
-- Schema Verification and Table Creation Script
-- Target RDBMS: MySQL 8.0.16+ (InnoDB Engine)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- =====================================================================

CREATE DATABASE IF NOT EXISTS briefcase;
USE briefcase;

-- ---------------------------------------------------------------------
-- 1. Reference / Independent Tables
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CLIENT (
    client_id            INT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    client_type          VARCHAR(30) NOT NULL,  -- Individual / Organization
    phone                VARCHAR(20),
    email                VARCHAR(150),
    address              VARCHAR(255),
    date_of_registration DATE NOT NULL DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DEPARTMENT (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CASE_TYPE (
    case_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name    VARCHAR(100) NOT NULL UNIQUE,            
    description  VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CASE_STATUS (
    status_id   INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,              -- New / Filed / Hearing / Settled / Closed ...
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DOCUMENT_TYPE (
    document_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name        VARCHAR(100) NOT NULL UNIQUE,        -- Evidence / Petition / Contract ...
    description      VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PAYMENT_METHOD (
    method_id   INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL UNIQUE,              -- UPI / Cash / Card / Bank Transfer
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS COURT (
    court_id   INT AUTO_INCREMENT PRIMARY KEY,
    court_name VARCHAR(150) NOT NULL,
    court_type VARCHAR(50),
    address    VARCHAR(255),
    city       VARCHAR(80),
    state      VARCHAR(80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS USERS (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL,                  -- Admin / Lawyer / Assistant / Staff
    status        VARCHAR(20)  DEFAULT 'Active',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Tables with Foreign Keys to Reference Tables
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS LAWYER (
    lawyer_id           INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    bar_registration_no VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(150) UNIQUE,
    phone               VARCHAR(20),
    specialization      VARCHAR(100),
    experience_years    INT,
    join_date           DATE,
    status              VARCHAR(20) DEFAULT 'Active',     -- Active / Inactive
    department_id       INT,
    CONSTRAINT chk_lawyer_experience CHECK (experience_years IS NULL OR experience_years >= 0),
    CONSTRAINT fk_lawyer_department FOREIGN KEY (department_id)
        REFERENCES DEPARTMENT(department_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PARTY (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. CASES (Central Entity)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CASES (
    case_id               INT AUTO_INCREMENT PRIMARY KEY,
    case_number           VARCHAR(50)  NOT NULL UNIQUE,
    title                 VARCHAR(200) NOT NULL,
    description           TEXT,
    case_type_id          INT,
    client_id             INT NOT NULL,
    current_status_id     INT,
    priority              VARCHAR(20) DEFAULT 'Medium',   -- Low / Medium / High
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Associative Tables (Many-to-Many Relationships)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CASE_LAWYER (
    case_id       INT NOT NULL,
    lawyer_id     INT NOT NULL,
    role          VARCHAR(30) DEFAULT 'Associate',        -- Lead Lawyer / Associate / Reviewer
    assigned_date DATE DEFAULT (CURRENT_DATE),
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (case_id, lawyer_id),
    CONSTRAINT fk_caselawyer_case   FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_caselawyer_lawyer FOREIGN KEY (lawyer_id)
        REFERENCES LAWYER(lawyer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CASE_PARTY (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Appointments, Documents, Hearings
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS APPOINTMENT (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    client_id        INT  NOT NULL,
    lawyer_id        INT  NOT NULL,
    appointment_date DATE NOT NULL,
    start_time       TIME,
    end_time         TIME,
    purpose          VARCHAR(255),
    status           VARCHAR(20) DEFAULT 'Scheduled',
    notes            TEXT,
    CONSTRAINT chk_appt_time CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time),
    CONSTRAINT fk_appt_client FOREIGN KEY (client_id)
        REFERENCES CLIENT(client_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appt_lawyer FOREIGN KEY (lawyer_id)
        REFERENCES LAWYER(lawyer_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DOCUMENT (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS HEARING (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Billing (Invoices & Payments)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS INVOICE (
    invoice_id     INT AUTO_INCREMENT PRIMARY KEY,
    case_id        INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date   DATE DEFAULT (CURRENT_DATE),
    due_date       DATE,
    amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status         VARCHAR(20) DEFAULT 'Unpaid',
    description    VARCHAR(255),
    CONSTRAINT chk_invoice_amount CHECK (amount >= 0),
    CONSTRAINT chk_invoice_dates  CHECK (invoice_date IS NULL OR due_date IS NULL OR due_date >= invoice_date),
    CONSTRAINT fk_invoice_case FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PAYMENT (
    payment_id        INT AUTO_INCREMENT PRIMARY KEY,
    case_id           INT NOT NULL,
    payment_method_id INT,
    invoice_id        INT NULL,                           -- NULL = advance payment not tied to an invoice
    payment_date      DATE DEFAULT (CURRENT_DATE),
    amount            DECIMAL(12,2) NOT NULL,
    payment_status    VARCHAR(20) DEFAULT 'Completed',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Workflow & Status History
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CASE_STATUS_HISTORY (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TASK (
    task_id     INT AUTO_INCREMENT PRIMARY KEY,
    case_id     INT NOT NULL,
    assigned_to INT,
    created_by  INT,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    due_date    DATE,
    priority    VARCHAR(20) DEFAULT 'Medium',
    status      VARCHAR(20) DEFAULT 'Pending',
    CONSTRAINT fk_task_case        FOREIGN KEY (case_id)
        REFERENCES CASES(case_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_task_assigned_to FOREIGN KEY (assigned_to)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_task_created_by  FOREIGN KEY (created_by)
        REFERENCES USERS(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Existing Indexes (Idempotent Helper for MySQL 8.0)
-- ---------------------------------------------------------------------

DELIMITER //
DROP PROCEDURE IF EXISTS AddIndexIfNotExists //
CREATE PROCEDURE AddIndexIfNotExists (
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_column_def VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name;

    IF v_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, ' (', p_column_def, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL AddIndexIfNotExists('CASES',   'idx_case_filed_date',  'filed_date');
CALL AddIndexIfNotExists('HEARING', 'idx_hearing_date',     'hearing_date');
CALL AddIndexIfNotExists('TASK',    'idx_task_due_date',    'due_date');
CALL AddIndexIfNotExists('INVOICE', 'idx_invoice_due_date', 'due_date');
CALL AddIndexIfNotExists('PAYMENT', 'idx_payment_date',     'payment_date');

DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

-- Verification: List created tables
SHOW TABLES;
