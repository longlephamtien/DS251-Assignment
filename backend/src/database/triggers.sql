-- ============================================
-- Triggers
-- Database: bkinema
-- Generated: 2025-11-28T12:33:26.150Z
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

