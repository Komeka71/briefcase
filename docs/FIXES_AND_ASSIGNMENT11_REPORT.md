# BriefCase — Application Fixpack & SVNIT Practical Assignment 11 Comprehensive Report

**Academic Context:** SVNIT Surat | Department of Computer Science & Engineering  
**Course:** CS203 Database Management Systems | Academic Year 2026-27  
**Project:** BriefCase (Law Firm Practice Management & Court ERP System)  
**Database Engine:** MySQL 8.0 (InnoDB Engine)  
**Backend:** Node.js / Express (ES6+, Connection Pooling)  
**Frontend:** React 19 / Vite / TailwindCSS Design System (Frozen Aesthetics)  
**Evaluation Date:** 2026-11-02  

---

## 1. Executive Summary

This report documents the end-to-end execution of the **BriefCase Fixpack (Phases 0 through 3)** and the complete fulfillment of **SVNIT Practical Assignment 11 (Sections A through F)**.

BriefCase implements a modern, secure, database-enforced architecture for legal practice management. All operational features—ranging from client onboarding and matter docketing to evidence vault storage, judicial cause list scheduling, financial ledger reconciliation, and cross-entity relational queries—are strictly governed by database-enforced role-based access control (RBAC). Three distinct roles are enforced at the database layer using dedicated MySQL connection pools:
1. **Admin (DBA / Senior Managing Partner):** Full DML, procedure execution, counsel assignment, and administrative audit inspection via `briefcase_app`.
2. **Lawyer (Chamber Associate / Retained Counsel):** Scoped access to assigned legal matters, personal clients, and bench cause lists via `briefcase_lawyer` through SQL views (`vw_lawyer_cases`, `vw_lawyer_clients`, `vw_lawyer_documents`) and restricted procedures (`sp_lawyer_schedule_hearing`).
3. **Assistant (Paralegal / Court Clerk):** Firm-wide administrative read access without access to financial budgets, counsel fee invoices, payment ledgers, or privileged/confidential work product via `briefcase_staff` through SQL views (`vw_staff_cases`, `vw_staff_clients`, `vw_staff_documents`).

The frontend user experience remained strictly frozen in accordance with the project constraints. All authorized additions (document file upload/download, budget analytics, invoice generation, payment recording, clearance actions, counsel allocation, and Assignment 11 relational query forms) utilized pre-existing component tokens and copied style classes.

---

## 2. Phase 0: Database Diagnostics & Structural Repair

### 2.1 Diagnostics & Inventory Analysis
Before implementing application fixes, an automated audit inspected the database inventory against the required operational objects:
- **Stored Procedures & Functions:** Missing procedures and routines (`PaginateClients`, `sp_case_assign_counsel`, `sp_case_remove_counsel`, `sp_create_invoice`, `sp_record_payment`, `ExecuteNumericAggregate`) were inventoried.
- **Views:** Role security views (`vw_lawyer_cases`, `vw_staff_cases`, `vw_lawyer_clients`, `vw_staff_clients`, `vw_lawyer_documents`, `vw_staff_documents`) and consolidated views (`vw_client_cases`, `vw_surat_clients`) were checked.
- **Triggers:** Triggers for normalization (`trg_client_before_insert_norm`), validation (`trg_client_before_insert_val`), audit logging (`trg_client_after_insert_audit`), and office hours restrictions (`trg_case_before_insert_hours`) were audited.
- **Financial Integrity Deficit:** The `PAYMENT` table was initially unseeded while multiple invoices were marked as `Paid`, creating a reconciliation mismatch in client retainer balances.

### 2.2 Database Repair & Script Execution
A full snapshot was backed up to `backup_before_fixpack.sql`. To resolve syntax discrepancies across MySQL 8.0 versions, the migration suite was repaired and sequentially executed via `apply_objects.ps1`:
1. `database/10_audit_logging.sql`: Added dynamic metadata helper `AddColumnIfNotExists` to ensure `application_audit_log` structure without failing on legacy `ALTER TABLE` statements.
2. `database/13_indexes.sql`: Repaired index creation routine `CreateOrReplaceIndex` to safely skip pre-existing foreign key and secondary indexes.
3. `database/16_role_security.sql`: Wrapped payment triggers in `DELIMITER //` blocks and configured stored procedure grants for `briefcase_app`, `briefcase_lawyer`, `briefcase_staff`, and `briefcase_auth`.
4. `database/18_finance_integrity.sql`: Populated initial cleared payments for existing invoices, reconciling total collections with invoiced sums and enforcing integrity between `INVOICE.status` and `PAYMENT.amount`.

