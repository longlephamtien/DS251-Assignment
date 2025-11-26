-- ============================================
-- BKinema Authentication System - Complete SQL
-- ============================================
-- This file contains all stored procedures, functions, and triggers
-- for the authentication system with proper collation (utf8mb4_unicode_ci)
-- ============================================

USE bkinema;

-- Set session collation to match database
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- DROP EXISTING OBJECTS (if any)
-- ============================================

DROP TRIGGER IF EXISTS trg_before_customer_update;
DROP TRIGGER IF EXISTS trg_after_user_insert;

DROP PROCEDURE IF EXISTS sp_update_user_profile;
DROP PROCEDURE IF EXISTS sp_get_user_by_email;
DROP PROCEDURE IF EXISTS sp_get_user_by_id;
DROP PROCEDURE IF EXISTS sp_login_user;
DROP PROCEDURE IF EXISTS sp_register_user;

DROP FUNCTION IF EXISTS fn_get_membership_by_points;
DROP FUNCTION IF EXISTS fn_get_default_membership;
DROP FUNCTION IF EXISTS fn_validate_age;
DROP FUNCTION IF EXISTS fn_check_email_exists;
DROP FUNCTION IF EXISTS fn_validate_email;

-- ============================================
-- VALIDATION FUNCTIONS
-- ============================================

DELIMITER $$

-- Function: Validate email format using regex
CREATE FUNCTION fn_validate_email(p_email VARCHAR(255))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN p_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
END$$

-- Function: Check if email already exists in User table
CREATE FUNCTION fn_check_email_exists(p_email VARCHAR(255))
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE email_count INT;
    SELECT COUNT(*) INTO email_count FROM `User` WHERE email = p_email;
    RETURN email_count > 0;
END$$

-- Function: Validate user age (must be >= 13 years old)
CREATE FUNCTION fn_validate_age(p_birthday DATE)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_birthday, CURDATE()) >= 13;
END$$

-- ============================================
-- MEMBERSHIP MANAGEMENT FUNCTIONS
-- ============================================

-- Function: Get default membership tier (lowest tier)
CREATE FUNCTION fn_get_default_membership()
RETURNS VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE default_membership VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Get membership tier with minimum points requirement
    SELECT tier_name INTO default_membership
    FROM membership
    ORDER BY min_point ASC
    LIMIT 1;
    
    -- Fallback to 'Bronze' if no membership tiers exist
    IF default_membership IS NULL THEN
        SET default_membership = 'Bronze';
    END IF;
    
    RETURN default_membership;
END$$

-- Function: Get membership tier based on accumulated points
CREATE FUNCTION fn_get_membership_by_points(p_points INT)
RETURNS VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE membership_tier VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Get the highest tier that user qualifies for
    SELECT tier_name INTO membership_tier
    FROM membership
    WHERE min_point <= p_points
    ORDER BY min_point DESC
    LIMIT 1;
    
    -- If no tier found, return default membership
    IF membership_tier IS NULL THEN
        SET membership_tier = fn_get_default_membership();
    END IF;
    
    RETURN membership_tier;
END$$

-- ============================================
-- AUTHENTICATION STORED PROCEDURES
-- ============================================

-- Procedure: Register new user
-- Creates user record and trigger automatically creates customer record
CREATE PROCEDURE sp_register_user(
    IN p_fname VARCHAR(255),
    IN p_minit VARCHAR(50),
    IN p_lname VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_birthday DATE,
    IN p_gender ENUM('Male','Female','Other'),
    IN p_district VARCHAR(255),
    IN p_city VARCHAR(255),
    OUT p_user_id BIGINT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(500)
)
BEGIN
    DECLARE v_email_exists BOOLEAN;
    DECLARE v_email_valid BOOLEAN;
    DECLARE v_age_valid BOOLEAN;
    DECLARE v_error_msg TEXT;
    
    -- Error handler to capture MySQL errors
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = CONCAT('Database error: ', v_error_msg);
        SET p_user_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Validate email format
    SET v_email_valid = fn_validate_email(p_email);
    IF NOT v_email_valid THEN
        SET p_success = FALSE;
        SET p_message = 'Invalid email format';
        SET p_user_id = NULL;
        ROLLBACK;
    ELSE
        -- Check if email already exists
        SET v_email_exists = fn_check_email_exists(p_email);
        
        IF v_email_exists THEN
            SET p_success = FALSE;
            SET p_message = 'Email already registered';
            SET p_user_id = NULL;
            ROLLBACK;
        ELSE
            -- Validate age (must be >= 13 years)
            SET v_age_valid = fn_validate_age(p_birthday);
            IF NOT v_age_valid THEN
                SET p_success = FALSE;
                SET p_message = 'User must be at least 13 years old';
                SET p_user_id = NULL;
                ROLLBACK;
            ELSE
                -- Insert new user (trigger will auto-create customer record)
                INSERT INTO `User` (
                    fname, minit, lname, email, password, 
                    birthday, gender, district, city
                ) VALUES (
                    p_fname, p_minit, p_lname, p_email, p_password,
                    p_birthday, p_gender, p_district, p_city
                );
                
                SET p_user_id = LAST_INSERT_ID();
                SET p_success = TRUE;
                SET p_message = 'User registered successfully';
                
                COMMIT;
            END IF;
        END IF;
    END IF;
END$$

