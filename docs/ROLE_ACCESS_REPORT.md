# BriefCase: Role-Based Access Control (RBAC) Implementation Report

**System:** BriefCase — Law Firm Practice Management System  
**Stack:** MySQL 8.0, Node.js / Express, React / Vite  
**Scope:** Three-tier database-enforced role-based access for **Admin**, **Lawyer**, and **Assistant**  
**Course Context:** SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project  
**Date:** November 2026  

---

## 1. Executive Summary

This implementation delivers **database-enforced role-based access control (RBAC)** across BriefCase's three primary actors:
1. **Admin (Database Administrator):** Unrestricted access to firm data, user management, audit logs, financial ledgers, analytical reports, and raw PL/SQL management via `briefcase_app`.
2. **Lawyer:** Scoped access strictly to assigned cases, associated clients, hearings, tasks, and non-sensitive case documents via `briefcase_lawyer`. Financial records and unassigned cases are inaccessible at the MySQL engine level.
3. **Assistant (Staff):** Firm-wide administrative support access via `briefcase_staff`. Can view all cases (with the `budget` column masked as `NULL`), clients, hearings, and non-confidential documents; can create/update tasks and log documents. Access to financial records, analytics, audit logs, and confidential documents is denied.

### Three-Tier Enforcement Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React / Vite)                         │
│  • RequireAuth route guards (403/401 redirect)                         │
│  • Role-filtered navigation in Layout.jsx (Zero visual/CSS change)     │
│  • Axios 401/403 response interceptor                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express / Node.js)                     │
│  • verifyToken extracts user_id and role from verified JWT            │
│  • dbContext selects dedicated connection pool per role:               │
│      - Admin     -> adminPool  (User: briefcase_app)                   │
│      - Lawyer    -> lawyerPool (User: briefcase_lawyer)                │
│      - Assistant -> staffPool  (User: briefcase_staff)                 │
│      - Auth      -> authPool   (User: briefcase_auth)                  │
│  • Pre-query context execution: SET @app_user_id = ?, @app_role = ?    │
│  • Privilege errors (1142, 1044, 1370) & SIGNAL 45000 -> HTTP 403      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ MySQL Session Context & Pools
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (MySQL 8.0)                            │
│  • Zero direct SELECT/INSERT/UPDATE/DELETE table grants for non-admins │
│  • SQL SECURITY DEFINER views filter by fn_app_user() & fn_app_role()  │
│  • Write procedures enforce case ownership with SIGNAL SQLSTATE '45000'│
│  • Dedicated DB user accounts with strict least-privilege GRANTs       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Demo User Credentials

The following four demo accounts are seeded and available in the database:

| Role | Name | Email | Password | Database User Pool | Key Scope & Restrictions |
|---|---|---|---|---|---|
| **Admin** | Managing Partner / DBA | `admin@briefcase.in` | `Admin@2026` | `briefcase_app` | Full firm access: finances, audit logs, users, reports, PL/SQL console. |
| **Lawyer A** | Adv. Priya Patel | `priya.patel@briefcase.law` | `Lawyer@2026` | `briefcase_lawyer` | Assigned to Cases #2, #5, #6. Views only own cases, clients, hearings, tasks. Cannot see unassigned cases or firm finances. |
| **Lawyer B** | Adv. Vikramaditya Desai | `vikram.desai@briefcase.law` | `Lawyer@2026` | `briefcase_lawyer` | Assigned to Cases #3, #4. Used to verify strict zero-overlap and case isolation between lawyers. |
| **Assistant** | Priya Nair (Staff) | `assistant@briefcase.in` | `Assistant@2026` | `briefcase_staff` | Firm-wide support: views all cases (budget masked as `NULL`), clients, hearings, non-confidential documents. Finances & audit logs blocked. |

---

## 3. Role Access Matrix

