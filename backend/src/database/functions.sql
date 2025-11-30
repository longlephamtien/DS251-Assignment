-- ============================================
-- Functions
-- Database: bkinema
-- Generated: 2025-11-30T09:44:38.566Z
-- ============================================

-- Function: fn_calculate_points
DROP FUNCTION IF EXISTS fn_calculate_points;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_calculate_points"(
    p_amount DECIMAL(10,2),
    p_rate DECIMAL(5,2)
) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE v_raw_points DECIMAL(10,2);
    DECLARE v_points INT;
    
    -- Calculate raw points: amount * rate / 1000
    SET v_raw_points = (p_amount * p_rate / 100) / 1000;
    
    -- Apply rounding rules
    -- Round to nearest integer (0.5 rounds up, 0.1-0.4 rounds down)
    SET v_points = ROUND(v_raw_points, 0);
    
    RETURN v_points;
END$$
DELIMITER ;

-- Function: fn_check_email_exists
DROP FUNCTION IF EXISTS fn_check_email_exists;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_check_email_exists"(p_email VARCHAR(255)) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
    DECLARE email_count INT;
    SELECT COUNT(*) INTO email_count FROM `User` WHERE email = p_email;
    RETURN email_count > 0;
END$$
DELIMITER ;

-- Function: fn_count_showtimes_in_range
DROP FUNCTION IF EXISTS fn_count_showtimes_in_range;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_count_showtimes_in_range"(
    p_theater_id INT,
    p_start_date DATE,
    p_end_date DATE
) RETURNS int
    READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_current_date DATE;

    IF p_theater_id IS NULL OR p_theater_id <= 0 THEN RETURN -1; END IF;
    IF p_start_date IS NULL OR p_end_date IS NULL THEN RETURN -2; END IF;
    IF p_start_date > p_end_date THEN RETURN -3; END IF;

    SET v_current_date = p_start_date;

    WHILE v_current_date <= p_end_date DO
        SET v_total = v_total + (
            SELECT COUNT(*)
            FROM showtime
            WHERE au_theater_id = p_theater_id 
              AND date = v_current_date
        );
        SET v_current_date = v_current_date + INTERVAL 1 DAY;
    END WHILE;

    RETURN v_total;
END$$
DELIMITER ;

-- Function: fn_get_default_membership
DROP FUNCTION IF EXISTS fn_get_default_membership;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_get_default_membership"() RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    -- Always return 'Member' as default
    RETURN 'Member';
END$$
DELIMITER ;

-- Function: fn_get_membership_by_points
DROP FUNCTION IF EXISTS fn_get_membership_by_points;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_get_membership_by_points"(p_points INT) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    -- This function is deprecated, membership is now based on total_spent
    -- Return 'Member' as default
    RETURN 'Member';
END$$
DELIMITER ;

-- Function: fn_validate_age
DROP FUNCTION IF EXISTS fn_validate_age;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_validate_age"(p_birthday DATE) RETURNS tinyint(1)
    DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_birthday, CURDATE()) >= 13;
END$$
DELIMITER ;

-- Function: fn_validate_email
DROP FUNCTION IF EXISTS fn_validate_email;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_validate_email"(p_email VARCHAR(255)) RETURNS tinyint(1)
    DETERMINISTIC
BEGIN
    RETURN p_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
END$$
DELIMITER ;

-- Function: fn_validate_password_hash
DROP FUNCTION IF EXISTS fn_validate_password_hash;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_validate_password_hash"(p_password VARCHAR(255)) RETURNS tinyint(1)
    DETERMINISTIC
BEGIN
    RETURN p_password IS NOT NULL 
           AND LENGTH(p_password) = 60 
           AND p_password LIKE '$2%';
END$$
DELIMITER ;

