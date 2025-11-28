const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function testDeleteShowtime() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 14127,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.AIVEN_SSL_CA ? {
            ca: process.env.AIVEN_SSL_CA
        } : undefined,
        multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    try {
        // ===================================================================
        // PRE-CLEANUP: Remove any leftover test data
        // ===================================================================
        console.log('🧹 Pre-cleaning any leftover test data...\n');

        try {
            // First cleanup test movies/theaters to avoid FK issues
            const [testMovies] = await connection.query(`SELECT id FROM movie WHERE name = 'Test Movie Delete'`);
            const [testTheaters] = await connection.query(`SELECT id FROM theater WHERE name = 'Test Theater Delete'`);
            
            if (testMovies.length > 0) {
                const movieIds = testMovies.map(m => m.id).join(',');
                const [showtimesToDelete] = await connection.query(`SELECT id FROM showtime WHERE movie_id IN (${movieIds})`);
                
                if (showtimesToDelete.length > 0) {
                    const showtimeIds = showtimesToDelete.map(s => s.id).join(',');
                    await connection.query(`DELETE FROM showtime_seat WHERE st_id IN (${showtimeIds})`);
                    await connection.query(`DELETE FROM showtime WHERE id IN (${showtimeIds})`);
                }
                
                await connection.query(`DELETE FROM movie WHERE id IN (${movieIds})`);
            }
            
            if (testTheaters.length > 0) {
                const theaterIds = testTheaters.map(t => t.id).join(',');
                await connection.query(`DELETE FROM seat WHERE au_theater_id IN (${theaterIds})`);
                await connection.query(`DELETE FROM auditorium WHERE theater_id IN (${theaterIds})`);
                await connection.query(`DELETE FROM theater WHERE id IN (${theaterIds})`);
            }
            
            // Now cleanup test users
            const [existingUsers] = await connection.query(`
                SELECT id FROM \`User\` WHERE email IN ('admin_test@test.com', 'manager_test@test.com', 'staff_test@test.com')
            `);
            
            if (existingUsers.length > 0) {
                const userIds = existingUsers.map(u => u.id).join(',');
                
                // Delete bookings first
                const [bookings] = await connection.query(`SELECT id FROM booking WHERE customer_id IN (${userIds})`);
                if (bookings.length > 0) {
                    const bookingIds = bookings.map(b => b.id).join(',');
                    await connection.query(`DELETE FROM showtime_seat WHERE booking_id IN (${bookingIds})`);
                    await connection.query(`DELETE FROM booking WHERE id IN (${bookingIds})`);
                }
                
                // Delete staff, customer, then users
                await connection.query(`DELETE FROM staff WHERE user_id IN (${userIds})`);
                await connection.query(`DELETE FROM customer WHERE user_id IN (${userIds})`);
                await connection.query(`DELETE FROM \`User\` WHERE id IN (${userIds})`);
            }
        } catch (e) {
            console.log('Pre-cleanup warning:', e.message);
        }

        // ===================================================================
        // SETUP: Create test data
        // ===================================================================
        console.log('📝 Setting up test data...\n');

        // 1. Create test users
        await connection.query(`
            INSERT INTO \`User\` (fname, lname, email, password, birthday, gender)
            VALUES 
                ('Admin', 'Test', 'admin_test@test.com', 'hashed_password', '1990-01-01', 'Male'),
                ('Manager', 'Test', 'manager_test@test.com', 'hashed_password', '1990-01-01', 'Female'),
                ('Regular', 'Test', 'staff_test@test.com', 'hashed_password', '1990-01-01', 'Male')
        `);

        const [users] = await connection.query(`
            SELECT id FROM \`User\` WHERE email IN ('admin_test@test.com', 'manager_test@test.com', 'staff_test@test.com')
            ORDER BY email
        `);

        const adminUserId = users[0].id;
        const managerUserId = users[1].id;
        const regularUserId = users[2].id;

        console.log(`Admin User ID: ${adminUserId}`);
        console.log(`Manager User ID: ${managerUserId}`);
        console.log(`Regular User ID: ${regularUserId}\n`);

        // 2. Create staff records
        await connection.query(`
            INSERT INTO staff (user_id, role, shift)
            VALUES 
                (${adminUserId}, 'Admin', 'Morning'),
                (${managerUserId}, 'Manager', 'Evening'),
                (${regularUserId}, 'Staff', 'Night')
        `);

        // 3. Create test movie
        await connection.query(`
            INSERT INTO movie (name, duration, language, release_date, age_rating, poster_file)
            VALUES ('Test Movie Delete', 120, 'English', '2025-01-01', 'P13', 'test.jpg')
        `);

        const [movieResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const movieId = movieResult[0].id;

        // 4. Create test theater and auditorium
        await connection.query(`
            INSERT INTO theater (name, street, district, city)
            VALUES ('Test Theater Delete', '123 Test St', 'Test District', 'Test City')
        `);

        const [theaterResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const theaterId = theaterResult[0].id;

        // Check existing auditorium types first
        const [existingAud] = await connection.query(`SELECT DISTINCT type FROM auditorium LIMIT 1`);
        const audType = existingAud.length > 0 ? existingAud[0].type : '2D';
        console.log(`Using auditorium type: ${audType}`);

        await connection.query(`
            INSERT INTO auditorium (number, theater_id, type, capacity)
            VALUES (1, ${theaterId}, '${audType}', 100)
        `);

        // 5. Create test seats (need to get max id first)
        const [maxSeatResult] = await connection.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM seat`);
        const nextSeatId = maxSeatResult[0].max_id + 1;

        await connection.query(`
            INSERT INTO seat (id, au_number, au_theater_id, row_char, column_number, type, price)
            VALUES 
                (${nextSeatId}, 1, ${theaterId}, 'A', 1, 'Normal', 100000),
                (${nextSeatId + 1}, 1, ${theaterId}, 'A', 2, 'Normal', 100000)
        `);

        const seatId1 = nextSeatId;
        const seatId2 = nextSeatId + 1;

        // 6. Create test showtimes
        await connection.query(`
            INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
            VALUES 
                ('2025-12-01', '10:00:00', '12:00:00', ${movieId}, 1, ${theaterId}),
                ('2025-12-01', '14:00:00', '16:00:00', ${movieId}, 1, ${theaterId})
        `);

        const [showtimes] = await connection.query(`
            SELECT id FROM showtime WHERE movie_id = ${movieId} ORDER BY id
        `);
        const showtimeNoBooking = showtimes[0].id;
        const showtimeWithBooking = showtimes[1].id;

        console.log(`Showtime without booking: ${showtimeNoBooking}`);
        console.log(`Showtime with booking: ${showtimeWithBooking}\n`);

        // 7. Create showtime_seat records for empty showtime
        await connection.query(`
            INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price)
            VALUES 
                (${showtimeNoBooking}, ${seatId1}, 1, ${theaterId}, 'Available', 100000),
                (${showtimeNoBooking}, ${seatId2}, 1, ${theaterId}, 'Available', 100000)
        `);

        // 8. Create customer and booking (check if customer exists first)
        const [existingCustomer] = await connection.query(`SELECT user_id FROM customer WHERE user_id = ${adminUserId}`);
        
        if (existingCustomer.length === 0) {
            await connection.query(`
                INSERT INTO customer (user_id, accumulated_points, membership_name)
                VALUES (${adminUserId}, 0, 'Member')
            `);
        }

        await connection.query(`
            INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
            VALUES (NOW(), 'Paid', 'Online', 0, ${adminUserId})
        `);

        const [bookingResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const bookingId = bookingResult[0].id;

        // 9. Create showtime_seat with booking
        await connection.query(`
            INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
            VALUES (${showtimeWithBooking}, ${seatId1}, 1, ${theaterId}, 'Booked', 100000, ${bookingId})
        `);

        console.log('✅ Test data setup complete\n');

        // ===================================================================
        // TEST CASES
        // ===================================================================

        // TEST 1: Regular staff trying to delete (should FAIL)
        console.log('🧪 TEST 1: Regular staff trying to delete showtime');
        try {
            await connection.query(`CALL sp_delete_showtime(${showtimeNoBooking}, ${regularUserId})`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 2: Admin trying to delete showtime with bookings (should FAIL)
        console.log('🧪 TEST 2: Admin trying to delete showtime with bookings');
        try {
            await connection.query(`CALL sp_delete_showtime(${showtimeWithBooking}, ${adminUserId})`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 3: Admin deleting showtime without bookings (should SUCCESS)
        console.log('🧪 TEST 3: Admin deleting showtime without bookings');
        
        const [beforeDelete] = await connection.query(`
            SELECT COUNT(*) as count FROM showtime WHERE id = ${showtimeNoBooking}
        `);
        console.log(`Before deletion - Showtime count: ${beforeDelete[0].count}`);

        const [beforeSeats] = await connection.query(`
            SELECT COUNT(*) as count FROM showtime_seat WHERE st_id = ${showtimeNoBooking}
        `);
        console.log(`Before deletion - Showtime_seat count: ${beforeSeats[0].count}`);

        await connection.query(`CALL sp_delete_showtime(${showtimeNoBooking}, ${adminUserId})`);

        const [afterDelete] = await connection.query(`
            SELECT COUNT(*) as count FROM showtime WHERE id = ${showtimeNoBooking}
        `);
        console.log(`After deletion - Showtime count: ${afterDelete[0].count}`);

        const [afterSeats] = await connection.query(`
            SELECT COUNT(*) as count FROM showtime_seat WHERE st_id = ${showtimeNoBooking}
        `);
        console.log(`After deletion - Showtime_seat count: ${afterSeats[0].count}`);

        if (afterDelete[0].count === 0 && afterSeats[0].count === 0) {
            console.log('✅ PASSED: Showtime and seats deleted successfully\n');
        } else {
            console.log('❌ FAILED: Showtime or seats not deleted\n');
        }

        // TEST 4: Manager deleting showtime (should SUCCESS)
        console.log('🧪 TEST 4: Manager deleting showtime');
        
        await connection.query(`
            INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
            VALUES ('2025-12-02', '10:00:00', '12:00:00', ${movieId}, 1, ${theaterId})
        `);

        const [managerShowtime] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const showtimeForManager = managerShowtime[0].id;

        await connection.query(`
            INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price)
            VALUES (${showtimeForManager}, ${seatId1}, 1, ${theaterId}, 'Available', 100000)
        `);

        await connection.query(`CALL sp_delete_showtime(${showtimeForManager}, ${managerUserId})`);

        const [managerCheck] = await connection.query(`
            SELECT COUNT(*) as count FROM showtime WHERE id = ${showtimeForManager}
        `);

        if (managerCheck[0].count === 0) {
            console.log('✅ PASSED: Manager deleted showtime successfully\n');
        } else {
            console.log('❌ FAILED: Manager could not delete showtime\n');
        }

        // TEST 5: Delete non-existent showtime (should FAIL)
        console.log('🧪 TEST 5: Deleting non-existent showtime');
        try {
            await connection.query(`CALL sp_delete_showtime(99999, ${adminUserId})`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // ===================================================================
        // CLEANUP
        // ===================================================================
        console.log('🧹 Cleaning up test data...');

        await connection.query(`DELETE FROM showtime_seat WHERE st_id IN (${showtimeWithBooking}, ${showtimeForManager})`);
        await connection.query(`DELETE FROM showtime WHERE id IN (${showtimeWithBooking}, ${showtimeForManager})`);
        await connection.query(`DELETE FROM booking WHERE id = ${bookingId}`);
        await connection.query(`DELETE FROM seat WHERE au_theater_id = ${theaterId}`);
        await connection.query(`DELETE FROM auditorium WHERE theater_id = ${theaterId}`);
        await connection.query(`DELETE FROM theater WHERE id = ${theaterId}`);
        await connection.query(`DELETE FROM movie WHERE id = ${movieId}`);
        await connection.query(`DELETE FROM staff WHERE user_id IN (${adminUserId}, ${managerUserId}, ${regularUserId})`);
        await connection.query(`DELETE FROM customer WHERE user_id IN (${adminUserId}, ${managerUserId}, ${regularUserId})`);
        await connection.query(`DELETE FROM \`User\` WHERE id IN (${adminUserId}, ${managerUserId}, ${regularUserId})`);

        console.log('✅ Cleanup complete\n');
        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error(error);
    } finally {
        await connection.end();
    }
}

testDeleteShowtime();