| Feature / Resource | HTTP Endpoint | Admin | Lawyer | Assistant | Enforcement Mechanism |
|---|---|:---:|:---:|:---:|---|
| **Dashboard Overview** | `GET /api/dashboard` | Full (firm KPIs + financial metrics) | Scoped (own counts, `financials: null`) | Scoped (firm counts, `financials: null`) | Database views & backend controller |
| **Clients (Read)** | `GET /api/clients` | All clients (`CLIENT` table) | Assigned clients (`vw_lawyer_clients`) | All clients (`vw_staff_clients`) | Views + `fn_app_user()` session context |
| **Clients (Create)** | `POST /api/clients` | Full (`InsertClient` SP) | 403 Forbidden | 403 Forbidden | Route middleware + MySQL procedure GRANT |
| **Clients (Update/Delete)** | `PUT/DELETE /api/clients/:id` | Full (`UpdateClient` / `DeleteClient`) | 403 Forbidden | 403 Forbidden | Route middleware + MySQL procedure GRANT |
| **Cases (Read)** | `GET /api/cases` | All cases + full budgets | Scoped to assigned cases (`vw_lawyer_cases`) | All cases; `budget: null` (`vw_staff_cases`) | View definition + `fn_app_user()` |
| **Cases (Create)** | `POST /api/cases` | Full (`InsertCase` SP) | 403 Forbidden | 403 Forbidden | Route middleware + MySQL procedure GRANT |
| **Cases (Update Notes)** | `PUT /api/cases/:id` | Full | Own cases only (`sp_lawyer_update_case_notes`) | 403 Forbidden | Stored Procedure + `SIGNAL SQLSTATE '45000'` |
| **Lawyers Directory (Read)** | `GET /api/lawyers` | Full directory | Full directory (`vw_ref_lawyers`) | Full directory (`vw_staff_lawyers`) | Read-only reference views |
| **Lawyers (Manage)** | `POST/PUT/DELETE /api/lawyers` | Full (`InsertLawyer`, etc.) | 403 Forbidden | 403 Forbidden | Route middleware + MySQL procedure GRANT |
| **Hearings (Read)** | `GET /api/hearings` | All hearings | Scoped to assigned cases (`vw_lawyer_hearings`) | All hearings (`vw_staff_hearings`) | Views + `fn_app_user()` session context |
| **Hearings (Create)** | `POST /api/hearings` | Full (`InsertHearing` SP) | 403 Forbidden | 403 Forbidden | Route middleware + MySQL procedure GRANT |
| **Hearings (Update Outcome)** | `PUT /api/hearings/:id` | Full | Own cases only (`sp_lawyer_update_hearing_outcome`) | 403 Forbidden | Stored Procedure + `SIGNAL SQLSTATE '45000'` |
| **Documents (Read)** | `GET /api/practice/documents` | All documents | Own/assigned case documents (`vw_lawyer_documents`) | Non-confidential only (`vw_staff_documents`) | Views: `is_confidential = 0` filter for staff |
| **Documents (Upload)** | `POST /api/practice/documents` | Full | Permitted on own cases (`sp_role_add_document`) | Permitted (`sp_role_add_document`) | Stored Procedure + ownership check |
| **Documents (Delete)** | `DELETE /api/practice/documents/:id`| Full | 403 Forbidden | 403 Forbidden | Route middleware + MySQL privilege revoking |
| **Tasks (Read)** | `GET /api/practice/tasks` | All tasks | Own/assigned case tasks (`vw_lawyer_tasks`) | All tasks (`vw_staff_tasks`) | Views + `fn_app_user()` session context |
| **Tasks (Create)** | `POST /api/practice/tasks` | Full | Permitted on own cases (`sp_role_add_task`) | Permitted (`sp_role_add_task`) | Stored Procedure + ownership check |
| **Tasks (Status Update)** | `PATCH /api/practice/tasks/:id/status`| Full | Permitted on own tasks (`sp_role_update_task_status`)| Permitted (`sp_role_update_task_status`)| Stored Procedure + ownership check |
| **Tasks (Delete)** | `DELETE /api/practice/tasks/:id`| Full | 403 Forbidden | 403 Forbidden | Route middleware + MySQL privilege revoking |
| **Finances (Invoices & Payments)**| `GET /api/practice/invoices` | Full access | 403 Forbidden | 403 Forbidden | Route middleware + no DB grants |
| **Analytical Reports** | `GET /api/reports/*` | All reports | 403 Forbidden | 403 Forbidden | Route middleware + no DB grants |
| **PL/SQL Console** | `POST /api/practice/plsql` | Full access | 403 Forbidden | 403 Forbidden | Route middleware (Admin only) |
| **Audit Logs** | `GET /api/audit` | Full firm audit log | 403 Forbidden | 403 Forbidden | Route middleware + no DB grants |
| **User Administration** | `GET/DELETE /api/auth/users` | Full access (`GetAllUsers`) | 403 Forbidden | 403 Forbidden | Route middleware + no DB grants |
| **Register New Admin** | `POST /api/auth/register` (Admin)| Permitted (requires Admin JWT)| 403 Forbidden | 403 Forbidden | `authController` token role validation |

