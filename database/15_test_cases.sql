-- =====================================================================
-- Complete Test Suite & Assertion Runner for MySQL Workbench
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Tests all Assignment 10 and Assignment 11 requirements
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- TEST 1: CRUD Stored Procedures (Req 10.1)
-- ---------------------------------------------------------------------
-- 1a. Test Valid Insertion
CALL InsertClient('Soma Textiles Corporation', 'Organization', '+91 98251 00112', 'info@somatex.com', 'Surat SEZ', @new_id);
SELECT CONCAT('TEST 1a (InsertClient): Generated Client ID = ', @new_id) AS test_result;

-- 1b. Test Update
CALL UpdateClient(@new_id, 'Soma Textiles International Ltd', 'Organization', '+91 98251 00112', 'contact@somaint.com', 'Surat Apparel Park');
SELECT 'TEST 1b (UpdateClient): Succeeded' AS test_result;

-- 1c. Test Deletion of dependent client (Must be rejected by referential check)
-- Client ID 1 has active cases
-- Expected Result: SIGNAL SQLSTATE 45000: Integrity Error
-- CALL DeleteClient(1); -- Uncomment to verify rejection

-- 1d. Test Deletion of leaf client (@new_id has no cases)
CALL DeleteClient(@new_id);
SELECT 'TEST 1d (DeleteClient leaf): Succeeded' AS test_result;

-- ---------------------------------------------------------------------
-- TEST 2: Cursors (Req 10.4)
-- ---------------------------------------------------------------------
-- 2a. Cursor without limit
CALL DisplayAllClients();

-- 2b. Cursor with limit (First 3 clients)
CALL DisplayLimitedClients(3);

-- ---------------------------------------------------------------------
-- TEST 3: Paginated Search (Req 10.5)
-- ---------------------------------------------------------------------
-- 3a. Page 1, Page Size 4, Unfiltered
CALL PaginateClients(1, 4, '');

-- 3b. Page 2, Page Size 4, Unfiltered
CALL PaginateClients(2, 4, '');

-- 3c. Filtered search for 'Textiles'
CALL PaginateClients(1, 10, 'Textiles');

-- ---------------------------------------------------------------------
-- TEST 4: Aggregate Functions (Req 10.6)
-- ---------------------------------------------------------------------
-- 4a. Scalar Function without grouping
SELECT fn_total_case_budget() AS total_firm_budget;

-- 4b. Grouped Summary Procedure
CALL GetCaseBudgetSummaryByType();

-- 4c. Dynamic safe aggregate runner
CALL ExecuteNumericAggregate('SUM', 'CASES', 'budget');
CALL ExecuteNumericAggregate('AVG', 'CASES', 'budget');
CALL ExecuteNumericAggregate('COUNT', 'CASES', 'budget');

-- ---------------------------------------------------------------------
-- TEST 5: Triggers Validation & Normalization (Req 10.7 & 10.8)
-- ---------------------------------------------------------------------
-- 5a. Uppercase normalization & Valid insertion
INSERT INTO CLIENT (name, client_type, phone, email, address)
VALUES ('test lower case name', 'Individual', '+91 98980 00000', 'USER@TEST.COM', 'Surat Ring Road');

SET @inserted_id = LAST_INSERT_ID();

-- Check that name became UPPERCASE ('TEST LOWER CASE NAME') and email became LOWERCASE ('user@test.com')
SELECT client_id, name, email FROM CLIENT WHERE client_id = @inserted_id;

-- Clean up test row
DELETE FROM CLIENT WHERE client_id = @inserted_id;

-- 5b. Invalid Insertion Test: Empty Name (Must fail)
-- INSERT INTO CLIENT (name, client_type) VALUES ('', 'Individual'); -- Throws SQLSTATE 45000

-- 5c. Invalid Insertion Test: Bad Client Type (Must fail)
-- INSERT INTO CLIENT (name, client_type) VALUES ('Valid Name', 'Partnership'); -- Throws SQLSTATE 45000

-- ---------------------------------------------------------------------
-- TEST 6: Audit Logging (Req 10.9)
-- ---------------------------------------------------------------------
-- View recent audit log records created by above tests
SELECT 
    audit_id,
    table_name,
    operation_type,
    record_id,
    new_values,
    old_values,
    changed_at,
    changed_by
FROM application_audit_log
ORDER BY audit_id DESC
LIMIT 10;

-- ---------------------------------------------------------------------
-- TEST 7: Office Hours Trigger (Req 10.10)
-- ---------------------------------------------------------------------
-- 7a. Normal modification outside restricted hours succeeds
-- (Handled by normal test operations above)

-- 7b. Test Restricted Modification Simulation
-- SET @briefcase_simulate_monday_review = 1;
-- INSERT INTO CLIENT (name, client_type) VALUES ('Blocked Client', 'Individual');
-- Result: SQLSTATE 45000 Operation Blocked (Monday review window)
-- Reset simulation:
-- SET @briefcase_simulate_monday_review = 0;

-- ---------------------------------------------------------------------
-- TEST 8: Views & Indexes (Req 11.B & 11.C)
-- ---------------------------------------------------------------------
-- 8a. Select from view
SELECT * FROM vw_client_cases LIMIT 5;

-- 8b. Display cases from procedure wrapping view
CALL DisplayCasesFromView();

-- 8c. Filter view by status
CALL FilterViewByStatus('Hearing');

-- 8d. Test indexes
SHOW INDEX FROM CASES;
SHOW INDEX FROM CLIENT;
