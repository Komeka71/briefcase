-- =====================================================================
-- Requirement 11.C: Database Views & Trigger Interaction Analysis
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Combines: CLIENT, CASES, CASE_STATUS, and CASE_TYPE
-- Demonstrates: View creation, filtering, procedures on views, and
--               trigger impact analysis on underlying base tables.
-- =====================================================================

USE briefcase;

DROP VIEW IF EXISTS vw_client_cases;
DROP VIEW IF EXISTS vw_surat_clients;
DROP PROCEDURE IF EXISTS DisplayCasesFromView;
DROP PROCEDURE IF EXISTS FilterViewByStatus;
DROP PROCEDURE IF EXISTS UpdateClientPhoneViaView;

-- ---------------------------------------------------------------------
-- 1. Create Comprehensive View (CLIENT + CASES + CASE_TYPE + CASE_STATUS)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_client_cases AS
SELECT 
    c.case_id,
    c.case_number,
    c.title AS case_title,
    c.client_id,
    cl.name AS client_name,
    cl.client_type,
    cl.phone AS client_phone,
    cl.email AS client_email,
    ct.type_name AS case_type,
    cs.status_name AS case_status,
    c.priority,
    c.budget,
    c.filed_date,
    c.expected_closure_date
FROM CASES c
INNER JOIN CLIENT cl ON c.client_id = cl.client_id
LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
LEFT JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id;

-- ---------------------------------------------------------------------
-- 2. Create Condition-Specific View: Surat Jurisdiction Clients
-- (Filters on city condition as per assignment guidelines)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_surat_clients AS
SELECT 
    client_id,
    name AS client_name,
    client_type,
    phone,
    email,
    address,
    date_of_registration
FROM CLIENT
WHERE address LIKE '%Surat%';

-- ---------------------------------------------------------------------
-- 3. Stored Procedure: Display Cases from View
-- ---------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE DisplayCasesFromView ()
BEGIN
    SELECT * FROM vw_client_cases ORDER BY case_id ASC;
END //

-- ---------------------------------------------------------------------
-- 4. Stored Procedure: Filter View By Status
-- ---------------------------------------------------------------------
CREATE PROCEDURE FilterViewByStatus (
    IN p_status_name VARCHAR(50)
)
BEGIN
    SELECT * 
    FROM vw_client_cases
    WHERE case_status = p_status_name
    ORDER BY budget DESC;
END //

-- ---------------------------------------------------------------------
-- 5. Stored Procedure Demonstrating Updatable View & Trigger Propagation
--
-- CRITICAL MYSQL ARCHITECTURAL NOTE:
-- MySQL DOES NOT support creating triggers directly ON views
-- (e.g., CREATE TRIGGER ... ON vw_name raises ERROR 1347: Not Base Table).
-- However, when an update is dispatched to an updatable view (like vw_surat_clients),
-- MySQL's storage engine propagates the update to the base table (CLIENT).
-- Consequently:
--   - The BEFORE UPDATE validation trigger (trg_client_before_update_val) FIRES!
--   - The BEFORE UPDATE normalization trigger (trg_client_before_update_norm) FIRES!
--   - The AFTER UPDATE audit trigger (trg_client_after_update_audit) FIRES!
-- ---------------------------------------------------------------------
CREATE PROCEDURE UpdateClientPhoneViaView (
    IN p_client_id INT,
    IN p_new_phone VARCHAR(20)
)
BEGIN
    -- This update executes through the view vw_surat_clients
    UPDATE vw_surat_clients
    SET phone = p_new_phone
    WHERE client_id = p_client_id;

    -- Return the updated record directly from the view
    SELECT * FROM vw_surat_clients WHERE client_id = p_client_id;
END //

DELIMITER ;