---

## 4. MySQL Accounts, Functions, Views, and Grants

### 4.1 MySQL Service Accounts

All accounts authenticate via `caching_sha2_password` (or `mysql_native_password`) on `localhost`:

| Account | Dedicated Connection Pool | Granted Privileges | Scope / Restrictions |
|---|---|---|---|
| `briefcase_app` | `adminPool` | `ALL PRIVILEGES ON briefcase.*` | Backend administrative operations, migrations, and Admin role user requests. |
| `briefcase_lawyer` | `lawyerPool` | `SELECT` on `vw_lawyer_*`, `vw_ref_*`, `vw_case_lawyers`; `EXECUTE` on `sp_role_*`, `sp_lawyer_*`, `fn_app_*` | Zero direct table access. All DML blocked on views. Read and write strictly scoped to assigned cases. |
| `briefcase_staff` | `staffPool` | `SELECT` on `vw_staff_*`, `vw_ref_*`, `vw_case_lawyers`; `EXECUTE` on `sp_role_*`, `fn_app_*` | Zero direct table access. Budget masked to `NULL`. Confidential documents omitted. Writes limited to task/doc SPs. |
| `briefcase_auth` | `authPool` | `EXECUTE` on `GetUserByEmail`, `InsertUser`, `fn_app_*` | Zero table access. Can only look up users by email for bcrypt authentication and insert new non-admin users. |

### 4.2 Deterministic Session Context Functions

To securely scope `SQL SECURITY DEFINER` views without leaking connection-level state:
```sql
CREATE FUNCTION fn_app_user()
RETURNS INT
DETERMINISTIC
NO SQL
SQL SECURITY DEFINER
RETURN IFNULL(@app_user_id, 0);

CREATE FUNCTION fn_app_role()
RETURNS VARCHAR(50)
DETERMINISTIC
NO SQL
SQL SECURITY DEFINER
RETURN IFNULL(@app_role, 'Guest');
```

On every incoming HTTP request, `dbContext.js` executes:
```sql
SET @app_user_id = ?, @app_role = ?;
```
This binds the request to the verified JWT subject prior to any application query.

### 4.3 Key SQL Security Views

- **`vw_lawyer_cases`**: Joins `CASES` with `CASE_LAWYER` and `LAWYER` where `l.user_id = fn_app_user()`.
- **`vw_lawyer_clients`**: Selects only clients with cases in `vw_lawyer_cases`.
- **`vw_lawyer_hearings`**: Selects only hearings associated with cases in `vw_lawyer_cases`.
- **`vw_lawyer_tasks`**: Selects only tasks assigned to the lawyer or linked to cases in `vw_lawyer_cases`.
- **`vw_lawyer_documents`**: Selects non-confidential case documents or documents uploaded by the lawyer.
- **`vw_staff_cases`**: Selects all firm cases with `CAST(NULL AS DECIMAL(12,2)) AS budget` to mask financial figures.
- **`vw_staff_documents`**: Selects all documents where `is_confidential = 0`.

### 4.4 Stored Procedures with Ownership Enforcement

- **`sp_role_add_task`**: Validates whether the caller is an Admin, Assistant, or an assigned Lawyer for the specified case. If an unassigned lawyer attempts to insert a task:
  ```sql
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Forbidden: Lawyers can only create tasks for their own cases.';
  ```
