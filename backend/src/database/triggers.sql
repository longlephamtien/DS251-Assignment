-- ============================================
-- Triggers
-- Database: bkinema
-- Generated: 2025-11-29T21:52:10.119Z
-- ============================================

-- Trigger: trg_after_user_insert
-- Table: User
DROP TRIGGER IF EXISTS trg_after_user_insert;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_after_user_insert" AFTER INSERT ON "User" FOR EACH ROW BEGIN
    IF NOT EXISTS (SELECT 1 FROM staff WHERE user_id = NEW.id) THEN
        INSERT INTO customer (user_id, accumulated_points, membership_name)
        VALUES (NEW.id, 0, fn_get_default_membership());
    END IF;
END$$
DELIMITER ;

-- Trigger: trg_before_customer_update
-- Table: customer
DROP TRIGGER IF EXISTS trg_before_customer_update;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_before_customer_update" BEFORE UPDATE ON "customer" FOR EACH ROW BEGIN
    IF NEW.accumulated_points < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Accumulated points cannot be negative';
    END IF;
    
    SET NEW.membership_name = fn_get_membership_by_points(NEW.accumulated_points);
END$$
DELIMITER ;

-- Trigger: trg_customer_membership_bi
-- Table: customer
DROP TRIGGER IF EXISTS trg_customer_membership_bi;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_customer_membership_bi" BEFORE INSERT ON "customer" FOR EACH ROW BEGIN
    DECLARE v_tier_name VARCHAR(255);

    -- Find highest tier whose min_point <= accumulated_points
    SELECT m.tier_name
    INTO v_tier_name
    FROM membership AS m
    WHERE m.uk_membership_min_point <= NEW.accumulated_points
    ORDER BY m.uk_membership_min_point DESC
    LIMIT 1;

    -- If a tier is found, set it; otherwise leave NULL (FK allows NULL)
    SET NEW.membership_name = v_tier_name;
END$$
DELIMITER ;

-- Trigger: trg_customer_membership_bu
-- Table: customer
DROP TRIGGER IF EXISTS trg_customer_membership_bu;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_customer_membership_bu" BEFORE UPDATE ON "customer" FOR EACH ROW BEGIN
    DECLARE v_tier_name VARCHAR(255);

    -- Only react when points actually increase
    IF NEW.accumulated_points > OLD.accumulated_points THEN
        SELECT m.tier_name
        INTO v_tier_name
        FROM membership AS m
        WHERE m.uk_membership_min_point <= NEW.accumulated_points
        ORDER BY m.uk_membership_min_point DESC
        LIMIT 1;

        SET NEW.membership_name = v_tier_name;
    END IF;
END$$
DELIMITER ;

-- Trigger: trg_after_seat_delete
-- Table: seat
DROP TRIGGER IF EXISTS trg_after_seat_delete;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_after_seat_delete" AFTER DELETE ON "seat" FOR EACH ROW BEGIN
    UPDATE auditorium
    SET capacity = (
        SELECT COUNT(*) 
        FROM seat 
        WHERE au_number = OLD.au_number 
        AND au_theater_id = OLD.au_theater_id
    )
    WHERE number = OLD.au_number 
    AND theater_id = OLD.au_theater_id;
END$$
DELIMITER ;

-- Trigger: trg_after_seat_insert
-- Table: seat
DROP TRIGGER IF EXISTS trg_after_seat_insert;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_after_seat_insert" AFTER INSERT ON "seat" FOR EACH ROW BEGIN
    UPDATE auditorium
    SET capacity = (
        SELECT COUNT(*) 
        FROM seat 
        WHERE au_number = NEW.au_number 
        AND au_theater_id = NEW.au_theater_id
    )
    WHERE number = NEW.au_number 
    AND theater_id = NEW.au_theater_id;
END$$
DELIMITER ;

-- Trigger: trg_after_seat_update
-- Table: seat
DROP TRIGGER IF EXISTS trg_after_seat_update;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_after_seat_update" AFTER UPDATE ON "seat" FOR EACH ROW BEGIN
    -- Update old auditorium capacity if seat moved to different auditorium
    IF OLD.au_number != NEW.au_number OR OLD.au_theater_id != NEW.au_theater_id THEN
        UPDATE auditorium
        SET capacity = (
            SELECT COUNT(*) 
            FROM seat 
            WHERE au_number = OLD.au_number 
            AND au_theater_id = OLD.au_theater_id
        )
        WHERE number = OLD.au_number 
        AND theater_id = OLD.au_theater_id;
    END IF;
    
    -- Update new auditorium capacity
    UPDATE auditorium
    SET capacity = (
        SELECT COUNT(*) 
        FROM seat 
        WHERE au_number = NEW.au_number 
        AND au_theater_id = NEW.au_theater_id
    )
    WHERE number = NEW.au_number 
    AND theater_id = NEW.au_theater_id;
END$$
DELIMITER ;

