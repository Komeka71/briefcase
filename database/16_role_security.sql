-- =====================================================================
-- BriefCase - Role-Based Security, Scoped Views & Role Procedures
-- Target RDBMS: MySQL 8.0 (InnoDB)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- File: 16_role_security.sql
-- =====================================================================

USE briefcase;

-- =====================================================================
-- SECTION 1: Session Context Functions
-- Returns session variables @app_user_id and @app_role set per request.
-- Views invoke these functions to achieve tenant & user-scoped row security.
-- =====================================================================

DROP FUNCTION IF EXISTS fn_app_user;
DROP FUNCTION IF EXISTS fn_app_role;

DELIMITER //

CREATE FUNCTION fn_app_user() 
RETURNS INT 
DETERMINISTIC 
NO SQL 
BEGIN
    RETURN @app_user_id;
END //

CREATE FUNCTION fn_app_role() 
RETURNS VARCHAR(30) 
DETERMINISTIC 
NO SQL 
BEGIN
    RETURN @app_role;
END //

DELIMITER ;

-- =====================================================================
-- SECTION 2: Idempotent Baseline Reference & Seed Data
-- Ensures COURT, LAWYER, CASE_LAWYER, DOCUMENT, HEARING, TASK have
-- valid rows for role verification without dropping or truncating tables.
-- =====================================================================

-- Courts
INSERT IGNORE INTO COURT (court_id, court_name, court_type, address, city, state) VALUES
(1, 'Gujarat High Court', 'High Court', 'S.G. Highway, Sola', 'Ahmedabad', 'Gujarat'),
(2, 'Surat District & Sessions Court', 'District Court', 'Athwalines, Near Ring Road', 'Surat', 'Gujarat'),
(3, 'City Civil & Sessions Court Ahmedabad', 'City Civil Court', 'Bhadra Fort Complex', 'Ahmedabad', 'Gujarat'),
(4, 'National Company Law Tribunal (NCLT) Ahmedabad', 'Tribunal', 'Aniket Building, C.G. Road', 'Ahmedabad', 'Gujarat'),
(5, 'Vadodara District Court', 'District Court', 'Diwalipura, Old Padra Road', 'Vadodara', 'Gujarat'),
(6, 'Supreme Court of India', 'Apex Court', 'Tilak Marg, Mandi House', 'New Delhi', 'Delhi');

-- Lawyers (Priya Patel = Lawyer A, Vikramaditya Desai = Lawyer B)
INSERT IGNORE INTO LAWYER (lawyer_id, name, bar_registration_no, email, phone, specialization, experience_years, join_date, status, department_id) VALUES
(1, 'Adv. Rajesh Mehta', 'G/1245/2005', 'rajesh.mehta@briefcase.law', '+91 98250 99881', 'Corporate & Commercial', 21, '2020-01-01', 'Active', 4),
(2, 'Adv. Priya Patel', 'G/2356/2012', 'priya.patel@briefcase.law', '+91 98791 22334', 'Constitutional & Appellate', 14, '2021-03-15', 'Active', 2),
(3, 'Adv. Vikramaditya Desai', 'G/3478/2015', 'vikram.desai@briefcase.law', '+91 98242 55667', 'White Collar Crime & Defense', 11, '2022-07-01', 'Active', 3),
(4, 'Adv. Ananya Iyer', 'G/4589/2018', 'ananya.iyer@briefcase.law', '+91 97255 88990', 'Real Estate & Infrastructure', 8, '2023-01-10', 'Active', 2),
(5, 'Adv. Mehul Choksi-Verma', 'G/5690/2019', 'mehul.verma@briefcase.law', '+91 99098 44332', 'Taxation & Intellectual Property', 7, '2023-08-01', 'Active', 4),
(6, 'Adv. Rahul Mehta', 'G/9991/2020', 'rahul.mehta@briefcase.example.com', '+91 98250 11111', 'Civil Litigation', 6, '2024-01-01', 'Active', 2),
(7, 'Adv. Farah Khan', 'G/9992/2021', 'farah.khan@briefcase.example.com', '+91 98250 22222', 'Criminal Defence', 5, '2024-02-01', 'Active', 3);