- **`sp_role_update_task_status`**: Enforces that Lawyers can only modify tasks associated with their own cases or assigned directly to them.
- **`sp_role_add_document`**: Restricts document uploads for Lawyers to their own cases.
- **`sp_lawyer_update_case_notes`**: Restricts case note updates to assigned lawyers.
- **`sp_lawyer_update_hearing_outcome`**: Restricts hearing outcome edits to assigned lawyers.

---

## 5. Test Verification Results

### 5.1 Database-Level Security Tests (`17_role_tests.sql` / `runRoleTests.js`)

Executed directly against the MySQL engine using dedicated role accounts:

| # | Account | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|:---:|
| 1 | `briefcase_lawyer` | `SELECT * FROM CLIENT` (direct table) | 1142 Privilege Error | `ER_TABLEACCESS_DENIED_ERROR (1142)` | **PASS ✅** |
| 2 | `briefcase_lawyer` | `SELECT * FROM USERS` (direct table) | 1142 Privilege Error | `ER_TABLEACCESS_DENIED_ERROR (1142)` | **PASS ✅** |
| 3 | `briefcase_lawyer` | `DELETE FROM vw_lawyer_cases` | Deny DML on view | `ER_TABLEACCESS_DENIED_ERROR (1142)` | **PASS ✅** |
| 4 | `briefcase_lawyer` | Scoped cases: Lawyer A vs Lawyer B | Scoped to own cases; zero overlap | A: [2, 5, 6], B: [3, 4], Overlap: [] | **PASS ✅** |
| 5 | `briefcase_lawyer` | `sp_role_add_task` on unowned Case #3 | SIGNAL SQLSTATE 45000 | `45000: Forbidden: Lawyers can only create tasks for their own cases.` | **PASS ✅** |
| 6 | `briefcase_staff` | `SELECT * FROM CASES` (direct table) | 1142 Privilege Error | `ER_TABLEACCESS_DENIED_ERROR (1142)` | **PASS ✅** |
| 7 | `briefcase_staff` | `vw_staff_cases` budget masking | All budget values returned as `NULL` | All 8 rows have `budget: null` | **PASS ✅** |
| 8 | `briefcase_staff` | `vw_staff_documents` confidential filter | 0 confidential documents visible | 0 confidential out of 4 visible | **PASS ✅** |
| 9 | `briefcase_auth` | `CALL GetUserByEmail(...)` | Procedure executes successfully | Found `user_id: 10`, `role: Admin` | **PASS ✅** |
| 10 | `briefcase_auth` | `SELECT * FROM USERS` (direct table) | 1142 Privilege Error | `ER_TABLEACCESS_DENIED_ERROR (1142)` | **PASS ✅** |

**Step 1 Result:** **10 / 10 Tests Passed (100%)**

---

### 5.2 End-to-End HTTP API & Role Verification Tests (`verifyRoles.js`)

Executed over HTTP against all backend API routes using JWT authentication across all three roles:

| # | Test Name | Expected Result | Actual Result | Status |
|---|---|---|---|:---:|
| 1 | Login as Admin (`admin@briefcase.in`) | HTTP 200 with JWT token | HTTP 200 (token: Received) | **PASS ✅** |
| 2 | Login as Lawyer (`priya.patel@briefcase.law`) | HTTP 200 with JWT token | HTTP 200 (token: Received) | **PASS ✅** |
| 3 | Login as Assistant (`assistant@briefcase.in`) | HTTP 200 with JWT token | HTTP 200 (token: Received) | **PASS ✅** |
| 4 | Unauthenticated Request (`GET /api/dashboard`) | HTTP 401 Access Denied | HTTP 401 (`Access Denied: No authentication token provided.`) | **PASS ✅** |
| 5 | Public Registration as Admin without Admin Token | HTTP 403 Forbidden | HTTP 403 (`Admin accounts can only be created by an existing administrator.`) | **PASS ✅** |
| 6 | Dashboard Overview [`GET /api/dashboard`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 7 | Clients Registry (Read) [`GET /api/clients`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 8 | Clients Registry (Create) [`POST /api/clients`] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 9 | Cases (Read) [`GET /api/cases`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 10 | Cases (Create) [`POST /api/cases`] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 11 | Cases (Update) [`PUT /api/cases/2`] | Admin: 200, Lawyer: 200, Assistant: 403 | Admin: 200, Lawyer: 200, Assistant: 403 | **PASS ✅** |
| 12 | Lawyers Directory (Read) [`GET /api/lawyers`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 13 | Lawyers (Create) [`POST /api/lawyers`] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 14 | Hearings (Read) [`GET /api/hearings`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 15 | Hearings (Create) [`POST /api/hearings`] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 16 | Hearings (Update) [`PUT /api/hearings/1`] | Admin: 200, Lawyer: 200, Assistant: 403 | Admin: 200, Lawyer: 200, Assistant: 403 | **PASS ✅** |
| 17 | Documents (Read) [`GET /api/practice/documents`]| Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 18 | Documents (Delete) [`DELETE /practice/documents/999`]| Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 19 | Tasks (Read) [`GET /api/practice/tasks`] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | **PASS ✅** |
| 20 | Tasks (Delete) [`DELETE /practice/tasks/999`] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 21 | Finances (Invoices) [`GET /api/practice/invoices`]| Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 22 | Finances (Payments) [`GET /api/practice/payments`]| Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 23 | Reports [`GET /api/reports/query1-clients`] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 24 | Audit Logs [`GET /api/audit`] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 25 | Database Users [`GET /api/auth/users`] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | **PASS ✅** |
| 26 | Lawyer Cases Scoping | Lawyer cases (3) < Firm cases (8), strict subset | Lawyer: [6, 5, 2], Firm: [9, 8, 7, 6, 5, 4, 3, 2] | **PASS ✅** |
| 27 | Assistant Cases Budget Masking | All case rows have `budget === null` | All 8 case records have `budget: null` | **PASS ✅** |
| 28 | Assistant Documents Confidentiality | Zero confidential documents visible | 0 confidential out of 4 visible documents | **PASS ✅** |
| 29 | Clients Scoping & JSON Shape | Lawyer sees own (3 < 8), Assistant sees all (8 == 8) | Lawyer count: 3, Assistant count: 8, Admin count: 8 | **PASS ✅** |

**Steps 2 & 3 Result:** **29 / 29 Tests Passed (100%)**

---

## 6. Frontend UI Freeze Compliance Verification

As strictly mandated by the rules, **zero visual changes** were made to the frontend:
- No changes to CSS files.
- No modifications, additions, or deletions of Tailwind classes or inline styles.
- Zero changes to layout structure, HTML markup, typography, colors, or copy text.

### Verification Evidence:
```bash
$ git diff -- frontend | grep -E "^[+-].*(className|style=)"
# Returned: 0 matching lines (Exit Code 1)
```

Frontend production build completed without errors:
```
vite v8.3.4 building client environment for production...
✓ 3015 modules transformed.
dist/index.html                     1.09 kB │ gzip:   0.59 kB
dist/assets/index-CABQ1PnH.css     85.85 kB │ gzip:  13.74 kB
dist/assets/index-DCHseIp8.js   1,136.79 kB │ gzip: 319.74 kB
✓ built in 1.15s
```

---

## 7. Inventory of Modified and Created Files

### Database Layer
- `database/16_role_security.sql` *(New)*: Defines session context functions (`fn_app_user`, `fn_app_role`), scoped security views (`vw_lawyer_*`, `vw_staff_*`), stored write procedures with ownership validation (`sp_role_*`, `sp_lawyer_*`), and MySQL accounts with granular privilege grants.
- `database/17_role_tests.sql` *(New)*: SQL script documenting engine-level privilege and scoping tests for `briefcase_lawyer`, `briefcase_staff`, and `briefcase_auth`.
- `database/00_master_init.sql` *(Modified)*: Appended execution of `16_role_security.sql` to standard database provisioning sequence.

### Backend Layer
- `backend/src/config/db.js` *(Modified)*: Implements per-role connection pools (`adminPool`, `lawyerPool`, `staffPool`, `authPool`) and exports `testConnections()`. Eliminates single root pool fallback.
- `backend/src/middleware/dbContext.js` *(New)*: Middleware that binds the request to the matching MySQL pool based on the authenticated user's role and sets MySQL session variables (`@app_user_id`, `@app_role`).
- `backend/src/middleware/auth.js` *(Modified)*: Added fast-fail validation for `JWT_SECRET` and route role authorization helper `authorize(roles)`.
- `backend/src/middleware/errorHandler.js` *(Modified)*: Maps MySQL privilege errors (errno 1142, 1143, 1370, 1044) and custom SP signal `45000` to HTTP 403 Forbidden.
- `backend/src/controllers/authController.js` *(Modified)*: Uses `authPool` for login/registration; enforces that Admin account registration requires an existing Admin JWT token.
- `backend/src/controllers/dashboardController.js` *(Modified)*: Scopes dashboard counters and masks financial metrics (`financials: null`) for non-admin callers.
- `backend/src/controllers/clientController.js` *(Modified)*: Queries `vw_lawyer_clients`, `vw_staff_clients`, or `CLIENT` based on caller role; adds empty payload validation.
- `backend/src/controllers/caseController.js` *(Modified)*: Queries `vw_lawyer_cases`, `vw_staff_cases`, or `CASES`; delegates updates to `sp_lawyer_update_case_notes` for lawyers.
- `backend/src/controllers/hearingController.js` *(Modified)*: Scopes hearings via `vw_lawyer_hearings` / `vw_staff_hearings`; delegates outcome updates to `sp_lawyer_update_hearing_outcome`.
- `backend/src/controllers/practiceController.js` *(Modified)*: Scopes documents and tasks; routes document uploads and task creation to `sp_role_add_document` and `sp_role_add_task`.
- `backend/src/controllers/lawyerController.js` *(Modified)*: Uses `vw_ref_lawyers` and `vw_staff_lawyers` for directory queries.
- `backend/src/controllers/auditController.js` *(Modified)*: Uses `req.db` and aligns query fields with `application_audit_log` schema.
- `backend/src/routes/` (`caseRoutes.js`, `clientRoutes.js`, `hearingRoutes.js`, `lawyerRoutes.js`, `practiceRoutes.js`, `dashboardRoutes.js`, `auditRoutes.js`, `reportRoutes.js`, `authRoutes.js`) *(Modified)*: Attached `authorize` middleware protecting mutation and sensitive administration routes.
- `backend/src/app.js` *(Modified)*: Mounted `verifyToken` and `attachDb` globally across all API resource routes.
- `backend/scripts/seedDemoUsers.js` *(New)*: Idempotently upserts the 4 demo users with bcrypt-hashed passwords.
- `backend/scripts/runRoleTests.js` *(New)*: Node test runner validating MySQL engine privileges directly.
- `backend/scripts/verifyRoles.js` *(New)*: Comprehensive HTTP test runner validating the full access matrix.
- `backend/.env.example` *(Modified)*: Documented role pool environment variables with migration root isolation.

### Frontend Layer (Behaviour Only)
- `frontend/src/components/RequireAuth.jsx` *(New)*: Route protection component checking authentication and role permission without altering layout or DOM styling.
- `frontend/src/lib/auth.js` *(New)*: Helper library providing `getUser()`, `getRole()`, `can(action)`, and `clearAuth()`.
- `frontend/src/App.jsx` *(Modified)*: Guarded `/app` routes and Admin-exclusive paths (`finances`, `reports`, `plsql`, `audit`, `db-users`).
- `frontend/src/components/Layout.jsx` *(Modified)*: Removed hardcoded user fallback; filtered navigation links dynamically based on user role while preserving exact markup and classes.
- `frontend/src/services/api.js` *(Modified)*: Configured Axios response interceptor redirecting HTTP 401 to `/login` and handling HTTP 403 rejections.

---

## 8. Conclusion

All three phases of the BriefCase Database-Enforced Role-Based Access Control project have been completely implemented and verified:
1. **Database Layer:** Fully secured with custom accounts, deterministic functions, DEFINER views, and guarded stored procedures.
2. **Backend Layer:** Decoupled into per-role connection pools with session variable binding on every query.
3. **Frontend Layer:** Protected with behavioral route guards and role-filtered navigation with zero visual modifications.

Both the MySQL engine tests (10/10) and HTTP API verification suite (29/29) report a **100% pass rate**.
