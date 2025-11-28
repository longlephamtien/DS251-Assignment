-- ============================================
-- Stored Procedures
-- Database: bkinema
-- Generated: 2025-11-28T12:33:24.399Z
-- ============================================

-- Procedure: sp_apply_coupon
DROP PROCEDURE IF EXISTS sp_apply_coupon;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_apply_coupon"(
    IN p_booking_id INT,
    IN p_coupon_id INT,
    IN p_customer_id INT
)
BEGIN
    DECLARE v_customer_id INT;
    DECLARE v_balance DECIMAL(10,2);
    DECLARE v_date_expired DATE;
    DECLARE v_booking_id INT;

    -- Check if coupon exists and get details
    SELECT customer_id, balance, date_expired, booking_id
    INTO v_customer_id, v_balance, v_date_expired, v_booking_id
    FROM coupon
    WHERE id = p_coupon_id;

    -- Validate coupon ownership
    IF v_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coupon not found';
    END IF;

    IF v_customer_id != p_customer_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coupon does not belong to this customer';
    END IF;

    -- Check if coupon is already used
    IF v_booking_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coupon has already been used';
    END IF;

    -- Check if coupon has expired
    IF v_date_expired < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coupon has expired';
    END IF;

    -- Check if coupon has balance
    IF v_balance <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coupon has no remaining balance';
    END IF;

    -- ===== KEY FIX =====
    -- Update coupon: Set discount_amount = balance BEFORE setting balance = 0
    -- This allows sp_calculate_final_amount to read the discount
    UPDATE coupon
    SET booking_id = p_booking_id,
        discount_amount = balance,  -- ← ADD THIS LINE
        balance = 0
    WHERE id = p_coupon_id;

END$$
DELIMITER ;

-- Procedure: sp_calculate_final_amount
DROP PROCEDURE IF EXISTS sp_calculate_final_amount;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_calculate_final_amount"(
    IN p_booking_id BIGINT,
    OUT p_base_seat_price DECIMAL(10,2),
    OUT p_fwb_price DECIMAL(10,2),
    OUT p_subtotal DECIMAL(10,2),
    OUT p_coupon_discount DECIMAL(10,2),
    OUT p_coupon_type VARCHAR(50),
    OUT p_box_office_discount DECIMAL(10,2),
    OUT p_concession_discount DECIMAL(10,2),
    OUT p_membership_tier VARCHAR(255),
    OUT p_final_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_customer_id BIGINT;
    DECLARE v_membership_name VARCHAR(255);
    DECLARE v_box_discount_percent DECIMAL(5,2) DEFAULT 0;
    DECLARE v_concession_discount_percent DECIMAL(5,2) DEFAULT 0;
    DECLARE v_coupon_discount_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_seat_after_box_discount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_fwb_after_concession_discount DECIMAL(10,2) DEFAULT 0;

    -- Init OUT params
    SET p_base_seat_price     = 0;
    SET p_fwb_price           = 0;
    SET p_subtotal            = 0;
    SET p_coupon_discount     = 0;
    SET p_coupon_type         = NULL;
    SET p_box_office_discount = 0;
    SET p_concession_discount = 0;
    SET p_membership_tier     = NULL;
    SET p_final_amount        = 0;

    -- 1. Base ticket price: only count 'Held' seats for this booking
    SELECT COALESCE(SUM(price), 0)
    INTO p_base_seat_price
    FROM showtime_seat
    WHERE booking_id = p_booking_id
      AND status = 'Held';

    -- 2. F&B price
    SELECT COALESCE(SUM(price * quantity), 0)
    INTO p_fwb_price
    FROM fwb
    WHERE booking_id = p_booking_id;

    SET p_subtotal = p_base_seat_price + p_fwb_price;

    -- 3. Get customer + membership tier
    SELECT b.customer_id, c.membership_name
    INTO v_customer_id, v_membership_name
    FROM booking b
    LEFT JOIN customer c ON c.user_id = b.customer_id
    WHERE b.id = p_booking_id
    LIMIT 1;

    -- 4. Membership discounts (if exists)
    IF v_membership_name IS NOT NULL THEN
        SELECT box_office_discount, concession_discount
        INTO v_box_discount_percent, v_concession_discount_percent
        FROM membership
        WHERE tier_name = v_membership_name
        LIMIT 1;

        IF v_box_discount_percent IS NOT NULL OR v_concession_discount_percent IS NOT NULL THEN
            SET p_membership_tier = v_membership_name;

            -- Box office discount on tickets
            SET p_box_office_discount =
                ROUND(p_base_seat_price * COALESCE(v_box_discount_percent, 0) / 100, 2);

            -- Concession discount on F&B
            SET p_concession_discount =
                ROUND(p_fwb_price * COALESCE(v_concession_discount_percent, 0) / 100, 2);
        END IF;
    END IF;

    -- 5. Coupon discount: only applied coupons (discount_amount > 0)
    SELECT 
        COALESCE(SUM(discount_amount), 0),
        MAX(coupon_type)
    INTO 
        v_coupon_discount_amount,
        p_coupon_type
    FROM coupon
    WHERE booking_id = p_booking_id
      AND date_expired >= CURDATE()
      AND discount_amount > 0;

    SET p_coupon_discount = COALESCE(v_coupon_discount_amount, 0);

    -- 6. Calculate final amount
    SET v_seat_after_box_discount =
        p_base_seat_price - p_box_office_discount;

    SET v_fwb_after_concession_discount =
        p_fwb_price - p_concession_discount;

    SET p_final_amount =
        v_seat_after_box_discount +
        v_fwb_after_concession_discount -
        p_coupon_discount;

    IF p_final_amount < 0 THEN
        SET p_final_amount = 0;
    END IF;

    -- Round all money fields to 2 decimal places
    SET p_base_seat_price       = ROUND(p_base_seat_price, 2);
    SET p_fwb_price             = ROUND(p_fwb_price, 2);
    SET p_subtotal              = ROUND(p_subtotal, 2);
    SET p_coupon_discount       = ROUND(p_coupon_discount, 2);
    SET p_box_office_discount   = ROUND(p_box_office_discount, 2);
    SET p_concession_discount   = ROUND(p_concession_discount, 2);
    SET p_final_amount          = ROUND(p_final_amount, 2);
END$$
DELIMITER ;

-- Procedure: sp_cancel_payment
DROP PROCEDURE IF EXISTS sp_cancel_payment;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cancel_payment"(
    IN  p_booking_id     BIGINT,
    IN  p_reason         VARCHAR(255),
    OUT p_payment_id     BIGINT
)
BEGIN
    DECLARE v_exists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1. Booking phải đang Pending
    SELECT COUNT(*)
    INTO v_exists
    FROM booking
    WHERE id = p_booking_id
      AND status = 'Pending'
    FOR UPDATE;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking is not Pending or does not exist. Cannot cancel.';
    END IF;

    -- 2. Tạo payment log (Cancelled) với transaction_id giả nhưng unique
    INSERT INTO payment (
        payment_method,
        status,
        created_time_at,
        transaction_id,
        expired_time_at,
        duration,
        booking_id
    )
    VALUES (
        'System',  -- hoặc 'N/A'
        'Cancelled',
        NOW(),
        CONCAT('CANCEL-', p_booking_id, '-', UNIX_TIMESTAMP()),
        NOW(),
        0,
        p_booking_id
    );

    SET p_payment_id = LAST_INSERT_ID();

    -- 3. Update booking
    UPDATE booking
    SET status = 'Cancelled'
    WHERE id = p_booking_id;

    -- 4. Giải phóng ghế Held → Available
    UPDATE showtime_seat
    SET status = 'Available'
    WHERE booking_id = p_booking_id
      AND status = 'Held';

    COMMIT;
