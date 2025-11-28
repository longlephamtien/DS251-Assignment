-- Update stored procedure sp_generate_sales_report with PRIMARY KEY fix

DROP PROCEDURE IF EXISTS sp_generate_sales_report;

DELIMITER $$

CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_generate_sales_report"(
    IN p_theater_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Variable declarations
    DECLARE v_showtime_id BIGINT;
    DECLARE v_movie_name VARCHAR(255);
    DECLARE v_showtime_date DATE;
    DECLARE v_tickets_sold INT;
    DECLARE v_ticket_revenue DECIMAL(10,2);
    DECLARE v_fwb_revenue DECIMAL(10,2);
    DECLARE v_total_revenue DECIMAL(10,2);
    DECLARE v_theater_exists INT;
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor to iterate through showtimes
    DECLARE showtime_cursor CURSOR FOR
        SELECT 
            s.id,
            m.name,
            s.date
        FROM showtime s
        JOIN movie m ON s.movie_id = m.id
        WHERE s.au_theater_id = p_theater_id
          AND s.date BETWEEN p_start_date AND p_end_date
        ORDER BY s.date, s.start_time;
    
    -- Handler for cursor end
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- ===================================================================
    -- PARAMETER VALIDATION
    -- ===================================================================
    
    -- Check if theater_id is provided
    IF p_theater_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Theater ID is required';
    END IF;
    
    -- Check if start_date is provided
    IF p_start_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date is required';
    END IF;
    
    -- Check if end_date is provided
    IF p_end_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'End date is required';
    END IF;
    
    -- Check if date range is valid
    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date must be before or equal to end date';
    END IF;
    
    -- Check if theater exists
    SELECT COUNT(*) INTO v_theater_exists
    FROM theater
    WHERE id = p_theater_id;
    
    IF v_theater_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Theater not found';
    END IF;
    
    -- ===================================================================
    -- CREATE TEMPORARY TABLE FOR RESULTS (WITH PRIMARY KEY)
    -- ===================================================================
    
    DROP TEMPORARY TABLE IF EXISTS temp_sales_report;
    CREATE TEMPORARY TABLE temp_sales_report (
        showtime_id BIGINT PRIMARY KEY,
        movie_name VARCHAR(255),
        showtime_date DATE,
        tickets_sold INT,
        ticket_revenue DECIMAL(10,2),
        fwb_revenue DECIMAL(10,2),
        total_revenue DECIMAL(10,2)
    );
    
    -- ===================================================================
    -- CURSOR PROCESSING
    -- ===================================================================
    
    OPEN showtime_cursor;
    
    read_loop: LOOP
        FETCH showtime_cursor INTO v_showtime_id, v_movie_name, v_showtime_date;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate tickets sold for this showtime
        SELECT COUNT(*)
        INTO v_tickets_sold
        FROM showtime_seat
        WHERE st_id = v_showtime_id
          AND booking_id IS NOT NULL;
        
        -- Calculate ticket revenue
        SELECT COALESCE(SUM(price), 0)
        INTO v_ticket_revenue
        FROM showtime_seat
        WHERE st_id = v_showtime_id
          AND booking_id IS NOT NULL;
        
        -- Calculate F&B revenue (via bookings linked to this showtime)
        SELECT COALESCE(SUM(f.price), 0)
        INTO v_fwb_revenue
        FROM fwb f
        JOIN booking b ON f.booking_id = b.id
        JOIN showtime_seat ss ON ss.booking_id = b.id
        WHERE ss.st_id = v_showtime_id
        GROUP BY ss.st_id;
        
        -- Calculate total revenue
        SET v_total_revenue = v_ticket_revenue + COALESCE(v_fwb_revenue, 0);
        
        -- Insert into temp table
        INSERT INTO temp_sales_report
        VALUES (
            v_showtime_id,
            v_movie_name,
            v_showtime_date,
            v_tickets_sold,
            v_ticket_revenue,
            COALESCE(v_fwb_revenue, 0),
            v_total_revenue
        );
        
    END LOOP;
    
    CLOSE showtime_cursor;
    
    -- ===================================================================
    -- RETURN RESULTS
    -- ===================================================================
    
    SELECT * FROM temp_sales_report ORDER BY showtime_date, movie_name;
    
    DROP TEMPORARY TABLE IF EXISTS temp_sales_report;

END$$

DELIMITER ;
