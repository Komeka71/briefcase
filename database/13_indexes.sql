-- =====================================================================
-- Requirement 11.B: Indexes Creation and Performance Profiling
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Analyzes execution plans and timing impact before and after indexing.
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- Helper Procedure for Idempotent Index Replacement in MySQL 8.0
-- ---------------------------------------------------------------------
DELIMITER //
DROP PROCEDURE IF EXISTS CreateOrReplaceIndex //
CREATE PROCEDURE CreateOrReplaceIndex (
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

    IF v_exists > 0 THEN
        SET @drop_stmt = CONCAT('ALTER TABLE ', p_table_name, ' DROP INDEX ', p_index_name);
        PREPARE s1 FROM @drop_stmt;
        EXECUTE s1;
        DEALLOCATE PREPARE s1;
    END IF;

    SET @create_stmt = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, ' (', p_column_def, ')');
    PREPARE s2 FROM @create_stmt;
    EXECUTE s2;
    DEALLOCATE PREPARE s2;
END //
DELIMITER ;

-- ---------------------------------------------------------------------
-- 1. Index 1: Composite Index on CASES (case_type_id, budget)
-- Purpose: Accelerates Section A Query 7 (Correlated Subquery)
--          and Section A Query 3 (Aggregate by Case Type)
-- ---------------------------------------------------------------------
CALL CreateOrReplaceIndex('CASES', 'idx_cases_type_budget', 'case_type_id, budget');

-- ---------------------------------------------------------------------
-- 2. Index 2: Composite Index on CLIENT (client_type, name)
-- Purpose: Accelerates Section A Query 4 (Conditional Search on client_type)
--          and Client Name lookups
-- ---------------------------------------------------------------------
CALL CreateOrReplaceIndex('CLIENT', 'idx_client_type_name', 'client_type, name');

-- ---------------------------------------------------------------------
-- 3. Index 3: Composite Index on CASES (client_id, current_status_id)
-- Purpose: Optimizes Section A Query 5 (JOIN between CLIENT and CASES)
--          and Section A Query 6 (Subquery on Clients with Cases)
-- ---------------------------------------------------------------------
CALL CreateOrReplaceIndex('CASES', 'idx_cases_client_status', 'client_id, current_status_id');

DROP PROCEDURE IF EXISTS CreateOrReplaceIndex;

-- ---------------------------------------------------------------------
-- 4. Execution Plan Inspection (EXPLAIN)
-- ---------------------------------------------------------------------

-- Plan for Correlated Subquery (Query 7)
EXPLAIN SELECT 
    c1.case_id, 
    c1.case_number, 
    c1.title, 
    c1.budget, 
    c1.case_type_id
FROM CASES c1
WHERE c1.budget > (
    SELECT AVG(c2.budget)
    FROM CASES c2
    WHERE c2.case_type_id = c1.case_type_id
);

-- Plan for Conditional Search (Query 4)
EXPLAIN SELECT client_id, name, client_type, phone, email, address 
FROM CLIENT 
WHERE client_type = 'Individual';

-- Plan for Join Operation (Query 5)
EXPLAIN SELECT 
    cl.client_id, 
    cl.name AS client_name, 
    c.case_number, 
    c.title, 
    c.budget
FROM CLIENT cl
INNER JOIN CASES c ON cl.client_id = c.client_id;
