-- ============================================
-- Functions
-- Database: bkinema
-- Generated: 2025-12-01T05:27:28.980Z
-- ============================================

-- Function: fn_calculate_avg_booking_value_by_month
DROP FUNCTION IF EXISTS fn_calculate_avg_booking_value_by_month;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_calculate_avg_booking_value_by_month"(
    p_year INT,
    p_month INT
) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
    DECLARE v_total_amount DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_booking_id BIGINT;
    DECLARE v_booking_value DECIMAL(12,2);
    DECLARE v_booking_status VARCHAR(255);
    DECLARE v_booking_count INT DEFAULT 0;
    DECLARE v_done INT DEFAULT 0;
    
    -- Cursor để lấy các booking trong tháng
    DECLARE booking_cursor CURSOR FOR
        SELECT b.id, b.status
        FROM booking b
        WHERE YEAR(b.created_time_at) = p_year
          AND MONTH(b.created_time_at) = p_month;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    -- Kiểm tra tham số đầu vào
    IF p_year IS NULL OR p_year < 2000 OR p_year > 2100 THEN
        RETURN -1; -- Invalid year
    END IF;
    
    IF p_month IS NULL OR p_month < 1 OR p_month > 12 THEN
        RETURN -2; -- Invalid month
    END IF;
    
    -- Mở cursor
    OPEN booking_cursor;
    
    -- Vòng lặp xử lý từng booking
    booking_loop: LOOP
        FETCH booking_cursor INTO v_booking_id, v_booking_status;
        
        IF v_done = 1 THEN
            LEAVE booking_loop;
        END IF;
        
        -- Chỉ tính các booking đã paid
        IF v_booking_status = 'Paid' THEN
            -- Tính tổng giá trị của booking (tickets status Held/Booked + F&B với price*quantity)
            SET v_booking_value = (
                SELECT COALESCE(SUM(ss.price), 0)
                FROM showtime_seat ss
                WHERE ss.booking_id = v_booking_id
                  AND ss.status IN ('Held', 'Booked')
            ) + (
                SELECT COALESCE(SUM(f.price * f.quantity), 0)
                FROM fwb f
                WHERE f.booking_id = v_booking_id
            );
            
            SET v_total_amount = v_total_amount + v_booking_value;
            SET v_booking_count = v_booking_count + 1;
        END IF;
    END LOOP;
    
    -- Đóng cursor
    CLOSE booking_cursor;
    
    -- Tính trung bình, tránh chia cho 0
    IF v_booking_count = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN ROUND(v_total_amount / v_booking_count, 2);
END$$
DELIMITER ;

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

-- Function: fn_calculate_total_revenue_by_customer
DROP FUNCTION IF EXISTS fn_calculate_total_revenue_by_customer;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" FUNCTION "fn_calculate_total_revenue_by_customer"(
    p_customer_id BIGINT
) RETURNS decimal(12,2)
    READS SQL DATA
BEGIN
    DECLARE v_total_revenue DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_item_price DECIMAL(10,2);
    DECLARE v_done INT DEFAULT 0;
    
    -- Cursor để lấy giá vé (tickets với status Held hoặc Booked)
    DECLARE ticket_cursor CURSOR FOR
        SELECT ss.price
        FROM showtime_seat ss
        INNER JOIN booking b ON ss.booking_id = b.id
        WHERE b.customer_id = p_customer_id
          AND b.status = 'Paid'
          AND ss.status IN ('Held', 'Booked');
    
    -- Cursor để lấy giá F&B (price * quantity)
    DECLARE fwb_cursor CURSOR FOR
        SELECT f.price * f.quantity
        FROM fwb f
        INNER JOIN booking b ON f.booking_id = b.id
        WHERE b.customer_id = p_customer_id
          AND b.status = 'Paid';
    
    -- Handler khi cursor hết dữ liệu
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    -- Kiểm tra tham số đầu vào
    IF p_customer_id IS NULL OR p_customer_id <= 0 THEN
        RETURN -1; -- Invalid customer ID
    END IF;
    
    -- Kiểm tra customer có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM customer WHERE user_id = p_customer_id) THEN
        RETURN -2; -- Customer not found
    END IF;
    
    -- Tính doanh thu từ vé
    OPEN ticket_cursor;
    ticket_loop: LOOP
        FETCH ticket_cursor INTO v_item_price;
        
        IF v_done = 1 THEN
            LEAVE ticket_loop;
        END IF;
        
        SET v_total_revenue = v_total_revenue + v_item_price;
    END LOOP;
    CLOSE ticket_cursor;
    
    -- Reset flag và tính doanh thu từ F&B
    SET v_done = 0;
    OPEN fwb_cursor;
    fwb_loop: LOOP
        FETCH fwb_cursor INTO v_item_price;
        
        IF v_done = 1 THEN
            LEAVE fwb_loop;
        END IF;
        
        SET v_total_revenue = v_total_revenue + v_item_price;
    END LOOP;
    CLOSE fwb_cursor;
    
    RETURN ROUND(v_total_revenue, 2);
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

    date_loop: LOOP
        IF v_current_date > p_end_date THEN
            LEAVE date_loop;
        END IF;
        
        SET v_total = v_total + (
            SELECT COUNT(*)
            FROM showtime
            WHERE au_theater_id = p_theater_id 
              AND date = v_current_date
        );
        
        SET v_current_date = v_current_date + INTERVAL 1 DAY;
    END LOOP;

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

