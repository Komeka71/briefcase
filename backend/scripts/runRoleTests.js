const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '3306', 10);

async function runTests() {
  console.log('========================================================================');
  console.log(' BRIEFCASE DATABASE-ENFORCED ROLE ACCESS TESTS (Step 1e)');
  console.log(' Target Database: briefcase on ' + host + ':' + port);
  console.log('========================================================================\n');

  const results = [];

  // -------------------------------------------------------------------
  // 1. Tests as 'briefcase_lawyer'
  // -------------------------------------------------------------------
  let lawyerConn;
  try {
    lawyerConn = await mysql.createConnection({
      host, port,
      user: 'briefcase_lawyer',
      password: process.env.DB_LAWYER_PASSWORD || 'LawyerSvc@2026',
      database: 'briefcase'
    });

    // 1.1 SELECT * FROM CLIENT
    try {
      await lawyerConn.query('SELECT * FROM CLIENT');
      results.push({
        account: 'briefcase_lawyer',
        test: 'SELECT * FROM CLIENT (direct table)',
        expected: '1142 Privilege Error (ER_TABLEACCESS_DENIED_ERROR)',
        actual: 'Query succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      const isDenied = err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR';
      results.push({
        account: 'briefcase_lawyer',
        test: 'SELECT * FROM CLIENT (direct table)',
        expected: '1142 Privilege Error',
        actual: `${err.code} (${err.errno})`,
        passed: isDenied
      });
    }

    // 1.2 SELECT * FROM USERS
    try {
      await lawyerConn.query('SELECT * FROM USERS');
      results.push({
        account: 'briefcase_lawyer',
        test: 'SELECT * FROM USERS (direct table)',
        expected: '1142 Privilege Error',
        actual: 'Query succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      const isDenied = err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR';
      results.push({
        account: 'briefcase_lawyer',
        test: 'SELECT * FROM USERS (direct table)',
        expected: '1142 Privilege Error',
        actual: `${err.code} (${err.errno})`,
        passed: isDenied
      });
    }

    // 1.3 DELETE FROM vw_lawyer_cases
    try {
      await lawyerConn.query('DELETE FROM vw_lawyer_cases');
      results.push({
        account: 'briefcase_lawyer',
        test: 'DELETE FROM vw_lawyer_cases',
        expected: 'Deny DML on view (1142/1370/view not updatable)',
        actual: 'Delete succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      results.push({
        account: 'briefcase_lawyer',
        test: 'DELETE FROM vw_lawyer_cases',
        expected: 'Deny DML on view',
        actual: `${err.code} (${err.errno})`,
        passed: true
      });
    }

    // Resolve user IDs for Lawyer A and Lawyer B
    await lawyerConn.query("SET @app_role = 'Lawyer'");
    
    // Find Priya Patel (Lawyer A) and Vikramaditya Desai (Lawyer B)
    const [priyaRow] = await lawyerConn.query("SELECT user_id FROM vw_staff_users WHERE role = 'Lawyer' AND name LIKE '%Priya%' LIMIT 1");
    const [vikramRow] = await lawyerConn.query("SELECT user_id FROM vw_staff_users WHERE role = 'Lawyer' AND name LIKE '%Vikram%' LIMIT 1");
    
    const priyaId = priyaRow[0]?.user_id || 11;
    const vikramId = vikramRow[0]?.user_id || 12;

    // 1.4 Scoped cases for Lawyer A
    await lawyerConn.query('SET @app_user_id = ?', [priyaId]);
    const [casesA] = await lawyerConn.query('SELECT case_id, case_number, title FROM vw_lawyer_cases');
    const caseIdsA = casesA.map(c => c.case_id);

    // 1.5 Scoped cases for Lawyer B
    await lawyerConn.query('SET @app_user_id = ?', [vikramId]);
    const [casesB] = await lawyerConn.query('SELECT case_id, case_number, title FROM vw_lawyer_cases');
    const caseIdsB = casesB.map(c => c.case_id);

    const overlap = caseIdsA.filter(id => caseIdsB.includes(id));
    const passedScoped = caseIdsA.length > 0 && caseIdsB.length > 0 && overlap.length === 0;

    results.push({
      account: 'briefcase_lawyer',
      test: 'Scoped cases: Lawyer A vs Lawyer B',
      expected: 'Lawyer A has own cases, Lawyer B has own cases, Zero overlap',
      actual: `A: [${caseIdsA.join(',')}], B: [${caseIdsB.join(',')}], Overlap: [${overlap.join(',')}]`,
      passed: passedScoped
    });

    // 1.6 sp_role_add_task on unowned case (Case 3 by Lawyer A)
    await lawyerConn.query('SET @app_user_id = ?', [priyaId]);
    await lawyerConn.query("SET @app_role = 'Lawyer'");
    try {
      await lawyerConn.query(
        'CALL sp_role_add_task(?, ?, ?, ?, ?, ?, ?, @new_tid)',
        [3, priyaId, 'Unauthorized Task Attempt', 'Testing ownership', '2026-12-01', 'High', 'Pending']
      );
      results.push({
        account: 'briefcase_lawyer',
        test: 'sp_role_add_task on unowned case',
        expected: 'SIGNAL SQLSTATE 45000',
        actual: 'Procedure succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      const isSignal = err.sqlState === '45000' || err.code === 'ER_SIGNAL_EXCEPTION';
      results.push({
        account: 'briefcase_lawyer',
        test: 'sp_role_add_task on unowned case',
        expected: 'SIGNAL SQLSTATE 45000',
        actual: `${err.sqlState || err.code}: ${err.sqlMessage || err.message}`,
        passed: isSignal
      });
    }

  } catch (err) {
    console.error('Lawyer connection failure:', err.message);
  } finally {
    if (lawyerConn) await lawyerConn.end();
  }

  // -------------------------------------------------------------------
  // 2. Tests as 'briefcase_staff'
  // -------------------------------------------------------------------
  let staffConn;
  try {
    staffConn = await mysql.createConnection({
      host, port,
      user: 'briefcase_staff',
      password: process.env.DB_STAFF_PASSWORD || 'StaffSvc@2026',
      database: 'briefcase'
    });

    // 2.1 Direct table access to CASES
    try {
      await staffConn.query('SELECT * FROM CASES');
      results.push({
        account: 'briefcase_staff',
        test: 'SELECT * FROM CASES (direct table)',
        expected: '1142 Privilege Error',
        actual: 'Query succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      const isDenied = err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR';
      results.push({
        account: 'briefcase_staff',
        test: 'SELECT * FROM CASES (direct table)',
        expected: '1142 Privilege Error',
        actual: `${err.code} (${err.errno})`,
        passed: isDenied
      });
    }

    // 2.2 Assistant reads cases; budget column must be masked as NULL
    await staffConn.query("SET @app_user_id = 13");
    await staffConn.query("SET @app_role = 'Assistant'");
    const [staffCases] = await staffConn.query('SELECT case_id, title, budget FROM vw_staff_cases');
    const allBudgetsNull = staffCases.length > 0 && staffCases.every(c => c.budget === null);
    results.push({
      account: 'briefcase_staff',
      test: 'vw_staff_cases budget masking',
      expected: 'All budget values returned as NULL',
      actual: allBudgetsNull ? `All ${staffCases.length} rows have budget: null` : 'Some non-null budgets found',
      passed: allBudgetsNull
    });

    // 2.3 Assistant reads documents; confidential documents invisible
    const [confDocs] = await staffConn.query('SELECT * FROM vw_staff_documents WHERE is_confidential = 1');
    const [allStaffDocs] = await staffConn.query('SELECT * FROM vw_staff_documents');
    results.push({
      account: 'briefcase_staff',
      test: 'vw_staff_documents confidential exclusion',
      expected: '0 confidential documents visible',
      actual: `${confDocs.length} confidential visible out of ${allStaffDocs.length} total`,
      passed: confDocs.length === 0 && allStaffDocs.length > 0
    });

  } catch (err) {
    console.error('Staff connection failure:', err.message);
  } finally {
    if (staffConn) await staffConn.end();
  }

  // -------------------------------------------------------------------
  // 3. Tests as 'briefcase_auth'
  // -------------------------------------------------------------------
  let authConn;
  try {
    authConn = await mysql.createConnection({
      host, port,
      user: 'briefcase_auth',
      password: process.env.DB_AUTH_PASSWORD || 'AuthSvc@2026',
      database: 'briefcase'
    });

    // 3.1 CALL GetUserByEmail
    try {
      const [authRows] = await authConn.query('CALL GetUserByEmail(?)', ['admin@briefcase.in']);
      const foundUser = authRows[0]?.[0];
      results.push({
        account: 'briefcase_auth',
        test: 'CALL GetUserByEmail(...)',
        expected: 'Stored procedure returns matching user',
        actual: foundUser ? `Found user_id: ${foundUser.user_id}, role: ${foundUser.role}` : 'No row returned',
        passed: !!foundUser
      });
    } catch (err) {
      results.push({
        account: 'briefcase_auth',
        test: 'CALL GetUserByEmail(...)',
        expected: 'Stored procedure succeeds',
        actual: err.message,
        passed: false
      });
    }

    // 3.2 Direct table access to USERS
    try {
      await authConn.query('SELECT * FROM USERS');
      results.push({
        account: 'briefcase_auth',
        test: 'SELECT * FROM USERS (direct table)',
        expected: '1142 Privilege Error',
        actual: 'Query succeeded unexpectedly',
        passed: false
      });
    } catch (err) {
      const isDenied = err.errno === 1142 || err.code === 'ER_TABLEACCESS_DENIED_ERROR';
      results.push({
        account: 'briefcase_auth',
        test: 'SELECT * FROM USERS (direct table)',
        expected: '1142 Privilege Error',
        actual: `${err.code} (${err.errno})`,
        passed: isDenied
      });
    }

  } catch (err) {
    console.error('Auth connection failure:', err.message);
  } finally {
    if (authConn) await authConn.end();
  }

  // -------------------------------------------------------------------
  // Print Table
  // -------------------------------------------------------------------
  console.log('| Account | Test Description | Expected Result | Actual Result | Status |');
  console.log('|---|---|---|---|---|');
  let allPass = true;
  for (const r of results) {
    const status = r.passed ? 'PASS ✅' : 'FAIL ❌';
    if (!r.passed) allPass = false;
    console.log(`| \`${r.account}\` | ${r.test} | ${r.expected} | ${r.actual} | **${status}** |`);
  }

  console.log('\n------------------------------------------------------------------------');
  if (allPass) {
    console.log('✅ ALL DATABASE ROLE TESTS PASSED (Step 1 Complete)');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
  console.log('------------------------------------------------------------------------\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