-- Case assignments in CASE_LAWYER
-- Lawyer 2 (Priya Patel): Cases 2, 5, 6
-- Lawyer 3 (Vikramaditya Desai): Cases 3, 4
-- Lawyer 4 (Ananya Iyer): Cases 7, 8
-- Notice: Lawyer 2 and Lawyer 3 have disjoint sets of cases (zero overlap)
INSERT IGNORE INTO CASE_LAWYER (case_id, lawyer_id, role, assigned_date, is_primary) VALUES
(2, 2, 'Lead Lawyer', '2026-02-01', TRUE),
(5, 2, 'Lead Lawyer', '2026-03-08', TRUE),
(6, 2, 'Lead Lawyer', '2026-03-15', TRUE),
(3, 3, 'Lead Lawyer', '2026-02-10', TRUE),
(4, 3, 'Lead Lawyer', '2026-02-28', TRUE),
(7, 4, 'Lead Lawyer', '2025-10-15', TRUE),
(8, 4, 'Lead Lawyer', '2025-08-10', TRUE);

-- Documents (including confidential document for Case 4)
INSERT IGNORE INTO DOCUMENT (document_id, case_id, document_type_id, title, description, file_path, file_size, upload_date, uploaded_by, is_confidential) VALUES
(1, 2, 2, 'Revenue Records & 7/12 Extracts', 'Ancestral land title records certified by Collector', '/uploads/cases/2/extracts.pdf', 8920100, '2026-02-03 14:10:00', 1, FALSE),
(2, 3, 1, 'Special Civil Application Memo', 'Writ memo challenging customs tariff classification', '/uploads/cases/3/sca_memo.pdf', 5120300, '2026-02-12 16:30:00', 1, FALSE),
(3, 4, 1, 'Sessions Court Interim Bail Order', 'Certified copy of interim anticipatory bail granted', '/uploads/cases/4/interim_bail.pdf', 1240100, '2026-03-02 18:00:00', 3, TRUE),
(4, 5, 3, 'Maintenance Assessment Schedule', 'Collate bank statements and maintenance schedule', '/uploads/cases/5/maintenance.pdf', 3450210, '2026-03-10 11:20:00', 1, FALSE),
(5, 7, 3, 'Memorandum of Settlement & Consent', 'Joint compromise deed duly registered', '/uploads/cases/7/settlement.pdf', 2890450, '2026-02-28 17:15:00', 1, FALSE);

-- Hearings
INSERT IGNORE INTO HEARING (hearing_id, case_id, court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes) VALUES
(1, 2, 2, '2026-11-12', '14:00:00', '15:00:00', 'Injunction application hearing under Order 39', 'Status-quo order continued', '2026-12-15', 'Court commissioner appointed for inspection'),
(2, 3, 1, '2026-11-15', '10:30:00', '11:45:00', 'Admission hearing before Division Bench 2', 'Rule issued returnable in 6 weeks', '2026-12-20', 'Interim protection granted'),
(3, 4, 2, '2026-11-20', '12:00:00', '13:00:00', 'Regular bail confirmation hearing', 'Bail confirmed with surety of Rs 1 Lakh', '2026-12-22', 'Passport deposited with IO'),
(4, 6, 1, '2026-11-25', '11:00:00', '11:30:00', 'Urgent mention for interim stay', 'Notice issued with 1 week return date', '2026-12-05', 'Direct service permitted');

-- Tasks
INSERT IGNORE INTO TASK (task_id, case_id, assigned_to, created_by, title, description, due_date, priority, status) VALUES
(1, 2, 1, 1, 'Obtain certified map from DILR', 'Submit DILR application for spot measurement of parcel 84/B', '2026-11-08', 'High', 'Pending'),
(2, 3, 1, 1, 'Track Gujarat HC daily cause list', 'Check daily sitting list for urgent item serial assignment', '2026-11-06', 'High', 'Pending'),
(3, 4, 3, 1, 'Submit compliance report to IO', 'File formal compliance affidavit before ACP Cyber Cell', '2026-11-15', 'Medium', 'Pending'),
(4, 5, 1, 1, 'Draft proposed maintenance terms', 'Collate bank passbook statements and living expenses', '2026-11-10', 'Low', 'Pending');

