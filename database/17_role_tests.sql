-- =====================================================================
-- BriefCase - Role Access Tests Script
-- Runs SQL verifications across each role-based database account
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- File: 17_role_tests.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- TEST SET 1: Test as 'briefcase_lawyer'
-- Connection credentials: briefcase_lawyer / LawyerSvc@2026
-- ---------------------------------------------------------------------

-- Test 1.1: Direct table access to CLIENT must be DENIED (Expected: ER_TABLEACCESS_DENIED_ERROR 1142)
-- SELECT * FROM CLIENT;

-- Test 1.2: Direct table access to USERS must be DENIED (Expected: ER_TABLEACCESS_DENIED_ERROR 1142)
-- SELECT * FROM USERS;

-- Test 1.3: DML on view vw_lawyer_cases must be DENIED (Expected: ER_TABLEACCESS_DENIED_ERROR / ER_SPECIFIC_ACCESS_DENIED_ERROR)
-- DELETE FROM vw_lawyer_cases;

-- Test 1.4: Scoped cases for Lawyer A (Priya Patel, user_id = 11)
-- SET @app_user_id = 11;
-- SET @app_role = 'Lawyer';
-- SELECT case_id, case_number, title FROM vw_lawyer_cases;

-- Test 1.5: Scoped cases for Lawyer B (Vikramaditya Desai, user_id = 12)
-- SET @app_user_id = 12;
-- SET @app_role = 'Lawyer';
-- SELECT case_id, case_number, title FROM vw_lawyer_cases;

-- Test 1.6: Lawyer A attempting to add task to Case 3 (owned by Lawyer B) -> Expected: SIGNAL 45000
-- SET @app_user_id = 11;
-- SET @app_role = 'Lawyer';
-- CALL sp_role_add_task(3, 11, 'Unauthorized Task', 'Should fail', '2026-12-01', 'High', 'Pending', @tid);

-- ---------------------------------------------------------------------
-- TEST SET 2: Test as 'briefcase_staff'
-- Connection credentials: briefcase_staff / StaffSvc@2026
-- ---------------------------------------------------------------------

-- Test 2.1: Direct table access to CASES must be DENIED (Expected: ER_TABLEACCESS_DENIED_ERROR 1142)
-- SELECT * FROM CASES;

-- Test 2.2: Assistant reads cases; budget column must be masked as NULL
-- SET @app_user_id = 13;
-- SET @app_role = 'Assistant';
-- SELECT case_id, case_number, title, budget FROM vw_staff_cases;

-- Test 2.3: Assistant reads documents; confidential documents must be INVISIBLE (count of is_confidential = 1 must be 0)
-- SELECT COUNT(*) AS confidential_docs_count FROM vw_staff_documents WHERE is_confidential = 1;

-- ---------------------------------------------------------------------
-- TEST SET 3: Test as 'briefcase_auth'
-- Connection credentials: briefcase_auth / AuthSvc@2026
-- ---------------------------------------------------------------------

-- Test 3.1: GetUserByEmail stored procedure EXECUTE works
-- CALL GetUserByEmail('admin@briefcase.in');

-- Test 3.2: Direct table access to USERS must be DENIED (Expected: ER_TABLEACCESS_DENIED_ERROR 1142)
-- SELECT * FROM USERS;
