-- Test script for sp_delete_showtime stored procedure
-- This script creates test data and tests the deletion functionality

-- ===================================================================
-- SETUP: Create test data
-- ===================================================================

-- 1. Create test staff users (Admin and Manager roles)
INSERT INTO `User` (fname, lname, email, password, birthday, gender)
VALUES 
    ('Admin', 'User', 'admin@test.com', 'hashed_password', '1990-01-01', 'Male'),
    ('Manager', 'User', 'manager@test.com', 'hashed_password', '1990-01-01', 'Female'),
    ('Regular', 'Staff', 'staff@test.com', 'hashed_password', '1990-01-01', 'Male');

-- Get the user IDs
SET @admin_user_id = LAST_INSERT_ID();
SET @manager_user_id = @admin_user_id + 1;
SET @regular_user_id = @admin_user_id + 2;

-- 2. Create staff records
INSERT INTO staff (user_id, role, shift)
VALUES 
    (@admin_user_id, 'Admin', 'Morning'),
    (@manager_user_id, 'Manager', 'Evening'),
    (@regular_user_id, 'Staff', 'Night');

-- 3. Create test movie
INSERT INTO movie (name, duration, language, release_date, age_rating, poster_file)
VALUES ('Test Movie for Deletion', 120, 'English', '2025-01-01', 'PG-13', 'test.jpg');

SET @test_movie_id = LAST_INSERT_ID();

-- 4. Create test theater and auditorium
INSERT INTO theater (name, street, district, city)
VALUES ('Test Theater', '123 Test St', 'Test District', 'Test City');

SET @test_theater_id = LAST_INSERT_ID();

INSERT INTO auditorium (number, theater_id, type, capacity)
VALUES (1, @test_theater_id, 'Standard', 100);

-- 5. Create test seats
INSERT INTO seat (au_number, au_theater_id, row_char, column_number, type, price)
VALUES 
    (1, @test_theater_id, 'A', 1, 'Normal', 100000),
    (1, @test_theater_id, 'A', 2, 'Normal', 100000);

SET @test_seat_id_1 = LAST_INSERT_ID();
SET @test_seat_id_2 = @test_seat_id_1 + 1;

-- 6. Create test showtimes
INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
VALUES 
    -- Showtime without any bookings (can be deleted)
    ('2025-12-01', '10:00:00', '12:00:00', @test_movie_id, 1, @test_theater_id),
    -- Showtime with bookings (cannot be deleted)
    ('2025-12-01', '14:00:00', '16:00:00', @test_movie_id, 1, @test_theater_id);

SET @showtime_no_booking = LAST_INSERT_ID();
SET @showtime_with_booking = @showtime_no_booking + 1;

-- 7. Create showtime_seat records for empty showtime
INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price)
VALUES 
    (@showtime_no_booking, @test_seat_id_1, 1, @test_theater_id, 'Available', 100000),
    (@showtime_no_booking, @test_seat_id_2, 1, @test_theater_id, 'Available', 100000);

-- 8. Create customer and booking for second showtime
INSERT INTO customer (user_id, accumulated_points, membership_name)
VALUES (@admin_user_id, 0, 'Member');

INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
VALUES (NOW(), 'Paid', 'Online', 0, @admin_user_id);

SET @test_booking_id = LAST_INSERT_ID();

-- 9. Create showtime_seat records with booking (cannot be deleted)
INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
VALUES 
    (@showtime_with_booking, @test_seat_id_1, 1, @test_theater_id, 'Booked', 100000, @test_booking_id);

-- ===================================================================
-- TEST CASES
-- ===================================================================

-- TEST 1: Try to delete showtime as regular staff (should FAIL)
-- Expected: Error "Only Admin or Manager staff can delete showtime"
SELECT '--- TEST 1: Regular staff trying to delete ---' AS test_case;
CALL sp_delete_showtime(@showtime_no_booking, @regular_user_id);
-- This should throw an error


-- TEST 2: Try to delete showtime with bookings as Admin (should FAIL)
-- Expected: Error "Cannot delete showtime: There are tickets already booked"
SELECT '--- TEST 2: Admin trying to delete showtime with bookings ---' AS test_case;
CALL sp_delete_showtime(@showtime_with_booking, @admin_user_id);
-- This should throw an error


-- TEST 3: Delete showtime without bookings as Admin (should SUCCESS)
-- Expected: Showtime and showtime_seat records deleted
SELECT '--- TEST 3: Admin deleting showtime without bookings ---' AS test_case;

-- Check before deletion
SELECT 'Before deletion:' AS status;
SELECT COUNT(*) AS showtime_count FROM showtime WHERE id = @showtime_no_booking;
SELECT COUNT(*) AS showtime_seat_count FROM showtime_seat WHERE st_id = @showtime_no_booking;

-- Perform deletion
CALL sp_delete_showtime(@showtime_no_booking, @admin_user_id);

-- Check after deletion
SELECT 'After deletion:' AS status;
SELECT COUNT(*) AS showtime_count FROM showtime WHERE id = @showtime_no_booking;
SELECT COUNT(*) AS showtime_seat_count FROM showtime_seat WHERE st_id = @showtime_no_booking;


-- TEST 4: Delete showtime as Manager (should SUCCESS if no bookings)
-- Create another showtime for Manager test
SELECT '--- TEST 4: Manager deleting showtime ---' AS test_case;

INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
VALUES ('2025-12-02', '10:00:00', '12:00:00', @test_movie_id, 1, @test_theater_id);

SET @showtime_for_manager = LAST_INSERT_ID();

INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price)
VALUES (@showtime_for_manager, @test_seat_id_1, 1, @test_theater_id, 'Available', 100000);

-- Check before deletion
SELECT 'Before deletion:' AS status;
SELECT COUNT(*) AS showtime_count FROM showtime WHERE id = @showtime_for_manager;

-- Perform deletion
CALL sp_delete_showtime(@showtime_for_manager, @manager_user_id);

-- Check after deletion
SELECT 'After deletion:' AS status;
SELECT COUNT(*) AS showtime_count FROM showtime WHERE id = @showtime_for_manager;


-- TEST 5: Try to delete non-existent showtime (should FAIL)
-- Expected: Error "Showtime not found"
SELECT '--- TEST 5: Deleting non-existent showtime ---' AS test_case;
CALL sp_delete_showtime(99999, @admin_user_id);
-- This should throw an error


-- ===================================================================
-- CLEANUP: Remove test data
-- ===================================================================
SELECT '--- CLEANUP: Removing test data ---' AS cleanup;

-- Delete in reverse order of dependencies
DELETE FROM showtime_seat WHERE st_id IN (@showtime_no_booking, @showtime_with_booking, @showtime_for_manager);
DELETE FROM showtime WHERE id IN (@showtime_no_booking, @showtime_with_booking, @showtime_for_manager);
DELETE FROM booking WHERE id = @test_booking_id;
DELETE FROM customer WHERE user_id = @admin_user_id;
DELETE FROM seat WHERE seat_au_theater_id = @test_theater_id;
DELETE FROM auditorium WHERE theater_id = @test_theater_id;
DELETE FROM theater WHERE id = @test_theater_id;
DELETE FROM movie WHERE id = @test_movie_id;
DELETE FROM staff WHERE user_id IN (@admin_user_id, @manager_user_id, @regular_user_id);
DELETE FROM `User` WHERE id IN (@admin_user_id, @manager_user_id, @regular_user_id);

SELECT 'Test completed and cleaned up!' AS result;