-- Trigger: trg_sendgift_set_isgift
-- Table: send_gift
DROP TRIGGER IF EXISTS trg_sendgift_set_isgift;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_sendgift_set_isgift" AFTER INSERT ON "send_gift" FOR EACH ROW BEGIN
    UPDATE booking
    SET is_gift = 1
    WHERE id = NEW.booking_id;
END$$
DELIMITER ;

-- Trigger: trg_before_showtime_insert
-- Table: showtime
DROP TRIGGER IF EXISTS trg_before_showtime_insert;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_before_showtime_insert" BEFORE INSERT ON "showtime" FOR EACH ROW BEGIN
    DECLARE conflict_count INT;
    
    -- Check for overlapping showtimes with 15 minutes buffer
    -- A showtime conflicts if:
    -- - It's in the same auditorium (au_number and au_theater_id)
    -- - It's on the same date
    -- - Either:
    --   a) New showtime starts before existing ends + 15 min AND ends after existing starts - 15 min
    SELECT COUNT(*) INTO conflict_count
    FROM showtime
    WHERE au_number = NEW.au_number
      AND au_theater_id = NEW.au_theater_id
      AND date = NEW.date
      AND (
          -- New showtime overlaps with existing showtime (with 15 min buffer)
          (NEW.start_time < ADDTIME(end_time, '00:15:00') 
           AND NEW.end_time > SUBTIME(start_time, '00:15:00'))
      );
    
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Showtime conflicts with existing schedule. Showtimes must not overlap and must have at least 15 minutes gap between them.';
    END IF;
END$$
DELIMITER ;

-- Trigger: trg_before_showtime_update
-- Table: showtime
DROP TRIGGER IF EXISTS trg_before_showtime_update;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_before_showtime_update" BEFORE UPDATE ON "showtime" FOR EACH ROW BEGIN
    DECLARE conflict_count INT;
    
    -- Only check if date, time, or auditorium has changed
    IF NEW.date != OLD.date 
       OR NEW.start_time != OLD.start_time 
       OR NEW.end_time != OLD.end_time
       OR NEW.au_number != OLD.au_number
       OR NEW.au_theater_id != OLD.au_theater_id THEN
        
        -- Check for conflicts with other showtimes (excluding current one)
        SELECT COUNT(*) INTO conflict_count
        FROM showtime
        WHERE id != NEW.id
          AND au_number = NEW.au_number
          AND au_theater_id = NEW.au_theater_id
          AND date = NEW.date
          AND (
              (NEW.start_time < ADDTIME(end_time, '00:15:00') 
               AND NEW.end_time > SUBTIME(start_time, '00:15:00'))
          );
        
        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Showtime conflicts with existing schedule. Showtimes must not overlap and must have at least 15 minutes gap between them.';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Trigger: trg_before_showtime_seat_insert
-- Table: showtime_seat
DROP TRIGGER IF EXISTS trg_before_showtime_seat_insert;
DELIMITER $$
CREATE DEFINER="avnadmin"@"%" TRIGGER "trg_before_showtime_seat_insert" BEFORE INSERT ON "showtime_seat" FOR EACH ROW BEGIN
    DECLARE v_showtime_datetime DATETIME;
    DECLARE v_booking_method VARCHAR(255);
    DECLARE v_minutes_until_showtime INT;
    DECLARE v_current_datetime_vn DATETIME;
    
    -- Convert NOW() to Vietnam timezone (GMT+7) for comparison
    SET v_current_datetime_vn = CONVERT_TZ(NOW(), '+00:00', '+07:00');
    
    -- Get showtime date and time first
    SELECT TIMESTAMP(date, start_time) INTO v_showtime_datetime
    FROM showtime
    WHERE id = NEW.st_id;
    
    -- Check if showtime has already started or passed (applies to all bookings)
    -- Compare with Vietnam timezone
    IF v_showtime_datetime <= v_current_datetime_vn THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book tickets for showtimes that have already started or passed.';
    END IF;
    
    -- Additional check for online bookings (status = 'Held')
    -- Staff bookings at counter can be made closer to showtime
    IF NEW.status = 'Held' AND NEW.booking_id IS NOT NULL THEN
        -- Get booking method to verify this is an online booking
        SELECT booking_method INTO v_booking_method
        FROM booking
        WHERE id = NEW.booking_id;
        
        -- Only apply 15-minute restriction for online bookings
        IF v_booking_method = 'Online' THEN
            -- Calculate minutes until showtime (using Vietnam timezone)
            SET v_minutes_until_showtime = TIMESTAMPDIFF(MINUTE, v_current_datetime_vn, v_showtime_datetime);
            
            -- Check if booking is too close to showtime (less than 15 minutes)
            IF v_minutes_until_showtime < 15 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Online booking must be completed at least 15 minutes before showtime start time.';
            END IF;
        END IF;
    END IF;
END$$
DELIMITER ;