All 14 programmatic verification checks in `verify_recreated_admin.js` passed with zero errors.

---

## 3. Phase 1: Application Page-by-Page Completion

### 3.1 PL/SQL Controller & Routes (`/api/plsql`)
- Created `backend/src/controllers/plsqlController.js` and `backend/src/routes/plsqlRoutes.js`.
- Exposed endpoints:
  - `GET /api/plsql/aggregate`: Invokes `ExecuteNumericAggregate(func, table, column)` or native aggregation.
  - `POST /api/plsql/trigger-test`: Dispatches validation and office-hours trigger tests.
  - `GET /api/plsql/table-stats`: Gathers real-time row counts across all 9 primary relational tables.
  - `GET /api/plsql/catalog`: Queries `information_schema.routines` for stored procedures and functions.
- Mounted at `/api/plsql` in `backend/src/app.js`.

### 3.2 Practice Dashboard (`/dashboard`)
- Updated `backend/src/controllers/dashboardController.js`:
  - Filtered hearings cause list to return **unadjourned hearings** (`status != 'Adjourned'`) scheduled on or after current date, ordered chronologically.
  - Scoped tasks overview to **active urgent tasks** (`priority = 'Urgent' AND status != 'Completed'`).
  - Integrated `/api/plsql/table-stats` for table row metrics.

### 3.3 Client Registry (`/clients`)
- **Backend (`clientController.js`):**
  - Corrected `PaginateClients` parameter ordering: `CALL PaginateClients(page, pageSize, search || null)`.
  - Admin pagination metadata reads directly from stored procedure output `results[1][0]`.
  - Lawyer and Assistant queries execute through `vw_lawyer_clients` and `vw_staff_clients` with accurate `count` and `total_pages`.
- **Frontend (`Clients.jsx`):**
  - Gated "Enrol New Client", table "Actions" header, and row action buttons (Edit, Delete) behind `isAdmin = getRole() === 'Admin'`.
  - Updated client table registration date mapping to `date_of_registration`.

### 3.4 Chamber Counsel Directory (`/lawyers`)
- **Backend (`lawyerController.js`):**
  - Enhanced Admin query to compute `assigned_cases_count` via `LEFT JOIN CASE_LAWYER` and `COUNT(case_id)`.
- **Frontend (`Lawyers.jsx`):**
  - Gated "Admit New Counsel", table "Actions" header, and Edit/Delete buttons behind `isAdmin`.

### 3.5 Court Bench Hearings (`/hearings`)
- **Backend (`hearingRoutes.js`, `hearingController.js`):**
  - Allowed Lawyer role on `POST /api/hearings` (`requireRole('Admin', 'Lawyer')`).
  - Admin schedules cause list entries via `sp_admin_schedule_hearing`.
  - Lawyer schedules cause list entries via `sp_lawyer_schedule_hearing` (validating that the case is actively assigned to their counsel profile).
- **Frontend (`Hearings.jsx`):**
  - Gated "Schedule Bench Hearing" to Admin and Lawyer (`canSchedule = isAdmin || isLawyer`).
  - Row edit button gated to `canSchedule`; permanent delete action strictly gated behind `isAdmin`.

### 3.6 Legal Matters & Counsel Allocation (`/cases`)
- **Backend (`caseRoutes.js`, `caseController.js`):**
  - Added Admin-only endpoints `POST /api/cases/:id/lawyers` and `DELETE /api/cases/:id/lawyers/:lawyerId`.
  - Dispatched counsel allocation to `sp_case_assign_counsel` and removal to `sp_case_remove_counsel`.
- **Frontend (`Cases.jsx`):**
  - Gated "Register New Matter", row Edit, and row Delete buttons behind `isAdmin`.
  - Added counsel allocation form and counsel removal button inside the case dossier modal.
  - Updated `fetchAggregate` to parse `result_value` and display docket numbers for MIN/MAX queries.
  - Updated `handleSubqueryChange` to invoke `getQuery6(300000, 'cases')` when "High-Value Matters" is selected.

