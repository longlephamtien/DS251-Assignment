-- ============================================
-- Core SP (ROUTINE EDITOR MODE)
-- Paste this into routine editor that expects CREATE first.
-- No DROP / no DELIMITER.
-- ============================================

CREATE DEFINER='avnadmin'@'%' PROCEDURE `sp_generate_showtimes`(
    IN p_movie_id BIGINT,
    IN p_theater_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_duration_minutes INT,
    IN p_buffer_minutes INT,
    IN p_auditorium_list TEXT,
    IN p_showtime_list TEXT,
    OUT p_inserted_count INT,
    OUT p_skipped_count INT
)
BEGIN
    DECLARE v_current_date DATE;
    DECLARE v_aud_csv TEXT;
    DECLARE v_time_csv TEXT;
    DECLARE v_aud_token VARCHAR(50);
    DECLARE v_time_token VARCHAR(20);
    DECLARE v_aud_number INT;
    DECLARE v_start_time TIME;
    DECLARE v_end_time TIME;
    DECLARE v_conflict_count INT DEFAULT 0;
    DECLARE v_movie_exists INT DEFAULT 0;
    DECLARE v_theater_exists INT DEFAULT 0;
    DECLARE v_inserted INT DEFAULT 0;
    DECLARE v_skipped INT DEFAULT 0;
    DECLARE v_buffer_minutes_safe INT DEFAULT 15;

    IF p_movie_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Movie ID is required';
    END IF;

    IF p_theater_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Theater ID is required';
    END IF;

    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date and end date are required';
    END IF;

    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date must be before or equal to end date';
    END IF;

    IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duration minutes must be greater than 0';
    END IF;

    IF p_auditorium_list IS NULL OR TRIM(p_auditorium_list) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Auditorium list is required';
    END IF;

    IF p_showtime_list IS NULL OR TRIM(p_showtime_list) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Showtime list is required';
    END IF;

    SELECT COUNT(*) INTO v_movie_exists
    FROM movie
    WHERE id = p_movie_id;

    IF v_movie_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Movie not found';
    END IF;

    SELECT COUNT(*) INTO v_theater_exists
    FROM theater
    WHERE id = p_theater_id;

    IF v_theater_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Theater not found';
    END IF;

    SET v_buffer_minutes_safe = IFNULL(p_buffer_minutes, 15);
    IF v_buffer_minutes_safe < 15 THEN
        SET v_buffer_minutes_safe = 15;
    END IF;

    SET v_current_date = p_start_date;

    WHILE v_current_date <= p_end_date DO
        SET v_aud_csv = p_auditorium_list;

        WHILE v_aud_csv IS NOT NULL AND LENGTH(TRIM(v_aud_csv)) > 0 DO
            SET v_aud_token = TRIM(SUBSTRING_INDEX(v_aud_csv, ',', 1));

            IF LOCATE(',', v_aud_csv) > 0 THEN
                SET v_aud_csv = SUBSTRING(v_aud_csv, LOCATE(',', v_aud_csv) + 1);
            ELSE
                SET v_aud_csv = '';
            END IF;

            SET v_aud_number = CAST(v_aud_token AS UNSIGNED);

            IF v_aud_number IS NULL OR v_aud_number = 0 THEN
                SET v_skipped = v_skipped + 1;
            ELSEIF NOT EXISTS (
                SELECT 1
                FROM auditorium
                WHERE number = v_aud_number
                  AND theater_id = p_theater_id
            ) THEN
                SET v_skipped = v_skipped + 1;
            ELSE
                SET v_time_csv = p_showtime_list;

                WHILE v_time_csv IS NOT NULL AND LENGTH(TRIM(v_time_csv)) > 0 DO
                    SET v_time_token = TRIM(SUBSTRING_INDEX(v_time_csv, ',', 1));

                    IF LOCATE(',', v_time_csv) > 0 THEN
                        SET v_time_csv = SUBSTRING(v_time_csv, LOCATE(',', v_time_csv) + 1);
                    ELSE
                        SET v_time_csv = '';
                    END IF;

                    SET v_start_time = STR_TO_DATE(v_time_token, '%H:%i');

                    IF v_start_time IS NULL THEN
                        SET v_skipped = v_skipped + 1;
                    ELSE
                        SET v_end_time = ADDTIME(v_start_time, SEC_TO_TIME(p_duration_minutes * 60));

                        IF v_end_time <= v_start_time THEN
                            SET v_skipped = v_skipped + 1;
                        ELSE
                            SELECT COUNT(*) INTO v_conflict_count
                            FROM showtime
                            WHERE au_number = v_aud_number
                              AND au_theater_id = p_theater_id
                              AND date = v_current_date
                              AND (
                                  v_start_time < ADDTIME(end_time, SEC_TO_TIME(v_buffer_minutes_safe * 60))
                                  AND v_end_time > SUBTIME(start_time, SEC_TO_TIME(v_buffer_minutes_safe * 60))
                              );

                            IF v_conflict_count = 0 THEN
                                INSERT INTO showtime (
                                    date,
                                    start_time,
                                    end_time,
                                    movie_id,
                                    au_number,
                                    au_theater_id
                                )
                                VALUES (
                                    v_current_date,
                                    v_start_time,
                                    v_end_time,
                                    p_movie_id,
                                    v_aud_number,
                                    p_theater_id
                                );

                                SET v_inserted = v_inserted + 1;
                            ELSE
                                SET v_skipped = v_skipped + 1;
                            END IF;
                        END IF;
                    END IF;
                END WHILE;
            END IF;
        END WHILE;

        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
    END WHILE;

    SET p_inserted_count = v_inserted;
    SET p_skipped_count = v_skipped;
END;

-- Example call after procedure is created:
-- CALL sp_generate_showtimes(
--     41,
--     54,
--     '2026-04-01',
--     '2026-05-31',
--     138,
--     15,
--     '1,4,5,6',
--     '09:00,12:00,15:00,18:00,21:00',
--     @inserted,
--     @skipped
-- );
-- SELECT @inserted AS inserted_count, @skipped AS skipped_count;