END$$
DELIMITER ;

-- Procedure: sp_change_password
DROP PROCEDURE IF EXISTS sp_change_password;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_change_password"(
    IN p_user_id BIGINT,
    IN p_new_password VARCHAR(255),
    OUT p_success TINYINT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = 0;
        SET p_message = 'Error changing password';
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM User WHERE id = p_user_id) THEN
        SET p_success = 0;
        SET p_message = 'User not found';
        ROLLBACK;
    ELSE
        -- Update password
        UPDATE User 
        SET password = p_new_password,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_user_id;

        SET p_success = 1;
        SET p_message = 'Password changed successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_confirm_payment
DROP PROCEDURE IF EXISTS sp_confirm_payment;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_confirm_payment"(
    IN  p_booking_id       BIGINT,
    IN  p_payment_method   VARCHAR(255),
    IN  p_transaction_id   VARCHAR(255),
    IN  p_total_amount     DECIMAL(10,2),
    IN  p_duration         INT,
    OUT p_payment_id       BIGINT
)
BEGIN
    DECLARE v_customer_id BIGINT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1. Validate booking
    SELECT customer_id
    INTO v_customer_id
    FROM booking
    WHERE id = p_booking_id
      AND status = 'Pending'
    FOR UPDATE;

    IF v_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking not found or not in Pending status';
    END IF;

    -- 2. Insert payment
    INSERT INTO payment (
        payment_method,
        status,
        created_time_at,
        transaction_id,
        expired_time_at,
        duration,
        booking_id
    )
    VALUES (
        p_payment_method,
        'Success',
        NOW(),
        p_transaction_id,
        DATE_ADD(NOW(), INTERVAL p_duration MINUTE),
        p_duration,
        p_booking_id
    );

    SET p_payment_id = LAST_INSERT_ID();

    -- 3. Update booking
    UPDATE booking
    SET status = 'Paid'
    WHERE id = p_booking_id;

    -- 4. Update seats
    UPDATE showtime_seat
    SET status = 'Booked'
    WHERE booking_id = p_booking_id
      AND status = 'Held';

    -- 5. Update membership
    CALL sp_update_customer_membership(v_customer_id, p_total_amount);

    COMMIT;
END$$
DELIMITER ;

-- Procedure: sp_create_refund_booking
DROP PROCEDURE IF EXISTS sp_create_refund_booking;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_create_refund_booking"(
    IN  p_booking_id    BIGINT,
    IN  p_reason        VARCHAR(255),
    IN  p_refund_amount DECIMAL(10,2),
    IN  p_coupon_id     BIGINT,
    OUT p_refund_id     BIGINT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_status VARCHAR(255);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1. Kiểm tra booking có tồn tại
    SELECT COUNT(*)
    INTO v_exists
    FROM booking
    WHERE id = p_booking_id
    FOR UPDATE;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking not found';
    END IF;

    -- 2. Lấy trạng thái booking
    SELECT status
    INTO v_status
    FROM booking
    WHERE id = p_booking_id
    FOR UPDATE;

    IF v_status <> 'Paid' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only Paid bookings can be refunded';
    END IF;

    -- 3. Không cho refund 2 lần
    SELECT COUNT(*)
    INTO v_exists
    FROM refund
    WHERE booking_id = p_booking_id
      AND status IN ('Requested','Completed','Approved');

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking already has a refund';
    END IF;

    -- 4. Tạo refund record
    INSERT INTO refund (
        booking_id,
        amount,
        reason,
        status,
        created_time_at,
        processed_time_at,
        coupon_id
    )
    VALUES (
        p_booking_id,
        p_refund_amount,
        p_reason,
        'Completed',
        NOW(),
        NOW(),
        p_coupon_id
    );

    SET p_refund_id = LAST_INSERT_ID();

    -- 5. Cập nhật booking + ghế
    UPDATE booking
    SET status = 'Refunded'
    WHERE id = p_booking_id;

    UPDATE showtime_seat
    SET status = 'Refunded'
    WHERE booking_id = p_booking_id;

    COMMIT;
END$$
DELIMITER ;

-- Procedure: sp_create_refund_coupon
DROP PROCEDURE IF EXISTS sp_create_refund_coupon;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_create_refund_coupon"(
    IN p_booking_id BIGINT,
    IN p_customer_id BIGINT,
    IN p_refund_amount DECIMAL(10,2),
    IN p_reason TEXT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255),
    OUT p_refund_id BIGINT,
    OUT p_new_coupon_id BIGINT
)
main_block: BEGIN
    DECLARE v_booking_owner BIGINT;
    DECLARE v_booking_status VARCHAR(50);
    DECLARE v_expiry_date DATE;
    
    -- Default output
    SET p_success = FALSE;
    SET p_refund_id = NULL;
    SET p_new_coupon_id = NULL;
    
    -- 1. Verify booking ownership and status
    SELECT customer_id, status INTO v_booking_owner, v_booking_status
    FROM booking
    WHERE id = p_booking_id
    LIMIT 1;
    
    IF v_booking_owner IS NULL THEN
        SET p_message = 'Booking not found';
        LEAVE main_block;
    END IF;
    
    IF v_booking_owner != p_customer_id THEN
        SET p_message = 'You do not own this booking';
        LEAVE main_block;
    END IF;
    
    IF v_booking_status = 'Cancelled' THEN
        SET p_message = 'Booking is already cancelled';
        LEAVE main_block;
    END IF;
    
    -- 2. Check if refund amount is valid
    IF p_refund_amount <= 0 THEN
        SET p_message = 'Refund amount must be greater than 0';
        LEAVE main_block;
    END IF;
    
    -- Start transaction
    START TRANSACTION;
    
    -- 3. Create refund record
    INSERT INTO refund (booking_id, amount, reason, status, created_time_at, processed_time_at)
    VALUES (p_booking_id, p_refund_amount, p_reason, 'Completed', NOW(), NOW());
    
    SET p_refund_id = LAST_INSERT_ID();
    
    -- 4. Create compensation coupon (valid for 1 year)
    SET v_expiry_date = DATE_ADD(CURDATE(), INTERVAL 1 YEAR);
    
    INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift)
    VALUES ('Refund Compensation', p_customer_id, p_refund_amount, 'GiftCard', v_expiry_date, 0);
    
    SET p_new_coupon_id = LAST_INSERT_ID();
    
    -- 5. Link coupon to refund
    UPDATE refund
    SET coupon_id = p_new_coupon_id
    WHERE id = p_refund_id AND booking_id = p_booking_id;
    
    -- 6. Update booking status
    UPDATE booking
    SET status = 'Cancelled'
    WHERE id = p_booking_id;
    
    -- If all goes well, commit
    COMMIT;
    
    -- Success
    SET p_success = TRUE;
    SET p_message = 'Refund processed and coupon created successfully';
END$$
DELIMITER ;

