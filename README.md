# BriefCase — Law Firm Case Management System
## SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project

Complete, database-driven Law Firm Management System implementing **Lab Assignment 10** and **Lab Assignment 11**.

---

## 🛠️ Technology Stack
- **Database:** MySQL 8.0 (InnoDB Storage Engine)
- **Database Tool:** MySQL Workbench
- **Backend API:** Node.js + Express.js (`mysql2/promise`)
- **Frontend App:** React 19 + Vite + Tailwind CSS v4 + React Router
- **Visualization:** Recharts
- **Serialization:** xmlbuilder2

---

## 🚀 Quickstart Guide

### 1. Initialize MySQL Database
Open **MySQL Workbench**, connect to your local MySQL instance, and run:
```sql
SOURCE c:/Users/SHREE/Desktop/Briefcase/database/00_master_init.sql;
```
To run the automated assertion suite:
```sql
SOURCE c:/Users/SHREE/Desktop/Briefcase/database/15_test_cases.sql;
```

### 2. Configure Backend Credentials
Verify `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=briefcase
PORT=5000
```

### 3. Launch the Backend API Server
```powershell
cd backend
npm start
```
*Server runs at:* `http://localhost:5000`  
*API Health check:* `http://localhost:5000/api/health`

### 4. Launch the React Frontend
```powershell
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 📋 Lab Assignments Coverage

### Lab Assignment 10 (PL/SQL Backend Requirements)
- **10.1 CRUD Procedures:** `InsertClient`, `UpdateClient`, `DeleteClient` with `SIGNAL SQLSTATE '45000'`.
- **10.2 Database Accounts:** `briefcase_naive`, `briefcase_dev`, `briefcase_app`, `briefcase_dba`.
- **10.3 User Login:** `USERS` table with bcrypt salting & hashing via `RegisterUser` and `GetUserByEmail`.
- **10.4 Explicit Cursors:** `DisplayAllClients` (unbounded) and `DisplayLimitedClients` (bounded).
- **10.5 Paginated Search:** `PaginateClients` procedure + `fn_get_client_search_count` function.
- **10.6 Aggregates:** `fn_total_case_budget`, `GetCaseBudgetSummaryByType`, `ExecuteNumericAggregate`.
- **10.7 BEFORE Trigger Validation:** `trg_client_before_insert_val` and `trg_client_before_update_val`.
- **10.8 Uppercase Normalization:** `trg_client_before_insert_norm` converting names to uppercase.
- **10.9 AFTER Audit Logging:** `application_audit_log` with JSON before/after snapshots.
- **10.10 Office Hours Restriction:** Blocks Monday 14:00–16:00 with `@briefcase_simulate_monday_review` harness.

### Lab Assignment 11 (SQL Queries & Frontend Integration)
- **11.A Q1:** Display all records from `CLIENT` with timing + XML output.
- **11.A Q2:** Relational insert into `CLIENT` and dependent `CASES`.
- **11.A Q3:** Dropdown for `SUM`, `AVG`, `COUNT`, `MIN`, `MAX` on `CASES.budget` + XML output.
- **11.A Q4:** Conditional query with `=`, `!=`, `LIKE` operators + XML output.
- **11.A Q5:** Dynamic 2-table dropdowns (`CLIENT-CASES`, `CASES-CASE_TYPE`, `HEARING-COURT`) with `INNER`, `LEFT`, `RIGHT` joins.
- **11.A Q6:** Subquery retrieving clients with high-budget cases.
- **11.A Q7:** Correlated subquery (`c2.case_type_id = c1.case_type_id`).
- **11.A Q8:** Update case budget and notes with integrity checks.
- **11.B Indexes:** Profiling `idx_cases_type_budget` and `idx_client_type_name` with `EXPLAIN`.
- **11.C Views:** `vw_client_cases` and updatable `vw_surat_clients` trigger propagation.
- **11.E Dashboard:** Real-time statistics, charts, upcoming hearings, and task telemetry.
- **11.F XML Output:** `application/xml` endpoints for Queries 1, 3, and 4.

---

Detailed documentation is available in [docs/PROJECT_DOCUMENTATION.md](file:///c:/Users/SHREE/Desktop/Briefcase/docs/PROJECT_DOCUMENTATION.md).
