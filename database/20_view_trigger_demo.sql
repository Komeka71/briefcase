-- =====================================================================
-- Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat
-- Department of Computer Science and Engineering
-- B.Tech. II (CSE) Semester-III | Academic Year 2026-27
-- Database Management Systems (CS203) — Practical Assignment 11
-- SECTION C: Database Views & Trigger Interaction Analysis
-- Script: 20_view_trigger_demo.sql
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- Part C: CREATE VIEW from TWO tables combined on a condition (City: Surat)
-- Combines: CLIENT and CASES
-- Filter: Only records where the represented client is located in Surat.
-- ---------------------------------------------------------------------

DROP VIEW IF EXISTS vw_surat_litigation;

CREATE OR REPLACE VIEW vw_surat_litigation AS
SELECT 
    c.case_id,
    c.case_number,
    c.title AS case_title,
    c.budget,
    c.priority,
    c.filed_date,
    cl.client_id,
    cl.name AS client_name,
    cl.client_type,
    cl.phone AS client_phone,
    cl.email AS client_email,
    cl.address AS client_address
FROM CASES c
INNER JOIN CLIENT cl ON c.client_id = cl.client_id
WHERE cl.address LIKE '%Surat%';

-- ---------------------------------------------------------------------
-- Part C.1: Saved Stored Procedure to Display Data from View
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_display_surat_litigation;
DROP PROCEDURE IF EXISTS sp_insert_client_case_surat;

DELIMITER //

CREATE PROCEDURE sp_display_surat_litigation(
    IN p_min_budget DECIMAL(12,2)
)
BEGIN
    SELECT 
        case_id,
        case_number,
        case_title,
        budget,
        priority,
        client_name,
        client_type,
        client_phone,
        client_address
    FROM vw_surat_litigation
    WHERE budget >= COALESCE(p_min_budget, 0.00)
    ORDER BY budget DESC;
END //

-- Stored Procedure to Insert Client and Case into the Surat Jurisdiction
CREATE PROCEDURE sp_insert_client_case_surat(
    IN p_name VARCHAR(100),
    IN p_type VARCHAR(50),
    IN p_phone VARCHAR(20),
    IN p_email VARCHAR(100),
    IN p_surat_address VARCHAR(255),
    IN p_case_title VARCHAR(200),
    IN p_budget DECIMAL(12,2)
)
BEGIN
    DECLARE v_client_id INT;
    DECLARE v_case_number VARCHAR(50);

    -- Ensure address complies with Surat condition
    IF p_surat_address NOT LIKE '%Surat%' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Client address must reside within Surat judicial territory.';
    END IF;

    -- Insert into primary CLIENT table
    -- Trigger 'trg_client_before_insert_norm' and 'trg_client_before_insert_val' execute automatically
    INSERT INTO CLIENT (name, client_type, phone, email, address, date_of_registration)
    VALUES (p_name, p_type, p_phone, p_email, p_surat_address, CURRENT_DATE);

    SET v_client_id = LAST_INSERT_ID();
    SET v_case_number = CONCAT('SURAT/2026/', LPAD(v_client_id, 4, '0'));

    -- Insert into dependent CASES table
    INSERT INTO CASES (case_number, title, case_type_id, client_id, current_status_id, priority, filed_date, budget)
    VALUES (v_case_number, p_case_title, 1, v_client_id, 1, 'Medium', CURRENT_DATE, p_budget);

    -- Return the newly formed record from the View
    SELECT * FROM vw_surat_litigation WHERE client_id = v_client_id;
END //

DELIMITER ;


-- ---------------------------------------------------------------------
-- Part C.2: Trigger Validation Analysis on View Operations
--
-- ARCHITECTURAL PRINCIPLE:
-- Under MySQL 8.0, INSTEAD OF triggers on views are not natively supported
-- (ERROR 1347: Not Base Table). However, views serve as transparent
-- projections over base relational tables.
-- When DML statements target an updatable view or when stored procedures
-- mutate base tables through views:
--   1. The base table's BEFORE INSERT / BEFORE UPDATE validation triggers
--      fire IMMEDIATELY.
--   2. Invalid data violating domain rules (e.g. malformed phone, empty email,
--      negative budget) is aborted with SIGNAL SQLSTATE '45000'.
--   3. Successful mutations trigger AFTER INSERT / AFTER UPDATE audit triggers,
--      recording mutations in AUDIT_LOG with old and new values.
-- ---------------------------------------------------------------------

-- TEST 1: Execute Saved Procedure to Display Data from View
CALL sp_display_surat_litigation(100000.00);

-- TEST 2: Execute Saved Procedure with Valid Data (Triggers Validate & Allow)
CALL sp_insert_client_case_surat(
    'Surat Diamond Bourse Consortium',
    'Organization',
    '+91 261 247 8899',
    'legal@suratdiamondbourse.in',
    'Khajod Dream City, Surat - 395007',
    'Special Civil Suit on Diamond Export Customs Clearance',
    450000.00
);

-- TEST 3: Verify Trigger Validation Rejection (Negative Budget Violating Domain Constraint)
-- Attempting to insert an invalid budget triggers MySQL check/trigger rejection:
/*
-- UNCOMMENT TO OBSERVE SIGNAL REJECTION:
CALL sp_insert_client_case_surat(
    'Invalid Data Client',
    'Individual',
    '+91 98250 99999',
    'invalid@example.com',
    'Ring Road, Surat',
    'Invalid Negative Budget Suit',
    -50000.00 -- Violates CHECK (budget >= 0)
);
-- Result: Error 3819 (HY000): Check constraint 'chk_case_budget' is violated.
*/

-- TEST 4: Direct Updatable View Mutation & Underlying Trigger Propagation
-- Updating the updatable view vw_surat_clients propagates to CLIENT table
-- and invokes trg_client_before_update_norm + trg_client_after_update_audit:
UPDATE vw_surat_clients
SET phone = '+91 98250 11223'
WHERE client_name LIKE '%Surat Diamond Bourse%'
LIMIT 1;

-- Verify Audit Log Captured the View Mutation:
SELECT 
    audit_id,
    table_name,
    operation_type,
    record_id,
    changed_by,
    changed_at,
    old_values,
    new_values
FROM application_audit_log
WHERE table_name = 'CLIENT'
ORDER BY audit_id DESC
LIMIT 3;

-- =====================================================================
-- End of Section C View & Trigger Suite
-- =====================================================================
