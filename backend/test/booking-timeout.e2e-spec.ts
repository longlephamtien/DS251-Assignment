import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E Test: Booking Timeout Auto-Cancel
 * 
 * Prerequisite:
 * 1. Database đã import sp_cancel_expired_bookings
 * 2. Database có test data (hoặc script tạo)
 */
describe('Booking Timeout (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /booking/cleanup-expired', () => {
    beforeEach(async () => {
      // Cleanup test data
      await dataSource.query(`
        DELETE FROM payment WHERE booking_id IN (
          SELECT id FROM booking WHERE customer_id = 9999
        )
      `);
      await dataSource.query(`
        DELETE FROM showtime_seat WHERE booking_id IN (
          SELECT id FROM booking WHERE customer_id = 9999
        )
      `);
      await dataSource.query(`
        DELETE FROM booking WHERE customer_id = 9999
      `);
    });

    it('should return zero when no expired bookings exist', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/booking/cleanup-expired')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        cancelled: 0,
        failed: 0,
        message: expect.stringContaining('0 cancelled'),
      });
    });

    it('should cancel expired booking and release seats', async () => {
      // Arrange - Tạo booking timeout (6 phút trước)
      const [result] = await dataSource.query(`
        INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
        VALUES (DATE_SUB(NOW(), INTERVAL 6 MINUTE), 'Pending', 'Online', 0, 9999)
      `);
      const bookingId = result.insertId;

      // Tạo ghế held
      await dataSource.query(`
        INSERT INTO showtime_seat (showtime_id, seat_id, status, booking_id)
        VALUES (1, 999, 'Held', ?)
      `, [bookingId]);

      // Act
      const response = await request(app.getHttpServer())
        .get('/booking/cleanup-expired')
        .expect(200);

      // Assert
      expect(response.body.cancelled).toBeGreaterThan(0);
      expect(response.body.failed).toBe(0);

      // Verify booking status
      const [booking] = await dataSource.query(
        'SELECT status FROM booking WHERE id = ?',
        [bookingId],
      );
      expect(booking.status).toBe('Cancelled');

      // Verify seat released
      const [seat] = await dataSource.query(
        'SELECT status FROM showtime_seat WHERE seat_id = 999 AND showtime_id = 1',
      );
      expect(seat.status).toBe('Available');

      // Verify payment record created
      const payments = await dataSource.query(
        'SELECT * FROM payment WHERE booking_id = ? AND status = ?',
        [bookingId, 'Cancelled'],
      );
      expect(payments.length).toBe(1);
    });

    it('should NOT cancel fresh booking (< 5 minutes)', async () => {
      // Arrange - Tạo booking mới (2 phút trước)
      const [result] = await dataSource.query(`
        INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
        VALUES (DATE_SUB(NOW(), INTERVAL 2 MINUTE), 'Pending', 'Online', 0, 9999)
      `);
      const bookingId = result.insertId;

      // Act
      await request(app.getHttpServer())
        .get('/booking/cleanup-expired')
        .expect(200);

      // Assert - Booking vẫn Pending
      const [booking] = await dataSource.query(
        'SELECT status FROM booking WHERE id = ?',
        [bookingId],
      );
      expect(booking.status).toBe('Pending');
    });

    it('should NOT cancel paid booking even if old', async () => {
      // Arrange - Tạo booking cũ nhưng đã Paid
      const [result] = await dataSource.query(`
        INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
        VALUES (DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'Paid', 'Online', 0, 9999)
      `);
      const bookingId = result.insertId;

      // Act
      await request(app.getHttpServer())
        .get('/booking/cleanup-expired')
        .expect(200);

      // Assert - Booking vẫn Paid
      const [booking] = await dataSource.query(
        'SELECT status FROM booking WHERE id = ?',
        [bookingId],
      );
      expect(booking.status).toBe('Paid');
    });

    it('should handle multiple expired bookings', async () => {
      // Arrange - Tạo 3 expired bookings
      for (let i = 0; i < 3; i++) {
        const [result] = await dataSource.query(`
          INSERT INTO booking (created_time_at, status, booking_method, is_gift, customer_id)
          VALUES (DATE_SUB(NOW(), INTERVAL ${6 + i} MINUTE), 'Pending', 'Online', 0, 9999)
        `);
        const bookingId = result.insertId;

        await dataSource.query(`
          INSERT INTO showtime_seat (showtime_id, seat_id, status, booking_id)
          VALUES (1, ${990 + i}, 'Held', ?)
        `, [bookingId]);
      }

      // Act
      const response = await request(app.getHttpServer())
        .get('/booking/cleanup-expired')
        .expect(200);

      // Assert
      expect(response.body.cancelled).toBe(3);
      expect(response.body.failed).toBe(0);

      // Verify all cancelled
      const cancelledCount = await dataSource.query(`
        SELECT COUNT(*) as count 
        FROM booking 
        WHERE customer_id = 9999 AND status = 'Cancelled'
      `);
      expect(cancelledCount[0].count).toBe(3);
    });
  });
});
