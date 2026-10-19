-- =====================================================================
-- Requirement 10.9: Audit Logging System (AFTER Triggers)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Demonstration Table: CLIENT
-- Tracks complete historical lineage of INSERT, UPDATE, and DELETE operations.
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- 1. Create Dedicated Audit Log Table
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

DROP TRIGGER IF EXISTS trg_client_after_insert_audit;
DROP TRIGGER IF EXISTS trg_client_after_update_audit;
DROP TRIGGER IF EXISTS trg_client_after_delete_audit;

DELIMITER //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_after_insert_audit
-- Records newly inserted client data in JSON format
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_after_insert_audit
AFTER INSERT ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (
        table_name,
        operation_type,
        record_id,
        old_values,
        new_values,
        changed_at,
        changed_by
    )
    VALUES (
        'CLIENT',
        'INSERT',
        NEW.client_id,
        NULL,
        JSON_OBJECT(
            'client_id', NEW.client_id,
            'name', NEW.name,
            'client_type', NEW.client_type,
            'phone', NEW.phone,
            'email', NEW.email,
            'address', NEW.address,
            'date_of_registration', NEW.date_of_registration
        ),
        NOW(),
        COALESCE(@current_app_user, CURRENT_USER())
    );
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_after_update_audit
-- Records before and after state diffs upon updates
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_after_update_audit
AFTER UPDATE ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (
        table_name,
        operation_type,
        record_id,
        old_values,
        new_values,
        changed_at,
        changed_by
    )
    VALUES (
        'CLIENT',
        'UPDATE',
        NEW.client_id,
        JSON_OBJECT(
            'client_id', OLD.client_id,
            'name', OLD.name,
            'client_type', OLD.client_type,
            'phone', OLD.phone,
            'email', OLD.email,
            'address', OLD.address,
            'date_of_registration', OLD.date_of_registration
        ),
        JSON_OBJECT(
            'client_id', NEW.client_id,
            'name', NEW.name,
            'client_type', NEW.client_type,
            'phone', NEW.phone,
            'email', NEW.email,
            'address', NEW.address,
            'date_of_registration', NEW.date_of_registration
        ),
        NOW(),
        COALESCE(@current_app_user, CURRENT_USER())
    );
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_after_delete_audit
-- Records preserved snapshot of deleted row
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_after_delete_audit
AFTER DELETE ON CLIENT
FOR EACH ROW
BEGIN
    INSERT INTO application_audit_log (
        table_name,
        operation_type,
        record_id,
        old_values,
        new_values,
        changed_at,
        changed_by
    )
    VALUES (
        'CLIENT',
        'DELETE',
        OLD.client_id,
        JSON_OBJECT(
            'client_id', OLD.client_id,
            'name', OLD.name,
            'client_type', OLD.client_type,
            'phone', OLD.phone,
            'email', OLD.email,
            'address', OLD.address,
            'date_of_registration', OLD.date_of_registration
        ),
        NULL,
        NOW(),
        COALESCE(@current_app_user, CURRENT_USER())
    );
END //

DELIMITER ;
