-- =======================================
-- MOVIE MODULE - STORED PROCEDURES
-- =======================================

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS sp_get_movies;
DROP PROCEDURE IF EXISTS sp_get_movies_with_details;

CREATE PROCEDURE sp_get_movies_with_details(
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
        -- Aggregate related data using GROUP_CONCAT with custom separator
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
END;

-- =======================================
-- Get basic movie information (without related data)
-- Use sp_get_movies_with_details instead for complete data
-- =======================================
CREATE PROCEDURE sp_get_movies(
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
END;