-- Procedure: sp_delete_showtime
DROP PROCEDURE IF EXISTS sp_delete_showtime;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_delete_showtime"(
    IN p_showtime_id BIGINT,
    IN p_staff_id BIGINT
)
BEGIN
    DECLARE v_showtime_exists INT;
    DECLARE v_ticket_count INT;
    DECLARE v_staff_role VARCHAR(255);

    -- Check if staff exists and get role
    SELECT `role` INTO v_staff_role
    FROM staff
    WHERE user_id = p_staff_id;

    IF v_staff_role IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Staff not found or unauthorized';
    END IF;

    IF v_staff_role NOT IN ('Admin', 'Manager') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only Admin or Manager staff can delete showtime';
    END IF;

    SELECT COUNT(*) INTO v_showtime_exists
    FROM showtime
    WHERE id = p_showtime_id;

    IF v_showtime_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Showtime not found';
    END IF;

    SELECT COUNT(*) INTO v_ticket_count
    FROM showtime_seat
    WHERE st_id = p_showtime_id
      AND booking_id IS NOT NULL;

    IF v_ticket_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot delete showtime: There are tickets already booked';
    END IF;

    DELETE FROM showtime_seat WHERE st_id = p_showtime_id;
    DELETE FROM showtime WHERE id = p_showtime_id;

END$$
DELIMITER ;

-- Procedure: sp_get_all_fwb_menu
DROP PROCEDURE IF EXISTS sp_get_all_fwb_menu;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_all_fwb_menu"()
BEGIN
    SELECT *
    FROM fwb_menu
    ORDER BY id;  -- optional, just to have a stable order
END$$
DELIMITER ;

-- Procedure: sp_get_auditorium_by_id
DROP PROCEDURE IF EXISTS sp_get_auditorium_by_id;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_auditorium_by_id"(
    IN p_number INT,
    IN p_theater_id BIGINT
)
BEGIN
    SELECT 
        number,
        theater_id,
        type,
        capacity,
        image,
        description
    FROM auditorium
    WHERE number = p_number
      AND theater_id = p_theater_id;
END$$
DELIMITER ;

-- Procedure: sp_get_customer_bookings
DROP PROCEDURE IF EXISTS sp_get_customer_bookings;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_customer_bookings"(
    IN p_customer_id INT
)
BEGIN
    -- Temporary table to store calculated amounts
    DROP TEMPORARY TABLE IF EXISTS temp_booking_amounts;
    CREATE TEMPORARY TABLE temp_booking_amounts (
        booking_id BIGINT PRIMARY KEY,
        final_amount DECIMAL(10,2)
    );

    -- Calculate final amount for each booking
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE v_booking_id BIGINT;
        DECLARE v_final_amount DECIMAL(10,2);
        
        DECLARE cur CURSOR FOR 
            SELECT DISTINCT b.id 
            FROM booking b 
            WHERE b.customer_id = p_customer_id;
        
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_booking_id;
            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Call sp_calculate_final_amount for this booking
            CALL sp_calculate_final_amount(
                v_booking_id,
                @base_seat_price,
                @fwb_price,
                @subtotal,
                @coupon_discount,
                @coupon_type,
                @box_office_discount,
                @concession_discount,
                @membership_tier,
                @final_amount
            );

            INSERT INTO temp_booking_amounts VALUES (v_booking_id, @final_amount);
        END LOOP;
        CLOSE cur;
    END;

    -- Return booking list with calculated final amounts
    SELECT 
        b.id,
        b.status,
        -- Convert UTC to Vietnam timezone (+7 hours)
        DATE_FORMAT(DATE_ADD(b.created_time_at, INTERVAL 7 HOUR), '%Y-%m-%d %H:%i:%s') as createdAt,
        b.booking_method as bookingMethod,
        CASE 
            WHEN st.date IS NOT NULL AND st.start_time IS NOT NULL 
            THEN CONCAT(st.date, ' ', st.start_time)
            ELSE ''
        END as showtime,
        COALESCE(m.name, 'Unknown Movie') as movieTitle,
        m.poster_file as moviePoster,
        COALESCE(t.name, 'Unknown Theater') as theaterName,
        COALESCE(st.au_number, 0) as auditoriumNumber,
        -- Get list of seat names (e.g., "A1, A2, A3")
        COALESCE(
            (SELECT GROUP_CONCAT(CONCAT(s.row_char, s.column_number) ORDER BY s.row_char, s.column_number SEPARATOR ', ')
             FROM showtime_seat ss
             JOIN seat s ON ss.seat_id = s.id 
                AND ss.seat_au_number = s.au_number 
                AND ss.seat_au_theater_id = s.au_theater_id
             WHERE ss.booking_id = b.id),
            ''
        ) as seatNames,
        -- Use calculated final amount (after all discounts)
        COALESCE(tba.final_amount, 0) as totalAmount
    FROM booking b
    LEFT JOIN temp_booking_amounts tba ON tba.booking_id = b.id
    LEFT JOIN showtime_seat ss_first ON ss_first.booking_id = b.id
    LEFT JOIN showtime st ON ss_first.st_id = st.id
    LEFT JOIN movie m ON st.movie_id = m.id
    -- Join auditorium to get theater_id
    LEFT JOIN auditorium au ON st.au_number = au.number AND st.au_theater_id = au.theater_id
    LEFT JOIN theater t ON au.theater_id = t.id
    WHERE b.customer_id = p_customer_id
    GROUP BY b.id, b.status, b.created_time_at, b.booking_method, st.date, st.start_time, 
             m.name, m.poster_file, t.name, st.au_number, au.theater_id, tba.final_amount
    ORDER BY b.created_time_at DESC;

    -- Cleanup
    DROP TEMPORARY TABLE IF EXISTS temp_booking_amounts;
END$$
DELIMITER ;

-- Procedure: sp_get_customer_coupons
DROP PROCEDURE IF EXISTS sp_get_customer_coupons;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_customer_coupons"(
    IN p_customer_id INT
)
BEGIN
    SELECT 
        c.id AS couponId,
        c.name AS couponCode,
        c.coupon_type AS couponType,
        c.balance AS balance,
        c.date_expired AS expiryDate,
        c.gift AS isGifted,
        -- Determine coupon state - CHECK booking_id FIRST
        CASE 
            WHEN c.booking_id IS NOT NULL THEN 'Used'
            WHEN c.balance = 0 THEN 'Used'
            WHEN c.date_expired < CURDATE() THEN 'Expired'
            WHEN c.balance > 0 AND c.date_expired >= CURDATE() THEN 'Available'
            ELSE 'Unavailable'
        END AS couponState
    FROM coupon c
    WHERE c.customer_id = p_customer_id
    ORDER BY 
        CASE 
            WHEN c.booking_id IS NULL AND c.balance > 0 AND c.date_expired >= CURDATE() THEN 1
            WHEN c.date_expired < CURDATE() THEN 2
            ELSE 3
        END,
        c.id DESC;
        
END$$
DELIMITER ;