-- =====================================================================
-- SECTION 3: Shared Reference & Directory Views (SQL SECURITY DEFINER)
-- Non-admin roles query these views instead of base tables.
-- =====================================================================

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_ref_case_types AS
SELECT case_type_id, type_name, description
FROM CASE_TYPE;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_ref_case_status AS
SELECT status_id, status_name, description
FROM CASE_STATUS;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_ref_courts AS
SELECT court_id, court_name, court_type, address, city, state
FROM COURT;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_ref_departments AS
SELECT department_id, department_name, description
FROM DEPARTMENT;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_ref_document_types AS
SELECT document_type_id, type_name, description
FROM DOCUMENT_TYPE;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_lawyers AS
SELECT 
    l.lawyer_id,
    l.name,
    l.bar_registration_no,
    l.email,
    l.phone,
    l.specialization,
    (l.experience_years + COALESCE(TIMESTAMPDIFF(YEAR, l.join_date, CURRENT_DATE), 0)) AS experience_years,
    l.join_date,
    l.status,
    l.department_id,
    d.department_name,
    (
        SELECT COUNT(*)
        FROM CASE_LAWYER cl
        INNER JOIN CASES c ON cl.case_id = c.case_id
        INNER JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id
        WHERE cl.lawyer_id = l.lawyer_id
          AND cs.status_name NOT IN ('Closed', 'Settled')
    ) AS assigned_cases_count
FROM LAWYER l
LEFT JOIN DEPARTMENT d ON l.department_id = d.department_id;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_case_lawyers AS
SELECT 
    cl.case_id,
    l.lawyer_id,
    l.name,
    l.bar_registration_no,
    cl.role,
    cl.assigned_date,
    cl.is_primary
FROM CASE_LAWYER cl
INNER JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_users AS
SELECT user_id, name, role
FROM USERS
WHERE status = 'Active';

-- =====================================================================
-- SECTION 4: Lawyer-Scoped Views (SQL SECURITY DEFINER)
-- Filtered dynamically by "own" cases matching fn_app_user()
-- =====================================================================

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_lawyer_cases AS
SELECT 
    c.case_id,
    c.case_number,
    c.title,
    c.description,
    c.budget,
    c.priority,
    c.filed_date,
    c.expected_closure_date,
    c.actual_closure_date,
    c.notes,
    c.client_id,
    cl.name AS client_name,
    cl.phone AS client_phone,
    cl.email AS client_email,
    c.case_type_id,
    ct.type_name AS case_type,
    c.current_status_id,
    cs.status_name AS case_status
FROM CASES c
INNER JOIN CLIENT cl ON c.client_id = cl.client_id
LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
LEFT JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id
WHERE c.case_id IN (
    SELECT cl2.case_id
    FROM CASE_LAWYER cl2
    INNER JOIN LAWYER l ON cl2.lawyer_id = l.lawyer_id
    INNER JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
    WHERE u.user_id = fn_app_user()
);

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_lawyer_clients AS
SELECT DISTINCT
    cl.client_id,
    cl.name,
    cl.client_type,
    cl.phone,
    cl.email,
    cl.address,
    cl.date_of_registration
FROM CLIENT cl
INNER JOIN CASES c ON cl.client_id = c.client_id
WHERE c.case_id IN (
    SELECT cl2.case_id
    FROM CASE_LAWYER cl2
    INNER JOIN LAWYER l ON cl2.lawyer_id = l.lawyer_id
    INNER JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
    WHERE u.user_id = fn_app_user()
);

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_lawyer_hearings AS
SELECT 
    h.hearing_id,
    h.case_id,
    c.case_number,
    c.title AS case_title,
    h.court_id,
    co.court_name,
    co.city AS court_city,
    h.hearing_date,
    h.start_time,
    h.end_time,
    h.purpose,
    h.outcome,
    h.next_hearing_date,
    h.notes
FROM HEARING h
INNER JOIN CASES c ON h.case_id = c.case_id
INNER JOIN COURT co ON h.court_id = co.court_id
WHERE h.case_id IN (
    SELECT cl2.case_id
    FROM CASE_LAWYER cl2
    INNER JOIN LAWYER l ON cl2.lawyer_id = l.lawyer_id
    INNER JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
    WHERE u.user_id = fn_app_user()
);

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_lawyer_tasks AS
SELECT 
    t.task_id,
    t.title,
    t.description,
    t.due_date,
    t.priority,
    t.status,
    t.case_id,
    c.case_number,
    c.title AS case_title,
    t.assigned_to,
    t.created_by,
    u.name AS assigned_to_name
FROM TASK t
INNER JOIN CASES c ON t.case_id = c.case_id
LEFT JOIN USERS u ON t.assigned_to = u.user_id
WHERE t.case_id IN (
    SELECT cl2.case_id
    FROM CASE_LAWYER cl2
    INNER JOIN LAWYER l ON cl2.lawyer_id = l.lawyer_id
    INNER JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
    WHERE u.user_id = fn_app_user()
) OR t.assigned_to = fn_app_user();

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_lawyer_documents AS
SELECT 
    d.document_id,
    d.case_id,
    d.document_type_id,
    d.title,
    d.description,
    d.file_path,
    d.file_size,
    d.upload_date,
    d.uploaded_by,
    d.is_confidential,
    c.case_number,
    c.title AS case_title,
    dt.type_name AS document_type,
    u.name AS uploaded_by_name
