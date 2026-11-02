const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/app');

// Helper for making HTTP requests
function request(baseUrl, method, endpoint, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function verifyAllRoles() {
  console.log('========================================================================');
  console.log(' BRIEFCASE END-TO-END ROLE-BASED ACCESS VERIFICATION');
  console.log(' Testing over HTTP against Access Matrix (Steps 1-3)');
  console.log('========================================================================\n');

  // Start ephemeral server
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test API Server running on port ${port}...\n`);

  const results = [];
  let allPass = true;

  try {
    // -----------------------------------------------------------------
    // 1. Authentication: Login as Admin, Lawyer, Assistant
    // -----------------------------------------------------------------
    console.log('Step 1: Logging in as Admin, Lawyer, Assistant...');
    
    // Admin login
    const adminLogin = await request(baseUrl, 'POST', '/api/auth/login', null, {
      email: 'admin@briefcase.in',
      password: 'Admin@2026'
    });
    const adminToken = adminLogin.body?.token;
    results.push({
      test: 'Login as Admin (admin@briefcase.in)',
      expected: 'HTTP 200 with JWT token',
      actual: `HTTP ${adminLogin.status} (token: ${adminToken ? 'Received' : 'Missing'})`,
      passed: adminLogin.status === 200 && !!adminToken
    });

    // Lawyer login
    const lawyerLogin = await request(baseUrl, 'POST', '/api/auth/login', null, {
      email: 'priya.patel@briefcase.law',
      password: 'Lawyer@2026'
    });
    const lawyerToken = lawyerLogin.body?.token;
    results.push({
      test: 'Login as Lawyer (priya.patel@briefcase.law)',
      expected: 'HTTP 200 with JWT token',
      actual: `HTTP ${lawyerLogin.status} (token: ${lawyerToken ? 'Received' : 'Missing'})`,
      passed: lawyerLogin.status === 200 && !!lawyerToken
    });

    // Assistant login
    const staffLogin = await request(baseUrl, 'POST', '/api/auth/login', null, {
      email: 'assistant@briefcase.in',
      password: 'Assistant@2026'
    });
    const staffToken = staffLogin.body?.token;
    results.push({
      test: 'Login as Assistant (assistant@briefcase.in)',
      expected: 'HTTP 200 with JWT token',
      actual: `HTTP ${staffLogin.status} (token: ${staffToken ? 'Received' : 'Missing'})`,
      passed: staffLogin.status === 200 && !!staffToken
    });

    // -----------------------------------------------------------------
    // 2. Unauthenticated access guard (No token -> 401)
    // -----------------------------------------------------------------
    const noTokenRes = await request(baseUrl, 'GET', '/api/dashboard');
    results.push({
      test: 'Unauthenticated Request (GET /api/dashboard without token)',
      expected: 'HTTP 401 Access Denied',
      actual: `HTTP ${noTokenRes.status} (${noTokenRes.body?.message})`,
      passed: noTokenRes.status === 401
    });

    // -----------------------------------------------------------------
    // 3. Admin Registration Guard (Creating Admin without Admin token -> 403)
    // -----------------------------------------------------------------
    const registerAdminAttempt = await request(baseUrl, 'POST', '/api/auth/register', null, {
      name: 'Rogue Admin Attempt',
      email: 'rogue@briefcase.in',
      password: 'Password@123',
      role: 'Admin'
    });
    const expectedMsg = 'Admin accounts can only be created by an existing administrator.';
    results.push({
      test: 'Public Registration as Admin without Admin Token',
      expected: `HTTP 403: "${expectedMsg}"`,
      actual: `HTTP ${registerAdminAttempt.status}: "${registerAdminAttempt.body?.message}"`,
      passed: registerAdminAttempt.status === 403 && registerAdminAttempt.body?.message === expectedMsg
    });

    // -----------------------------------------------------------------
    // 4. Matrix Checks Across Roles
    // -----------------------------------------------------------------
    const matrixChecks = [
      // Dashboard
      { method: 'GET', path: '/api/dashboard', admin: 200, lawyer: 200, staff: 200, label: 'Dashboard Overview' },

      // Clients
      { method: 'GET', path: '/api/clients', admin: 200, lawyer: 200, staff: 200, label: 'Clients Registry (Read)' },
      { method: 'POST', path: '/api/clients', admin: 400, lawyer: 403, staff: 403, label: 'Clients Registry (Create)', body: {} },

      // Cases
      { method: 'GET', path: '/api/cases', admin: 200, lawyer: 200, staff: 200, label: 'Cases (Read)' },
      { method: 'POST', path: '/api/cases', admin: 400, lawyer: 403, staff: 403, label: 'Cases (Create)', body: {} },
      { method: 'PUT', path: '/api/cases/2', admin: 200, lawyer: 200, staff: 403, label: 'Cases (Update)', body: { notes: 'Updated notes' } },

      // Lawyers
      { method: 'GET', path: '/api/lawyers', admin: 200, lawyer: 200, staff: 200, label: 'Lawyers Directory (Read)' },
      { method: 'POST', path: '/api/lawyers', admin: 400, lawyer: 403, staff: 403, label: 'Lawyers (Create)', body: {} },

      // Hearings
      { method: 'GET', path: '/api/hearings', admin: 200, lawyer: 200, staff: 200, label: 'Hearings (Read)' },
      { method: 'POST', path: '/api/hearings', admin: 400, lawyer: 400, staff: 403, label: 'Hearings (Create)', body: {} },
      { method: 'PUT', path: '/api/hearings/1', admin: 200, lawyer: 200, staff: 403, label: 'Hearings (Update)', body: { outcome: 'Ongoing', notes: 'Hearing note' } },

      // Documents
      { method: 'GET', path: '/api/practice/documents', admin: 200, lawyer: 200, staff: 200, label: 'Documents (Read)' },
      { method: 'DELETE', path: '/api/practice/documents/999', admin: 200, lawyer: 403, staff: 403, label: 'Documents (Delete)' },

      // Tasks
      { method: 'GET', path: '/api/practice/tasks', admin: 200, lawyer: 200, staff: 200, label: 'Tasks (Read)' },
      { method: 'DELETE', path: '/api/practice/tasks/999', admin: 404, lawyer: 403, staff: 403, label: 'Tasks (Delete)' },

      // Finances (Invoices & Payments)
      { method: 'GET', path: '/api/practice/invoices', admin: 200, lawyer: 403, staff: 403, label: 'Finances (Invoices)' },
      { method: 'GET', path: '/api/practice/payments', admin: 200, lawyer: 403, staff: 403, label: 'Finances (Payments)' },

      // Reports (Query 1 Scoped to all roles, Query 5 Admin-only)
      { method: 'GET', path: '/api/reports/query1-clients', admin: 200, lawyer: 200, staff: 200, label: 'Reports (Query 1 Clients Scoped)' },
      { method: 'GET', path: '/api/reports/query5-join', admin: 200, lawyer: 403, staff: 403, label: 'Reports (Query 5 Join Admin-only)' },

      // Audit Logs
      { method: 'GET', path: '/api/audit', admin: 200, lawyer: 403, staff: 403, label: 'Audit Logs' },

      // Database Users
      { method: 'GET', path: '/api/auth/users', admin: 200, lawyer: 403, staff: 403, label: 'Database Users' }
    ];

    for (const check of matrixChecks) {
      const aRes = await request(baseUrl, check.method, check.path, adminToken, check.body);
      const lRes = await request(baseUrl, check.method, check.path, lawyerToken, check.body);
      const sRes = await request(baseUrl, check.method, check.path, staffToken, check.body);

      const aPass = aRes.status === check.admin;
      const lPass = lRes.status === check.lawyer;
      const sPass = sRes.status === check.staff;

      results.push({
        test: `${check.label} [${check.method} ${check.path}]`,
        expected: `Admin: ${check.admin}, Lawyer: ${check.lawyer}, Assistant: ${check.staff}`,
        actual: `Admin: ${aRes.status}, Lawyer: ${lRes.status}, Assistant: ${sRes.status}`,
        passed: aPass && lPass && sPass
      });
    }

    // -----------------------------------------------------------------
    // 5. Scoped Data Integrity Checks
    // -----------------------------------------------------------------

    // 5.1 Lawyer cases are a strict subset of firm cases
    const firmCasesRes = await request(baseUrl, 'GET', '/api/cases', adminToken);
    const lawyerCasesRes = await request(baseUrl, 'GET', '/api/cases', lawyerToken);
    const firmCases = firmCasesRes.body?.data || [];
    const lawyerCases = lawyerCasesRes.body?.data || [];

    const firmIds = firmCases.map(c => c.case_id);
    const lawyerIds = lawyerCases.map(c => c.case_id);
    const isSubset = lawyerIds.length > 0 && lawyerIds.every(id => firmIds.includes(id)) && lawyerIds.length < firmIds.length;

    results.push({
      test: "Lawyer's cases are a strict subset of firm's cases",
      expected: `Lawyer case count (${lawyerIds.length}) < Firm case count (${firmIds.length}) and all lawyer cases in firm cases`,
      actual: `Lawyer cases: [${lawyerIds.join(', ')}], Firm cases: [${firmIds.join(', ')}]`,
      passed: isSubset
    });

    // 5.2 Assistant case rows have budget: null
    const staffCasesRes = await request(baseUrl, 'GET', '/api/cases', staffToken);
    const staffCases = staffCasesRes.body?.data || [];
    const allStaffBudgetsNull = staffCases.length > 0 && staffCases.every(c => c.budget === null);
    results.push({
      test: 'Assistant case rows have budget: null',
      expected: 'All case rows have budget === null',
      actual: allStaffBudgetsNull ? `All ${staffCases.length} case records have budget: null` : 'Non-null budgets returned',
      passed: allStaffBudgetsNull
    });

    // 5.3 Assistant documents contain NO confidential rows
    const staffDocsRes = await request(baseUrl, 'GET', '/api/practice/documents', staffToken);
    const staffDocs = staffDocsRes.body?.data || [];
    const hasConfidential = staffDocs.some(d => d.is_confidential === 1 || d.is_confidential === true);
    results.push({
      test: 'Assistant documents contain no confidential rows',
      expected: 'Zero confidential documents visible to Assistant',
      actual: hasConfidential ? 'Confidential documents found!' : `0 confidential out of ${staffDocs.length} visible documents`,
      passed: !hasConfidential && staffDocs.length > 0
    });

    // 5.4 GET /api/clients scoping & JSON shape consistency
    const adminClientsRes = await request(baseUrl, 'GET', '/api/clients', adminToken);
    const lawyerClientsRes = await request(baseUrl, 'GET', '/api/clients', lawyerToken);
    const staffClientsRes = await request(baseUrl, 'GET', '/api/clients', staffToken);

    const adminClients = adminClientsRes.body?.data || [];
    const lawyerClients = lawyerClientsRes.body?.data || [];
    const staffClients = staffClientsRes.body?.data || [];

    const shapesMatch = 
      adminClientsRes.body?.success === true &&
      lawyerClientsRes.body?.success === true &&
      staffClientsRes.body?.success === true &&
      Array.isArray(adminClients) &&
      Array.isArray(lawyerClients) &&
      Array.isArray(staffClients);

    const lawyerClientSubset = lawyerClients.length < adminClients.length && lawyerClients.length > 0;
    const staffClientAll = staffClients.length === adminClients.length;

    results.push({
      test: 'GET /api/clients scoped: Lawyer own-clients vs Assistant all-clients',
      expected: `Lawyer sees own (${lawyerClients.length} < ${adminClients.length}), Assistant sees all (${staffClients.length} == ${adminClients.length}), identical JSON shape`,
      actual: `Lawyer count: ${lawyerClients.length}, Assistant count: ${staffClients.length}, Admin count: ${adminClients.length}, Shapes match: ${shapesMatch}`,
      passed: shapesMatch && lawyerClientSubset && staffClientAll
    });

    // -----------------------------------------------------------------
    // 6. Summary Table Output
    // -----------------------------------------------------------------
    console.log('\n| Test Name | Expected Result | Actual Result | Status |');
    console.log('|---|---|---|---|');
    for (const r of results) {
      const status = r.passed ? 'PASS ✅' : 'FAIL ❌';
      if (!r.passed) allPass = false;
      console.log(`| ${r.test} | ${r.expected} | ${r.actual} | **${status}** |`);
    }

    console.log('\n------------------------------------------------------------------------');
    if (allPass) {
      console.log('🎉 ALL ROLE VERIFICATION CHECKS PASSED (Steps 1, 2, 3 Complete)');
    } else {
      console.log('⚠️ SOME VERIFICATION CHECKS FAILED');
    }
    console.log('------------------------------------------------------------------------\n');

  } catch (err) {
    console.error('Verification error:', err);
    allPass = false;
  } finally {
    server.close();
    if (require.main === module) {
      const { pools } = require('../src/config/db');
      if (pools) {
        await Promise.all(Object.values(pools).map(p => p.end().catch(() => {})));
      }
      process.exit(allPass ? 0 : 1);
    }
  }
}

if (require.main === module) {
  verifyAllRoles();
}

module.exports = { verifyAllRoles };
