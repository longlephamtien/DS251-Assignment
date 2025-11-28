const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function testSalesReport() {
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
        // PRE-CLEANUP
        // ===================================================================
        console.log('🧹 Pre-cleaning any leftover test data...\n');

        try {
            // Cleanup test theaters and movies
            const [testTheaters] = await connection.query(`SELECT id FROM theater WHERE name = 'Test Theater Sales'`);
            const [testMovies] = await connection.query(`SELECT id FROM movie WHERE name = 'Sales Test Movie'`);
            
            if (testTheaters.length > 0) {
                const theaterIds = testTheaters.map(t => t.id).join(',');
                const [showtimesToDelete] = await connection.query(`SELECT id FROM showtime WHERE au_theater_id IN (${theaterIds})`);
                
                if (showtimesToDelete.length > 0) {
                    const showtimeIds = showtimesToDelete.map(s => s.id).join(',');
                    await connection.query(`DELETE FROM showtime_seat WHERE st_id IN (${showtimeIds})`);
                    await connection.query(`DELETE FROM showtime WHERE id IN (${showtimeIds})`);
                }
                
                await connection.query(`DELETE FROM seat WHERE au_theater_id IN (${theaterIds})`);
                await connection.query(`DELETE FROM auditorium WHERE theater_id IN (${theaterIds})`);
                await connection.query(`DELETE FROM theater WHERE id IN (${theaterIds})`);
            }
            
            if (testMovies.length > 0) {
                const movieIds = testMovies.map(m => m.id).join(',');
                await connection.query(`DELETE FROM movie WHERE id IN (${movieIds})`);
            }
            
            // Cleanup test users
            const [testUsers] = await connection.query(`SELECT id FROM \`User\` WHERE email = 'sales_test@test.com'`);
            if (testUsers.length > 0) {
                const userIds = testUsers.map(u => u.id).join(',');
                const [bookings] = await connection.query(`SELECT id FROM booking WHERE customer_id IN (${userIds})`);
                
                if (bookings.length > 0) {
                    const bookingIds = bookings.map(b => b.id).join(',');
                    await connection.query(`DELETE FROM showtime_seat WHERE booking_id IN (${bookingIds})`);
                    await connection.query(`DELETE FROM booking WHERE id IN (${bookingIds})`);
                }
                
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

        // 1. Create test theater
        await connection.query(`
            INSERT INTO theater (name, street, district, city)
            VALUES ('Test Theater Sales', '999 Test St', 'Test District', 'Test City')
        `);

        const [theaterResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const theaterId = theaterResult[0].id;
        console.log(`Theater ID: ${theaterId}`);

        // 2. Create test auditorium
        const [existingAud] = await connection.query(`SELECT DISTINCT type FROM auditorium LIMIT 1`);
        const audType = existingAud.length > 0 ? existingAud[0].type : '2D';

        await connection.query(`
            INSERT INTO auditorium (number, theater_id, type, capacity)
            VALUES (1, ${theaterId}, '${audType}', 100)
        `);

        // 3. Create test movie
        await connection.query(`
            INSERT INTO movie (name, duration, language, release_date, age_rating, poster_file)
            VALUES ('Sales Test Movie', 120, 'English', '2025-01-01', 'P13', 'test.jpg')
        `);

        const [movieResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const movieId = movieResult[0].id;

        // 4. Create test user and customer
        await connection.query(`
            INSERT INTO \`User\` (fname, lname, email, password, birthday, gender)
            VALUES ('Sales', 'Customer', 'sales_test@test.com', 'hashed', '1990-01-01', 'Male')
        `);

        const [userResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
        const userId = userResult[0].id;

        const [existingCustomer] = await connection.query(`SELECT user_id FROM customer WHERE user_id = ${userId}`);
        if (existingCustomer.length === 0) {
            await connection.query(`
                INSERT INTO customer (user_id, accumulated_points, membership_name)
                VALUES (${userId}, 0, 'Member')
            `);
        }

        // 5. Create showtimes with bookings
        const showtimes = [
            { date: '2025-01-15', start: '10:00:00', end: '12:00:00' },
            { date: '2025-01-16', start: '14:00:00', end: '16:00:00' },
            { date: '2025-01-20', start: '18:00:00', end: '20:00:00' }
        ];

        const showtimeIds = [];
        for (const st of showtimes) {
            await connection.query(`
                INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
                VALUES ('${st.date}', '${st.start}', '${st.end}', ${movieId}, 1, ${theaterId})
            `);
            const [stResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
            showtimeIds.push(stResult[0].id);
        }

        // 6. Create seats
        const [maxSeatResult] = await connection.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM seat`);
        let nextSeatId = maxSeatResult[0].max_id + 1;

        const seatIds = [];
        for (let i = 1; i <= 3; i++) {
            await connection.query(`
                INSERT INTO seat (id, au_number, au_theater_id, row_char, column_number, type, price)
                VALUES (${nextSeatId}, 1, ${theaterId}, 'A', ${i}, 'Normal', 100000)
            `);
            seatIds.push(nextSeatId);
            nextSeatId++;
        }

        // 7. Create bookings and showtime_seats for first 2 showtimes
        for (let i = 0; i < 2; i++) {
            await connection.query(`
                INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
                VALUES (NOW(), 'Paid', 'Online', 0, ${userId})
            `);
            const [bookingResult] = await connection.query('SELECT LAST_INSERT_ID() as id');
            const bookingId = bookingResult[0].id;

            // Add 2 seats per booking
            for (let j = 0; j < 2; j++) {
                await connection.query(`
                    INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
                    VALUES (${showtimeIds[i]}, ${seatIds[j]}, 1, ${theaterId}, 'Booked', 100000, ${bookingId})
                `);
            }
        }

        console.log('✅ Test data setup complete\n');

        // ===================================================================
        // TEST CASES
        // ===================================================================

        // TEST 1: NULL theater_id
        console.log('🧪 TEST 1: NULL theater_id (should FAIL)');
        try {
            await connection.query(`CALL sp_generate_sales_report(NULL, '2025-01-01', '2025-01-31')`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 2: NULL start_date
        console.log('🧪 TEST 2: NULL start_date (should FAIL)');
        try {
            await connection.query(`CALL sp_generate_sales_report(${theaterId}, NULL, '2025-01-31')`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 3: NULL end_date
        console.log('🧪 TEST 3: NULL end_date (should FAIL)');
        try {
            await connection.query(`CALL sp_generate_sales_report(${theaterId}, '2025-01-01', NULL)`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 4: Invalid date range (start > end)
        console.log('🧪 TEST 4: Invalid date range (should FAIL)');
        try {
            await connection.query(`CALL sp_generate_sales_report(${theaterId}, '2025-01-31', '2025-01-01')`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 5: Non-existent theater
        console.log('🧪 TEST 5: Non-existent theater (should FAIL)');
        try {
            await connection.query(`CALL sp_generate_sales_report(99999, '2025-01-01', '2025-01-31')`);
            console.log('❌ FAILED: Should have thrown error\n');
        } catch (error) {
            console.log(`✅ PASSED: ${error.message}\n`);
        }

        // TEST 6: Valid request - generate sales report
        console.log('🧪 TEST 6: Valid sales report generation (should SUCCESS)');
        const [result] = await connection.query(`CALL sp_generate_sales_report(${theaterId}, '2025-01-01', '2025-01-31')`);
        
        console.log('Sales Report:');
        console.log('='.repeat(100));
        if (result && result.length > 0) {
            result.forEach((row, index) => {
                console.log(`\n${index + 1}. Showtime ID: ${row.showtime_id}`);
                console.log(`   Movie: ${row.movie_name}`);
                console.log(`   Date: ${row.showtime_date}`);
                console.log(`   Tickets Sold: ${row.tickets_sold}`);
                console.log(`   Ticket Revenue: ${row.ticket_revenue}`);
                console.log(`   F&B Revenue: ${row.fwb_revenue}`);
                console.log(`   Total Revenue: ${row.total_revenue}`);
            });
            console.log('\n' + '='.repeat(100));
            console.log(`✅ PASSED: Generated report with ${result.length} records\n`);
        } else {
            console.log('ℹ️  No sales data found (this is OK for empty date range)\n');
        }

        // TEST 7: CURSOR functionality - verify all showtimes processed
        console.log('🧪 TEST 7: Verify CURSOR processed all showtimes');
        const [showtimeCount] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM showtime 
            WHERE au_theater_id = ${theaterId} 
              AND date BETWEEN '2025-01-01' AND '2025-01-31'
        `);
        
        const expectedCount = showtimeCount[0].count;
        const actualCount = result.length;
        
        if (expectedCount === actualCount) {
            console.log(`✅ PASSED: CURSOR processed all ${actualCount} showtimes\n`);
        } else {
            console.log(`❌ FAILED: Expected ${expectedCount} records, got ${actualCount}\n`);
        }

        // TEST 8: Verify revenue calculations
        console.log('🧪 TEST 8: Verify revenue calculations');
        let passed = true;
        for (const row of result) {
            // Each booking has 2 tickets at 100000 each
            const expectedTicketRevenue = row.tickets_sold * 100000;
            if (Math.abs(row.ticket_revenue - expectedTicketRevenue) > 0.01) {
                console.log(`❌ FAILED: Incorrect ticket revenue for showtime ${row.showtime_id}`);
                passed = false;
                break;
            }
        }
        if (passed) {
            console.log(`✅ PASSED: Revenue calculations are correct\n`);
        }

        // ===================================================================
        // CLEANUP
        // ===================================================================
        console.log('🧹 Cleaning up test data...');

        // Delete in correct order
        await connection.query(`DELETE FROM showtime_seat WHERE st_id IN (${showtimeIds.join(',')})`);
        await connection.query(`DELETE FROM showtime WHERE id IN (${showtimeIds.join(',')})`);
        await connection.query(`DELETE FROM booking WHERE customer_id = ${userId}`);
        await connection.query(`DELETE FROM seat WHERE au_theater_id = ${theaterId}`);
        await connection.query(`DELETE FROM auditorium WHERE theater_id = ${theaterId}`);
        await connection.query(`DELETE FROM theater WHERE id = ${theaterId}`);
        await connection.query(`DELETE FROM movie WHERE id = ${movieId}`);
        await connection.query(`DELETE FROM customer WHERE user_id = ${userId}`);
        await connection.query(`DELETE FROM \`User\` WHERE id = ${userId}`);

        console.log('✅ Cleanup complete\n');
        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error(error);
    } finally {
        await connection.end();
    }
}

testSalesReport();
