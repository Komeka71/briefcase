-- =====================================================================
-- Requirement 10.10: Office-Hours Modification Restriction Trigger
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Target Table: CLIENT
-- Policy: Restricts modifications (INSERT, UPDATE, DELETE) on Monday
--         between 2:00 PM and 4:00 PM (14:00 to 16:00) during the firm's
--         mandatory senior partner case-review window.
--
-- TEST HARNESS:
-- Includes a session flag (@briefcase_simulate_monday_review) so the
-- restriction can be demonstrated at any time in MySQL Workbench without
-- waiting for the exact real-world clock time.
-- =====================================================================

USE briefcase;

DROP TRIGGER IF EXISTS trg_client_before_insert_office_hours;
DROP TRIGGER IF EXISTS trg_client_before_update_office_hours;
DROP TRIGGER IF EXISTS trg_client_before_delete_office_hours;

DELIMITER //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_insert_office_hours
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_insert_office_hours
BEFORE INSERT ON CLIENT
FOR EACH ROW
BEGIN
    DECLARE v_is_monday BOOLEAN;
    DECLARE v_is_restricted_time BOOLEAN;
    DECLARE v_is_simulation BOOLEAN;

    -- In MySQL, DAYOFWEEK returns 1 for Sunday, 2 for Monday, ..., 7 for Saturday
    SET v_is_monday = (DAYOFWEEK(NOW()) = 2);
    SET v_is_restricted_time = (CURRENT_TIME() BETWEEN '14:00:00' AND '16:00:00');
    SET v_is_simulation = (COALESCE(@briefcase_simulate_monday_review, 0) = 1);

    IF (v_is_monday AND v_is_restricted_time) OR v_is_simulation THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Operation Blocked: Modifications to client records are restricted on Monday between 2:00 PM and 4:00 PM (Weekly Case Review Window).';
    END IF;
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_update_office_hours
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_update_office_hours
BEFORE UPDATE ON CLIENT
FOR EACH ROW
BEGIN
    DECLARE v_is_monday BOOLEAN;
    DECLARE v_is_restricted_time BOOLEAN;
    DECLARE v_is_simulation BOOLEAN;

    SET v_is_monday = (DAYOFWEEK(NOW()) = 2);
    SET v_is_restricted_time = (CURRENT_TIME() BETWEEN '14:00:00' AND '16:00:00');
    SET v_is_simulation = (COALESCE(@briefcase_simulate_monday_review, 0) = 1);

    IF (v_is_monday AND v_is_restricted_time) OR v_is_simulation THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Operation Blocked: Modifications to client records are restricted on Monday between 2:00 PM and 4:00 PM (Weekly Case Review Window).';
    END IF;
END //

-- ---------------------------------------------------------------------
-- Trigger: trg_client_before_delete_office_hours
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_client_before_delete_office_hours
BEFORE DELETE ON CLIENT
FOR EACH ROW
BEGIN
    DECLARE v_is_monday BOOLEAN;
    DECLARE v_is_restricted_time BOOLEAN;
    DECLARE v_is_simulation BOOLEAN;

    SET v_is_monday = (DAYOFWEEK(NOW()) = 2);
    SET v_is_restricted_time = (CURRENT_TIME() BETWEEN '14:00:00' AND '16:00:00');
    SET v_is_simulation = (COALESCE(@briefcase_simulate_monday_review, 0) = 1);

    IF (v_is_monday AND v_is_restricted_time) OR v_is_simulation THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Operation Blocked: Modifications to client records are restricted on Monday between 2:00 PM and 4:00 PM (Weekly Case Review Window).';
    END IF;
END //

DELIMITER ;