-- Procedure: sp_get_customer_dashboard
DROP PROCEDURE IF EXISTS sp_get_customer_dashboard;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_customer_dashboard"(
    IN p_customer_id INT
)
BEGIN
    DECLARE v_total_points INT DEFAULT 0;
    DECLARE v_total_gift_cards INT DEFAULT 0;
    DECLARE v_total_vouchers INT DEFAULT 0;
    DECLARE v_total_bookings INT DEFAULT 0;
    
    -- Get total accumulated points from customer table
    SELECT COALESCE(accumulated_points, 0)
    INTO v_total_points
    FROM customer
    WHERE user_id = p_customer_id
    LIMIT 1;
    
    -- Get total gift cards - set to 0 for now as gift table doesn't exist
    SET v_total_gift_cards = 0;
    
    -- Get total available coupons (not used, not expired)
    SELECT COUNT(*)
    INTO v_total_vouchers
    FROM coupon
    WHERE customer_id = p_customer_id
      AND date_expired >= CURDATE()
      AND balance > 0;
    
    -- Get total bookings
    SELECT COUNT(*)
    INTO v_total_bookings
    FROM booking
    WHERE customer_id = p_customer_id;
    
    -- Return stats as first result set
    SELECT 
        v_total_points AS totalPoints,
        v_total_gift_cards AS totalGiftCards,
        v_total_vouchers AS totalVouchers,
        v_total_bookings AS totalBookings;
    
    -- Return recent activities as second result set
    -- Combine bookings and coupon usage (gift card removed as table doesn't exist)
    (
        SELECT 
            b.created_time_at AS activityDate,
            'Booking' AS activityType,
            CONCAT('Booked movie ticket') AS description,
            CONCAT(
                (SELECT COUNT(*) FROM showtime_seat ss WHERE ss.booking_id = b.id),
                ' tickets'
            ) AS details
        FROM booking b
        WHERE b.customer_id = p_customer_id
          AND b.created_time_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    )
    UNION ALL
    (
        SELECT 
            CURDATE() AS activityDate,
            'Coupon' AS activityType,
            CASE 
                WHEN c.balance = 0 THEN 'Redeemed coupon'
                ELSE 'Received coupon'
            END AS description,
            c.coupon_type AS details
        FROM coupon c
        WHERE c.customer_id = p_customer_id
        LIMIT 10
    )
    ORDER BY activityDate DESC
    LIMIT 10;
    
END$$
DELIMITER ;

-- Procedure: sp_get_customer_gift_cards
DROP PROCEDURE IF EXISTS sp_get_customer_gift_cards;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_customer_gift_cards"(
    IN p_customer_id INT
)
BEGIN
    -- Return gift cards received by customer
    SELECT 
        CONCAT('GC-', YEAR(b.created_time_at), '-', LPAD(sg.booking_id, 3, '0')) AS giftCardId,
        CONCAT(u.fname, ' ', COALESCE(u.minit, ''), ' ', u.lname) AS senderName,
        COALESCE(
            (SELECT SUM(ss.price) 
             FROM showtime_seat ss 
             WHERE ss.booking_id = b.id), 
            0
        ) AS balance,
        COALESCE(
            (SELECT SUM(ss.price) 
             FROM showtime_seat ss 
             WHERE ss.booking_id = b.id), 
            0
        ) AS originalBalance,
        b.created_time_at AS createdDate,
        DATE_ADD(b.created_time_at, INTERVAL 1 YEAR) AS expiryDate,
        CASE 
            WHEN DATE_ADD(b.created_time_at, INTERVAL 1 YEAR) < NOW() THEN 'expired'
            WHEN b.status = 'confirmed' THEN 'active'
            ELSE 'inactive'
        END AS status
    FROM send_gift sg
    JOIN booking b ON sg.booking_id = b.id
    JOIN customer c ON sg.sender_id = c.user_id
    JOIN User u ON c.user_id = u.id
    WHERE sg.receiver_id = p_customer_id
    ORDER BY b.created_time_at DESC;
END$$
DELIMITER ;

-- Procedure: sp_get_customer_points
DROP PROCEDURE IF EXISTS sp_get_customer_points;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_customer_points"(
    IN p_customer_id INT
)
BEGIN
    DECLARE v_total_points INT DEFAULT 0;
    
    -- Get total accumulated points
    SELECT COALESCE(accumulated_points, 0)
    INTO v_total_points
    FROM customer
    WHERE user_id = p_customer_id;
    
    -- Return total points as first result set
    SELECT v_total_points AS totalPoints;
    
    -- Return point history as second result set
    -- Point history is derived from bookings (points earned) and redeemed vouchers
    SELECT 
        activity_date AS date,
        description,
        points,
        balance
    FROM (
        -- Points earned from bookings
        SELECT 
            b.created_time_at AS activity_date,
            CONCAT('Booking #', b.id) AS description,
            CONCAT('+', COALESCE(
                CAST(
                    (SELECT SUM(ss.price * 0.05) 
                     FROM showtime_seat ss 
                     WHERE ss.booking_id = b.id) AS SIGNED
                ), 0)
            ) AS points,
            (
                SELECT accumulated_points 
                FROM customer 
                WHERE user_id = p_customer_id
            ) AS balance,
            1 AS sort_order
        FROM booking b
        WHERE b.customer_id = p_customer_id
          AND b.status = 'confirmed'
        
        UNION ALL
        
        -- Points redeemed (from coupons with balance deducted)
        SELECT 
            c.date_expired AS activity_date,
            CONCAT('Redeemed voucher') AS description,
            CONCAT('-', CAST(c.balance AS SIGNED)) AS points,
            (
                SELECT accumulated_points 
                FROM customer 
                WHERE user_id = p_customer_id
            ) AS balance,
            2 AS sort_order
        FROM coupon c
        WHERE c.customer_id = p_customer_id
          AND c.balance < 0
    ) AS point_activities
    ORDER BY activity_date DESC, sort_order ASC
    LIMIT 50;
END$$
DELIMITER ;

-- Procedure: sp_get_membership_card
DROP PROCEDURE IF EXISTS sp_get_membership_card;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_membership_card"(
    IN p_customer_id BIGINT
)
BEGIN
    DECLARE v_member_since DATE;

    -- Member since = ngày tạo tài khoản
    SELECT 
        COALESCE(u.created_at, CURDATE())
    INTO v_member_since
    FROM `User` u
    WHERE u.id = p_customer_id
    LIMIT 1;

    -- Return 1 single row with membership card info
    SELECT 
        c.user_id AS customer_id,

        CONCAT('BKinema ', c.membership_name, ' Member') AS membership_title,
        c.membership_name AS membership_tier,

        CONCAT(
            u.fname, ' ',
            COALESCE(u.minit, ''), 
            CASE WHEN u.minit IS NULL OR u.minit = '' THEN '' ELSE ' ' END,
            u.lname
        ) AS member_name,

        -- Card Number (fake logic, stable per user)
        CONCAT(
            LPAD(c.user_id, 4, '0'), '-',
            LPAD(MOD(c.user_id * 13, 10000), 4, '0'), '-',
            LPAD(MOD(c.user_id * 37, 10000), 4, '0'), '-',
            LPAD(MOD(c.user_id * 97, 10000), 4, '0')
        ) AS card_number,

        v_member_since AS member_since_date,

        NULL AS valid_until_date,   -- Membership lifetime, no expiry

        m.box_office_discount,
        m.concession_discount,
        c.accumulated_points

    FROM customer c
    JOIN `User` u
      ON u.id = c.user_id
    LEFT JOIN membership m
      ON m.tier_name = c.membership_name
    WHERE c.user_id = p_customer_id
    LIMIT 1;
END$$
DELIMITER ;

-- Procedure: sp_get_movies
DROP PROCEDURE IF EXISTS sp_get_movies;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_movies"(
    IN p_status VARCHAR(20),   -- now, upcoming, ended, all
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        id,
        name,
        duration,
        language,
        release_date,
        end_date,
        age_rating,
        poster_file,
        url_slug,
        description,
        trailer_url
    FROM movie
    WHERE
        (
            p_status = 'all'
            OR (p_status = 'now' AND release_date <= CURDATE() 
                                AND (end_date IS NULL OR end_date >= CURDATE()))
            OR (p_status = 'upcoming' AND release_date > CURDATE())
            OR (p_status = 'ended' AND end_date < CURDATE())
        )
    ORDER BY release_date DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Procedure: sp_get_movies_with_details
