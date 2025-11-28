-- ============================================
-- Triggers
-- Database: bkinema
-- Generated: 2025-11-28T11:02:23.874Z
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

