# BriefCase — SVNIT Practical Assignment 11: Performance & Indexing Analysis

**Course:** CS203 Database Management Systems | Academic Year 2026-27  
**Department:** Computer Science and Engineering, SVNIT Surat  
**Target System:** BriefCase (Law Firm Practice Management & Court ERP System)  
**Database Engine:** MySQL 8.0 (InnoDB Storage Engine)  
**Evaluation Date:** 2026-11-02  
**Benchmark Scope:** Synthetic Scaled Dataset (`briefcase_perf`) with 5,000 Clients, 10,000 Legal Matters, and 10,000 Hearings.

---

## 1. Executive Summary & Benchmark Results

This benchmark analyzes the performance impact of creating strategic secondary B+Tree indexes on large relational tables in MySQL 8.0. Every query from **Section A** and **Section B** was executed against unindexed tables (Baseline) and then re-executed against indexed tables. Timings are averaged over multiple iterations using high-precision monotonic timers.

| Query ID | Description / Target Entity | Before Index (ms) | After Index (ms) | Speedup Factor | Latency Reduction | Primary Index Leveraged |
|---|---|---|---|---|---|---|
| **Q1** | All records from main table (CLIENT) | 7.656 ms | 8.035 ms | **0.95x** | **-5.0%** | Primary Key Cluster |
| **Q4a** | Exact Point Lookup on Email (CLIENT) | 2.017 ms | 0.425 ms | **4.75x** | **78.9%** | `idx_perf_client_email` |
| **Q4b** | Composite Filter on Client Type & Registration Date Range | 7.128 ms | 2.172 ms | **3.28x** | **69.5%** | `idx_perf_client_type_date` |
| **Q5** | Multi-table Relational JOIN (CASES + CLIENT + CASE_TYPE) | 40.017 ms | 19.079 ms | **2.10x** | **52.3%** | `idx_perf_cases_client_budget` |
| **Q6** | Independent Subquery from Multiple Tables | 50.138 ms | 8.763 ms | **5.72x** | **82.5%** | `idx_perf_cases_client_budget` |
| **Q7** | Correlated Subquery (Budget > Case Type Average) | 57576.271 ms | 11311.658 ms | **5.09x** | **80.4%** | `idx_perf_cases_type_budget` |
| **Q_Hearings** | Cause List Filter on Hearing Date | 5.361 ms | 0.401 ms | **13.36x** | **92.5%** | `idx_perf_hearing_date` |

---

## 2. Indexes Created and Structural Design (Section B)

To optimize queries 1 through 8, the following secondary B+Tree indexes were designed and deployed:

1. **`idx_perf_client_email` on `PERF_CLIENT(email)`:**
   - **Type:** Secondary B+Tree Non-Clustered Index
   - **Design Rationale:** Changes point lookup queries from an $O(N)$ full table scan (examining all 5,000 rows) into an $O(\log N)$ B+Tree index traversal (1 single row read).

2. **`idx_perf_client_type_date` on `PERF_CLIENT(client_type, date_of_registration)`:**
   - **Type:** Composite Secondary B+Tree Index
   - **Design Rationale:** Satisfies multi-column conditional queries. The leftmost prefix `client_type` filters rows by equality, while the second column `date_of_registration` enables fast range scans without sorting in memory.

3. **`idx_perf_cases_type_budget` on `PERF_CASES(case_type_id, budget)`:**
   - **Type:** Composite Covering Index for Correlated Subqueries
   - **Design Rationale:** Directly accelerates Query 7 (Correlated subquery). By indexing `(case_type_id, budget)`, the subquery computing `AVG(budget)` for each `case_type_id` can be resolved directly within index leaf pages without accessing the clustered data pages (Index-Only Scan).

4. **`idx_perf_cases_client_budget` on `PERF_CASES(client_id, budget)`:**
   - **Type:** Composite Foreign Key & Range Index
   - **Design Rationale:** Accelerates multi-table joins (Query 5) and subqueries (Query 6). Allows the optimizer to jump directly to qualifying budgets for each client without full table scanning.

5. **`idx_perf_hearing_date` on `PERF_HEARING(hearing_date)`:**
   - **Type:** Secondary Single-Column B+Tree Index
   - **Design Rationale:** Optimizes daily court cause list generation. Accelerates filtering 10,000 court hearings down to hearings scheduled for a specific bench date.