DROP PROCEDURE IF EXISTS sp_get_movies_with_details;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_movies_with_details"(
    IN p_status VARCHAR(20),   -- now, upcoming, ended, all
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        m.id,
        m.name,
        m.duration,
        m.language,
        m.release_date,
        m.end_date,
        m.age_rating,
        m.poster_file,
        m.url_slug,
        m.description,
        m.trailer_url,
        -- Aggregate related data using GROUP_CONCAT
        GROUP_CONCAT(DISTINCT d.director ORDER BY d.director SEPARATOR '|||') AS directors,
        GROUP_CONCAT(DISTINCT a.actor ORDER BY a.actor SEPARATOR '|||') AS actors,
        GROUP_CONCAT(DISTINCT g.genre ORDER BY g.genre SEPARATOR '|||') AS genres,
        GROUP_CONCAT(DISTINCT s.subtitle ORDER BY s.subtitle SEPARATOR '|||') AS subtitles,
        GROUP_CONCAT(DISTINCT db.dubbing ORDER BY db.dubbing SEPARATOR '|||') AS dubbing_options
    FROM movie m
    LEFT JOIN director d ON m.id = d.movie_id
    LEFT JOIN actor a ON m.id = a.movie_id
    LEFT JOIN genre g ON m.id = g.movie_id
    LEFT JOIN subtitle s ON m.id = s.movie_id
    LEFT JOIN dubbing db ON m.id = db.movie_id
    WHERE
        (
            p_status = 'all'
            OR (p_status = 'now' AND m.release_date <= CURDATE() 
                                AND (m.end_date IS NULL OR m.end_date >= CURDATE()))
            OR (p_status = 'upcoming' AND m.release_date > CURDATE())
            OR (p_status = 'ended' AND m.end_date < CURDATE())
        )
    GROUP BY m.id, m.name, m.duration, m.language, m.release_date, m.end_date, 
             m.age_rating, m.poster_file, m.url_slug, m.description, m.trailer_url
    ORDER BY m.release_date DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Procedure: sp_get_movie_by_id
DROP PROCEDURE IF EXISTS sp_get_movie_by_id;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_movie_by_id"(
    IN p_movie_id BIGINT
)
BEGIN
    SELECT *
    FROM movie
    WHERE id = p_movie_id;
END$$
DELIMITER ;

-- Procedure: sp_get_schedule_by_theater
DROP PROCEDURE IF EXISTS sp_get_schedule_by_theater;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_schedule_by_theater"(
    IN p_theater_id INT,
    IN p_date DATE
)
BEGIN
    SELECT
        s.id AS showtime_id,
        s.date,
        s.start_time,
        s.end_time,

        -- movie info
        m.id AS movie_id,
        m.name AS movie_name,
        m.age_rating,
        m.poster_file,
        m.duration,
        GROUP_CONCAT(DISTINCT g.genre ORDER BY g.genre SEPARATOR ', ') AS genres,

        -- auditorium info
        a.number AS auditorium_number,
        a.type AS auditorium_type,
        a.capacity AS auditorium_capacity

    FROM showtime s
    JOIN movie m 
        ON s.movie_id = m.id
    JOIN auditorium a
        ON s.au_number = a.number
       AND s.au_theater_id = a.theater_id
    LEFT JOIN genre g
        ON m.id = g.movie_id

    WHERE 
        a.theater_id = p_theater_id
        AND s.date = p_date

    GROUP BY 
        s.id, s.date, s.start_time, s.end_time,
        m.id, m.name, m.age_rating, m.poster_file, m.duration,
        a.number, a.type, a.capacity

    ORDER BY 
        m.name ASC,
        a.number ASC,
        s.start_time ASC;
END$$
DELIMITER ;

-- Procedure: sp_get_seat_by_au_theater
DROP PROCEDURE IF EXISTS sp_get_seat_by_au_theater;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_seat_by_au_theater"(
    IN p_au_number INT,
    IN p_au_theater_id BIGINT
)
BEGIN
    SELECT 
        id,
        au_number,
        au_theater_id,
        row_char,
        column_number,
        type,
        price
    FROM seat
    WHERE au_number = p_au_number
      AND au_theater_id = p_au_theater_id
    ORDER BY row_char ASC, column_number ASC;
END$$
DELIMITER ;

-- Procedure: sp_get_showtime
DROP PROCEDURE IF EXISTS sp_get_showtime;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_showtime"(
    IN p_showtime_id BIGINT
)
BEGIN
    SELECT *
    FROM showtime
    WHERE id = p_showtime_id;
END$$
DELIMITER ;

-- Procedure: sp_get_showtime_seat
DROP PROCEDURE IF EXISTS sp_get_showtime_seat;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_showtime_seat"(
    IN p_st_id BIGINT,
    IN p_seat_au_number INT,
    IN p_seat_au_theater_id BIGINT
)
BEGIN
    SELECT *
    FROM showtime_seat
    WHERE st_id = p_st_id
      AND seat_au_number = p_seat_au_number
      AND seat_au_theater_id = p_seat_au_theater_id;
END$$
DELIMITER ;

-- Procedure: sp_get_theaters
DROP PROCEDURE IF EXISTS sp_get_theaters;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_theaters"(
    IN p_name      VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_city      VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_district  VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_limit     INT,
    IN p_offset    INT
)
BEGIN
    SELECT 
        id,
        name,
        street,
        district,
        city,
        image,
        description
    FROM theater
    WHERE
        (
            p_name IS NULL
            OR name COLLATE utf8mb4_unicode_ci
               LIKE (CONCAT('%', p_name, '%') COLLATE utf8mb4_unicode_ci)
        )
        AND (
            p_city IS NULL
            OR city COLLATE utf8mb4_unicode_ci = p_city COLLATE utf8mb4_unicode_ci
        )
        AND (
            p_district IS NULL
            OR district COLLATE utf8mb4_unicode_ci = p_district COLLATE utf8mb4_unicode_ci
        )
    ORDER BY name ASC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- Procedure: sp_get_theater_by_id
DROP PROCEDURE IF EXISTS sp_get_theater_by_id;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_theater_by_id"(
    IN p_theater_id BIGINT
)
BEGIN
    SELECT 
        id,
        name,
        street,
        district,
        city,
        image,
        description
    FROM theater
    WHERE id = p_theater_id;
END$$
DELIMITER ;

