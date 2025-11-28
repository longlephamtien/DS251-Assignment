-- ============================================
-- Functions
-- Database: bkinema
-- Generated: 2025-11-28T11:02:23.512Z
-- ============================================

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

-- Function: fn_get_default_membership
DROP FUNCTION IF EXISTS fn_get_default_membership;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_get_default_membership"() RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE default_membership VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Get membership tier with minimum points requirement
    SELECT tier_name INTO default_membership
    FROM membership
    ORDER BY uk_membership_min_point ASC
    LIMIT 1;
    
    -- Fallback to 'Member' if no membership tiers exist
    IF default_membership IS NULL THEN
        SET default_membership = 'Member';
    END IF;
    
    RETURN default_membership;
END$$
DELIMITER ;

-- Function: fn_get_membership_by_points
DROP FUNCTION IF EXISTS fn_get_membership_by_points;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_get_membership_by_points"(p_points INT) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE membership_tier VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Get the highest tier that user qualifies for
    SELECT tier_name INTO membership_tier
    FROM membership
    WHERE uk_membership_min_point <= p_points
    ORDER BY uk_membership_min_point DESC
    LIMIT 1;
    
    -- If no tier found, return default membership
    IF membership_tier IS NULL THEN
        SET membership_tier = fn_get_default_membership();
    END IF;
    
    RETURN membership_tier;
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

