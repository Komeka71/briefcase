-- =====================================================================
-- BriefCase - Master Initialization Runner Script
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Run this script in MySQL Workbench or MySQL Command Line to initialize
-- the complete database, tables, seed data, stored procedures, functions,
-- triggers, views, and indexes.
-- =====================================================================

-- Step 1: Create Database and Tables
SOURCE 01_schema_verification.sql;

-- Step 2: Seed Comprehensive Sample Data
SOURCE 02_sample_data.sql;

-- Step 3: Create CRUD Stored Procedures
SOURCE 03_crud_procedures.sql;

-- Step 4: Create User Management Stored Procedures
SOURCE 04_user_management.sql;

-- Step 5: Create Explicit Cursor Procedures
SOURCE 05_cursor_procedures.sql;

-- Step 6: Create Paginated Search Procedures and Functions
SOURCE 06_pagination.sql;

-- Step 7: Create Aggregate Functions and Procedures
SOURCE 07_aggregate_functions.sql;

-- Step 8: Create Data Integrity Validation Triggers
SOURCE 08_validation_triggers.sql;

-- Step 9: Create Uppercase Normalization Triggers
SOURCE 09_normalization_triggers.sql;

-- Step 10: Create Audit Logging System and AFTER Triggers
SOURCE 10_audit_logging.sql;

-- Step 11: Create Office-Hours Restriction Triggers
SOURCE 11_office_hours_restriction.sql;

-- Step 12: Create Views and View-related Procedures
SOURCE 12_views.sql;

-- Step 13: Create Indexes and Performance Analyzers
SOURCE 13_indexes.sql;

-- Final Verification Check
SELECT 'BriefCase Database initialization finished successfully!' AS status;
