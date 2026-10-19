-- =====================================================================
-- Requirement 10.8: Uppercase Normalization Triggers
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Demonstration Table: CLIENT
-- Normalizes:
--   1. CLIENT.name -> Converted to UPPERCASE before saving.
--   2. CLIENT.email -> Normalized to LOWERCASE.
--
-- COMPATIBILITY NOTE:
-- The assignment text mentions a "statement trigger". However, MySQL
-- does NOT support Oracle-style statement-level triggers. In MySQL,
-- triggers are strictly row-level (FOR EACH ROW), and column value
-- modification is performed in BEFORE INSERT and BEFORE UPDATE triggers
-- via NEW.column = UPPER(...). This script implements the exact MySQL
-- standard equivalent.
-- =====================================================================

USE briefcase;

DROP TRIGGER IF EXISTS trg_client_before_insert_norm;
DROP TRIGGER IF EXISTS trg_client_before_update_norm;

DELIMITER //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_insert_norm
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_insert_norm
BEFORE INSERT ON CLIENT
FOR EACH ROW
BEGIN
    -- Normalize client name to UPPERCASE
    IF NEW.name IS NOT NULL THEN
        SET NEW.name = UPPER(TRIM(NEW.name));
    END IF;

    -- Normalize email to LOWERCASE
    IF NEW.email IS NOT NULL THEN
        SET NEW.email = LOWER(TRIM(NEW.email));
    END IF;
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_update_norm
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_update_norm
BEFORE UPDATE ON CLIENT
FOR EACH ROW
BEGIN
    -- Normalize client name to UPPERCASE
    IF NEW.name IS NOT NULL THEN
        SET NEW.name = UPPER(TRIM(NEW.name));
    END IF;

    -- Normalize email to LOWERCASE
    IF NEW.email IS NOT NULL THEN
        SET NEW.email = LOWER(TRIM(NEW.email));
    END IF;
END //

DELIMITER ;