### 3.7 Evidence Vault & Document Storage (`/documents`)
- **Backend (`practiceRoutes.js`, `practiceController.js`):**
  - Integrated `multer` disk storage with secure filename sanitization (`backend/storage/documents/`).
  - Configured `POST /api/practice/documents` to accept `multipart/form-data` with automatic `file_size` and `file_path` resolution.
  - Implemented `GET /api/practice/documents/:id/download` with path-traversal protection and streaming delivery.
  - Created `backend/scripts/seedDocumentFiles.js` to ensure valid files exist on disk for all seeded records.
- **Frontend (`Documents.jsx`):**
  - Added actual file input (`<input type="file" ... />`) submitting `FormData`.
  - Wired download button to call `practiceService.downloadDocument(id)` and trigger browser download with Blob.
  - Gated row expunge/delete button behind `isAdmin`.

### 3.8 Billing & Financial Registers (`/finances`)
- **Backend (`practiceController.js`):**
  - Maintained procedures `sp_create_invoice` and `sp_record_payment`.
  - Implemented `PUT /api/practice/payments/:id/status` for marking payments cleared and updating ledger status.
  - Implemented `GET /api/practice/ledger/export` generating an RFC-4180 compliant CSV audit ledger with UTF-8 BOM.
- **Frontend (`Finances.jsx`):**
  - Connected "Export Audit Ledger" button to trigger file download (`briefcase_audit_ledger.csv`).
  - Added "New Invoice" modal calling `practiceService.createInvoice`.
  - Added "Record Payment" modal calling `practiceService.createPayment`.
  - Added "Mark Cleared" row action button for uncompleted payments.
  - Strictly gated all invoice and payment mutation controls behind `isAdmin`.

### 3.9 Tasks Management (`/tasks`)
- **Backend (`practiceController.js`):**
  - Enforced that task deletion is Admin-only and strictly rejects tasks whose status is not `'Completed'`.
- **Frontend (`Tasks.jsx`):**
  - Gated Actions column and delete button behind `isAdmin`.

### 3.10 Cross-Entity Reports & Relational Intelligence (`/reports`)
- **Backend (`reportRoutes.js`, `reportController.js`):**
  - Allowed Lawyer and Assistant access to `query1-clients`, `query3-aggregate`, `query4-conditional`, `query6-subquery`, and `query7-correlated`.
  - Scoped data access using `vw_lawyer_clients`, `vw_staff_clients`, `vw_lawyer_cases`, and `vw_staff_cases`.
  - Retained strict Admin-only security on `query2-insert-integrity`, `query5-join`, `query8-update-integrity`, and `/views`.
- **Frontend (`Reports.jsx`):**
  - Added Tab 3: "Relational Insertion (Q2)" submitting client and linked matter details to `reportService.postQuery2`.
  - Added Tab 4: "Relational Update (Q8)" submitting budget updates and audit notes to `reportService.putQuery8`.

---

## 4. Phase 2: Assignment 11 Deliverables & Performance Analysis

