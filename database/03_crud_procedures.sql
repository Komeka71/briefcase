-- =====================================================================
-- Requirement 10.1: CRUD Stored Procedures (Demonstration Table: CLIENT)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- =====================================================================

USE briefcase;

DROP PROCEDURE IF EXISTS InsertClient;
DROP PROCEDURE IF EXISTS UpdateClient;
DROP PROCEDURE IF EXISTS DeleteClient;
DROP PROCEDURE IF EXISTS GetClientById;

DELIMITER //

-- ---------------------------------------------------------------------
-- Procedure: InsertClient
-- Purpose: Inserts a new client record with validation and returns the generated ID
-- ---------------------------------------------------------------------
CREATE PROCEDURE InsertClient (
    IN  p_name        VARCHAR(150),
    IN  p_client_type VARCHAR(30),
    IN  p_phone       VARCHAR(20),
    IN  p_email       VARCHAR(150),
    IN  p_address     VARCHAR(255),
    OUT p_client_id   INT
)
BEGIN
    -- Validate required fields
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Client name cannot be empty or whitespace.';
    END IF;

    IF p_client_type NOT IN ('Individual', 'Organization') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Client type must be either "Individual" or "Organization".';
    END IF;

    INSERT INTO CLIENT (name, client_type, phone, email, address, date_of_registration)
    VALUES (TRIM(p_name), p_client_type, TRIM(p_phone), TRIM(p_email), TRIM(p_address), CURRENT_DATE);

    SET p_client_id = LAST_INSERT_ID();

    -- Return the newly created record
    SELECT * FROM CLIENT WHERE client_id = p_client_id;
END //

-- ---------------------------------------------------------------------
-- Procedure: UpdateClient
-- Purpose: Updates an existing client record identified by client_id
-- ---------------------------------------------------------------------
CREATE PROCEDURE UpdateClient (
    IN p_client_id   INT,
    IN p_name        VARCHAR(150),
    IN p_client_type VARCHAR(30),
    IN p_phone       VARCHAR(20),
    IN p_email       VARCHAR(150),
    IN p_address     VARCHAR(255)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    -- Check if record exists
    SELECT COUNT(*) INTO v_exists FROM CLIENT WHERE client_id = p_client_id;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Client record not found with the specified client_id.';
    END IF;

    -- Validate required fields
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Client name cannot be empty.';
    END IF;

    IF p_client_type NOT IN ('Individual', 'Organization') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Client type must be "Individual" or "Organization".';
    END IF;

    UPDATE CLIENT
    SET name        = TRIM(p_name),
        client_type = p_client_type,
        phone       = TRIM(p_phone),
        email       = TRIM(p_email),
        address     = TRIM(p_address)
    WHERE client_id = p_client_id;

    -- Return updated row
    SELECT * FROM CLIENT WHERE client_id = p_client_id;
END //

-- ---------------------------------------------------------------------
-- Procedure: DeleteClient
-- Purpose: Deletes a client record after checking referential integrity
-- ---------------------------------------------------------------------
CREATE PROCEDURE DeleteClient (
    IN p_client_id INT
)
BEGIN
    DECLARE v_case_count INT DEFAULT 0;
    DECLARE v_appt_count INT DEFAULT 0;
    DECLARE v_exists     INT DEFAULT 0;

    -- Verify client existence
    SELECT COUNT(*) INTO v_exists FROM CLIENT WHERE client_id = p_client_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Client does not exist.';
    END IF;

    -- Check dependent cases
    SELECT COUNT(*) INTO v_case_count FROM CASES WHERE client_id = p_client_id;
    IF v_case_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Error: Cannot delete client. Associated legal cases exist.';
    END IF;

    -- Check dependent appointments
    SELECT COUNT(*) INTO v_appt_count FROM APPOINTMENT WHERE client_id = p_client_id;
    IF v_appt_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Error: Cannot delete client. Associated lawyer appointments exist.';
    END IF;

    DELETE FROM CLIENT WHERE client_id = p_client_id;

    SELECT CONCAT('Client with ID ', p_client_id, ' successfully deleted.') AS message;
END //

-- ---------------------------------------------------------------------
-- Procedure: GetClientById
-- Purpose: Retrieves single client details
-- ---------------------------------------------------------------------
CREATE PROCEDURE GetClientById (
    IN p_client_id INT
)
BEGIN
    SELECT * FROM CLIENT WHERE client_id = p_client_id;
END //

DELIMITER ;
