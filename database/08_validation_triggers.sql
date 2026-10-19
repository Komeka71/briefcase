-- =====================================================================
-- Requirement 10.7: BEFORE Trigger: Data Validation
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Demonstration Table: CLIENT
-- Validates:
--   1. Name is non-empty, non-whitespace, and at least 2 characters long.
--   2. Client type must strictly be 'Individual' or 'Organization'.
--   3. Email format check (must contain '@' and '.') if provided.
-- =====================================================================

USE briefcase;

DROP TRIGGER IF EXISTS trg_client_before_insert_val;
DROP TRIGGER IF EXISTS trg_client_before_update_val;

DELIMITER //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_insert_val
-- Fired BEFORE an INSERT on CLIENT
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_insert_val
BEFORE INSERT ON CLIENT
FOR EACH ROW
BEGIN
    -- Integrity Check 1: Non-empty, non-whitespace client name
    IF NEW.name IS NULL OR CHAR_LENGTH(TRIM(NEW.name)) < 2 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Client name cannot be empty and must be at least 2 characters.';
    END IF;

    -- Integrity Check 2: Valid client classification
    IF NEW.client_type NOT IN ('Individual', 'Organization') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Client type must strictly be "Individual" or "Organization".';
    END IF;

    -- Integrity Check 3: Valid email format if provided
    IF NEW.email IS NOT NULL AND TRIM(NEW.email) != '' THEN
        IF NEW.email NOT LIKE '%_@__%.__%' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Invalid email format provided.';
        END IF;
    END IF;
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_update_val
-- Fired BEFORE an UPDATE on CLIENT
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_update_val
BEFORE UPDATE ON CLIENT
FOR EACH ROW
BEGIN
    -- Integrity Check 1: Non-empty, non-whitespace client name
    IF NEW.name IS NULL OR CHAR_LENGTH(TRIM(NEW.name)) < 2 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Updated client name cannot be empty and must be at least 2 characters.';
    END IF;

    -- Integrity Check 2: Valid client classification
    IF NEW.client_type NOT IN ('Individual', 'Organization') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Updated client type must strictly be "Individual" or "Organization".';
    END IF;

    -- Integrity Check 3: Valid email format if provided
    IF NEW.email IS NOT NULL AND TRIM(NEW.email) != '' THEN
        IF NEW.email NOT LIKE '%_@__%.__%' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Integrity Violation [Trigger]: Updated email has an invalid format.';
        END IF;
    END IF;
END //

DELIMITER ;
