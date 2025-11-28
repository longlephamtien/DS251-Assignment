import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

interface SalesReportRow {
  showtime_id: number;
  movie_name: string;
  showtime_date: string;
  tickets_sold: number;
  ticket_revenue: number;
  fwb_revenue: number;
  total_revenue: number;
}

describe('sp_generate_sales_report Stored Procedure (E2E)', () => {
  let connection: mysql.Connection;
  let theaterId: number;
  let movieId: number;
  let userId: number;
  let showtimeIds: number[] = [];
  let seatIds: number[] = [];

  beforeAll(async () => {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '14127', 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.AIVEN_SSL_CA ? {
        ca: process.env.AIVEN_SSL_CA
      } : undefined,
      multipleStatements: true
    });

    // Pre-cleanup and setup
    await cleanupTestData();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await connection.end();
  });

  async function cleanupTestData() {
    try {
      // Cleanup test theaters and movies
      const [testTheaters] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id FROM theater WHERE name = 'Test Theater Sales'`
      );
      const [testMovies] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id FROM movie WHERE name = 'Sales Test Movie'`
      );

      if (testTheaters.length > 0) {
        const theaterIds = testTheaters.map(t => t.id).join(',');
        const [showtimesToDelete] = await connection.query<mysql.RowDataPacket[]>(
          `SELECT id FROM showtime WHERE au_theater_id IN (${theaterIds})`
        );

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
      const [testUsers] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id FROM \`User\` WHERE email = 'sales_test@test.com'`
      );
      if (testUsers.length > 0) {
        const userIds = testUsers.map(u => u.id).join(',');
        const [bookings] = await connection.query<mysql.RowDataPacket[]>(
          `SELECT id FROM booking WHERE customer_id IN (${userIds})`
        );

        if (bookings.length > 0) {
          const bookingIds = bookings.map(b => b.id).join(',');
          await connection.query(`DELETE FROM showtime_seat WHERE booking_id IN (${bookingIds})`);
          await connection.query(`DELETE FROM booking WHERE id IN (${bookingIds})`);
        }

        await connection.query(`DELETE FROM customer WHERE user_id IN (${userIds})`);
        await connection.query(`DELETE FROM \`User\` WHERE id IN (${userIds})`);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async function setupTestData() {
    // Create test theater
    await connection.query(`
      INSERT INTO theater (name, street, district, city)
      VALUES ('Test Theater Sales', '999 Test St', 'Test District', 'Test City')
    `);

    const [theaterResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    theaterId = theaterResult[0].id;

    // Create test auditorium
    const [existingAud] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT DISTINCT type FROM auditorium LIMIT 1`
    );
    const audType = existingAud.length > 0 ? existingAud[0].type : '2D';

    await connection.query(`
      INSERT INTO auditorium (number, theater_id, type, capacity)
      VALUES (1, ${theaterId}, '${audType}', 100)
    `);

    // Create test movie
    await connection.query(`
      INSERT INTO movie (name, duration, language, release_date, age_rating, poster_file)
      VALUES ('Sales Test Movie', 120, 'English', '2025-01-01', 'P13', 'test.jpg')
    `);

    const [movieResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    movieId = movieResult[0].id;

    // Create test user and customer
    await connection.query(`
      INSERT INTO \`User\` (fname, lname, email, password, birthday, gender)
      VALUES ('Sales', 'Customer', 'sales_test@test.com', 'hashed', '1990-01-01', 'Male')
    `);

    const [userResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    userId = userResult[0].id;

    const [existingCustomer] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT user_id FROM customer WHERE user_id = ${userId}`
    );
    if (existingCustomer.length === 0) {
      await connection.query(`
        INSERT INTO customer (user_id, accumulated_points, membership_name)
        VALUES (${userId}, 0, 'Member')
      `);
    }

    // Create showtimes
    const showtimes = [
      { date: '2025-01-15', start: '10:00:00', end: '12:00:00' },
      { date: '2025-01-16', start: '14:00:00', end: '16:00:00' },
      { date: '2025-01-20', start: '18:00:00', end: '20:00:00' }
    ];

    for (const st of showtimes) {
      await connection.query(`
        INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
        VALUES ('${st.date}', '${st.start}', '${st.end}', ${movieId}, 1, ${theaterId})
      `);
      const [stResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
      showtimeIds.push(stResult[0].id);
    }

    // Create seats
    const [maxSeatResult] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT COALESCE(MAX(id), 0) as max_id FROM seat`
    );
    let nextSeatId = maxSeatResult[0].max_id + 1;

    for (let i = 1; i <= 3; i++) {
      await connection.query(`
        INSERT INTO seat (id, au_number, au_theater_id, row_char, column_number, type, price)
        VALUES (${nextSeatId}, 1, ${theaterId}, 'A', ${i}, 'Normal', 100000)
      `);
      seatIds.push(nextSeatId);
      nextSeatId++;
    }

    // Create bookings for first 2 showtimes
    for (let i = 0; i < 2; i++) {
      await connection.query(`
        INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
        VALUES (NOW(), 'Paid', 'Online', 0, ${userId})
      `);
      const [bookingResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
      const bookingId = bookingResult[0].id;

      // Add 2 seats per booking
      for (let j = 0; j < 2; j++) {
        await connection.query(`
          INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
          VALUES (${showtimeIds[i]}, ${seatIds[j]}, 1, ${theaterId}, 'Booked', 100000, ${bookingId})
        `);
      }
    }
  }

  describe('Input Validation Tests', () => {
    it('should fail when theater_id is NULL', async () => {
      await expect(
        connection.query(`CALL sp_generate_sales_report(NULL, '2025-01-01', '2025-01-31')`)
      ).rejects.toThrow();
    });

    it('should fail when start_date is NULL', async () => {
      await expect(
        connection.query(`CALL sp_generate_sales_report(${theaterId}, NULL, '2025-01-31')`)
      ).rejects.toThrow();
    });

    it('should fail when end_date is NULL', async () => {
      await expect(
        connection.query(`CALL sp_generate_sales_report(${theaterId}, '2025-01-01', NULL)`)
      ).rejects.toThrow();
    });

    it('should fail when start_date > end_date', async () => {
      await expect(
        connection.query(`CALL sp_generate_sales_report(${theaterId}, '2025-01-31', '2025-01-01')`)
      ).rejects.toThrow(/Invalid date range/);
    });

    it('should fail when theater does not exist', async () => {
      await expect(
        connection.query(`CALL sp_generate_sales_report(99999, '2025-01-01', '2025-01-31')`)
      ).rejects.toThrow(/Theater not found/);
    });
  });

  describe('Sales Report Generation Tests', () => {
    let salesReport: SalesReportRow[];

    beforeAll(async () => {
      const [result] = await connection.query<mysql.RowDataPacket[]>(
        `CALL sp_generate_sales_report(${theaterId}, '2025-01-01', '2025-01-31')`
      );
      salesReport = result as SalesReportRow[];
    });

    it('should generate sales report successfully', () => {
      expect(salesReport).toBeDefined();
      expect(salesReport.length).toBeGreaterThan(0);
    });

    it('should include all expected fields in report', () => {
      expect(salesReport[0]).toHaveProperty('showtime_id');
      expect(salesReport[0]).toHaveProperty('movie_name');
      expect(salesReport[0]).toHaveProperty('showtime_date');
      expect(salesReport[0]).toHaveProperty('tickets_sold');
      expect(salesReport[0]).toHaveProperty('ticket_revenue');
      expect(salesReport[0]).toHaveProperty('fwb_revenue');
      expect(salesReport[0]).toHaveProperty('total_revenue');
    });

    it('should process all showtimes in date range (CURSOR test)', async () => {
      const [showtimeCount] = await connection.query<mysql.RowDataPacket[]>(`
        SELECT COUNT(*) as count 
        FROM showtime 
        WHERE au_theater_id = ${theaterId} 
          AND date BETWEEN '2025-01-01' AND '2025-01-31'
      `);

      const expectedCount = showtimeCount[0].count;
      const actualCount = salesReport.length;

      expect(actualCount).toBe(expectedCount);
    });

    it('should calculate ticket revenue correctly', () => {
      for (const row of salesReport) {
        // Each ticket is 100000 VND
        const expectedTicketRevenue = row.tickets_sold * 100000;
        expect(row.ticket_revenue).toBe(expectedTicketRevenue);
      }
    });

    it('should have correct total revenue', () => {
      for (const row of salesReport) {
        const expectedTotal = row.ticket_revenue + row.fwb_revenue;
        expect(row.total_revenue).toBe(expectedTotal);
      }
    });

    it('should only include showtimes with bookings', () => {
      // We created 3 showtimes but only 2 have bookings
      expect(salesReport.length).toBe(2);
    });

    it('should have correct movie name', () => {
      for (const row of salesReport) {
        expect(row.movie_name).toBe('Sales Test Movie');
      }
    });

    it('should have correct number of tickets sold per showtime', () => {
      for (const row of salesReport) {
        // Each showtime has 2 seats booked
        expect(row.tickets_sold).toBe(2);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should return empty result for date range with no showtimes', async () => {
      const [result] = await connection.query<mysql.RowDataPacket[]>(
        `CALL sp_generate_sales_report(${theaterId}, '2020-01-01', '2020-01-31')`
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should handle single-day date range', async () => {
      const [result] = await connection.query<mysql.RowDataPacket[]>(
        `CALL sp_generate_sales_report(${theaterId}, '2025-01-15', '2025-01-15')`
      );
      
      expect(result).toBeDefined();
      // Should have 1 showtime on this date
      expect(result.length).toBe(1);
    });
  });
});