-- Procedure: sp_get_transaction_history
DROP PROCEDURE IF EXISTS sp_get_transaction_history;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_transaction_history"(
    IN p_customer_id INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    DECLARE v_total_count INT DEFAULT 0;
    
    -- Get total count for pagination
    SELECT COUNT(*) INTO v_total_count
    FROM (
        SELECT b.id FROM booking b WHERE b.customer_id = p_customer_id
        UNION ALL
        SELECT c.id FROM coupon c WHERE c.customer_id = p_customer_id
        UNION ALL
        SELECT r.id FROM refund r 
        JOIN booking b ON r.booking_id = b.id 
        WHERE b.customer_id = p_customer_id
    ) AS all_transactions;
    
    -- Return total count as first result set
    SELECT v_total_count AS totalCount;
    
    -- Return paginated transactions as second result set
    (
        SELECT 
            CONCAT('TXN-', LPAD(b.id, 8, '0'), '-B01') AS transactionId,
            b.created_time_at AS date,
            'Booking' AS type,
            CONCAT('Movie Booking #', b.id) AS description,
            COALESCE(
                (SELECT SUM(ss.price) 
                 FROM showtime_seat ss 
                 WHERE ss.booking_id = b.id), 0
            ) + COALESCE(
                (SELECT SUM(fw.price * fw.quantity) 
                 FROM fwb fw 
                 WHERE fw.booking_id = b.id), 0
            ) AS amount,
            b.booking_method AS paymentMethod,
            b.status AS status
        FROM booking b
        WHERE b.customer_id = p_customer_id
    )
    UNION ALL
    (
        SELECT 
            CONCAT('TXN-', LPAD(c.id, 8, '0'), '-C02') AS transactionId,
            COALESCE(b.created_time_at, CURDATE()) AS date,
            'Coupon' AS type,
            CONCAT(c.coupon_type, ' - ', c.name) AS description,
            c.balance AS amount,
            'Coupon' AS paymentMethod,
            IF(c.balance > 0, 'Active', 'Used') AS status
        FROM coupon c
        LEFT JOIN booking b ON c.booking_id = b.id
        WHERE c.customer_id = p_customer_id
    )
    UNION ALL
    (
        SELECT 
            CONCAT('TXN-', LPAD(r.id, 8, '0'), '-R04') AS transactionId,
            r.created_time_at AS date,
            'Refund' AS type,
            COALESCE(r.reason, 'Refund request') AS description,
            r.amount AS amount,
            'Refund' AS paymentMethod,
            r.status AS status
        FROM refund r
        JOIN booking b ON r.booking_id = b.id
        WHERE b.customer_id = p_customer_id
    )
    ORDER BY date DESC
    LIMIT p_limit OFFSET p_offset;
    
END$$
DELIMITER ;

-- Procedure: sp_get_user_by_email
DROP PROCEDURE IF EXISTS sp_get_user_by_email;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_user_by_email"(
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
DELIMITER ;

-- Procedure: sp_get_user_by_id
DROP PROCEDURE IF EXISTS sp_get_user_by_id;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_user_by_id"(
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
DELIMITER ;

-- Procedure: sp_get_user_password
DROP PROCEDURE IF EXISTS sp_get_user_password;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_get_user_password"(
    IN p_user_id BIGINT,
    OUT p_password VARCHAR(255),
    OUT p_success TINYINT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = 0;
        SET p_message = 'Error retrieving user password';
    END;

    -- Get user password
    SELECT password INTO p_password
    FROM User
    WHERE id = p_user_id
    LIMIT 1;

    IF p_password IS NULL THEN
        SET p_success = 0;
        SET p_message = 'User not found';
    ELSE
        SET p_success = 1;
        SET p_message = 'Password retrieved successfully';
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_gift_coupon
DROP PROCEDURE IF EXISTS sp_gift_coupon;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_gift_coupon"(
    IN p_coupon_id BIGINT,
    IN p_sender_id BIGINT,
    IN p_receiver_id BIGINT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255),
    OUT p_sender_name VARCHAR(255),
    OUT p_receiver_name VARCHAR(255)
)
main_block: BEGIN
    DECLARE v_current_owner BIGINT;
    DECLARE v_booking_id BIGINT;
    DECLARE v_date_expired DATE;
    DECLARE v_already_gifted TINYINT;
    DECLARE v_receiver_exists INT DEFAULT 0;
    DECLARE v_sender_fname VARCHAR(100);
    DECLARE v_sender_lname VARCHAR(100);
    DECLARE v_receiver_fname VARCHAR(100);
    DECLARE v_receiver_lname VARCHAR(100);
    
    -- Default output
    SET p_success = FALSE;
    SET p_sender_name = NULL;
    SET p_receiver_name = NULL;
    
    -- 1. Check if sender = receiver
    IF p_sender_id = p_receiver_id THEN
        SET p_message = 'Cannot gift coupon to yourself';
        LEAVE main_block;
    END IF;
    
    -- 2. Check if receiver exists
    SELECT COUNT(*) INTO v_receiver_exists
    FROM customer c
    WHERE c.user_id = p_receiver_id;
    
    IF v_receiver_exists = 0 THEN
        SET p_message = 'Receiver customer not found';
        LEAVE main_block;
    END IF;
    
    -- Get receiver name
    SELECT u.fname, u.lname
    INTO v_receiver_fname, v_receiver_lname
    FROM customer c
    JOIN User u ON c.user_id = u.id
    WHERE c.user_id = p_receiver_id
    LIMIT 1;
    
    -- 3. Check coupon ownership, usage, and expiry
    SELECT customer_id, booking_id, date_expired, gift
    INTO v_current_owner, v_booking_id, v_date_expired, v_already_gifted
    FROM coupon
    WHERE id = p_coupon_id
    LIMIT 1;
    
    IF v_current_owner IS NULL THEN
        SET p_message = 'Coupon not found';
        LEAVE main_block;
    END IF;
    
    IF v_current_owner != p_sender_id THEN
        SET p_message = 'You do not own this coupon';
        LEAVE main_block;
    END IF;
    
    -- 4. Check if coupon already applied to booking
    IF v_booking_id IS NOT NULL THEN
        SET p_message = 'Coupon already applied to a booking';
        LEAVE main_block;
    END IF;
    
    -- 5. Check if coupon expired
    IF v_date_expired < CURDATE() THEN
        SET p_message = 'Coupon has expired';
        LEAVE main_block;
    END IF;
    
    -- 6. Check if already gifted (only allow gift once)
    IF v_already_gifted = 1 THEN
        SET p_message = 'Coupon has already been gifted';
        LEAVE main_block;
    END IF;
    
    -- Get sender name
    SELECT fname, lname
    INTO v_sender_fname, v_sender_lname
    FROM User
    WHERE id = p_sender_id
    LIMIT 1;
    
    -- Start transaction with row lock to prevent concurrent gifts
    START TRANSACTION;
    
    -- 7. Transfer ownership with FOR UPDATE lock
    UPDATE coupon
    SET customer_id = p_receiver_id, gift = 1
    WHERE id = p_coupon_id 
      AND customer_id = p_sender_id 
      AND gift = 0 
      AND booking_id IS NULL;
    
    -- Check if update actually happened (race condition check)
    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SET p_message = 'Coupon state changed during transaction, please retry';
        LEAVE main_block;
    END IF;
    
    -- 8. Record gift transaction
    INSERT INTO `give` (coupon_id, sender_id, receiver_id)
    VALUES (p_coupon_id, p_sender_id, p_receiver_id);
    
    -- If all goes well, commit
    COMMIT;
    
    -- Success
    SET p_success = TRUE;
    SET p_message = 'Coupon gifted successfully';
    SET p_sender_name = CONCAT(v_sender_fname, ' ', v_sender_lname);
    SET p_receiver_name = CONCAT(v_receiver_fname, ' ', v_receiver_lname);
END$$
DELIMITER ;

-- Procedure: sp_login_user
DROP PROCEDURE IF EXISTS sp_login_user;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_login_user"(
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
        SELECT id, password, fname, lname
        INTO p_user_id, p_password, p_fname, p_lname
        FROM `User`
        WHERE email = p_email
        LIMIT 1;
        
        SET p_success = TRUE;
        SET p_message = 'User found';
    END IF;