FROM DOCUMENT d
LEFT JOIN CASES c ON d.case_id = c.case_id
LEFT JOIN DOCUMENT_TYPE dt ON d.document_type_id = dt.document_type_id
LEFT JOIN USERS u ON d.uploaded_by = u.user_id
WHERE d.case_id IN (
    SELECT cl2.case_id
    FROM CASE_LAWYER cl2
    INNER JOIN LAWYER l ON cl2.lawyer_id = l.lawyer_id
    INNER JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
    WHERE u.user_id = fn_app_user()
);

-- =====================================================================
-- SECTION 5: Assistant / Staff Views (SQL SECURITY DEFINER)
-- Firm-wide reads; budget is NULL; confidential documents excluded.
-- =====================================================================

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_cases AS
SELECT 
    c.case_id,
    c.case_number,
    c.title,
    c.description,
    CAST(NULL AS DECIMAL(12,2)) AS budget,
    c.priority,
    c.filed_date,
    c.expected_closure_date,
    c.actual_closure_date,
    c.notes,
    c.client_id,
    cl.name AS client_name,
    cl.phone AS client_phone,
    cl.email AS client_email,
    c.case_type_id,
    ct.type_name AS case_type,
    c.current_status_id,
    cs.status_name AS case_status
FROM CASES c
INNER JOIN CLIENT cl ON c.client_id = cl.client_id
LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
LEFT JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_clients AS
SELECT 
    client_id,
    name,
    client_type,
    phone,
    email,
    address,
    date_of_registration
FROM CLIENT;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_hearings AS
SELECT 
    h.hearing_id,
    h.case_id,
    c.case_number,
    c.title AS case_title,
    h.court_id,
    co.court_name,
    co.city AS court_city,
    h.hearing_date,
    h.start_time,
    h.end_time,
    h.purpose,
    h.outcome,
    h.next_hearing_date,
    h.notes
FROM HEARING h
INNER JOIN CASES c ON h.case_id = c.case_id
INNER JOIN COURT co ON h.court_id = co.court_id;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_tasks AS
SELECT 
    t.task_id,
    t.title,
    t.description,
    t.due_date,
    t.priority,
    t.status,
    t.case_id,
    c.case_number,
    c.title AS case_title,
    t.assigned_to,
    t.created_by,
    u.name AS assigned_to_name
FROM TASK t
INNER JOIN CASES c ON t.case_id = c.case_id
LEFT JOIN USERS u ON t.assigned_to = u.user_id;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW vw_staff_documents AS
SELECT 
    d.document_id,
    d.case_id,
    d.document_type_id,
    d.title,
    d.description,
    d.file_path,
    d.file_size,
    d.upload_date,
    d.uploaded_by,
    d.is_confidential,
    c.case_number,
    c.title AS case_title,
    dt.type_name AS document_type,
    u.name AS uploaded_by_name
FROM DOCUMENT d
LEFT JOIN CASES c ON d.case_id = c.case_id
LEFT JOIN DOCUMENT_TYPE dt ON d.document_type_id = dt.document_type_id
LEFT JOIN USERS u ON d.uploaded_by = u.user_id
WHERE d.is_confidential = 0;

-- =====================================================================
-- SECTION 6: Role-Enforced Stored Procedures (SQL SECURITY DEFINER)
-- Checks fn_app_role() and ownership; SIGNAL SQLSTATE '45000' on failure.
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_role_add_task;
DROP PROCEDURE IF EXISTS sp_role_update_task_status;
DROP PROCEDURE IF EXISTS sp_role_add_document;
DROP PROCEDURE IF EXISTS sp_lawyer_update_case_notes;
DROP PROCEDURE IF EXISTS sp_lawyer_update_hearing_outcome;
DROP PROCEDURE IF EXISTS sp_lawyer_schedule_hearing;
DROP PROCEDURE IF EXISTS sp_recalculate_invoice_status;
DROP PROCEDURE IF EXISTS sp_create_invoice;
DROP PROCEDURE IF EXISTS sp_record_payment;
DROP PROCEDURE IF EXISTS sp_case_assign_counsel;
DROP PROCEDURE IF EXISTS sp_case_remove_counsel;

DELIMITER //

