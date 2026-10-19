-- =====================================================================
-- Requirement 10.5: Paginated Search Implementation
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Demonstrates paginated retrieval with/without filter conditions.
-- Compatibility Note: In MySQL, stored functions return only scalar values.
-- Multi-row paginated data is returned via a Stored Procedure, and the
-- scalar count is provided via a MySQL Stored Function (fn_get_client_search_count).
-- =====================================================================

USE briefcase;

DROP FUNCTION IF EXISTS fn_get_client_search_count;
DROP PROCEDURE IF EXISTS PaginateClients;

DELIMITER //

-- ---------------------------------------------------------------------
-- Function: fn_get_client_search_count
-- Purpose: Returns total count of clients matching a given search term (scalar function)
-- ---------------------------------------------------------------------
CREATE FUNCTION fn_get_client_search_count (
    p_search VARCHAR(100)
)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total INT DEFAULT 0;

    IF p_search IS NULL OR TRIM(p_search) = '' THEN
        SELECT COUNT(*) INTO v_total FROM CLIENT;
    ELSE
        SELECT COUNT(*) INTO v_total 
        FROM CLIENT 
        WHERE name LIKE CONCAT('%', TRIM(p_search), '%')
           OR email LIKE CONCAT('%', TRIM(p_search), '%')
           OR client_type LIKE CONCAT('%', TRIM(p_search), '%')
           OR phone LIKE CONCAT('%', TRIM(p_search), '%');
    END IF;

    RETURN v_total;
END //

-- ---------------------------------------------------------------------
-- Procedure: PaginateClients
-- Purpose: Retrieves a paginated slice of clients with stable ordering,
--          supporting optional filtering by name, email, or client_type.
-- ---------------------------------------------------------------------
CREATE PROCEDURE PaginateClients (
    IN p_page      INT,
    IN p_page_size INT,
    IN p_search    VARCHAR(100)
)
BEGIN
    DECLARE v_page      INT;
    DECLARE v_limit     INT;
    DECLARE v_offset    INT;
    DECLARE v_total     INT;
    DECLARE v_pages     INT;
    DECLARE v_search_str VARCHAR(102);

    -- 1. Sanitize and validate page number
    IF p_page IS NULL OR p_page < 1 THEN
        SET v_page = 1;
    ELSE
        SET v_page = p_page;
    END IF;

    -- 2. Sanitize and bound page size (prevent denial of service)
    IF p_page_size IS NULL OR p_page_size < 1 THEN
        SET v_limit = 10;
    ELSEIF p_page_size > 100 THEN
        SET v_limit = 100;
    ELSE
        SET v_limit = p_page_size;
    END IF;

    -- 3. Calculate offset
    SET v_offset = (v_page - 1) * v_limit;

    -- 4. Calculate total matching records using scalar function
    SET v_total = fn_get_client_search_count(p_search);
    SET v_pages = CEIL(v_total / v_limit);
    IF v_pages = 0 THEN
        SET v_pages = 1;
    END IF;

    -- 5. Prepare search pattern
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search_str = CONCAT('%', TRIM(p_search), '%');

        -- Return paginated filtered data
        SELECT 
            client_id,
            name,
            client_type,
            phone,
            email,
            address,
            date_of_registration
        FROM CLIENT
        WHERE name LIKE v_search_str
           OR email LIKE v_search_str
           OR client_type LIKE v_search_str
           OR phone LIKE v_search_str
        ORDER BY client_id ASC
        LIMIT v_limit OFFSET v_offset;
    ELSE
        -- Return unfiltered paginated data
        SELECT 
            client_id,
            name,
            client_type,
            phone,
            email,
            address,
            date_of_registration
        FROM CLIENT
        ORDER BY client_id ASC
        LIMIT v_limit OFFSET v_offset;
    END IF;

    -- 6. Return metadata as second result set for frontend pagination component
    SELECT 
        v_page AS current_page,
        v_limit AS page_size,
        v_total AS total_records,
        v_pages AS total_pages;
END //

DELIMITER ;