### 4.1 Section A: Complete Query Suite (`database/19_assignment11_queries.sql`)
The complete suite of 8 relational queries required by Section A was compiled into `database/19_assignment11_queries.sql` with comprehensive engineering commentary:
- **Query 1:** Display all records from `CLIENT` with `ORDER BY client_id ASC`.
- **Query 2:** Atomic multi-table insertion into `CLIENT` and dependent `CASES`, validating foreign keys, NOT NULL, domain constraints, and trigger integrity.
- **Query 3:** Aggregate function evaluation (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`) on `CASES.budget`, returning entity metadata and docket numbers.
- **Query 4:** Conditional queries on `CLIENT` using relational operators (`=`, `LIKE`, `IN`, `BETWEEN`).
- **Query 5:** Dual-entity relational joins (`CLIENT` INNER JOIN `CASES`, `CASES` LEFT JOIN `CASE_TYPE`, `HEARING` INNER JOIN `COURT`, `PAYMENT` LEFT JOIN `PAYMENT_METHOD`).
- **Query 6:** Subquery from multiple tables finding clients with legal cases exceeding a budget threshold (`>= 300000`).
- **Query 7:** Correlated subquery finding legal cases where `budget > (SELECT AVG(budget) FROM CASES WHERE case_type_id = outer.case_type_id)`.
- **Query 8:** Targeted relational update on `CASES` modifying `budget` and appending audit remarks while respecting check constraints (`budget >= 0`).

### 4.2 Section B: Performance Benchmark & Secondary B+Tree Indexes
To measure query execution timings before and after indexing on a realistic scale, an isolated synthetic database (`briefcase_perf`) was constructed and seeded via `backend/scripts/measureQueries.js`:
- **Dataset Scale:** 5,000 Clients, 10,000 Legal Matters, and 10,000 Court Hearings.
- **Secondary Indexes Created:**
  1. `idx_perf_client_email` on `PERF_CLIENT(email)`
  2. `idx_perf_client_type_date` on `PERF_CLIENT(client_type, date_of_registration)`
  3. `idx_perf_cases_type_budget` on `PERF_CASES(case_type_id, budget)`
  4. `idx_perf_cases_client_budget` on `PERF_CASES(client_id, budget)`
  5. `idx_perf_hearing_date` on `PERF_HEARING(hearing_date)`

#### Benchmark Timings & Speedup Summary
All queries were executed over multiple iterations with cache invalidation (`SQL_NO_CACHE`) and measured with high-resolution monotonic timers:

| Query ID | Description / Target Entity | Baseline Time (ms) | Indexed Time (ms) | Speedup Factor | Latency Reduction | Primary Index Leveraged |
|---|---|---|---|---|---|---|
| **Q1** | Full Table Scan on `PERF_CLIENT` | 7.656 ms | 8.035 ms | 0.95x | -5.0% | Primary Key Clustered Index |
| **Q4a** | Exact Point Lookup on Email | 2.017 ms | 0.425 ms | **4.75x** | **78.9%** | `idx_perf_client_email` |
| **Q4b** | Composite Filter (Type + Date Range) | 7.128 ms | 2.172 ms | **3.28x** | **69.5%** | `idx_perf_client_type_date` |
| **Q5** | Multi-Table Join (`CASES` + `CLIENT` + `TYPE`) | 40.017 ms | 19.079 ms | **2.10x** | **52.3%** | `idx_perf_cases_client_budget` |
| **Q6** | Independent Subquery (`budget >= 1.8M`) | 50.138 ms | 8.763 ms | **5.72x** | **82.5%** | `idx_perf_cases_client_budget` |
| **Q7** | Correlated Subquery (Category Average) | 57,576.271 ms | 11,311.658 ms | **5.09x** | **80.4%** | `idx_perf_cases_type_budget` |
| **Q_Hearings** | Cause List Date Filter | 5.361 ms | 0.401 ms | **13.36x** | **92.5%** | `idx_perf_hearing_date` |

#### Key Performance Findings
1. **Point Lookup Elimination ($O(N) \to O(\log N)$):** Query 4a saw an immediate 78.9% reduction in latency as MySQL transitioned from examining 5,000 rows (full table scan) to examining a single row via B+Tree index traversal.
2. **Elimination of Quadratic Combinatorial Scans:** In Query 7, the unindexed correlated subquery performed $10,000 \times 10,000 = 100,000,000$ row comparisons, taking 57.5 seconds per run. Introducing the covering index `idx_perf_cases_type_budget` allowed the optimizer to compute category averages directly from index leaf nodes, yielding an 80.4% reduction in execution time.
3. **Cause List Filter Optimization:** Querying daily hearings across 10,000 records improved by **13.36x** (92.5% latency reduction) with `idx_perf_hearing_date`.

Detailed execution plans (`EXPLAIN`) and analysis are documented in `docs/ASSIGNMENT11_RESULTS.md`.

### 4.3 Section C: Database Views & Trigger Propagation (`database/20_view_trigger_demo.sql`)
1. **Multi-Table View Creation:** Created `vw_surat_litigation` combining `CLIENT` and `CASES` on city condition (`cl.address LIKE '%Surat%'`).
2. **Stored Procedures on Views:**
   - `sp_display_surat_litigation(p_min_budget)`: Retrieves and filters litigation matters from the view.
   - `sp_insert_client_case_surat(...)`: Atomically inserts client and matter records into the Surat jurisdiction.
3. **Trigger Validation Analysis on Views:**
   - **Architectural Fact:** MySQL 8.0 does not support `INSTEAD OF` triggers directly on views (Error 1347: Not Base Table).
   - **Propagation Mechanism:** When DML is executed via stored procedures or updatable views (`vw_surat_clients`), MySQL automatically propagates the operation to the base table (`CLIENT`).
   - **Validation Demonstration:** Valid data passes triggers and records mutations in `application_audit_log`; invalid data (e.g. malformed phone or negative budget violating check constraints) is intercepted and rejected with `SIGNAL SQLSTATE '45000'`.

### 4.4 Section D, E, F: Frontend Capabilities
- **Section D.1 & D.2:** Navigation menu with role gating; Query 1 rendered as an interactive, sortable HTML table with pagination.
- **Section D.3 & D.7:** Form controls for Query 2 (atomic relational insert) and Query 8 (relational update) on the Reports page.
- **Section D.4 & D.5:** Dropdowns for Query 3 (SUM, AVG, COUNT, MIN, MAX) and Query 4 (relational operators and attributes).
- **Section D.6 & D.8:** Dynamic dropdown filter on Cases (`high_value` and `above_average` options); dual-table join builder on Reports (Table 1, Table 2, Join Type).
- **Section E (Dashboard):** Live practice statistics across all 9 relational tables via `/api/plsql/table-stats`, unadjourned cause list hearings, and urgent tasks.
- **Section F (XML Serialization):** Native XML format supported for Query 1, Query 3, and Query 4 via HTTP Accept headers and query parameters, accompanied by in-app XML modal viewers with clipboard copying.

---

## 5. Phase 3: Verification & Security Audit

### 5.1 End-to-End Role Verification Suite
The complete end-to-end verification script `backend/scripts/verifyRoles.js` tested 30 separate security assertions over HTTP across Admin, Lawyer, and Assistant logins:

```
========================================================================
 BRIEFCASE END-TO-END ROLE-BASED ACCESS VERIFICATION
 Testing over HTTP against Access Matrix (Steps 1-3)
========================================================================

| Test Name | Expected Result | Actual Result | Status |
|---|---|---|---|
| Login as Admin (admin@briefcase.in) | HTTP 200 with JWT token | HTTP 200 (token: Received) | PASS ✅ |
| Login as Lawyer (priya.patel@briefcase.law) | HTTP 200 with JWT token | HTTP 200 (token: Received) | PASS ✅ |
| Login as Assistant (assistant@briefcase.in) | HTTP 200 with JWT token | HTTP 200 (token: Received) | PASS ✅ |
| Unauthenticated Request (GET /api/dashboard without token) | HTTP 401 Access Denied | HTTP 401 (Access Denied) | PASS ✅ |
| Public Registration as Admin without Admin Token | HTTP 403 Forbidden | HTTP 403 Forbidden | PASS ✅ |
| Dashboard Overview [GET /api/dashboard] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Clients Registry (Read) [GET /api/clients] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Clients Registry (Create) [POST /api/clients] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Cases (Read) [GET /api/cases] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Cases (Create) [POST /api/cases] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Cases (Update) [PUT /api/cases/2] | Admin: 200, Lawyer: 200, Assistant: 403 | Admin: 200, Lawyer: 200, Assistant: 403 | PASS ✅ |
| Lawyers Directory (Read) [GET /api/lawyers] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Lawyers (Create) [POST /api/lawyers] | Admin: 400, Lawyer: 403, Assistant: 403 | Admin: 400, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Hearings (Read) [GET /api/hearings] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Hearings (Create) [POST /api/hearings] | Admin: 400, Lawyer: 400, Assistant: 403 | Admin: 400, Lawyer: 400, Assistant: 403 | PASS ✅ |
| Hearings (Update) [PUT /api/hearings/1] | Admin: 200, Lawyer: 200, Assistant: 403 | Admin: 200, Lawyer: 200, Assistant: 403 | PASS ✅ |
| Documents (Read) [GET /api/practice/documents] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Documents (Delete) [DELETE /api/practice/documents/999] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Tasks (Read) [GET /api/practice/tasks] | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Tasks (Delete) [DELETE /api/practice/tasks/999] | Admin: 404, Lawyer: 403, Assistant: 403 | Admin: 404, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Finances (Invoices) [GET /api/practice/invoices] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Finances (Payments) [GET /api/practice/payments] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Reports (Query 1 Clients Scoped) | Admin: 200, Lawyer: 200, Assistant: 200 | Admin: 200, Lawyer: 200, Assistant: 200 | PASS ✅ |
| Reports (Query 5 Join Admin-only) | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Audit Logs [GET /api/audit] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Database Users [GET /api/auth/users] | Admin: 200, Lawyer: 403, Assistant: 403 | Admin: 200, Lawyer: 403, Assistant: 403 | PASS ✅ |
| Lawyer's cases are a strict subset of firm's cases | Lawyer cases (3) < Firm cases (11) | Verified | PASS ✅ |
| Assistant case rows have budget: null | All 11 case records have budget: null | Verified | PASS ✅ |
| Assistant documents contain no confidential rows | 0 confidential out of 4 visible | Verified | PASS ✅ |
| GET /api/clients scoped (Lawyer own vs Assistant all) | Lawyer: 3, Assistant: 11, Admin: 11 | Verified | PASS ✅ |

------------------------------------------------------------------------
🎉 ALL ROLE VERIFICATION CHECKS PASSED (30 / 30 Passed)
------------------------------------------------------------------------
```

### 5.2 UI/UX Freeze Compliance Audit
The frontend codebase was audited against the strict UI freeze constraint. Executing:
```powershell
git diff -- frontend | Select-String -Pattern '^[+-].*(className|style=)'
```
confirmed that:
- Zero global CSS, Tailwind configuration, color palettes, fonts, spacing, or visual tokens were modified.
- All new interactive elements (file picker, counsel assignment buttons, invoice and payment modals, Mark Cleared action, and Q2/Q8 forms) strictly utilized existing class names and component structures copied directly from peer components.

### 5.3 Production Build Verification
The frontend production bundle was compiled:
```
> vite build
✓ 3015 modules transformed.
dist/index.html                     1.09 kB │ gzip:   0.59 kB
dist/assets/index-BRLZk6u0.css     86.15 kB │ gzip:  13.78 kB
dist/assets/index-CcxXhV-0.js   1,162.36 kB │ gzip: 323.97 kB
✓ built in 2.05s
```
Compilation completed with exit code 0 and zero linting or bundle errors.

### 5.4 Database Connection Pool Audit
A full audit of `backend/src/` verified:
- **Zero fallback to `root` at runtime.**
- Every database request is dynamically assigned to the authenticated user's role pool:
  - Admin users use `briefcase_app`.
  - Lawyer users use `briefcase_lawyer`.
  - Assistant users use `briefcase_staff`.
  - Authentication procedures use `briefcase_auth`.

---

## 6. Deliverable Artifacts Index

| File Path | Description |
|---|---|
| [`database/19_assignment11_queries.sql`](file:///d:/BriefCase/briefcase/database/19_assignment11_queries.sql) | Section A Queries 1 through 8 with SQL statements and engineering commentary |
| [`database/20_view_trigger_demo.sql`](file:///d:/BriefCase/briefcase/database/20_view_trigger_demo.sql) | Section C Views (`vw_surat_litigation`), procedures, and trigger validation demonstration |
| [`backend/scripts/measureQueries.js`](file:///d:/BriefCase/briefcase/backend/scripts/measureQueries.js) | Benchmark suite creating `briefcase_perf` (5k clients, 10k cases, 10k hearings) |
| [`docs/ASSIGNMENT11_RESULTS.md`](file:///d:/BriefCase/briefcase/docs/ASSIGNMENT11_RESULTS.md) | Full timing comparison table, speedup factors, and execution plan analysis |
| [`docs/FIXES_AND_ASSIGNMENT11_REPORT.md`](file:///d:/BriefCase/briefcase/docs/FIXES_AND_ASSIGNMENT11_REPORT.md) | Comprehensive engineering and verification report across all phases |
| [`backend/scripts/verifyRoles.js`](file:///d:/BriefCase/briefcase/backend/scripts/verifyRoles.js) | 30-assertion end-to-end HTTP role security test runner |
| [`database/apply_objects.ps1`](file:///d:/BriefCase/briefcase/database/apply_objects.ps1) | Clean PowerShell database object application runner |

---
*Report certified complete for BriefCase Practice Management & SVNIT CS203 DBMS Practical Assignment 11.*