END$$
DELIMITER ;

-- Procedure: sp_register_user
DROP PROCEDURE IF EXISTS sp_register_user;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_register_user"(
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
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = CONCAT('Database error: ', v_error_msg);
        SET p_user_id = NULL;
    END;
    
    START TRANSACTION;
    
    SET v_email_valid = fn_validate_email(p_email);
    IF NOT v_email_valid THEN
        SET p_success = FALSE;
        SET p_message = 'Invalid email format';
        SET p_user_id = NULL;
        ROLLBACK;
    ELSE
        SET v_email_exists = fn_check_email_exists(p_email);
        
        IF v_email_exists THEN
            SET p_success = FALSE;
            SET p_message = 'Email already registered';
            SET p_user_id = NULL;
            ROLLBACK;
        ELSE
            SET v_age_valid = fn_validate_age(p_birthday);
            IF NOT v_age_valid THEN
                SET p_success = FALSE;
                SET p_message = 'User must be at least 13 years old';
                SET p_user_id = NULL;
                ROLLBACK;
            ELSE
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
DELIMITER ;

-- Procedure: sp_send_gift
DROP PROCEDURE IF EXISTS sp_send_gift;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_send_gift"(
    IN p_sender_id BIGINT,
    IN p_booking_id BIGINT,
    IN p_receiver_id BIGINT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255),
    OUT p_sender_name VARCHAR(255),
    OUT p_receiver_name VARCHAR(255)
)
main_block: BEGIN
    DECLARE v_booking_customer_id BIGINT;
    DECLARE v_booking_status VARCHAR(50);
    DECLARE v_is_gift TINYINT;
    DECLARE v_receiver_exists INT DEFAULT 0;
    DECLARE v_sender_fname VARCHAR(100);
    DECLARE v_sender_lname VARCHAR(100);
    DECLARE v_receiver_fname VARCHAR(100);
    DECLARE v_receiver_lname VARCHAR(100);

    -- Default output values
    SET p_success = FALSE;
    SET p_sender_name = NULL;
    SET p_receiver_name = NULL;

    -- 1. Cannot send to yourself
    IF p_sender_id = p_receiver_id THEN
        SET p_message = 'Cannot send booking to yourself';
        LEAVE main_block;
    END IF;

    -- 2. Check if receiver exists
    SELECT COUNT(*) INTO v_receiver_exists
    FROM customer c
    WHERE c.user_id = p_receiver_id;

    IF v_receiver_exists = 0 THEN
        SET p_message = 'Receiver customer not found';
        LEAVE main_block;
    END IF;

    -- Lấy tên người nhận
    SELECT u.fname, u.lname
    INTO v_receiver_fname, v_receiver_lname
    FROM customer c
    JOIN User u ON c.user_id = u.id
    WHERE c.user_id = p_receiver_id
    LIMIT 1;

    -- 3. Check booking details
    SELECT customer_id, status, is_gift
    INTO v_booking_customer_id, v_booking_status, v_is_gift
    FROM booking
    WHERE id = p_booking_id
    LIMIT 1;

    IF v_booking_customer_id IS NULL THEN
        SET p_message = 'Booking not found';
        LEAVE main_block;
    END IF;

    IF v_booking_customer_id != p_sender_id THEN
        SET p_message = 'You do not own this booking';
        LEAVE main_block;
    END IF;

    IF v_is_gift = 1 THEN
        SET p_message = 'This booking has already been gifted';
        LEAVE main_block;
    END IF;

    IF v_booking_status NOT IN ('Confirmed', 'Paid') THEN
        SET p_message = CONCAT('Cannot gift booking with status: ', v_booking_status);
        LEAVE main_block;
    END IF;

    -- Get sender name
    SELECT fname, lname
    INTO v_sender_fname, v_sender_lname
    FROM User
    WHERE id = p_sender_id
    LIMIT 1;

    -- Start transaction
    START TRANSACTION;

    -- 4. Perform updates
    UPDATE booking
    SET is_gift = 1,
        customer_id = p_receiver_id
    WHERE id = p_booking_id;

    INSERT INTO send_gift (booking_id, sender_id, receiver_id)
    VALUES (p_booking_id, p_sender_id, p_receiver_id);

    -- If all goes well, commit
    COMMIT;

    -- 5. Set success and output parameters
    SET p_success = TRUE;
    SET p_message = 'Booking gifted successfully';
    SET p_sender_name = CONCAT(v_sender_fname, ' ', v_sender_lname);
    SET p_receiver_name = CONCAT(v_receiver_fname, ' ', v_receiver_lname);
END$$
DELIMITER ;

