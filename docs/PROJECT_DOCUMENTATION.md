# BriefCase — Law Firm Case Management System
## Complete DBMS Project & Lab Assignment Implementation Report
**Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat**  
**Department of Computer Science and Engineering**  
**Course:** CS203 — Database Management Systems | Academic Year 2026–27  
**Programme:** B.Tech II (CSE), Semester-III  

---

## 1. Executive Summary & Project Overview

**BriefCase** is a full-stack, database-centric Law Firm Case Management System engineered specifically to satisfy all academic requirements for SVNIT CS203 Practical Lab Assignments 10 and 11, along with the Comprehensive DBMS Project submission guidelines.

The system addresses the operational, administrative, and legal compliance needs of modern legal chambers. It coordinates legal matters across 20 normalized relational entities, tracking clients, attorneys, court venues, pleadings, litigation workflows, billing invoices, client escrow retainers, and audit histories.

The platform is strictly database-driven. Every metric, pagination query, cursor loop, transaction, and report executed in the React frontend communicates directly through a Node.js/Express REST API backed by an actual **MySQL 8.0** database server running on the InnoDB storage engine.

---

## 2. Requirement-to-Implementation Traceability Matrix

| Req ID | Assignment Requirement | SQL File / DB Object | Backend API Route | Frontend Component / Page | Workbench Test Command |
|---|---|---|---|---|---|
| **10.1** | CRUD Stored Procedures | `03_crud_procedures.sql`<br>`InsertClient`, `UpdateClient`, `DeleteClient`, `GetClientById` | `POST /api/clients`<br>`PUT /api/clients/:id`<br>`DELETE /api/clients/:id`<br>`GET /api/clients/:id` | `src/pages/Clients.jsx`<br>(Add/Edit/Delete Modals) | `CALL InsertClient(...);`<br>`CALL UpdateClient(...);`<br>`CALL DeleteClient(id);` |
| **10.2** | DB User Accounts & Least Privilege | `04_user_management.sql`<br>`briefcase_naive`, `briefcase_dev`, `briefcase_app`, `briefcase_dba` | `src/config/db.js`<br>(Uses restricted service account) | `src/pages/DatabaseUsers.jsx`<br>(Privilege Matrix Cards) | `SHOW GRANTS FOR 'briefcase_naive'@'localhost';` |
| **10.3** | User Login Data Management | `04_user_management.sql`<br>`USERS` table, `RegisterUser`, `GetUserByEmail` | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me` | `src/pages/DatabaseUsers.jsx`<br>(Login/Register Test Benches) | `CALL GetUserByEmail('...');`<br>Bcrypt verification in Node.js |
| **10.4** | Explicit Cursors (Unbounded & Bounded) | `05_cursor_procedures.sql`<br>`DisplayAllClients`, `DisplayLimitedClients` | `GET /api/clients/cursor`<br>`GET /api/clients/cursor?limit=5` | `src/pages/Clients.jsx`<br>(Cursor Execution Modal) | `CALL DisplayAllClients();`<br>`CALL DisplayLimitedClients(5);` |
| **10.5** | Paginated Search (Procedure + Function) | `06_pagination.sql`<br>`fn_get_client_search_count`<br>`PaginateClients` | `GET /api/clients/paginated?page=1&pageSize=5&search=...` | `src/pages/Clients.jsx`<br>(Live Pagination Controls) | `CALL PaginateClients(1, 5, 'Surat');`<br>`SELECT fn_get_client_search_count('');` |
| **10.6** | Aggregate Functions (Grouped & Ungrouped) | `07_aggregate_functions.sql`<br>`fn_total_case_budget`, `GetCaseBudgetSummaryByType`, `ExecuteNumericAggregate` | `GET /api/reports/query3-aggregate?func=SUM` | `src/pages/Reports.jsx` (Tab 3)<br>`src/pages/Dashboard.jsx` | `SELECT fn_total_case_budget();`<br>`CALL GetCaseBudgetSummaryByType();` |
| **10.7** | BEFORE Trigger: Data Integrity Validation | `08_validation_triggers.sql`<br>`trg_client_before_insert_val`, `trg_client_before_update_val` | Handled via `errorHandler.js`<br>(SQLSTATE 45000 normalization) | `src/pages/Clients.jsx`<br>(Error Alert Banner) | `INSERT INTO CLIENT (name, client_type) VALUES ('', 'Individual');` (Rejected) |
| **10.8** | Uppercase Normalization Trigger | `09_normalization_triggers.sql`<br>`trg_client_before_insert_norm`, `trg_client_before_update_norm` | Automatically executed on write | `src/pages/Clients.jsx`<br>(Table shows capitalized names) | `INSERT INTO CLIENT (name, client_type) VALUES ('test name', 'Individual');` |
| **10.9** | AFTER Trigger: Forensic Audit Logging | `10_audit_logging.sql`<br>`application_audit_log`, `trg_client_after_*_audit` | `GET /api/audit`<br>`GET /api/audit/stats` | `src/pages/AuditLogs.jsx`<br>(Full JSON Diff Table) | `SELECT * FROM application_audit_log ORDER BY audit_id DESC;` |
| **10.10** | Office-Hours Restriction Trigger | `11_office_hours_restriction.sql`<br>`trg_client_before_*_office_hours` | Trigger blocks DML during restricted window | Error modal displaying office hours signal | `SET @briefcase_simulate_monday_review = 1;`<br>`DELETE FROM CLIENT WHERE client_id = 99;` |
| **11.A.1** | Display All Records (Main Table) | `14_assignment_queries.sql` (Query 1) | `GET /api/reports/query1-clients` | `src/pages/Reports.jsx` (Tab 1) | `SELECT * FROM CLIENT ORDER BY client_id ASC;` |
| **11.A.2** | Insert with Integrity Constraints | `14_assignment_queries.sql` (Query 2) | `POST /api/reports/query2-insert-integrity` | `src/pages/Reports.jsx` (Tab 2) | Transactional insert into `CLIENT` and dependent `CASES` |
| **11.A.3** | Display Aggregate Function Result | `14_assignment_queries.sql` (Query 3) | `GET /api/reports/query3-aggregate?func=SUM` | `src/pages/Reports.jsx` (Tab 3) | `SELECT SUM(budget) FROM CASES;` |
| **11.A.4** | Display Data Using Condition & Operators | `14_assignment_queries.sql` (Query 4) | `GET /api/reports/query4-conditional?column=...` | `src/pages/Reports.jsx` (Tab 4) | `SELECT * FROM CLIENT WHERE client_type = 'Individual';` |
| **11.A.5** | Dynamic JOIN Operations (2 Tables) | `14_assignment_queries.sql` (Query 5) | `GET /api/reports/query5-join?table1=...` | `src/pages/Reports.jsx` (Tab 5) | `SELECT ... FROM CLIENT cl INNER JOIN CASES c ON ...` |
| **11.A.6** | Subquery Across Multiple Tables | `14_assignment_queries.sql` (Query 6) | `GET /api/reports/query6-subquery?minBudget=...` | `src/pages/Reports.jsx` (Tab 6) | `SELECT * FROM CLIENT WHERE client_id IN (SELECT ... FROM CASES ...);` |
| **11.A.7** | Correlated Subquery | `14_assignment_queries.sql` (Query 7) | `GET /api/reports/query7-correlated` | `src/pages/Reports.jsx` (Tab 7) | `WHERE c1.budget > (SELECT AVG(c2.budget) FROM CASES c2 WHERE c2.case_type_id = c1.case_type_id)` |
| **11.A.8** | Update Table Data with Integrity | `14_assignment_queries.sql` (Query 8) | `PUT /api/reports/query8-update-integrity` | `src/pages/Reports.jsx` (Tab 8) | `UPDATE CASES SET budget = ... WHERE case_id = 1;` |
| **11.B** | Indexes & Performance Profiling | `13_indexes.sql`<br>`idx_cases_type_budget`, `idx_client_type_name` | Timing measured via `process.hrtime.bigint()` | `src/pages/Reports.jsx` (Tab 10) | `EXPLAIN SELECT ... FROM CASES c1 WHERE c1.budget > ...` |
| **11.C** | Database Views & Trigger Propagation | `12_views.sql`<br>`vw_client_cases`, `vw_surat_clients` | `GET /api/reports/views?view=...` | `src/pages/Reports.jsx` (Tab 9) | `SELECT * FROM vw_client_cases;`<br>`UPDATE vw_surat_clients SET phone = '...';` |
| **11.E** | Real Database Dashboard | `/api/dashboard` (Live queries on all 12 tables) | `GET /api/dashboard` | `src/pages/Dashboard.jsx`<br>(Live Recharts + Metrics) | `SELECT COUNT(*) FROM CLIENT UNION ALL ...` |
| **11.F** | XML Output (Queries 1, 3, 4) | `backend/src/utils/xml.js`<br>(Generated via `xmlbuilder2`) | `GET /api/reports/query1-clients?format=xml`<br>`GET /api/reports/query3-aggregate?format=xml`<br>`GET /api/reports/query4-conditional?format=xml` | `src/pages/Reports.jsx`<br>(Modal XML Inspector) | Returns `application/xml; charset=utf-8` |

---

## 3. Conceptual & Relational Database Design

### 3.1 Entity Descriptions & Normalization
The database schema has been normalized to **Boyce-Codd Normal Form (BCNF) / 3NF**:
- **CLIENT:** Stores legal representation retainers. Eliminates multi-valued attributes and transitive dependencies.
- **DEPARTMENT:** Functional firm practice groups (Corporate, Criminal, Litigation, Taxation, Real Estate).
- **CASE_TYPE:** Categorization of disputes.
- **CASE_STATUS:** Enforces workflow state transitions (New $\rightarrow$ Filed $\rightarrow$ Hearing $\rightarrow$ Settled $\rightarrow$ Closed).
- **DOCUMENT_TYPE & DOCUMENT:** Isolates metadata, file sizes, and confidentiality levels from case records.
- **PAYMENT_METHOD & PAYMENT:** Tracks escrow settlements, advance retainers, and bank instruments.
- **COURT & HEARING:** Decouples judicial benches and city jurisdictions from specific case hearings.
- **USERS:** Role-based access control identities with bcrypt hashes.
- **LAWYER:** Attorney bar council credentials mapped to departments.
- **PARTY:** Litigants (Plaintiffs, Defendants, Petitioners, Respondents).
- **CASES:** Central transactional hub representing lawsuits.
- **CASE_LAWYER:** M:N associative entity mapping multiple attorneys to a lawsuit with role definitions (Lead, Associate, Reviewer).
- **CASE_PARTY:** M:N associative entity capturing multiple parties per legal proceeding.
- **INVOICE:** Commercial fee bills issued to clients.
- **CASE_STATUS_HISTORY:** Append-only temporal log recording state changes.
- **TASK:** Actionable legal assignments allocated to staff.
- **application_audit_log:** Forensic audit log storing JSON state vectors.

### 3.2 Integrity Constraints Enforced
1. **Primary Keys:** Every table defines a surrogate or composite primary key (`AUTO_INCREMENT` or composite associative PK).
2. **Foreign Keys:** All 19 relational links define explicit `ON UPDATE CASCADE` and either `ON DELETE RESTRICT` (to protect transactional legal records) or `ON DELETE SET NULL` (for optional metadata).
3. **CHECK Constraints:**
   - `chk_case_budget`: `budget IS NULL OR budget >= 0`
   - `chk_case_dates`: `expected_closure_date IS NULL OR filed_date IS NULL OR expected_closure_date >= filed_date`
   - `chk_appt_time`: `start_time IS NULL OR end_time IS NULL OR end_time > start_time`
   - `chk_hearing_time`: `end_time > start_time`
   - `chk_invoice_amount`: `amount >= 0`
   - `chk_payment_amount`: `amount >= 0`
   - `chk_lawyer_experience`: `experience_years >= 0`

---

## 4. MySQL Compatibility Solutions

The assignment documents reference generic "PL/SQL" terminology. In MySQL 8.0, several Oracle-specific features are handled differently:

1. **Statement-Level Triggers (Req 10.8):**
   - *Oracle PL/SQL:* Supports statement triggers (`FOR EACH STATEMENT`).
   - *MySQL 8.0:* Triggers are row-level (`FOR EACH ROW`).
   - *Solution:* Implemented `BEFORE INSERT` and `BEFORE UPDATE` row triggers on `CLIENT` using `SET NEW.name = UPPER(TRIM(NEW.name))` and `SET NEW.email = LOWER(TRIM(NEW.email))`.

2. **Stored Functions Returning Result Sets (Req 10.5):**
   - *Oracle PL/SQL:* Functions can return table types / pipelined ref cursors.
   - *MySQL 8.0:* Stored functions must return a scalar value (`RETURNS INT`).
   - *Solution:* Implemented the scalar search counter as a stored function (`fn_get_client_search_count`) and multi-row paginated data retrieval as a stored procedure (`PaginateClients`).

3. **Triggers on Views (Req 11.C.2):**
   - *Oracle PL/SQL:* Supports `INSTEAD OF` triggers directly on views.
   - *MySQL 8.0:* Does not support triggers directly on views (`ERROR 1347: Not Base Table`).
   - *Solution:* Demonstrated trigger firing on the base table (`CLIENT`) when updates are dispatched through the updatable view `vw_surat_clients`.

4. **Office-Hours Timing Harness (Req 10.10):**
   - The restriction restricts DML on Monday between 14:00 and 16:00 (`DAYOFWEEK(NOW()) = 2 AND CURRENT_TIME() BETWEEN '14:00:00' AND '16:00:00'`).
   - *Solution:* Added a session simulation flag `@briefcase_simulate_monday_review` so examiners and evaluators can verify the restriction in MySQL Workbench at any hour.

---

## 5. Instructions for Demonstration

### Step 1: Database Initialization in MySQL Workbench
1. Launch **MySQL Workbench** and connect to your local instance.
2. In the SQL Editor, execute:
   ```sql
   SOURCE c:/Users/SHREE/Desktop/Briefcase/database/00_master_init.sql;
   ```
3. Run the automated test harness:
   ```sql
   SOURCE c:/Users/SHREE/Desktop/Briefcase/database/15_test_cases.sql;
   ```

### Step 2: Start Backend Server
In PowerShell:
```powershell
cd c:\Users\SHREE\Desktop\Briefcase\backend
npm start
```
*Health check URL:* `http://localhost:5000/api/health`

### Step 3: Start Frontend Application
In a second PowerShell terminal:
```powershell
cd c:\Users\SHREE\Desktop\Briefcase\frontend
npm run dev
```
*Application URL:* `http://localhost:3000`

---

## 6. Conclusion
The BriefCase project is fully operational, strictly adhering to the database requirements of SVNIT CS203. Every frontend control triggers a genuine MySQL query or stored procedure through the Node.js API, with complete coverage of all Assignment 10 and Assignment 11 requirements.
