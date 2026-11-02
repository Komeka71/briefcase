-- =====================================================================
-- Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat
-- Department of Computer Science and Engineering
-- B.Tech. II (CSE) Semester-III | Academic Year 2026-27
-- Database Management Systems (CS203) — Practical Assignment 11
-- SECTION A: Complete Project Relational Queries Suite (Queries 1 to 8)
-- Project: BriefCase (Law Firm Practice Management & Court ERP System)
-- Target Database: MySQL 8.0 (InnoDB Storage Engine)
-- =====================================================================

USE briefcase;

-- =====================================================================
-- QUERY 1: Display all data from one of the main tables
-- Requirement: Section A.1 & Section D.2 & Section F
-- Target Main Entity: CLIENT
-- Relational Model Context: Primary client directory recording all litigants,
-- corporate retainers, government agencies, and represented parties.
-- Frontend Integration: Displayed in HTML table on /clients and /reports,
-- and rendered as XML stream via GET /api/reports/query1-clients?format=xml.
-- =====================================================================

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


-- =====================================================================
-- QUERY 2: Insert data into various tables maintaining integrity constraints
-- Requirement: Section A.2 & Section D.3
-- Target Entities: CLIENT (Primary) -> CASES (Dependent Child)
-- Integrity Constraints Maintained:
--   1. Entity Integrity: Primary key auto-generation (client_id, case_id)
--   2. Referential Integrity: Foreign key constraint fk_cases_client (CASES.client_id references CLIENT.client_id)
--   3. Domain Integrity: CHECK (budget >= 0), CHECK (priority IN ('Low','Medium','High','Urgent'))
--   4. Business Trigger Integrity: Validation triggers ensuring non-empty names and valid format
-- Transaction Scope: Atomically committed within a single database transaction.
-- Frontend Integration: Interactive form on /reports under tab 'Relational Insertion (Q2)'.
-- =====================================================================

START TRANSACTION;

-- Step 2a: Insert primary entity into CLIENT
INSERT INTO CLIENT (
    name,
    client_type,
    phone,
    email,
    address,
    date_of_registration
) VALUES (
    'Adani Ports & Special Economic Zone Ltd',
    'Organization',
    '+91 79 2656 5555',
    'legal.chambers@adani.com',
    'Adani Corporate House, Shantigram, Ahmedabad - 382421',
    CURRENT_DATE
);

SET @new_client_id = LAST_INSERT_ID();

-- Step 2b: Insert dependent entity into CASES referencing @new_client_id
INSERT INTO CASES (
    case_number,
    title,
    description,
    case_type_id,
    client_id,
    current_status_id,
    priority,
    filed_date,
    expected_closure_date,
    budget,
    notes
) VALUES (
    CONCAT('COMM/2026/', LPAD(@new_client_id, 4, '0')),
    'Commercial Arbitration on Terminal Concession Agreement',
    'Section 9 petition under Arbitration & Conciliation Act 1996 for interim maritime relief',
    4, -- Corporate & Commercial Law
    @new_client_id,
    1, -- Active / Pre-Trial
    'Urgent',
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 9 MONTH),
    750000.00,
    'Urgent commercial bench constitution requested before High Court'
);

SET @new_case_id = LAST_INSERT_ID();

COMMIT;

-- Verify inserted records and relational linkage
SELECT 
    cl.client_id,
    cl.name AS client_name,
    cl.client_type,
    c.case_id,
    c.case_number,
    c.title AS matter_title,
    c.budget,
    c.priority
FROM CLIENT cl
INNER JOIN CASES c ON cl.client_id = c.client_id
WHERE cl.client_id = @new_client_id;


-- =====================================================================
-- QUERY 3: Display ONE AGGREGATE FUNCTION RESULT from one of the main tables
-- Requirement: Section A.3 & Section D.4 & Section F
-- Target Main Entity: CASES (Financial column: budget)
-- Supported Functions: SUM, AVG, COUNT, MIN, MAX
-- Frontend Integration: Dynamic dropdown selector on /cases and /reports,
-- and XML output via GET /api/reports/query3-aggregate?func=SUM&column=budget&format=xml.
-- =====================================================================

