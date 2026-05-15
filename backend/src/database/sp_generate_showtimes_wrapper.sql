-- ============================================
-- Wrapper SP: seed showtimes for multiple theaters/movies
-- Depends on: sp_generate_showtimes
-- ============================================

DROP PROCEDURE IF EXISTS `sp_generate_showtimes_hcm_bundle`;
DELIMITER $$
CREATE DEFINER='avnadmin'@'%' PROCEDURE `sp_generate_showtimes_hcm_bundle`(
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_total_inserted INT,
    OUT p_total_skipped INT
)
BEGIN
    DECLARE v_inserted INT DEFAULT 0;
    DECLARE v_skipped INT DEFAULT 0;
    DECLARE v_total_inserted INT DEFAULT 0;
    DECLARE v_total_skipped INT DEFAULT 0;

    -- Validate date range
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date and end date are required';
    END IF;

    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date must be before or equal to end date';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS temp_showtime_seed_summary;
    CREATE TEMPORARY TABLE temp_showtime_seed_summary (
        item_label VARCHAR(255) NOT NULL,
        inserted_count INT NOT NULL DEFAULT 0,
        skipped_count INT NOT NULL DEFAULT 0
    );

    -- Theater 54: WICKED (movie_id=41), rooms 1,4,5,6
    CALL sp_generate_showtimes(
        41,
        54,
        p_start_date,
        p_end_date,
        138,
        15,
        '1,4,5,6',
        '09:00,11:40,14:20,17:00,19:40,22:20',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T54 WICKED (41)', v_inserted, v_skipped);

    -- Theater 54: ZOOTOPIA 2 (movie_id=42), rooms 2,3,7,8,9
    CALL sp_generate_showtimes(
        42,
        54,
        p_start_date,
        p_end_date,
        107,
        15,
        '2,3,7,8,9',
        '09:00,11:10,13:20,15:30,17:40,19:50,22:00',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T54 ZOOTOPIA 2 (42)', v_inserted, v_skipped);

    -- Theater 56: WICKED (movie_id=41), rooms 1,4,5
    CALL sp_generate_showtimes(
        41,
        56,
        p_start_date,
        p_end_date,
        138,
        15,
        '1,4,5',
        '09:00,11:40,14:20,17:00,19:40,22:20',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T56 WICKED (41)', v_inserted, v_skipped);

    -- Theater 56: ZOOTOPIA 2 (movie_id=42), rooms 2,3,6
    CALL sp_generate_showtimes(
        42,
        56,
        p_start_date,
        p_end_date,
        107,
        15,
        '2,3,6',
        '09:00,11:10,13:20,15:30,17:40,19:50,22:00',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T56 ZOOTOPIA 2 (42)', v_inserted, v_skipped);

    -- Theater 56: TRUY TIM LONG DIEN HUONG (movie_id=40), room 7
    CALL sp_generate_showtimes(
        40,
        56,
        p_start_date,
        p_end_date,
        103,
        15,
        '7',
        '09:10,11:10,13:10,15:10,17:10,19:10,21:10',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T56 TRUY TIM (40)', v_inserted, v_skipped);

    -- Theater 57: WICKED (movie_id=41), rooms 1,2,3
    CALL sp_generate_showtimes(
        41,
        57,
        p_start_date,
        p_end_date,
        138,
        15,
        '1,2,3',
        '09:00,11:40,14:20,17:00,19:40,22:20',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T57 WICKED (41)', v_inserted, v_skipped);

    -- Theater 57: TRUY TIM LONG DIEN HUONG (movie_id=40), rooms 4,5,6
    CALL sp_generate_showtimes(
        40,
        57,
        p_start_date,
        p_end_date,
        103,
        15,
        '4,5,6',
        '09:10,11:10,13:10,15:10,17:10,19:10,21:10',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T57 TRUY TIM (40)', v_inserted, v_skipped);

    -- Theater 57: THE FIRST RIDE (movie_id=39), rooms 7,8
    CALL sp_generate_showtimes(
        39,
        57,
        p_start_date,
        p_end_date,
        110,
        15,
        '7,8',
        '09:05,11:15,13:25,15:35,17:45,19:55,22:05',
        v_inserted,
        v_skipped
    );
    SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
    SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
    INSERT INTO temp_showtime_seed_summary VALUES ('T57 THE FIRST RIDE (39)', v_inserted, v_skipped);

    SET p_total_inserted = v_total_inserted;
    SET p_total_skipped = v_total_skipped;

    -- Return details + totals
    SELECT *
    FROM temp_showtime_seed_summary;

    SELECT
        p_total_inserted AS total_inserted,
        p_total_skipped AS total_skipped;

    DROP TEMPORARY TABLE IF EXISTS temp_showtime_seed_summary;
END$$
DELIMITER ;

-- ============================================
-- Example usage for April + May 2026
-- ============================================
-- CALL sp_generate_showtimes_hcm_bundle('2026-04-01', '2026-05-31', @total_inserted, @total_skipped);
-- SELECT @total_inserted AS total_inserted, @total_skipped AS total_skipped;
