-- =======================================
-- THEATER MODULE - STORED PROCEDURES
-- All stored procedures related to theater operations
-- =======================================

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS sp_get_theaters;
DROP PROCEDURE IF EXISTS sp_get_schedule_by_theater;
DROP PROCEDURE IF EXISTS sp_get_theater_by_id;

-- =======================================
-- Get theaters with optional filters and pagination
-- =======================================
CREATE PROCEDURE sp_get_theaters(
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
END;

-- =======================================
-- Get movie schedule for a specific theater on a specific date
-- =======================================
CREATE PROCEDURE sp_get_schedule_by_theater(
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

    WHERE 
        a.theater_id = p_theater_id
        AND s.date = p_date

    ORDER BY 
        m.name ASC,
        a.number ASC,
        s.start_time ASC;
END;

-- =======================================
-- Get a single theater by ID
-- =======================================
CREATE PROCEDURE sp_get_theater_by_id(
    IN p_theater_id INT
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
END;