-- 3a: Total Firm Matter Budget (SUM)
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'SUM' AS aggregate_function,
    COALESCE(SUM(budget), 0.00) AS result_value
FROM CASES;

-- 3b: Average Matter Retainer Value (AVG)
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'AVG' AS aggregate_function,
    ROUND(COALESCE(AVG(budget), 0.00), 2) AS result_value
FROM CASES;

-- 3c: Active Dockets Under Retainer (COUNT)
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'COUNT' AS aggregate_function,
    COUNT(case_id) AS result_value
FROM CASES;

-- 3d: Minimum Matter Budget with Docket Attribution (MIN)
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'MIN' AS aggregate_function,
    c.budget AS result_value,
    c.case_number,
    c.title AS case_title
FROM CASES c
WHERE c.budget = (SELECT MIN(budget) FROM CASES)
LIMIT 1;

-- 3e: Maximum Matter Budget with Docket Attribution (MAX)
SELECT 
    'CASES' AS entity,
    'budget' AS column_evaluated,
    'MAX' AS aggregate_function,
    c.budget AS result_value,
    c.case_number,
    c.title AS case_title
FROM CASES c
WHERE c.budget = (SELECT MAX(budget) FROM CASES)
LIMIT 1;


-- =====================================================================
-- QUERY 4: Display data from one of the main tables using conditions
-- Requirement: Section A.4 & Section D.5 & Section F
-- Target Main Entity: CLIENT
-- Relational Operators Demonstrated: =, >, <, >=, <=, !=, LIKE, IN, BETWEEN
-- Frontend Integration: Interactive condition builder on /reports,
-- and XML stream via GET /api/reports/query4-conditional?column=client_type&operator=%3D&value=Individual&format=xml.
-- =====================================================================

-- 4a: Equality Condition (=)
SELECT client_id, name, client_type, phone, email, address, date_of_registration
FROM CLIENT
WHERE client_type = 'Individual'
ORDER BY client_id ASC;

-- 4b: Pattern Matching Condition (LIKE)
SELECT client_id, name, client_type, phone, email, address, date_of_registration
FROM CLIENT
WHERE address LIKE '%Surat%'
ORDER BY client_id ASC;

-- 4c: Set Membership Condition (IN)
SELECT client_id, name, client_type, phone, email, address, date_of_registration
FROM CLIENT
WHERE client_type IN ('Corporate', 'Government')
ORDER BY client_id ASC;

-- 4d: Range Condition (BETWEEN) on registration dates
SELECT client_id, name, client_type, phone, email, address, date_of_registration
FROM CLIENT
WHERE date_of_registration BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR) AND CURRENT_DATE
ORDER BY date_of_registration DESC;


-- =====================================================================
-- QUERY 5: Display JOIN OPERATIONS on any two tables
-- Requirement: Section A.5 & Section D.8
-- Demonstrated Joins: INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN
-- Target Entity Combinations:
--   - CLIENT and CASES
--   - CASES and CASE_TYPE
--   - CASES and CASE_STATUS
--   - HEARING and COURT
--   - PAYMENT and PAYMENT_METHOD
-- Frontend Integration: Interactive dual-entity join builder on /reports (Tab 1).
-- =====================================================================

-- 5a: INNER JOIN (CLIENT and CASES)
-- Correlates legal matters with their legally represented client parties.
SELECT 
    cl.client_id,
    cl.name AS client_name,
    cl.client_type,
    cl.phone,
    c.case_id,
    c.case_number,
    c.title AS case_title,
    c.budget,
    c.priority
FROM CLIENT cl
INNER JOIN CASES c ON cl.client_id = c.client_id
ORDER BY cl.client_id ASC;

-- 5b: LEFT OUTER JOIN (CASES and CASE_TYPE)
-- Preserves all legal matters even if an unclassified matter type exists.
SELECT 
    c.case_id,
    c.case_number,
    c.title AS case_title,
    c.budget,
    ct.case_type_id,
    ct.type_name,
    ct.description AS type_description
FROM CASES c
LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
ORDER BY c.case_id ASC;

-- 5c: INNER JOIN (HEARING and COURT)
-- Correlates daily bench cause list hearings with judicial forums and court rooms.
SELECT 
    h.hearing_id,
    h.case_id,
    h.hearing_date,
    h.hearing_time,
    h.purpose,
    h.status,
    co.court_id,
    co.name AS court_name,
    co.court_type,
    co.city,
    co.state
