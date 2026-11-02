-- =====================================================================
-- Requirement 10.9 & Phase 1.11: Comprehensive Audit Logging System
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- File: 10_audit_logging.sql
-- Tracks complete historical lineage of INSERT, UPDATE, and DELETE
-- across CLIENT, CASES, LAWYER, HEARING, INVOICE, PAYMENT, TASK, DOCUMENT, USERS.
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- 1. Create Dedicated Audit Log Table & Ensure Structure
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_audit_log (
    audit_id       INT AUTO_INCREMENT PRIMARY KEY,
    table_name     VARCHAR(50)  NOT NULL,
    operation_type VARCHAR(10)  NOT NULL, -- INSERT, UPDATE, DELETE
    record_id      INT          NOT NULL,
    old_values     JSON         NULL,
    new_values     JSON         NULL,
    changed_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by     VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DELIMITER //
CREATE PROCEDURE AddColumnIfNotExists (
    IN p_table_name VARCHAR(64),
    IN p_col_name   VARCHAR(64),
    IN p_col_def    VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND column_name = p_col_name;

    IF v_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_col_name, ' ', p_col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL AddColumnIfNotExists('application_audit_log', 'old_values', 'JSON NULL AFTER record_id');
CALL AddColumnIfNotExists('application_audit_log', 'new_values', 'JSON NULL AFTER old_values');
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

-- Clean up any legacy or duplicate triggers
DROP TRIGGER IF EXISTS CaseAfterInsert;
DROP TRIGGER IF EXISTS CaseAfterUpdate;
DROP TRIGGER IF EXISTS CaseAfterDelete;

DROP TRIGGER IF EXISTS trg_client_after_insert_audit;
DROP TRIGGER IF EXISTS trg_client_after_update_audit;
DROP TRIGGER IF EXISTS trg_client_after_delete_audit;

DROP TRIGGER IF EXISTS trg_cases_after_insert_audit;
DROP TRIGGER IF EXISTS trg_cases_after_update_audit;
DROP TRIGGER IF EXISTS trg_cases_after_delete_audit;

DROP TRIGGER IF EXISTS trg_lawyer_after_insert_audit;
DROP TRIGGER IF EXISTS trg_lawyer_after_update_audit;
DROP TRIGGER IF EXISTS trg_lawyer_after_delete_audit;

DROP TRIGGER IF EXISTS trg_hearing_after_insert_audit;
DROP TRIGGER IF EXISTS trg_hearing_after_update_audit;
DROP TRIGGER IF EXISTS trg_hearing_after_delete_audit;

DROP TRIGGER IF EXISTS trg_invoice_after_insert_audit;
DROP TRIGGER IF EXISTS trg_invoice_after_update_audit;
DROP TRIGGER IF EXISTS trg_invoice_after_delete_audit;

DROP TRIGGER IF EXISTS trg_payment_after_insert_audit;
DROP TRIGGER IF EXISTS trg_payment_after_update_audit;
DROP TRIGGER IF EXISTS trg_payment_after_delete_audit;

DROP TRIGGER IF EXISTS trg_task_after_insert_audit;
DROP TRIGGER IF EXISTS trg_task_after_update_audit;
DROP TRIGGER IF EXISTS trg_task_after_delete_audit;

DROP TRIGGER IF EXISTS trg_document_after_insert_audit;
DROP TRIGGER IF EXISTS trg_document_after_update_audit;
DROP TRIGGER IF EXISTS trg_document_after_delete_audit;

DROP TRIGGER IF EXISTS trg_users_after_insert_audit;
DROP TRIGGER IF EXISTS trg_users_after_update_audit;
DROP TRIGGER IF EXISTS trg_users_after_delete_audit;

DELIMITER //

-- =====================================================================
-- 2. CLIENT Triggers
-- =====================================================================
CREATE TRIGGER trg_client_after_insert_audit
AFTER INSERT ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CLIENT', 'INSERT', NEW.client_id, NULL,
        JSON_OBJECT('client_id', NEW.client_id, 'name', NEW.name, 'client_type', NEW.client_type, 'phone', NEW.phone, 'email', NEW.email, 'address', NEW.address, 'date_of_registration', NEW.date_of_registration),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_client_after_update_audit
AFTER UPDATE ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CLIENT', 'UPDATE', NEW.client_id,
        JSON_OBJECT('client_id', OLD.client_id, 'name', OLD.name, 'client_type', OLD.client_type, 'phone', OLD.phone, 'email', OLD.email, 'address', OLD.address, 'date_of_registration', OLD.date_of_registration),
        JSON_OBJECT('client_id', NEW.client_id, 'name', NEW.name, 'client_type', NEW.client_type, 'phone', NEW.phone, 'email', NEW.email, 'address', NEW.address, 'date_of_registration', NEW.date_of_registration),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_client_after_delete_audit
AFTER DELETE ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CLIENT', 'DELETE', OLD.client_id,
        JSON_OBJECT('client_id', OLD.client_id, 'name', OLD.name, 'client_type', OLD.client_type, 'phone', OLD.phone, 'email', OLD.email, 'address', OLD.address, 'date_of_registration', OLD.date_of_registration),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 3. CASES Triggers
-- =====================================================================
CREATE TRIGGER trg_cases_after_insert_audit
AFTER INSERT ON CASES
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CASES', 'INSERT', NEW.case_id, NULL,
        JSON_OBJECT('case_id', NEW.case_id, 'case_number', NEW.case_number, 'title', NEW.title, 'client_id', NEW.client_id, 'case_type_id', NEW.case_type_id, 'current_status_id', NEW.current_status_id, 'priority', NEW.priority, 'budget', NEW.budget, 'filed_date', NEW.filed_date),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_cases_after_update_audit
AFTER UPDATE ON CASES
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CASES', 'UPDATE', NEW.case_id,
        JSON_OBJECT('case_id', OLD.case_id, 'case_number', OLD.case_number, 'title', OLD.title, 'client_id', OLD.client_id, 'case_type_id', OLD.case_type_id, 'current_status_id', OLD.current_status_id, 'priority', OLD.priority, 'budget', OLD.budget, 'notes', OLD.notes),
        JSON_OBJECT('case_id', NEW.case_id, 'case_number', NEW.case_number, 'title', NEW.title, 'client_id', NEW.client_id, 'case_type_id', NEW.case_type_id, 'current_status_id', NEW.current_status_id, 'priority', NEW.priority, 'budget', NEW.budget, 'notes', NEW.notes),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_cases_after_delete_audit
AFTER DELETE ON CASES
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'CASES', 'DELETE', OLD.case_id,
        JSON_OBJECT('case_id', OLD.case_id, 'case_number', OLD.case_number, 'title', OLD.title, 'client_id', OLD.client_id, 'case_type_id', OLD.case_type_id, 'budget', OLD.budget),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 4. LAWYER Triggers
-- =====================================================================
CREATE TRIGGER trg_lawyer_after_insert_audit
AFTER INSERT ON LAWYER
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'LAWYER', 'INSERT', NEW.lawyer_id, NULL,
        JSON_OBJECT('lawyer_id', NEW.lawyer_id, 'name', NEW.name, 'email', NEW.email, 'bar_registration_no', NEW.bar_registration_no, 'experience_years', NEW.experience_years, 'status', NEW.status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_lawyer_after_update_audit
AFTER UPDATE ON LAWYER
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'LAWYER', 'UPDATE', NEW.lawyer_id,
        JSON_OBJECT('lawyer_id', OLD.lawyer_id, 'name', OLD.name, 'email', OLD.email, 'status', OLD.status),
        JSON_OBJECT('lawyer_id', NEW.lawyer_id, 'name', NEW.name, 'email', NEW.email, 'status', NEW.status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_lawyer_after_delete_audit
AFTER DELETE ON LAWYER
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'LAWYER', 'DELETE', OLD.lawyer_id,
        JSON_OBJECT('lawyer_id', OLD.lawyer_id, 'name', OLD.name, 'email', OLD.email),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 5. HEARING Triggers
-- =====================================================================
CREATE TRIGGER trg_hearing_after_insert_audit
AFTER INSERT ON HEARING
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'HEARING', 'INSERT', NEW.hearing_id, NULL,
        JSON_OBJECT('hearing_id', NEW.hearing_id, 'case_id', NEW.case_id, 'court_id', NEW.court_id, 'hearing_date', NEW.hearing_date, 'outcome', NEW.outcome, 'notes', NEW.notes),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_hearing_after_update_audit
AFTER UPDATE ON HEARING
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'HEARING', 'UPDATE', NEW.hearing_id,
        JSON_OBJECT('hearing_id', OLD.hearing_id, 'case_id', OLD.case_id, 'hearing_date', OLD.hearing_date, 'outcome', OLD.outcome, 'notes', OLD.notes),
        JSON_OBJECT('hearing_id', NEW.hearing_id, 'case_id', NEW.case_id, 'hearing_date', NEW.hearing_date, 'outcome', NEW.outcome, 'notes', NEW.notes),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_hearing_after_delete_audit
AFTER DELETE ON HEARING
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'HEARING', 'DELETE', OLD.hearing_id,
        JSON_OBJECT('hearing_id', OLD.hearing_id, 'case_id', OLD.case_id, 'hearing_date', OLD.hearing_date, 'outcome', OLD.outcome),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 6. INVOICE Triggers
-- =====================================================================
CREATE TRIGGER trg_invoice_after_insert_audit
AFTER INSERT ON INVOICE
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'INVOICE', 'INSERT', NEW.invoice_id, NULL,
        JSON_OBJECT('invoice_id', NEW.invoice_id, 'case_id', NEW.case_id, 'invoice_number', NEW.invoice_number, 'amount', NEW.amount, 'status', NEW.status, 'due_date', NEW.due_date),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_invoice_after_update_audit
AFTER UPDATE ON INVOICE
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'INVOICE', 'UPDATE', NEW.invoice_id,
        JSON_OBJECT('invoice_id', OLD.invoice_id, 'amount', OLD.amount, 'status', OLD.status),
        JSON_OBJECT('invoice_id', NEW.invoice_id, 'amount', NEW.amount, 'status', NEW.status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_invoice_after_delete_audit
AFTER DELETE ON INVOICE
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'INVOICE', 'DELETE', OLD.invoice_id,
        JSON_OBJECT('invoice_id', OLD.invoice_id, 'invoice_number', OLD.invoice_number, 'amount', OLD.amount, 'status', OLD.status),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 7. PAYMENT Triggers
-- =====================================================================
CREATE TRIGGER trg_payment_after_insert_audit
AFTER INSERT ON PAYMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'PAYMENT', 'INSERT', NEW.payment_id, NULL,
        JSON_OBJECT('payment_id', NEW.payment_id, 'case_id', NEW.case_id, 'invoice_id', NEW.invoice_id, 'amount', NEW.amount, 'payment_status', NEW.payment_status, 'payment_date', NEW.payment_date),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_payment_after_update_audit
AFTER UPDATE ON PAYMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'PAYMENT', 'UPDATE', NEW.payment_id,
        JSON_OBJECT('payment_id', OLD.payment_id, 'amount', OLD.amount, 'payment_status', OLD.payment_status),
        JSON_OBJECT('payment_id', NEW.payment_id, 'amount', NEW.amount, 'payment_status', NEW.payment_status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_payment_after_delete_audit
AFTER DELETE ON PAYMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'PAYMENT', 'DELETE', OLD.payment_id,
        JSON_OBJECT('payment_id', OLD.payment_id, 'amount', OLD.amount, 'payment_status', OLD.payment_status),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 8. TASK Triggers
-- =====================================================================
CREATE TRIGGER trg_task_after_insert_audit
AFTER INSERT ON TASK
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'TASK', 'INSERT', NEW.task_id, NULL,
        JSON_OBJECT('task_id', NEW.task_id, 'case_id', NEW.case_id, 'title', NEW.title, 'priority', NEW.priority, 'status', NEW.status, 'due_date', NEW.due_date),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_task_after_update_audit
AFTER UPDATE ON TASK
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'TASK', 'UPDATE', NEW.task_id,
        JSON_OBJECT('task_id', OLD.task_id, 'title', OLD.title, 'status', OLD.status, 'priority', OLD.priority),
        JSON_OBJECT('task_id', NEW.task_id, 'title', NEW.title, 'status', NEW.status, 'priority', NEW.priority),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_task_after_delete_audit
AFTER DELETE ON TASK
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'TASK', 'DELETE', OLD.task_id,
        JSON_OBJECT('task_id', OLD.task_id, 'title', OLD.title, 'status', OLD.status),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 9. DOCUMENT Triggers
-- =====================================================================
CREATE TRIGGER trg_document_after_insert_audit
AFTER INSERT ON DOCUMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'DOCUMENT', 'INSERT', NEW.document_id, NULL,
        JSON_OBJECT('document_id', NEW.document_id, 'case_id', NEW.case_id, 'title', NEW.title, 'file_path', NEW.file_path, 'is_confidential', NEW.is_confidential),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_document_after_update_audit
AFTER UPDATE ON DOCUMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'DOCUMENT', 'UPDATE', NEW.document_id,
        JSON_OBJECT('document_id', OLD.document_id, 'title', OLD.title, 'is_confidential', OLD.is_confidential),
        JSON_OBJECT('document_id', NEW.document_id, 'title', NEW.title, 'is_confidential', NEW.is_confidential),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_document_after_delete_audit
AFTER DELETE ON DOCUMENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'DOCUMENT', 'DELETE', OLD.document_id,
        JSON_OBJECT('document_id', OLD.document_id, 'title', OLD.title, 'file_path', OLD.file_path),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

-- =====================================================================
-- 10. USERS Triggers (Excludes password_hash for security)
-- =====================================================================
CREATE TRIGGER trg_users_after_insert_audit
AFTER INSERT ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'USERS', 'INSERT', NEW.user_id, NULL,
        JSON_OBJECT('user_id', NEW.user_id, 'name', NEW.name, 'email', NEW.email, 'role', NEW.role, 'status', NEW.status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_users_after_update_audit
AFTER UPDATE ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'USERS', 'UPDATE', NEW.user_id,
        JSON_OBJECT('user_id', OLD.user_id, 'name', OLD.name, 'email', OLD.email, 'role', OLD.role, 'status', OLD.status),
        JSON_OBJECT('user_id', NEW.user_id, 'name', NEW.name, 'email', NEW.email, 'role', NEW.role, 'status', NEW.status),
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

CREATE TRIGGER trg_users_after_delete_audit
AFTER DELETE ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (table_name, operation_type, record_id, old_values, new_values, changed_at, changed_by)
    VALUES (
        'USERS', 'DELETE', OLD.user_id,
        JSON_OBJECT('user_id', OLD.user_id, 'name', OLD.name, 'email', OLD.email, 'role', OLD.role, 'status', OLD.status),
        NULL,
        NOW(),
        CASE WHEN @app_role IS NOT NULL AND @app_user_id IS NOT NULL THEN CONCAT(@app_role, ' (User #', @app_user_id, ')') WHEN @app_role IS NOT NULL THEN @app_role ELSE USER() END
    );
END //

DELIMITER ;
