-- ============================================
-- Multi-theater Wrapper SP (SCRIPT MODE)
-- Run in SQL query tab / script runner (not routine body editor)
-- Depends on: sp_generate_showtimes
-- ============================================

DROP PROCEDURE IF EXISTS `sp_generate_showtimes_multi_theater_only`;
DELIMITER $$
CREATE DEFINER='avnadmin'@'%' PROCEDURE `sp_generate_showtimes_multi_theater_only`(
    IN p_theater_ids TEXT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_total_inserted INT,
    OUT p_total_skipped INT
)
BEGIN
    DECLARE v_theater_csv TEXT;
    DECLARE v_theater_input TEXT;
    DECLARE v_theater_token VARCHAR(50);
    DECLARE v_theater_id BIGINT;

    DECLARE v_inserted INT DEFAULT 0;
    DECLARE v_skipped INT DEFAULT 0;
    DECLARE v_total_inserted INT DEFAULT 0;
    DECLARE v_total_skipped INT DEFAULT 0;

    DECLARE v_theater_exists INT DEFAULT 0;
    DECLARE v_aud_all TEXT;
    DECLARE v_aud_2d TEXT;
    DECLARE v_aud_imax TEXT;
    DECLARE v_aud_4dx TEXT;
    DECLARE v_aud_screenx TEXT;
    DECLARE v_aud_g1 TEXT;
    DECLARE v_aud_g2 TEXT;
    DECLARE v_aud_g3 TEXT;
    DECLARE v_aud_g4 TEXT;

    IF p_theater_ids IS NULL OR TRIM(p_theater_ids) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Theater IDs list is required (e.g. 54,56,57 or ALL)';
    END IF;

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
        theater_id BIGINT NOT NULL,
        item_label VARCHAR(255) NOT NULL,
        inserted_count INT NOT NULL DEFAULT 0,
        skipped_count INT NOT NULL DEFAULT 0,
        PRIMARY KEY (theater_id, item_label)
    );

    SET v_theater_input = UPPER(TRIM(p_theater_ids));
    IF v_theater_input = 'ALL' THEN
        SELECT GROUP_CONCAT(id ORDER BY id SEPARATOR ',') INTO v_theater_csv
        FROM theater;
    ELSE
        SET v_theater_csv = p_theater_ids;
    END IF;

    theater_loop: WHILE v_theater_csv IS NOT NULL AND LENGTH(TRIM(v_theater_csv)) > 0 DO
        SET v_theater_token = TRIM(SUBSTRING_INDEX(v_theater_csv, ',', 1));

        IF LOCATE(',', v_theater_csv) > 0 THEN
            SET v_theater_csv = SUBSTRING(v_theater_csv, LOCATE(',', v_theater_csv) + 1);
        ELSE
            SET v_theater_csv = '';
        END IF;

        SET v_theater_id = CAST(v_theater_token AS UNSIGNED);

        IF v_theater_id IS NULL OR v_theater_id = 0 THEN
            SET v_total_skipped = v_total_skipped + 1;
            ITERATE theater_loop;
        END IF;

        SELECT COUNT(*) INTO v_theater_exists
        FROM theater
        WHERE id = v_theater_id;

        IF v_theater_exists = 0 THEN
            SET v_total_skipped = v_total_skipped + 1;
            ITERATE theater_loop;
        END IF;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_all
        FROM auditorium
        WHERE theater_id = v_theater_id;

        IF v_aud_all IS NULL OR TRIM(v_aud_all) = '' THEN
            SET v_total_skipped = v_total_skipped + 1;
            ITERATE theater_loop;
        END IF;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_2d
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '2D';

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_imax
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = 'IMAX';

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_4dx
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '4DX';

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_screenx
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = 'ScreenX';

        IF v_aud_2d IS NULL OR TRIM(v_aud_2d) = '' THEN
            SET v_aud_2d = v_aud_all;
        END IF;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_g1
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '2D' AND MOD(number, 4) = 1;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_g2
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '2D' AND MOD(number, 4) = 2;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_g3
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '2D' AND MOD(number, 4) = 3;

        SELECT GROUP_CONCAT(number ORDER BY number SEPARATOR ',') INTO v_aud_g4
        FROM auditorium
        WHERE theater_id = v_theater_id AND type = '2D' AND MOD(number, 4) = 0;

        IF v_aud_g1 IS NULL OR TRIM(v_aud_g1) = '' THEN SET v_aud_g1 = v_aud_2d; END IF;
        IF v_aud_g2 IS NULL OR TRIM(v_aud_g2) = '' THEN SET v_aud_g2 = v_aud_2d; END IF;
        IF v_aud_g3 IS NULL OR TRIM(v_aud_g3) = '' THEN SET v_aud_g3 = v_aud_2d; END IF;
        IF v_aud_g4 IS NULL OR TRIM(v_aud_g4) = '' THEN SET v_aud_g4 = v_aud_2d; END IF;

        CALL sp_generate_showtimes(
            41,
            v_theater_id,
            p_start_date,
            p_end_date,
            138,
            15,
            v_aud_g1,
            '09:00,12:00,15:00,18:00,21:00',
            v_inserted,
            v_skipped
        );
        SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
        SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
        INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'WICKED (41) - 2D', v_inserted, v_skipped);

        CALL sp_generate_showtimes(
            42,
            v_theater_id,
            p_start_date,
            p_end_date,
            107,
            15,
            v_aud_g2,
            '09:30,11:45,14:00,16:15,18:30,20:45',
            v_inserted,
            v_skipped
        );
        SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
        SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
        INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'ZOOTOPIA 2 (42) - 2D', v_inserted, v_skipped);

        CALL sp_generate_showtimes(
            40,
            v_theater_id,
            p_start_date,
            p_end_date,
            103,
            15,
            v_aud_g3,
            '10:00,12:00,14:00,16:00,18:00,20:00,22:00',
            v_inserted,
            v_skipped
        );
        SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
        SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
        INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'TRUY TIM (40) - 2D', v_inserted, v_skipped);

        CALL sp_generate_showtimes(
            39,
            v_theater_id,
            p_start_date,
            p_end_date,
            110,
            15,
            v_aud_g4,
            '10:20,12:40,15:00,17:20,19:40,22:00',
            v_inserted,
            v_skipped
        );
        SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
        SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
        INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'THE FIRST RIDE (39) - 2D', v_inserted, v_skipped);

        IF v_aud_imax IS NOT NULL AND TRIM(v_aud_imax) <> '' THEN
            CALL sp_generate_showtimes(
                41,
                v_theater_id,
                p_start_date,
                p_end_date,
                138,
                15,
                v_aud_imax,
                '09:00,12:00,15:00,18:00,21:00',
                v_inserted,
                v_skipped
            );
            SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
            SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
            INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'WICKED (41) - IMAX', v_inserted, v_skipped);
        END IF;

        IF v_aud_4dx IS NOT NULL AND TRIM(v_aud_4dx) <> '' THEN
            CALL sp_generate_showtimes(
                42,
                v_theater_id,
                p_start_date,
                p_end_date,
                107,
                15,
                v_aud_4dx,
                '09:30,11:45,14:00,16:15,18:30,20:45',
                v_inserted,
                v_skipped
            );
            SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
            SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
            INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'ZOOTOPIA 2 (42) - 4DX', v_inserted, v_skipped);
        END IF;

        IF v_aud_screenx IS NOT NULL AND TRIM(v_aud_screenx) <> '' THEN
            CALL sp_generate_showtimes(
                39,
                v_theater_id,
                p_start_date,
                p_end_date,
                110,
                15,
                v_aud_screenx,
                '10:20,12:40,15:00,17:20,19:40,22:00',
                v_inserted,
                v_skipped
            );
            SET v_total_inserted = v_total_inserted + COALESCE(v_inserted, 0);
            SET v_total_skipped = v_total_skipped + COALESCE(v_skipped, 0);
            INSERT INTO temp_showtime_seed_summary VALUES (v_theater_id, 'THE FIRST RIDE (39) - ScreenX', v_inserted, v_skipped);
        END IF;
    END WHILE;

    SET p_total_inserted = v_total_inserted;
    SET p_total_skipped = v_total_skipped;

    SELECT *
    FROM temp_showtime_seed_summary
    ORDER BY theater_id, item_label;

    SELECT
        p_total_inserted AS total_inserted,
        p_total_skipped AS total_skipped;

    DROP TEMPORARY TABLE IF EXISTS temp_showtime_seed_summary;
END$$
DELIMITER ;

-- Example:
-- CALL sp_generate_showtimes_multi_theater_only('ALL', '2026-04-01', '2026-05-31', @total_inserted, @total_skipped);
-- SELECT @total_inserted AS total_inserted, @total_skipped AS total_skipped;
