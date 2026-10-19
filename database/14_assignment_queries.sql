-- =====================================================================
-- Assignment 11 Section A: Complete SQL Query Implementation Suite
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Queries 1 to 8 with Requirement details, tables, and statements.
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- QUERY 1: Display all the data from one of the main tables
-- Target Table: CLIENT
-- Frontend Feature: Rendered in HTML table and available as XML output
-- ---------------------------------------------------------------------
SELECT 
    client_id,
    name,
    client_type,
    phone,
    email,
    address,
    date_of_registration
FROM CLIENT
ORDER BY client_id ASC;

-- ---------------------------------------------------------------------
-- QUERY 2: Insert data into various tables maintaining integrity constraints
-- Validates: Foreign keys, NOT NULL, CHECK constraints, and BEFORE triggers
-- ---------------------------------------------------------------------
-- Step 2a: Insert new Client
INSERT INTO CLIENT (name, client_type, phone, email, address, date_of_registration)
VALUES ('MAHESHWARI TRADING CO', 'Organization', '+91 98251 77441', 'legal@maheshwari.in', 'GIDC Khatodara, Surat', CURRENT_DATE);

SET @new_client_id = LAST_INSERT_ID();

-- Step 2b: Insert new Case associated with the client
INSERT INTO CASES (case_number, title, description, case_type_id, client_id, current_status_id, priority, filed_date, expected_closure_date, budget, notes)
VALUES (
    CONCAT('COM/2026/', LPAD(@new_client_id, 3, '0')),
    'Maheshwari Commercial Supplier Payment Recovery',
    'Commercial summary suit under Order 37 CPC for bounced supplier checks',
    1, -- Corporate
    @new_client_id,
    1, -- New
    'High',
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH),
    350000.00,
    'Urgent attachment before judgment requested'
);

-- ---------------------------------------------------------------------
-- QUERY 3: Display ONE AGGREGATE FUNCTION RESULT from one of the main tables
-- Target Column: CASES.budget
-- Frontend Feature: Dynamic function dropdown (SUM, AVG, COUNT, MIN, MAX) & XML output
-- ---------------------------------------------------------------------
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'SUM' AS aggregate_function,
    COALESCE(SUM(budget), 0.00) AS total_case_budget
FROM CASES;

-- ---------------------------------------------------------------------
-- QUERY 4: Display data from one of the main tables using condition
-- Condition: client_type = 'Individual'
-- Frontend Feature: Column, operator, and value dropdown controls & XML output
-- ---------------------------------------------------------------------
SELECT 
    client_id,
    name,
    client_type,
    phone,
    email,
    address,
    date_of_registration
FROM CLIENT
WHERE client_type = 'Individual'
ORDER BY client_id ASC;

-- ---------------------------------------------------------------------
-- QUERY 5: Display JOIN OPERATIONS on any two tables
-- Option A: INNER JOIN (CLIENT and CASES)
-- Option B: LEFT JOIN (CASES and CASE_TYPE)
-- Frontend Feature: Dynamic Table 1, Table 2, and Join Type dropdowns
-- ---------------------------------------------------------------------
-- Join Option A:
SELECT 
    cl.client_id,
    cl.name AS client_name,
    cl.client_type,
    c.case_number,
    c.title AS case_title,
    c.budget,
    c.priority
FROM CLIENT cl
INNER JOIN CASES c ON cl.client_id = c.client_id
ORDER BY c.case_id ASC;

-- Join Option B:
SELECT 
    c.case_id,
    c.case_number,
    c.title AS case_title,
    ct.type_name AS case_type,
    c.budget,
    c.filed_date
FROM CASES c
LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
ORDER BY c.case_id ASC;

-- ---------------------------------------------------------------------
-- QUERY 6: Display some records using SUBQUERY from more than one different table
-- Purpose: Find all clients who have active cases with a budget exceeding Rs 3,00,000
-- Inner Query: Retrieves client_ids from CASES meeting the budget threshold
-- Outer Query: Retrieves matching client profiles from CLIENT
-- ---------------------------------------------------------------------
SELECT 
    cl.client_id,
    cl.name,
    cl.client_type,
    cl.email,
    cl.phone
FROM CLIENT cl
WHERE cl.client_id IN (
    SELECT DISTINCT c.client_id
    FROM CASES c
    WHERE c.budget >= 300000.00
)
ORDER BY cl.client_id ASC;

-- ---------------------------------------------------------------------
-- QUERY 7: Display some records using CORELATEDQUERY from more than one different table
-- Purpose: Find all cases whose budget exceeds the average budget of all cases
--          belonging to that exact same case_type.
-- Correlation: c2.case_type_id = c1.case_type_id inside the subquery
-- ---------------------------------------------------------------------
SELECT 
    c1.case_id,
    c1.case_number,
    c1.title,
    c1.case_type_id,
    ct.type_name AS case_type,
    c1.budget,
    (
        SELECT ROUND(AVG(c2.budget), 2)
        FROM CASES c2
        WHERE c2.case_type_id = c1.case_type_id
    ) AS category_avg_budget
FROM CASES c1
INNER JOIN CASE_TYPE ct ON c1.case_type_id = ct.case_type_id
WHERE c1.budget > (
    SELECT AVG(c2.budget)
    FROM CASES c2
    WHERE c2.case_type_id = c1.case_type_id
)
ORDER BY c1.budget DESC;

-- ---------------------------------------------------------------------
-- QUERY 8: Update any one table data maintaining integrity
-- Target: Updating case budget and status while respecting check constraints
-- ---------------------------------------------------------------------
UPDATE CASES
SET budget = 500000.00,
    notes  = CONCAT(notes, ' | Revised budget approved by client.')
WHERE case_id = 1;

-- Verification of update
SELECT case_id, case_number, title, budget, notes FROM CASES WHERE case_id = 1;