---

## 3. Query Execution Plan Analysis (EXPLAIN Verification)

### A. Query 4a (Point Lookup on Client Email)
```sql
SELECT * FROM PERF_CLIENT WHERE email = 'litigant_4250@briefcase-perf.in';
```
- **Before Indexing:**
  - `type:` **ALL** (Full Table Scan)
  - `possible_keys:` NULL
  - `rows examined:` **5,000**
  - `filtered:` 10.00%
- **After Indexing (`idx_perf_client_email`):**
  - `type:` **ref** (Index Lookup)
  - `key:` **idx_perf_client_email**
  - `rows examined:` **1**
  - `filtered:` 100.00%
  - **Impact:** Eliminates 4,999 unnecessary row evaluations, delivering an immediate **4.7x** speedup.

### B. Query 7 (Correlated Subquery: Budget > Category Average)
```sql
SELECT c1.case_id, c1.case_number, c1.budget, c1.case_type_id
FROM PERF_CASES c1
WHERE c1.budget > (
  SELECT AVG(c2.budget)
  FROM PERF_CASES c2
  WHERE c2.case_type_id = c1.case_type_id
);
```
- **Before Indexing:**
  - Outer query scans 10,000 cases; for each outer row, the subquery scans 10,000 cases to compute the average.
  - Total theoretical row evaluations: $10,000 \times 10,000 = 100,000,000$ operations.
- **After Indexing (`idx_perf_cases_type_budget`):**
  - Subquery uses `type: ref` on `idx_perf_cases_type_budget`.
  - Evaluates only the exact matching subset of cases belonging to that `case_type_id` directly from index memory pages.
  - **Impact:** Query latency dropped from **57576.27 ms** to **11311.66 ms** (**5.1x** faster).

### C. Cause List Filter on Hearing Date
```sql
SELECT * FROM PERF_HEARING WHERE hearing_date = '2026-05-15';
```
- **Before Indexing:** `type: ALL`, scans all 10,000 hearing rows.
- **After Indexing (`idx_perf_hearing_date`):** `type: ref`, reads only the ~10 matching hearings scheduled for that court date.

---

## 4. Database Views & Trigger Interaction Analysis (Section C)

### Architectural Findings (MySQL 8.0 Constraints)
1. **Direct Triggers on Views:**
   - Attempting `CREATE TRIGGER ... ON <view_name>` in MySQL 8.0 raises **ERROR 1347 (HY000): 'view_name' is not BASE TABLE**.
   - MySQL requires triggers to reside on the underlying relational base tables (`CLIENT`, `CASES`, etc.).

2. **Trigger Propagation through Updatable Views:**
   - When a `CALL sp_insert_client_case_surat(...)` or `UPDATE vw_surat_clients SET phone = ...` executes, MySQL automatically passes the DML down to the underlying `CLIENT` table.
   - **Verification:**
     1. `trg_client_before_update_norm` fires and normalizes the phone number.
     2. `trg_client_before_update_val` validates that phone and email follow valid structural formats.
     3. `trg_client_after_update_audit` writes an immutable audit entry to `AUDIT_LOG` recording the change.

---

## 5. Front-End Features Delivered (Section D, E, F)

1. **Section D.1 & D.2:** Full practice navigation menu with role-based visibility; Query 1 rendered as an interactive, sortable HTML table with pagination.
2. **Section D.3 & D.7:** Form controls for Query 2 (Relational Insertion with FK linking) and Query 8 (Relational Update with budget validation) on the Reports page.
3. **Section D.4 & D.5:** Dropdown controls for Query 3 (SUM, AVG, COUNT, MIN, MAX) and Query 4 (comparison operators and fields).
4. **Section D.6 & D.8:** Dynamic dropdown controls for Query 6 and Query 7 (High-Value and Practice Area Above Average options); dynamic 3-dropdown selector for Query 5 (Table 1, Table 2, Join Type).
5. **Section E (Dashboard):** Real-time practice statistics for all tables (`/api/plsql/table-stats`), unadjourned cause list hearings, and active urgent tasks.
6. **Section F (XML Serialization):** XML format available for Query 1, Query 3, and Query 4 via HTTP Accept headers or `?format=xml` query parameter, complete with in-browser XML modal viewer and one-click copy.

---
*Report generated automatically by `backend/scripts/measureQueries.js`.*
