-- =====================================================================
-- Requirement 10.4: Explicit Cursor Procedures (Table: CLIENT)
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Demonstrates explicit cursor row-by-row processing in MySQL 8.0
-- =====================================================================

USE briefcase;

DROP PROCEDURE IF EXISTS DisplayAllClients;
DROP PROCEDURE IF EXISTS DisplayLimitedClients;

DELIMITER //

-- ---------------------------------------------------------------------
-- Procedure: DisplayAllClients (Cursor Without Limit)
-- Purpose: Iterates row-by-row through all CLIENT records using an explicit cursor
-- ---------------------------------------------------------------------
CREATE PROCEDURE DisplayAllClients ()
BEGIN
    -- 1. Declare variables for fetching cursor columns
    DECLARE v_done        INT DEFAULT FALSE;
    DECLARE v_client_id   INT;
    DECLARE v_name        VARCHAR(150);
    DECLARE v_client_type VARCHAR(30);
    DECLARE v_phone       VARCHAR(20);
    DECLARE v_email       VARCHAR(150);
    DECLARE v_reg_date    DATE;
    DECLARE v_row_num     INT DEFAULT 0;

    -- 2. Declare explicit cursor
    DECLARE cur_all_clients CURSOR FOR
        SELECT client_id, name, client_type, phone, email, date_of_registration
        FROM CLIENT
        ORDER BY client_id ASC;

    -- 3. Declare continue handler for cursor exhaustion
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- 4. Temporary table to capture cursor-processed rows
    DROP TEMPORARY TABLE IF EXISTS tmp_cursor_all_clients;
    CREATE TEMPORARY TABLE tmp_cursor_all_clients (
        cursor_seq_no        INT,
        client_id            INT,
        client_name          VARCHAR(150),
        client_type          VARCHAR(30),
        contact_phone        VARCHAR(20),
        email_address        VARCHAR(150),
        registration_date    DATE,
        processed_by_cursor  BOOLEAN DEFAULT TRUE
    );

    -- 5. Open cursor
    OPEN cur_all_clients;

    -- 6. Fetch loop
    client_loop: LOOP
        FETCH cur_all_clients INTO v_client_id, v_name, v_client_type, v_phone, v_email, v_reg_date;
        IF v_done THEN
            LEAVE client_loop;
        END IF;

        SET v_row_num = v_row_num + 1;

        -- Insert processed row into temporary buffer
        INSERT INTO tmp_cursor_all_clients 
        VALUES (v_row_num, v_client_id, v_name, v_client_type, v_phone, v_email, v_reg_date, TRUE);
    END LOOP client_loop;

    -- 7. Close cursor
    CLOSE cur_all_clients;

    -- 8. Return accumulated cursor result set
    SELECT * FROM tmp_cursor_all_clients ORDER BY cursor_seq_no;
    DROP TEMPORARY TABLE IF EXISTS tmp_cursor_all_clients;
END //

-- ---------------------------------------------------------------------
-- Procedure: DisplayLimitedClients (Cursor With Limit)
-- Purpose: Iterates row-by-row using an explicit cursor up to a specified boundary
-- ---------------------------------------------------------------------
CREATE PROCEDURE DisplayLimitedClients (
    IN p_limit INT
)
BEGIN
    DECLARE v_done        INT DEFAULT FALSE;
    DECLARE v_client_id   INT;
    DECLARE v_name        VARCHAR(150);
    DECLARE v_client_type VARCHAR(30);
    DECLARE v_phone       VARCHAR(20);
    DECLARE v_email       VARCHAR(150);
    DECLARE v_reg_date    DATE;
    DECLARE v_count       INT DEFAULT 0;
    DECLARE v_max_rows    INT;

    -- Declare explicit cursor
    DECLARE cur_limited_clients CURSOR FOR
        SELECT client_id, name, client_type, phone, email, date_of_registration
        FROM CLIENT
        ORDER BY client_id ASC;

    -- Handler for end of cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Validate and sanitize limit
    IF p_limit IS NULL OR p_limit <= 0 THEN
        SET v_max_rows = 5; -- default boundary
    ELSE
        SET v_max_rows = p_limit;
    END IF;

    -- Temporary table for cursor results
    DROP TEMPORARY TABLE IF EXISTS tmp_cursor_limited_clients;
    CREATE TEMPORARY TABLE tmp_cursor_limited_clients (
        cursor_seq_no        INT,
        client_id            INT,
        client_name          VARCHAR(150),
        client_type          VARCHAR(30),
        contact_phone        VARCHAR(20),
        email_address        VARCHAR(150),
        registration_date    DATE,
        processed_by_cursor  BOOLEAN DEFAULT TRUE
    );

    OPEN cur_limited_clients;

    limited_loop: LOOP
        FETCH cur_limited_clients INTO v_client_id, v_name, v_client_type, v_phone, v_email, v_reg_date;
        
        IF v_done OR v_count >= v_max_rows THEN
            LEAVE limited_loop;
        END IF;

        SET v_count = v_count + 1;

        INSERT INTO tmp_cursor_limited_clients 
        VALUES (v_count, v_client_id, v_name, v_client_type, v_phone, v_email, v_reg_date, TRUE);
    END LOOP limited_loop;

    CLOSE cur_limited_clients;

    -- Return bounded cursor rows
    SELECT * FROM tmp_cursor_limited_clients ORDER BY cursor_seq_no;
    DROP TEMPORARY TABLE IF EXISTS tmp_cursor_limited_clients;
END //

DELIMITER ;
