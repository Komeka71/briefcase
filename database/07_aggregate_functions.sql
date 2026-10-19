-- =====================================================================
-- Requirement 10.6: Aggregate Functions (Without & With Grouping)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Target Column: CASES.budget (Numeric: DECIMAL(12,2))
-- =====================================================================

USE briefcase;

DROP FUNCTION IF EXISTS fn_total_case_budget;
DROP FUNCTION IF EXISTS fn_case_budget_by_type;
DROP PROCEDURE IF EXISTS GetCaseBudgetSummaryByType;
DROP PROCEDURE IF EXISTS ExecuteNumericAggregate;

DELIMITER //

-- ---------------------------------------------------------------------
-- 1. Aggregate Function Without Grouping (Scalar Function)
-- Purpose: Returns overall total budget allocated across all cases
-- ---------------------------------------------------------------------
CREATE FUNCTION fn_total_case_budget ()
RETURNS DECIMAL(14,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(14,2) DEFAULT 0.00;

    SELECT COALESCE(SUM(budget), 0.00) INTO v_total FROM CASES;

    RETURN v_total;
END //

-- ---------------------------------------------------------------------
-- 2. Aggregate Function for a Specific Group (Scalar Function)
-- Purpose: Returns total budget for a specific case_type_id
-- ---------------------------------------------------------------------
CREATE FUNCTION fn_case_budget_by_type (
    p_case_type_id INT
)
RETURNS DECIMAL(14,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_group_total DECIMAL(14,2) DEFAULT 0.00;

    SELECT COALESCE(SUM(budget), 0.00) INTO v_group_total
    FROM CASES
    WHERE case_type_id = p_case_type_id;

    RETURN v_group_total;
END //

-- ---------------------------------------------------------------------
-- 3. Grouped Aggregate Procedure
-- Purpose: Returns multi-row grouped aggregate metrics by CASE_TYPE
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetCaseBudgetSummaryByType ()
BEGIN
    SELECT 
        ct.case_type_id,
        ct.type_name,
        COUNT(c.case_id)                  AS total_cases,
        COALESCE(SUM(c.budget), 0.00)     AS total_budget,
        COALESCE(AVG(c.budget), 0.00)     AS average_budget,
        COALESCE(MIN(c.budget), 0.00)     AS min_budget,
        COALESCE(MAX(c.budget), 0.00)     AS max_budget
    FROM CASE_TYPE ct
    LEFT JOIN CASES c ON ct.case_type_id = c.case_type_id
    GROUP BY ct.case_type_id, ct.type_name
    ORDER BY total_budget DESC;
END //

-- ---------------------------------------------------------------------
-- 4. Dynamic Safe Aggregate Runner (Allowlisted Execution)
-- Purpose: Safely executes COUNT, SUM, AVG, MIN, MAX on permitted tables/columns
-- ---------------------------------------------------------------------
CREATE PROCEDURE ExecuteNumericAggregate (
    IN p_func_name   VARCHAR(10),
    IN p_table_name  VARCHAR(50),
    IN p_column_name VARCHAR(50)
)
BEGIN
    -- Strict allowlisting to prevent SQL injection
    IF UPPER(p_func_name) NOT IN ('COUNT', 'SUM', 'AVG', 'MIN', 'MAX') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Security Violation: Unsupported aggregate function requested.';
    END IF;

    IF UPPER(p_table_name) = 'CASES' AND UPPER(p_column_name) = 'BUDGET' THEN
        SET @sql = CONCAT('SELECT ''CASES'' AS entity, ''budget'' AS metric, ''', UPPER(p_func_name), ''' AS operation, COALESCE(', UPPER(p_func_name), '(budget), 0) AS result_value FROM CASES');
    ELSEIF UPPER(p_table_name) = 'INVOICE' AND UPPER(p_column_name) = 'AMOUNT' THEN
        SET @sql = CONCAT('SELECT ''INVOICE'' AS entity, ''amount'' AS metric, ''', UPPER(p_func_name), ''' AS operation, COALESCE(', UPPER(p_func_name), '(amount), 0) AS result_value FROM INVOICE');
    ELSEIF UPPER(p_table_name) = 'PAYMENT' AND UPPER(p_column_name) = 'AMOUNT' THEN
        SET @sql = CONCAT('SELECT ''PAYMENT'' AS entity, ''amount'' AS metric, ''', UPPER(p_func_name), ''' AS operation, COALESCE(', UPPER(p_func_name), '(amount), 0) AS result_value FROM PAYMENT');
    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Security Violation: Permitted tables are CASES(budget), INVOICE(amount), PAYMENT(amount).';
    END IF;

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;