-- Procedure: Login user
-- Returns user data for backend to verify password with bcrypt
CREATE PROCEDURE sp_login_user(
    IN p_email VARCHAR(255),
    OUT p_user_id BIGINT,
    OUT p_password VARCHAR(255),
    OUT p_fname VARCHAR(255),
    OUT p_lname VARCHAR(255),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(500)
)
BEGIN
    DECLARE v_user_count INT;
    
    -- Check if user exists
    SELECT COUNT(*) INTO v_user_count
    FROM `User` 
    WHERE email = p_email;
    
    IF v_user_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Invalid email or password';
        SET p_user_id = NULL;
        SET p_password = NULL;
        SET p_fname = NULL;
        SET p_lname = NULL;
    ELSE
        -- Retrieve user data for password verification in backend
        SELECT id, password, fname, lname
        INTO p_user_id, p_password, p_fname, p_lname
        FROM `User`
        WHERE email = p_email
        LIMIT 1;
        
        SET p_success = TRUE;
        SET p_message = 'User found';
    END IF;
END$$

-- Procedure: Get user by ID
-- Returns complete user profile with customer/membership info
CREATE PROCEDURE sp_get_user_by_id(
    IN p_user_id BIGINT
)
BEGIN
    SELECT 
        u.id,
        u.fname,
        u.minit,
        u.lname,
        u.email,
        u.birthday,
        u.gender,
        u.district,
        u.city,
        u.created_at,
        c.accumulated_points,
        c.membership_name
    FROM `User` u
    LEFT JOIN customer c ON u.id = c.user_id
    WHERE u.id = p_user_id;
END$$

-- Procedure: Get user by email
-- Returns complete user profile including password (for authentication)
CREATE PROCEDURE sp_get_user_by_email(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT 
        u.id,
        u.fname,
        u.minit,
        u.lname,
        u.email,
        u.password,
        u.birthday,
        u.gender,
        u.district,
        u.city,
        u.created_at,
        c.accumulated_points,
        c.membership_name
    FROM `User` u
    LEFT JOIN customer c ON u.id = c.user_id
    WHERE u.email = p_email;
END$$

-- Procedure: Update user profile
-- Updates user information with validation
CREATE PROCEDURE sp_update_user_profile(
    IN p_user_id BIGINT,
    IN p_fname VARCHAR(255),
    IN p_minit VARCHAR(50),
    IN p_lname VARCHAR(255),
    IN p_birthday DATE,
    IN p_gender ENUM('Male','Female','Other'),
    IN p_district VARCHAR(255),
    IN p_city VARCHAR(255),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(500)
)
BEGIN
    DECLARE v_age_valid BOOLEAN;
    DECLARE v_user_exists INT;
    
    -- Check if user exists
    SELECT COUNT(*) INTO v_user_exists FROM `User` WHERE id = p_user_id;
    
    IF v_user_exists = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'User not found';
    ELSE
        -- Validate age if birthday is provided
        SET v_age_valid = fn_validate_age(p_birthday);
        IF NOT v_age_valid THEN
            SET p_success = FALSE;
            SET p_message = 'User must be at least 13 years old';
        ELSE
            -- Update user profile
            UPDATE `User`
            SET 
                fname = p_fname,
                minit = p_minit,
                lname = p_lname,
                birthday = p_birthday,
                gender = p_gender,
                district = p_district,
                city = p_city
            WHERE id = p_user_id;
            
            SET p_success = TRUE;
            SET p_message = 'Profile updated successfully';
        END IF;
    END IF;
END$$

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-create customer record after user insert
-- Only creates customer if user is not a staff member
CREATE TRIGGER trg_after_user_insert
AFTER INSERT ON `User`
FOR EACH ROW
BEGIN
    -- Check if user is not a staff member
    IF NOT EXISTS (SELECT 1 FROM staff WHERE user_id = NEW.id) THEN
        -- Create customer record with default membership
        INSERT INTO customer (user_id, accumulated_points, membership_name)
        VALUES (NEW.id, 0, fn_get_default_membership());
    END IF;
END$$

-- Trigger: Auto-update membership tier when points change
-- Validates points and updates membership tier based on accumulated points
CREATE TRIGGER trg_before_customer_update
BEFORE UPDATE ON customer
FOR EACH ROW
BEGIN
    -- Validate accumulated points cannot be negative
    IF NEW.accumulated_points < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Accumulated points cannot be negative';
    END IF;
    
    -- Automatically update membership tier based on points
    SET NEW.membership_name = fn_get_membership_by_points(NEW.accumulated_points);
END$$

DELIMITER ;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Display all created functions
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'bkinema'
  AND ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- Display all created procedures
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'bkinema'
  AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- Display all created triggers
SELECT 
    TRIGGER_NAME,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    EVENT_MANIPULATION,
    COLLATION_CONNECTION
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'bkinema'
ORDER BY TRIGGER_NAME;

-- ============================================
-- SUMMARY
-- ============================================
-- Functions Created:
--   1. fn_validate_email          - Validates email format
--   2. fn_check_email_exists       - Checks if email is already registered
--   3. fn_validate_age             - Validates user is >= 13 years old
--   4. fn_get_default_membership   - Returns default membership tier
--   5. fn_get_membership_by_points - Returns membership tier based on points
--
-- Procedures Created:
--   1. sp_register_user            - Register new user with validation
--   2. sp_login_user               - Login and retrieve user data
--   3. sp_get_user_by_id           - Get user profile by ID
--   4. sp_get_user_by_email        - Get user profile by email
--   5. sp_update_user_profile      - Update user profile with validation
--
-- Triggers Created:
--   1. trg_after_user_insert       - Auto-create customer record
--   2. trg_before_customer_update  - Auto-update membership tier
-- ============================================