FROM HEARING h
INNER JOIN COURT co ON h.court_id = co.court_id
ORDER BY h.hearing_date ASC;

-- 5d: LEFT OUTER JOIN (PAYMENT and PAYMENT_METHOD)
-- Correlates financial ledger receipts with clearing channels.
SELECT 
    p.payment_id,
    p.case_id,
    p.amount,
    p.payment_date,
    p.payment_status,
    pm.method_id,
    pm.method_name,
    pm.is_digital
FROM PAYMENT p
LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_id = pm.method_id
ORDER BY p.payment_date DESC;


-- =====================================================================
-- QUERY 6: Display some records using SUBQUERY from more than one different table
-- Requirement: Section A.6 & Section D.6
-- Purpose: Find all clients who have at least one high-stakes litigation matter
--          exceeding a budget threshold (e.g., Rs 3,00,000).
-- Execution Mechanism: The subquery evaluates CASES to extract a distinct set of
--                      qualifying client_ids; the outer query filters CLIENT.
-- Frontend Integration: Dropdown filter on /cases ('high_value') and /reports.
-- =====================================================================

SELECT 
    cl.client_id,
    cl.name,
    cl.client_type,
    cl.email,
    cl.phone,
    cl.address
FROM CLIENT cl
WHERE cl.client_id IN (
    SELECT DISTINCT c.client_id
    FROM CASES c
    WHERE c.budget >= 300000.00
)
ORDER BY cl.client_id ASC;


-- =====================================================================
-- QUERY 7: Display some records using CORELATEDQUERY from more than one different table
-- Requirement: Section A.7 & Section D.6
-- Purpose: Find all legal cases whose allocated budget strictly exceeds the
--          average budget of cases within the EXACT SAME practice area / case type.
-- Correlation Condition: c2.case_type_id = c1.case_type_id
-- Execution Mechanism: For each row evaluated in the outer query c1, the subquery
--                      dynamically calculates the specific category average for that
--                      case's case_type_id.
-- Frontend Integration: Dropdown filter on /cases ('above_average') and /reports.
-- =====================================================================

SELECT 
    c1.case_id,
    c1.case_number,
    c1.title,
    c1.budget,
    c1.priority,
    c1.filed_date,
    cl.name AS client_name,
    ct.type_name AS case_type,
    cs.status_name AS case_status,
    (
        SELECT ROUND(AVG(c2.budget), 2)
        FROM CASES c2
        WHERE c2.case_type_id = c1.case_type_id
    ) AS category_avg_budget
FROM CASES c1
INNER JOIN CLIENT cl ON c1.client_id = cl.client_id
LEFT JOIN CASE_TYPE ct ON c1.case_type_id = ct.case_type_id
LEFT JOIN CASE_STATUS cs ON c1.current_status_id = cs.status_id
WHERE c1.budget > (
    SELECT AVG(c2.budget)
    FROM CASES c2
    WHERE c2.case_type_id = c1.case_type_id
)
ORDER BY c1.budget DESC;


-- =====================================================================
-- QUERY 8: Update any one table data maintaining integrity
-- Requirement: Section A.8 & Section D.7
-- Target Entity: CASES
-- Modification: Adjust budget estimate and append client audit notes.
-- Integrity Maintained:
--   1. Domain Integrity: CHECK (budget >= 0) is enforced.
--   2. Audit Trail: Appends timestamped audit remarks without obliterating historical notes.
--   3. Foreign Key Integrity: Preserves immutable client_id and case_type_id links.
-- Frontend Integration: Form controls on /reports under tab 'Relational Update (Q8)'.
-- =====================================================================

UPDATE CASES
SET budget = 650000.00,
    notes  = CONCAT(COALESCE(notes, ''), ' | Budget revised and approved per chambers conference on ', CURRENT_DATE)
WHERE case_id = 2;

-- Verify updated state
SELECT 
    case_id,
    case_number,
    title,
    budget,
    priority,
    notes
FROM CASES
WHERE case_id = 2;

-- =====================================================================
-- End of Assignment 11 Section A Query Suite
-- =====================================================================