-- 1. sp_role_add_task
CREATE PROCEDURE sp_role_add_task (
    IN  p_case_id     INT,
    IN  p_assigned_to INT,
    IN  p_title       VARCHAR(200),
    IN  p_description TEXT,
    IN  p_due_date    DATE,
    IN  p_priority    VARCHAR(20),
    IN  p_status      VARCHAR(20),
    OUT p_task_id     INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    IF v_role NOT IN ('Admin', 'Lawyer', 'Assistant', 'Staff') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Access denied for current role.';
    END IF;

    -- Validate case existence
    IF NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Specified case does not exist.';
    END IF;

    -- Lawyer ownership validation
    IF v_role = 'Lawyer' THEN
        SELECT COUNT(*) > 0 INTO v_is_own
        FROM CASE_LAWYER cl
        JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        WHERE cl.case_id = p_case_id AND u.user_id = v_user;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only create tasks for their own cases.';
        END IF;
    END IF;

    INSERT INTO TASK (case_id, assigned_to, created_by, title, description, due_date, priority, status)
    VALUES (p_case_id, p_assigned_to, v_user, TRIM(p_title), p_description, p_due_date, COALESCE(p_priority, 'Medium'), COALESCE(p_status, 'Pending'));

    SET p_task_id = LAST_INSERT_ID();
END //

-- 2. sp_role_update_task_status
CREATE PROCEDURE sp_role_update_task_status (
    IN p_task_id INT,
    IN p_status  VARCHAR(20)
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_case_id INT;
    DECLARE v_assigned_to INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    IF v_role NOT IN ('Admin', 'Lawyer', 'Assistant', 'Staff') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Access denied for current role.';
    END IF;

    SELECT case_id, assigned_to INTO v_case_id, v_assigned_to
    FROM TASK WHERE task_id = p_task_id;

    IF v_case_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Task record not found.';
    END IF;

    IF v_role = 'Lawyer' THEN
        IF v_assigned_to = v_user THEN
            SET v_is_own = TRUE;
        ELSE
            SELECT COUNT(*) > 0 INTO v_is_own
            FROM CASE_LAWYER cl
            JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
            JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
            WHERE cl.case_id = v_case_id AND u.user_id = v_user;
        END IF;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only update status of their own tasks.';
        END IF;
    END IF;

    UPDATE TASK
    SET status = p_status
    WHERE task_id = p_task_id;
END //

-- 3. sp_role_add_document
CREATE PROCEDURE sp_role_add_document (
    IN  p_case_id          INT,
    IN  p_document_type_id INT,
    IN  p_title            VARCHAR(200),
    IN  p_description      TEXT,
    IN  p_file_path        VARCHAR(500),
    IN  p_file_size        BIGINT,
    IN  p_is_confidential  BOOLEAN,
    OUT p_document_id      INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    IF v_role NOT IN ('Admin', 'Lawyer', 'Assistant', 'Staff') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Access denied for current role.';
    END IF;

    IF p_case_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Specified case does not exist.';
    END IF;

    IF v_role = 'Lawyer' THEN
        IF p_case_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers must link documents to a case.';
        END IF;

        SELECT COUNT(*) > 0 INTO v_is_own
        FROM CASE_LAWYER cl
        JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        WHERE cl.case_id = p_case_id AND u.user_id = v_user;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only add documents to their own cases.';
        END IF;
    END IF;

    INSERT INTO DOCUMENT (
        case_id, document_type_id, title, description, file_path, file_size, upload_date, uploaded_by, is_confidential
    ) VALUES (
        p_case_id, p_document_type_id, TRIM(p_title), p_description, p_file_path, p_file_size, NOW(), v_user, COALESCE(p_is_confidential, FALSE)
    );

    SET p_document_id = LAST_INSERT_ID();
END //

-- 4. sp_lawyer_update_case_notes
CREATE PROCEDURE sp_lawyer_update_case_notes (
    IN p_case_id INT,
    IN p_notes   TEXT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    IF NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Case record not found.';
    END IF;

    IF v_role = 'Lawyer' THEN
        SELECT COUNT(*) > 0 INTO v_is_own
        FROM CASE_LAWYER cl
        JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        WHERE cl.case_id = p_case_id AND u.user_id = v_user;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only update notes for their own cases.';
        END IF;
    ELSEIF v_role != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only Lawyers and Admins can update case notes.';
    END IF;

    UPDATE CASES
    SET notes = p_notes
    WHERE case_id = p_case_id;
END //

-- 5. sp_lawyer_update_hearing_outcome
CREATE PROCEDURE sp_lawyer_update_hearing_outcome (
    IN p_hearing_id INT,
    IN p_outcome    VARCHAR(255),
    IN p_notes      TEXT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_case_id INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    SELECT case_id INTO v_case_id FROM HEARING WHERE hearing_id = p_hearing_id;
    IF v_case_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Hearing record not found.';
    END IF;

    IF v_role = 'Lawyer' THEN
        SELECT COUNT(*) > 0 INTO v_is_own
        FROM CASE_LAWYER cl
        JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        WHERE cl.case_id = v_case_id AND u.user_id = v_user;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only update outcomes and notes of their own hearings.';
        END IF;
    ELSEIF v_role != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only Lawyers and Admins can update hearing outcomes.';
    END IF;

    UPDATE HEARING
    SET outcome = p_outcome,
        notes = p_notes
    WHERE hearing_id = p_hearing_id;
END //

-- 6. sp_lawyer_schedule_hearing
CREATE PROCEDURE sp_lawyer_schedule_hearing (
    IN  p_case_id      INT,
    IN  p_court_id     INT,
    IN  p_hearing_date DATE,
    IN  p_notes        TEXT,
    OUT p_hearing_id   INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_role VARCHAR(30);
    DECLARE v_user INT;
    DECLARE v_is_own BOOLEAN DEFAULT FALSE;

    SET v_role = fn_app_role();
    SET v_user = fn_app_user();

    IF NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Case record not found.';
    END IF;

    IF v_role = 'Lawyer' THEN
        SELECT COUNT(*) > 0 INTO v_is_own
        FROM CASE_LAWYER cl
        JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        JOIN USERS u ON LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        WHERE cl.case_id = p_case_id AND u.user_id = v_user;

        IF NOT v_is_own THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Forbidden: Lawyers can only schedule hearings for their own cases.';
        END IF;
    ELSEIF v_role != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only Lawyers and Admins can schedule hearings.';
    END IF;

    INSERT INTO HEARING (case_id, court_id, hearing_date, outcome, notes)
    VALUES (p_case_id, p_court_id, p_hearing_date, NULL, p_notes);

    SET p_hearing_id = LAST_INSERT_ID();

    SELECT * FROM HEARING WHERE hearing_id = p_hearing_id;
END //

-- 7. sp_recalculate_invoice_status
CREATE PROCEDURE sp_recalculate_invoice_status (
    IN p_invoice_id INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_total_paid DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_invoice_amount DECIMAL(12,2) DEFAULT 0.00;

    IF p_invoice_id IS NOT NULL THEN
        SELECT amount INTO v_invoice_amount FROM INVOICE WHERE invoice_id = p_invoice_id;
        IF v_invoice_amount IS NOT NULL THEN
            SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
            FROM PAYMENT
            WHERE invoice_id = p_invoice_id AND payment_status = 'Completed';

            IF v_total_paid >= v_invoice_amount AND v_invoice_amount > 0 THEN
                UPDATE INVOICE SET status = 'Paid' WHERE invoice_id = p_invoice_id;
            ELSEIF v_total_paid > 0 THEN
                UPDATE INVOICE SET status = 'Partially Paid' WHERE invoice_id = p_invoice_id;
            ELSE
                UPDATE INVOICE SET status = 'Unpaid' WHERE invoice_id = p_invoice_id;
            END IF;
        END IF;
    END IF;
END //

-- 8. sp_create_invoice
CREATE PROCEDURE sp_create_invoice (
    IN  p_case_id     INT,
    IN  p_issue_date  DATE,
    IN  p_due_date    DATE,
    IN  p_amount      DECIMAL(12,2),
    IN  p_description TEXT,
    OUT p_invoice_id  INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_year INT;
    DECLARE v_seq INT DEFAULT 1;
    DECLARE v_inv_number VARCHAR(50);

    IF fn_app_role() != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only administrators can create invoices.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Specified case does not exist.';
    END IF;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Invoice amount must be greater than zero.';
    END IF;

    IF p_due_date < p_issue_date THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Due date cannot be earlier than issue date.';
    END IF;

    SET v_year = YEAR(COALESCE(p_issue_date, CURRENT_DATE));

    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(invoice_number, '-', -1) AS UNSIGNED)), 0) + 1
    INTO v_seq
    FROM INVOICE
    WHERE invoice_number LIKE CONCAT('INV-', v_year, '-%');

    SET v_inv_number = CONCAT('INV-', v_year, '-', LPAD(v_seq, 3, '0'));

    INSERT INTO INVOICE (case_id, invoice_number, invoice_date, due_date, amount, status, description)
    VALUES (p_case_id, v_inv_number, COALESCE(p_issue_date, CURRENT_DATE), p_due_date, p_amount, 'Unpaid', p_description);

    SET p_invoice_id = LAST_INSERT_ID();

    SELECT * FROM INVOICE WHERE invoice_id = p_invoice_id;
END //

-- 9. sp_record_payment
CREATE PROCEDURE sp_record_payment (
    IN  p_case_id           INT,
    IN  p_payment_method_id INT,
    IN  p_invoice_id        INT,
    IN  p_payment_date      DATE,
    IN  p_amount            DECIMAL(12,2),
    IN  p_payment_status    VARCHAR(20),
    IN  p_description       TEXT,
    OUT p_payment_id        INT
)
SQL SECURITY DEFINER
BEGIN
    DECLARE v_invoice_amount DECIMAL(12,2);
    DECLARE v_already_paid DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_outstanding DECIMAL(12,2);

    IF fn_app_role() != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only administrators can record payments.';
    END IF;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Payment amount must be greater than zero.';
    END IF;

    IF p_invoice_id IS NOT NULL THEN
        SELECT amount INTO v_invoice_amount FROM INVOICE WHERE invoice_id = p_invoice_id;
        IF v_invoice_amount IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Linked invoice does not exist.';
        END IF;

        SELECT COALESCE(SUM(amount), 0.00) INTO v_already_paid
        FROM PAYMENT
        WHERE invoice_id = p_invoice_id AND payment_status = 'Completed';

        SET v_outstanding = v_invoice_amount - v_already_paid;

        IF p_amount > v_outstanding AND COALESCE(p_payment_status, 'Completed') = 'Completed' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Payment amount exceeds the outstanding balance.';
        END IF;
    END IF;

    INSERT INTO PAYMENT (case_id, payment_method_id, invoice_id, payment_date, amount, payment_status, description)
    VALUES (
        p_case_id,
        p_payment_method_id,
        p_invoice_id,
        COALESCE(p_payment_date, CURRENT_DATE),
        p_amount,
        COALESCE(p_payment_status, 'Completed'),
        p_description
    );

    SET p_payment_id = LAST_INSERT_ID();

    IF p_invoice_id IS NOT NULL THEN
        CALL sp_recalculate_invoice_status(p_invoice_id);
    END IF;

    SELECT p.*, pm.method_name AS payment_method, CONCAT('REC-', LPAD(p.payment_id, 4, '0')) AS payment_reference
    FROM PAYMENT p
    LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_id = pm.method_id
    WHERE p.payment_id = p_payment_id;
END //

-- 10. sp_case_assign_counsel
CREATE PROCEDURE sp_case_assign_counsel (
    IN p_case_id    INT,
    IN p_lawyer_id  INT,
    IN p_role       VARCHAR(50),
    IN p_is_primary BOOLEAN
)
SQL SECURITY DEFINER
BEGIN
    IF fn_app_role() != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only administrators can assign counsel.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CASES WHERE case_id = p_case_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Case does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM LAWYER WHERE lawyer_id = p_lawyer_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Lawyer does not exist.';
    END IF;

    IF p_is_primary THEN
        UPDATE CASE_LAWYER SET is_primary = FALSE WHERE case_id = p_case_id;
    END IF;

    INSERT INTO CASE_LAWYER (case_id, lawyer_id, role, assigned_date, is_primary)
    VALUES (p_case_id, p_lawyer_id, COALESCE(p_role, 'Associate Counsel'), CURRENT_DATE, COALESCE(p_is_primary, FALSE))
    ON DUPLICATE KEY UPDATE
        role = VALUES(role),
        is_primary = VALUES(is_primary);

    SELECT cl.*, l.name AS lawyer_name, l.email AS lawyer_email
    FROM CASE_LAWYER cl
    JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
    WHERE cl.case_id = p_case_id AND cl.lawyer_id = p_lawyer_id;
END //

-- 11. sp_case_remove_counsel
CREATE PROCEDURE sp_case_remove_counsel (
    IN p_case_id   INT,
    IN p_lawyer_id INT
)
SQL SECURITY DEFINER
BEGIN
    IF fn_app_role() != 'Admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Forbidden: Only administrators can remove counsel.';
    END IF;

    DELETE FROM CASE_LAWYER
    WHERE case_id = p_case_id AND lawyer_id = p_lawyer_id;
END //

DELIMITER //

-- PAYMENT triggers for automatic status synchronization
DROP TRIGGER IF EXISTS trg_payment_after_insert_status //
DROP TRIGGER IF EXISTS trg_payment_after_update_status //
DROP TRIGGER IF EXISTS trg_payment_after_delete_status //

CREATE TRIGGER trg_payment_after_insert_status
AFTER INSERT ON PAYMENT
FOR EACH ROW
BEGIN
    IF NEW.invoice_id IS NOT NULL THEN
        CALL sp_recalculate_invoice_status(NEW.invoice_id);
    END IF;
END //

CREATE TRIGGER trg_payment_after_update_status
AFTER UPDATE ON PAYMENT
FOR EACH ROW
BEGIN
    IF NEW.invoice_id IS NOT NULL THEN
        CALL sp_recalculate_invoice_status(NEW.invoice_id);
    END IF;
    IF OLD.invoice_id IS NOT NULL AND OLD.invoice_id != NEW.invoice_id THEN
        CALL sp_recalculate_invoice_status(OLD.invoice_id);
    END IF;
END //

CREATE TRIGGER trg_payment_after_delete_status
AFTER DELETE ON PAYMENT
FOR EACH ROW
BEGIN
    IF OLD.invoice_id IS NOT NULL THEN
        CALL sp_recalculate_invoice_status(OLD.invoice_id);
    END IF;
END //

DELIMITER ;

-- =====================================================================
-- SECTION 7: Database User Accounts & Grants (Principle of Least Privilege)
-- =====================================================================

-- 1. Dedicated Admin / App runtime account
DROP USER IF EXISTS 'briefcase_app'@'localhost';
CREATE USER 'briefcase_app'@'localhost' IDENTIFIED BY 'AppService@2026';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON briefcase.* TO 'briefcase_app'@'localhost';

-- 2. Lawyer Service Account (SELECT only on lawyer views and lookups; EXECUTE only on role procedures)
DROP USER IF EXISTS 'briefcase_lawyer'@'localhost';
CREATE USER 'briefcase_lawyer'@'localhost' IDENTIFIED BY 'LawyerSvc@2026';
GRANT SELECT ON briefcase.vw_lawyer_cases TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_lawyer_clients TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_lawyer_hearings TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_lawyer_tasks TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_lawyer_documents TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_case_lawyers TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_ref_case_types TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_ref_case_status TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_ref_courts TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_ref_departments TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_ref_document_types TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_staff_lawyers TO 'briefcase_lawyer'@'localhost';
GRANT SELECT ON briefcase.vw_staff_users TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON FUNCTION briefcase.fn_app_user TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON FUNCTION briefcase.fn_app_role TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_add_task TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_update_task_status TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_add_document TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_lawyer_update_case_notes TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_lawyer_update_hearing_outcome TO 'briefcase_lawyer'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_lawyer_schedule_hearing TO 'briefcase_lawyer'@'localhost';

-- 3. Assistant / Staff Service Account (SELECT only on staff views and lookups; EXECUTE only on staff procedures)
DROP USER IF EXISTS 'briefcase_staff'@'localhost';
CREATE USER 'briefcase_staff'@'localhost' IDENTIFIED BY 'StaffSvc@2026';
GRANT SELECT ON briefcase.vw_staff_cases TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_clients TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_hearings TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_tasks TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_documents TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_case_lawyers TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_ref_case_types TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_ref_case_status TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_ref_courts TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_ref_departments TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_ref_document_types TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_lawyers TO 'briefcase_staff'@'localhost';
GRANT SELECT ON briefcase.vw_staff_users TO 'briefcase_staff'@'localhost';
GRANT EXECUTE ON FUNCTION briefcase.fn_app_user TO 'briefcase_staff'@'localhost';
GRANT EXECUTE ON FUNCTION briefcase.fn_app_role TO 'briefcase_staff'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_add_task TO 'briefcase_staff'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_update_task_status TO 'briefcase_staff'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.sp_role_add_document TO 'briefcase_staff'@'localhost';

-- 4. Auth Service Account (EXECUTE strictly on RegisterUser and GetUserByEmail; NO table access)
DROP USER IF EXISTS 'briefcase_auth'@'localhost';
CREATE USER 'briefcase_auth'@'localhost' IDENTIFIED BY 'AuthSvc@2026';
GRANT EXECUTE ON PROCEDURE briefcase.RegisterUser TO 'briefcase_auth'@'localhost';
GRANT EXECUTE ON PROCEDURE briefcase.GetUserByEmail TO 'briefcase_auth'@'localhost';

FLUSH PRIVILEGES;

SELECT '16_role_security.sql executed successfully.' AS status;