-- Procedure: sp_start_booking
DROP PROCEDURE IF EXISTS sp_start_booking;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_start_booking"(
    IN  p_customer_id   BIGINT,
    IN  p_showtime_id   BIGINT,
    IN  p_seat_ids_json JSON,   -- [1,2,3]
    IN  p_fwb_items_json JSON,  -- [{"id":1,"quantity":2}] or NULL
    OUT p_booking_id    BIGINT
)
BEGIN
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_len INT;
    DECLARE v_seat_id BIGINT;
    DECLARE v_au_number INT;
    DECLARE v_au_theater_id BIGINT;
    DECLARE v_ticket_price DECIMAL(10,2);
    DECLARE v_showtime_au_number INT;
    DECLARE v_showtime_au_theater_id BIGINT;
    
    -- F&B variables
    DECLARE v_fwb_idx INT DEFAULT 0;
    DECLARE v_fwb_len INT DEFAULT 0;
    DECLARE v_menu_id BIGINT;
    DECLARE v_qty INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total_fwb DECIMAL(10,2) DEFAULT 0;
    DECLARE v_fwb_count INT DEFAULT 0;

    -- nếu lỗi SQL thì rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- validate JSON
    IF p_seat_ids_json IS NULL OR JSON_TYPE(p_seat_ids_json) <> 'ARRAY' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_seat_ids_json must be a JSON array of seat ids';
    END IF;
    
    -- Validate F&B JSON (optional)
    IF p_fwb_items_json IS NOT NULL THEN
        IF JSON_TYPE(p_fwb_items_json) <> 'ARRAY' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'p_fwb_items_json must be array or NULL';
        END IF;
        SET v_fwb_len = JSON_LENGTH(p_fwb_items_json);
    END IF;

    SET v_len = JSON_LENGTH(p_seat_ids_json);

    START TRANSACTION;

    -- Get showtime's auditorium info first
    SELECT au_number, au_theater_id
    INTO v_showtime_au_number, v_showtime_au_theater_id
    FROM showtime
    WHERE id = p_showtime_id;

    IF v_showtime_au_number IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Showtime not found';
    END IF;

    -- 1. Tạo booking (ở bước này status = Pending, method = Online)
    INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
    VALUES (NOW(), 'Pending', 'Online', 0, p_customer_id);

    SET p_booking_id = LAST_INSERT_ID();

    -- 2. Lặp từng seat_id để giữ ghế
    WHILE v_idx < v_len DO
        -- Cast explicitly to BIGINT to avoid string comparison issues
        SET v_seat_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_seat_ids_json, CONCAT('$[', v_idx, ']'))) AS UNSIGNED);

        -- Lấy thông tin seat (đảm bảo seat thuộc đúng phòng của showtime)
        SELECT s.au_number, s.au_theater_id, s.price
        INTO   v_au_number, v_au_theater_id, v_ticket_price
        FROM seat s
        WHERE s.id = v_seat_id
          AND s.au_number = v_showtime_au_number
          AND s.au_theater_id = v_showtime_au_theater_id
        FOR UPDATE;

        -- Check nếu không tìm thấy seat trong auditorium của showtime
        IF v_au_number IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Seat not found in showtime auditorium';
        END IF;

        -- Check ghế đã bị giữ/đặt chưa (phải check đầy đủ seat_id + auditorium + theater)
        IF EXISTS (
            SELECT 1 FROM showtime_seat ss
            WHERE ss.st_id = p_showtime_id
              AND ss.seat_id = v_seat_id
              AND ss.seat_au_number = v_au_number
              AND ss.seat_au_theater_id = v_au_theater_id
              AND ss.status IN ('Held','Booked')
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'One of selected seats is already taken';
        END IF;

        -- Insert vé (ticket) cho ghế này, trạng thái Held, gắn với booking
        INSERT INTO showtime_seat
            (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
        VALUES
            (p_showtime_id, v_seat_id, v_au_number, v_au_theater_id, 'Held', v_ticket_price, p_booking_id);

        SET v_idx = v_idx + 1;
    END WHILE;

    -- 3. Add F&B items (if provided)
    IF v_fwb_len > 0 THEN
        -- Create parent FWB record
        INSERT INTO fwb (id, booking_id, quantity, price)
        VALUES (p_booking_id, p_booking_id, 1, 0);

        -- Loop F&B items
        WHILE v_fwb_idx < v_fwb_len DO
            SET v_menu_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_fwb_items_json, CONCAT('$[', v_fwb_idx, '].id'))) AS UNSIGNED);
            SET v_qty     = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_fwb_items_json, CONCAT('$[', v_fwb_idx, '].quantity'))) AS UNSIGNED);

            IF v_qty IS NOT NULL AND v_qty > 0 THEN
                SELECT price INTO v_price
                FROM fwb_menu
                WHERE id = v_menu_id;

                IF v_price IS NOT NULL THEN
                    SET v_total_fwb = v_total_fwb + (v_price * v_qty);
                    SET v_fwb_count = v_fwb_count + 1;

                    INSERT INTO contains_item (fwb_menu_id, fwb_id, fwb_booking_id, quantity)
                    VALUES (v_menu_id, p_booking_id, p_booking_id, v_qty);
                END IF;
            END IF;

            SET v_fwb_idx = v_fwb_idx + 1;
        END WHILE;

        -- Update or delete FWB
        IF v_fwb_count = 0 THEN
            DELETE FROM fwb WHERE booking_id = p_booking_id;
        ELSE
            UPDATE fwb
            SET quantity = v_fwb_count,
                price    = v_total_fwb
            WHERE booking_id = p_booking_id;
        END IF;
    END IF;

    COMMIT;
END$$
DELIMITER ;

-- Procedure: sp_update_booking_fwb
DROP PROCEDURE IF EXISTS sp_update_booking_fwb;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_update_booking_fwb"(
    IN  p_booking_id   BIGINT,
    IN  p_items_json   JSON,
    OUT p_total_fwb    DECIMAL(10,2)
)
BEGIN
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_len INT;
    DECLARE v_menu_id BIGINT;
    DECLARE v_qty INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    DECLARE v_count INT DEFAULT 0;   -- số item hợp lệ

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate JSON
    IF p_items_json IS NULL OR JSON_TYPE(p_items_json) <> 'ARRAY' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_items_json must be array';
    END IF;

    SET v_len = JSON_LENGTH(p_items_json);

    START TRANSACTION;

    -- Xoá dữ liệu F&B cũ
    DELETE FROM contains_item WHERE fwb_booking_id = p_booking_id;
    DELETE FROM fwb          WHERE booking_id     = p_booking_id;

    -- Tạo parent trước (để tránh lỗi foreign key)
    INSERT INTO fwb (id, booking_id, quantity, price)
    VALUES (p_booking_id, p_booking_id, 1, 0);

    -- Loop món ăn
    WHILE v_idx < v_len DO
        SET v_menu_id = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_idx, '].id')));
        SET v_qty     = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_idx, '].quantity')));

        IF v_qty IS NOT NULL AND v_qty > 0 THEN
            -- Lấy giá
            SELECT price INTO v_price
            FROM fwb_menu
            WHERE id = v_menu_id;

            SET v_total = v_total + v_price * v_qty;
            SET v_count = v_count + 1;

            INSERT INTO contains_item (fwb_menu_id, fwb_id, fwb_booking_id, quantity)
            VALUES (v_menu_id, p_booking_id, p_booking_id, v_qty);
        END IF;

        SET v_idx = v_idx + 1;
    END WHILE;

    -- Nếu không có món hợp lệ -> xoá luôn FWB
    IF v_count = 0 THEN
        DELETE FROM fwb WHERE booking_id = p_booking_id;
        SET p_total_fwb = 0;
    ELSE
        UPDATE fwb
        SET quantity = v_count,
            price    = v_total
        WHERE booking_id = p_booking_id;

        SET p_total_fwb = v_total;
    END IF;

    COMMIT;
END$$
DELIMITER ;

-- Procedure: sp_update_customer_membership
DROP PROCEDURE IF EXISTS sp_update_customer_membership;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_update_customer_membership"(
  IN p_customer_id BIGINT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_birth_year INT;
  DECLARE v_total_spent DECIMAL(12,2);
  DECLARE v_tier VARCHAR(255);

  -- 1. Cộng thêm chi tiêu
  UPDATE customer
  SET accumulated_points = accumulated_points + p_amount
  WHERE user_id = p_customer_id;

  -- 2. Lấy năm sinh + tổng chi tiêu hiện tại
  SELECT YEAR(u.birthday), c.accumulated_points
  INTO v_birth_year, v_total_spent
  FROM customer c
  JOIN `User` u ON u.id = c.user_id
  WHERE c.user_id = p_customer_id;

  -- 3. Xác định tier base theo năm sinh
  IF v_birth_year >= 2002 THEN
    SET v_tier = 'U22';
  ELSE
    SET v_tier = 'Member';
  END IF;

  -- 4. Đè VIP / VVIP nếu đủ chi tiêu
  IF v_total_spent >= 8000000 THEN
    SET v_tier = 'VVIP';
  ELSEIF v_total_spent >= 4000000 THEN
    SET v_tier = 'VIP';
  END IF;

  -- 5. Cập nhật lại membership_name
  UPDATE customer
  SET membership_name = v_tier
  WHERE user_id = p_customer_id;
END$$
DELIMITER ;

-- Procedure: sp_update_user_profile
DROP PROCEDURE IF EXISTS sp_update_user_profile;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_update_user_profile"(
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
        -- Update user profile (only update non-null values, birthday is never updated)
        UPDATE `User`
        SET 
            fname = COALESCE(p_fname, fname),
            minit = COALESCE(p_minit, minit),
            lname = COALESCE(p_lname, lname),
            -- birthday is intentionally excluded - it cannot be changed after registration
            gender = COALESCE(p_gender, gender),
            district = COALESCE(p_district, district),
            city = COALESCE(p_city, city),
            updated_at = NOW()
        WHERE id = p_user_id;
        
        SET p_success = TRUE;
        SET p_message = 'Profile updated successfully';
    END IF;
END$$
DELIMITER ;

