import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

describe('sp_delete_showtime Stored Procedure (E2E)', () => {
  let connection: mysql.Connection;
  let adminId: number;
  let managerId: number;
  let staffId: number;
  let movieId: number;
  let theaterId: number;
  let showtimeId: number;
  let showtimeWithBookingId: number;

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

    // Pre-cleanup: Remove leftover test data
    await cleanupTestData();

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await connection.end();
  });

  async function cleanupTestData() {
    try {
      // Find test movie
      const [testMovies] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id FROM movie WHERE name = 'Test Movie Delete'`
      );

      if (testMovies.length > 0) {
        const movieIds = testMovies.map(m => m.id).join(',');
        
        // Get all showtimes for this movie
        const [showtimes] = await connection.query<mysql.RowDataPacket[]>(
          `SELECT id FROM showtime WHERE movie_id IN (${movieIds})`
        );

        if (showtimes.length > 0) {
          const showtimeIds = showtimes.map(s => s.id).join(',');
          
          // Get all bookings for these showtimes
          const [bookings] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT DISTINCT booking_id FROM showtime_seat WHERE st_id IN (${showtimeIds}) AND booking_id IS NOT NULL`
          );

          if (bookings.length > 0) {
            const bookingIds = bookings.map(b => b.booking_id).join(',');
            await connection.query(`DELETE FROM showtime_seat WHERE booking_id IN (${bookingIds})`);
            await connection.query(`DELETE FROM booking WHERE id IN (${bookingIds})`);
          }

          // Delete showtime_seats without bookings
          await connection.query(`DELETE FROM showtime_seat WHERE st_id IN (${showtimeIds})`);
          await connection.query(`DELETE FROM showtime WHERE id IN (${showtimeIds})`);
        }

        await connection.query(`DELETE FROM movie WHERE id IN (${movieIds})`);
      }

      // Find test theater
      const [testTheaters] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT id FROM theater WHERE name = 'Test Theater Delete'`
      );

      if (testTheaters.length > 0) {
        const theaterIds = testTheaters.map(t => t.id).join(',');
        await connection.query(`DELETE FROM seat WHERE au_theater_id IN (${theaterIds})`);
        await connection.query(`DELETE FROM auditorium WHERE theater_id IN (${theaterIds})`);
        await connection.query(`DELETE FROM theater WHERE id IN (${theaterIds})`);
      }

      // Cleanup test users
      await connection.query(`DELETE FROM customer WHERE user_id IN (
        SELECT id FROM \`User\` WHERE email IN ('admin_test@test.com', 'manager_test@test.com', 'staff_test@test.com')
      )`);
      await connection.query(`DELETE FROM staff WHERE user_id IN (
        SELECT id FROM \`User\` WHERE email IN ('admin_test@test.com', 'manager_test@test.com', 'staff_test@test.com')
      )`);
      await connection.query(`DELETE FROM \`User\` WHERE email IN ('admin_test@test.com', 'manager_test@test.com', 'staff_test@test.com')`);
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async function setupTestData() {
    // Create test users
    await connection.query(`
      INSERT INTO \`User\` (fname, lname, email, password, birthday, gender)
      VALUES 
        ('Admin', 'Test', 'admin_test@test.com', 'hashed', '1990-01-01', 'Male'),
        ('Manager', 'Test', 'manager_test@test.com', 'hashed', '1990-01-01', 'Female'),
        ('Staff', 'Test', 'staff_test@test.com', 'hashed', '1990-01-01', 'Male')
    `);

    const [adminUser] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT id FROM \`User\` WHERE email = 'admin_test@test.com'`
    );
    adminId = adminUser[0].id;

    const [managerUser] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT id FROM \`User\` WHERE email = 'manager_test@test.com'`
    );
    managerId = managerUser[0].id;

    const [staffUser] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT id FROM \`User\` WHERE email = 'staff_test@test.com'`
    );
    staffId = staffUser[0].id;

    // Create staff records
    await connection.query(`
      INSERT INTO staff (user_id, theater_id, role, hire_date, salary)
      VALUES 
        (${adminId}, NULL, 'Admin', '2020-01-01', 50000),
        (${managerId}, NULL, 'Manager', '2020-01-01', 40000),
        (${staffId}, NULL, 'Regular Staff', '2020-01-01', 30000)
    `);

    // Create test movie
    await connection.query(`
      INSERT INTO movie (name, duration, language, release_date, age_rating, poster_file)
      VALUES ('Test Movie Delete', 120, 'English', '2025-01-01', 'P13', 'test.jpg')
    `);

    const [movieResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    movieId = movieResult[0].id;

    // Create test theater
    await connection.query(`
      INSERT INTO theater (name, street, district, city)
      VALUES ('Test Theater Delete', '123 Test St', 'Test District', 'Test City')
    `);

    const [theaterResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    theaterId = theaterResult[0].id;

    // Create auditorium
    const [existingAud] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT DISTINCT type FROM auditorium LIMIT 1`
    );
    const audType = existingAud.length > 0 ? existingAud[0].type : '2D';

    await connection.query(`
      INSERT INTO auditorium (number, theater_id, type, capacity)
      VALUES (1, ${theaterId}, '${audType}', 100)
    `);

    // Create seats
    const [maxSeatResult] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT COALESCE(MAX(id), 0) as max_id FROM seat`
    );
    let nextSeatId = maxSeatResult[0].max_id + 1;

    for (let i = 1; i <= 5; i++) {
      await connection.query(`
        INSERT INTO seat (id, au_number, au_theater_id, row_char, column_number, type, price)
        VALUES (${nextSeatId}, 1, ${theaterId}, 'A', ${i}, 'Normal', 100000)
      `);
      nextSeatId++;
    }

    // Create showtime WITHOUT booking
    await connection.query(`
      INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
      VALUES ('2025-01-15', '10:00:00', '12:00:00', ${movieId}, 1, ${theaterId})
    `);

    const [showtimeResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    showtimeId = showtimeResult[0].id;

    // Create showtime WITH booking
    await connection.query(`
      INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
      VALUES ('2025-01-16', '14:00:00', '16:00:00', ${movieId}, 1, ${theaterId})
    `);

    const [showtimeWithBookingResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    showtimeWithBookingId = showtimeWithBookingResult[0].id;

    // Create customer
    await connection.query(`
      INSERT INTO customer (user_id, accumulated_points, membership_name)
      VALUES (${staffId}, 0, 'Member')
    `);

    // Create booking
    await connection.query(`
      INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
      VALUES (NOW(), 'Pending', 'Online', 0, ${staffId})
    `);

    const [bookingResult] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
    const bookingId = bookingResult[0].id;

    // Link booking to showtime
    const [seats] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT id FROM seat WHERE au_theater_id = ${theaterId} LIMIT 1`
    );
    const seatId = seats[0].id;

    await connection.query(`
      INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
      VALUES (${showtimeWithBookingId}, ${seatId}, 1, ${theaterId}, 'Booked', 100000, ${bookingId})
    `);
  }

  describe('Permission Tests', () => {
    it('should fail when regular staff tries to delete showtime', async () => {
      await expect(
        connection.query(`CALL sp_delete_showtime(${staffId}, ${showtimeId})`)
      ).rejects.toThrow(/Only Admin or Manager can delete showtimes/);
    });
  });

  describe('Booking Validation Tests', () => {
    it('should fail when trying to delete showtime with bookings', async () => {
      await expect(
        connection.query(`CALL sp_delete_showtime(${adminId}, ${showtimeWithBookingId})`)
      ).rejects.toThrow(/Cannot delete showtime with existing bookings/);
    });
  });

  describe('Successful Deletion Tests', () => {
    it('should allow admin to delete empty showtime', async () => {
      await expect(
        connection.query(`CALL sp_delete_showtime(${adminId}, ${showtimeId})`)
      ).resolves.not.toThrow();

      // Verify deletion
      const [result] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT * FROM showtime WHERE id = ${showtimeId}`
      );
      expect(result).toHaveLength(0);

      // Create new showtime for next test
      await connection.query(`
        INSERT INTO showtime (date, start_time, end_time, movie_id, au_number, au_theater_id)
        VALUES ('2025-01-17', '18:00:00', '20:00:00', ${movieId}, 1, ${theaterId})
      `);
      const [newShowtime] = await connection.query<mysql.RowDataPacket[]>('SELECT LAST_INSERT_ID() as id');
      showtimeId = newShowtime[0].id;
    });

    it('should allow manager to delete showtime', async () => {
      await expect(
        connection.query(`CALL sp_delete_showtime(${managerId}, ${showtimeId})`)
      ).resolves.not.toThrow();

      // Verify deletion
      const [result] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT * FROM showtime WHERE id = ${showtimeId}`
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should fail when trying to delete non-existent showtime', async () => {
      await expect(
        connection.query(`CALL sp_delete_showtime(${adminId}, 99999)`)
      ).rejects.toThrow(/Showtime not found/);
    });
  });
});
