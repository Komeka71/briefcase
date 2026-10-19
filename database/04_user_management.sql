-- =====================================================================
-- Requirements 10.2 & 10.3: Database Users, Privileges & User Management
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- =====================================================================

USE briefcase;

-- =====================================================================
-- SECTION A: Database User Accounts (Requirement 10.2)
-- Note: MySQL Database Accounts != Application Login Users (in USERS table)
-- MySQL Accounts control DB server privileges; USERS table stores app logins.
-- Use environment-specific strong passwords in production.
-- =====================================================================

-- 1. Naive / Basic User: Read-only access to basic public legal entities
DROP USER IF EXISTS 'briefcase_naive'@'localhost';
CREATE USER 'briefcase_naive'@'localhost' IDENTIFIED BY 'NaivePass@2026';
GRANT SELECT ON briefcase.CLIENT TO 'briefcase_naive'@'localhost';
GRANT SELECT ON briefcase.CASES TO 'briefcase_naive'@'localhost';
GRANT SELECT ON briefcase.COURT TO 'briefcase_naive'@'localhost';
GRANT SELECT ON briefcase.CASE_TYPE TO 'briefcase_naive'@'localhost';
GRANT SELECT ON briefcase.CASE_STATUS TO 'briefcase_naive'@'localhost';

-- 2. Application Developer: Full DML and Stored Procedure Execution on briefcase
DROP USER IF EXISTS 'briefcase_dev'@'localhost';
CREATE USER 'briefcase_dev'@'localhost' IDENTIFIED BY 'DevPass@2026';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON briefcase.* TO 'briefcase_dev'@'localhost';

-- 3. Dedicated Node.js Backend Application Account (Principle of Least Privilege)
DROP USER IF EXISTS 'briefcase_app'@'localhost';
CREATE USER 'briefcase_app'@'localhost' IDENTIFIED BY 'AppService@2026';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON briefcase.* TO 'briefcase_app'@'localhost';

-- 4. Database Administrator (DBA): Full administrative privileges on briefcase
DROP USER IF EXISTS 'briefcase_dba'@'localhost';
CREATE USER 'briefcase_dba'@'localhost' IDENTIFIED BY 'DbaSecure@2026';
GRANT ALL PRIVILEGES ON briefcase.* TO 'briefcase_dba'@'localhost' WITH GRANT OPTION;

FLUSH PRIVILEGES;

-- Verification of privileges:
SHOW GRANTS FOR 'briefcase_naive'@'localhost';
SHOW GRANTS FOR 'briefcase_dev'@'localhost';
SHOW GRANTS FOR 'briefcase_app'@'localhost';
SHOW GRANTS FOR 'briefcase_dba'@'localhost';

-- =====================================================================
-- SECTION B: Application User Login Stored Procedures (Requirement 10.3)
-- Manages application credentials stored securely in USERS table.
-- Node.js handles bcrypt salting & hashing before invoking these procedures.
-- =====================================================================

DROP PROCEDURE IF EXISTS RegisterUser;
DROP PROCEDURE IF EXISTS UpdateUser;
DROP PROCEDURE IF EXISTS DeleteUser;
DROP PROCEDURE IF EXISTS GetUserByEmail;
DROP PROCEDURE IF EXISTS GetAllUsers;

DELIMITER //

-- Procedure: RegisterUser
CREATE PROCEDURE RegisterUser (
    IN  p_name          VARCHAR(150),
    IN  p_email         VARCHAR(150),
    IN  p_password_hash VARCHAR(255),
    IN  p_role          VARCHAR(30),
    IN  p_status        VARCHAR(20),
    OUT p_user_id       INT
)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    -- Validate role
    IF p_role NOT IN ('Admin', 'Lawyer', 'Assistant', 'Staff') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Role must be Admin, Lawyer, Assistant, or Staff.';
    END IF;

    -- Check duplicate email
    SELECT COUNT(*) INTO v_count FROM USERS WHERE email = TRIM(p_email);
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Error: A user with this email address already exists.';
    END IF;

    INSERT INTO USERS (name, email, password_hash, role, status, created_at)
    VALUES (TRIM(p_name), LOWER(TRIM(p_email)), p_password_hash, p_role, COALESCE(p_status, 'Active'), NOW());

    SET p_user_id = LAST_INSERT_ID();

    -- Return safe user details (excluding password_hash)
    SELECT user_id, name, email, role, status, created_at 
    FROM USERS WHERE user_id = p_user_id;
END //

-- Procedure: UpdateUser
CREATE PROCEDURE UpdateUser (
    IN p_user_id INT,
    IN p_name    VARCHAR(150),
    IN p_email   VARCHAR(150),
    IN p_role    VARCHAR(30),
    IN p_status  VARCHAR(20)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_dup_email INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists FROM USERS WHERE user_id = p_user_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Specified user_id does not exist.';
    END IF;

    SELECT COUNT(*) INTO v_dup_email 
    FROM USERS 
    WHERE email = LOWER(TRIM(p_email)) AND user_id != p_user_id;

    IF v_dup_email > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Error: Email is already utilized by another user.';
    END IF;

    UPDATE USERS
    SET name   = TRIM(p_name),
        email  = LOWER(TRIM(p_email)),
        role   = p_role,
        status = p_status
    WHERE user_id = p_user_id;

    SELECT user_id, name, email, role, status, created_at 
    FROM USERS WHERE user_id = p_user_id;
END //

-- Procedure: DeleteUser
CREATE PROCEDURE DeleteUser (
    IN p_user_id INT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists FROM USERS WHERE user_id = p_user_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User not found.';
    END IF;

    -- USERS foreign keys on dependent tables are ON DELETE SET NULL or RESTRICT
    DELETE FROM USERS WHERE user_id = p_user_id;

    SELECT CONCAT('User ID ', p_user_id, ' successfully removed.') AS message;
END //

-- Procedure: GetUserByEmail (Used strictly by Backend Auth Controller for login hash check)
CREATE PROCEDURE GetUserByEmail (
    IN p_email VARCHAR(150)
)
BEGIN
    SELECT user_id, name, email, password_hash, role, status, created_at
    FROM USERS
    WHERE email = LOWER(TRIM(p_email));
END //

-- Procedure: GetAllUsers (Safe list for Admin view)
CREATE PROCEDURE GetAllUsers ()
BEGIN
    SELECT user_id, name, email, role, status, created_at
    FROM USERS
    ORDER BY user_id ASC;
END //

DELIMITER ;
