import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
const request = require('supertest');

/**
 * Gift Module E2E Tests
 * 
 * Test Flow:
 * 1. Register 3 customers: A, B, C
 * 2. Customer A creates 2 bookings
 * 3. A gifts booking 1 to B
 * 4. A gifts booking 2 to C
 * 5. Verify received/sent gifts
 * 6. Error handling tests
 */
describe('Gift Module (e2e)', () => {
  let app: INestApplication<App>;
  let accessTokenA: string; // Customer A (sender)
  let accessTokenB: string; // Customer B (receiver 1)
  let accessTokenC: string; // Customer C (receiver 2)
  let userIdA: number;
  let userIdB: number;
  let userIdC: number;
  let booking1Id: number; // A will gift this to B
  let booking2Id: number; // A will gift this to C

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipe like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // SETUP - Register 3 Customers
  // ============================================

  describe('Setup - Register Test Users (A, B, C)', () => {
    it('should register customer A (sender)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fname: 'Customer',
          lname: 'Phú A',
          email: `customerA.${Date.now()}@example.com`,
          password: 'Test123456',
          birthday: '2000-01-01',
          gender: 'Male',
          district: 'District 1',
          city: 'Ho Chi Minh',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userType).toBe('customer');

      accessTokenA = response.body.accessToken;
      userIdA = parseInt(response.body.userId); // Convert to number

      console.log('✅ Customer A registered:', { userId: userIdA });
    });

    it('should register customer B (receiver 1)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fname: 'Customer',
          lname: 'Phú B',
          email: `customerB.${Date.now()}@example.com`,
          password: 'Test123456',
          birthday: '2000-01-01',
          gender: 'Female',
          district: 'District 2',
          city: 'Ho Chi Minh',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userType).toBe('customer');

      accessTokenB = response.body.accessToken;
      userIdB = parseInt(response.body.userId); // Convert to number

      console.log('✅ Customer B registered:', { userId: userIdB });
    });

    it('should register customer C (receiver 2)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fname: 'Customer',
          lname: 'Phú C',
          email: `customerC.${Date.now()}@example.com`,
          password: 'Test123456',
          birthday: '2000-01-01',
          gender: 'Other',
          district: 'District 3',
          city: 'Ho Chi Minh',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userType).toBe('customer');

      accessTokenC = response.body.accessToken;
      userIdC = parseInt(response.body.userId); // Convert to number

      console.log('✅ Customer C registered:', { userId: userIdC });
    });
  });

  // ============================================
  // SETUP - Customer A Creates 2 Bookings
  // ============================================

  describe('Setup - Customer A Creates 2 Bookings', () => {
    it('should create booking 1 for customer A (to gift to B)', async () => {
      // Insert test booking directly into database
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Confirmed', 'Online', 0, NOW())`,
        [userIdA]
      );
      
      booking1Id = parseInt(result.insertId); // Convert to number
      expect(booking1Id).toBeDefined();
      expect(booking1Id).toBeGreaterThan(0);
      console.log('✅ Booking 1 created:', { bookingId: booking1Id, owner: 'Customer A' });
    });

    it('should create booking 2 for customer A (to gift to C)', async () => {
      // Insert test booking directly into database
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Confirmed', 'Online', 0, NOW())`,
        [userIdA]
      );
      
      booking2Id = parseInt(result.insertId); // Convert to number
      expect(booking2Id).toBeDefined();
      expect(booking2Id).toBeGreaterThan(0);
      console.log('✅ Booking 2 created:', { bookingId: booking2Id, owner: 'Customer A' });
    });
  });

  // ============================================
  // VALIDATION TESTS
  // ============================================

  describe('POST /gift/booking - Validation Tests', () => {
    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/gift/booking')
        .send({
          bookingId: booking1Id,
          receiverId: userIdB,
        })
        .expect(401);
    });

    it('should fail with invalid bookingId (not a number)', async () => {
      await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: 'invalid',
          receiverId: userIdB,
        })
        .expect(400);
    });

    it('should fail with missing receiverId', async () => {
      await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking1Id,
        })
        .expect(400);
    });

    it('should fail when sending to yourself', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking1Id,
          receiverId: userIdA, // Same as sender
        })
        .expect(400);

      expect(response.body.message).toContain('Cannot send booking to yourself');
      console.log('✅ Correctly rejected self-gifting');
    });

    it('should fail with non-existent booking', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: 999999, // Non-existent booking
          receiverId: userIdB,
        })
        .expect(400);

      expect(response.body.message).toContain('Booking not found');
      console.log('✅ Correctly rejected non-existent booking');
    });

    it('should fail with non-existent receiver', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking1Id,
          receiverId: 999999, // Non-existent user
        })
        .expect(400);

      expect(response.body.message).toContain('Receiver customer not found');
      console.log('✅ Correctly rejected non-existent receiver');
    });

    it('should fail when B tries to gift A\'s booking', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({
          bookingId: booking1Id,
          receiverId: userIdC,
        })
        .expect(400);

      expect(response.body.message).toContain('You do not own this booking');
      console.log('✅ Correctly prevented unauthorized gift');
    });
  });

  // ============================================
  // MAIN FLOW - A gifts booking 1 to B
  // ============================================

  describe('POST /gift/booking - A Gifts Booking 1 to B', () => {
    it('should successfully gift booking 1 from A to B', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking1Id,
          receiverId: userIdB,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Booking gifted successfully');
      expect(response.body.data.bookingId).toBe(booking1Id);
      expect(parseInt(response.body.data.senderId)).toBe(userIdA);
      expect(parseInt(response.body.data.receiverId)).toBe(userIdB);
      expect(response.body.data).toHaveProperty('senderName');
      expect(response.body.data).toHaveProperty('receiverName');

      console.log('✅ Booking 1 gifted A → B:', response.body.data);
    });

    it('should fail when trying to gift booking 1 again', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking1Id,
          receiverId: userIdB,
        })
        .expect(400);

      // After gifting, ownership transferred to B, so A no longer owns it
      expect(response.body.message).toContain('You do not own this booking');
      console.log('✅ Correctly prevented double-gifting');
    });
  });

  // ============================================
  // MAIN FLOW - A gifts booking 2 to C
  // ============================================

  describe('POST /gift/booking - A Gifts Booking 2 to C', () => {
    it('should successfully gift booking 2 from A to C', async () => {
      const response = await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: booking2Id,
          receiverId: userIdC,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Booking gifted successfully');
      expect(response.body.data.bookingId).toBe(booking2Id);
      expect(parseInt(response.body.data.senderId)).toBe(userIdA);
      expect(parseInt(response.body.data.receiverId)).toBe(userIdC);

      console.log('✅ Booking 2 gifted A → C:', response.body.data);
    });
  });

  // ============================================
  // VERIFY RECEIVED GIFTS
  // ============================================

  describe('GET /gift/received - Verify Received Gifts', () => {
    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/gift/received')
        .expect(401);
    });

    it('B should see 1 received gift (booking 1 from A)', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/received')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThanOrEqual(1);

      const gift = response.body.data.find(
        (g: any) => parseInt(g.bookingId) === booking1Id
      );
      expect(gift).toBeDefined();
      expect(parseInt(gift.senderId)).toBe(userIdA);
      expect(gift).toHaveProperty('senderName');

      console.log('✅ B\'s received gifts:', response.body.data);
    });

    it('C should see 1 received gift (booking 2 from A)', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/received')
        .set('Authorization', `Bearer ${accessTokenC}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBeGreaterThanOrEqual(1);

      const gift = response.body.data.find(
        (g: any) => parseInt(g.bookingId) === booking2Id
      );
      expect(gift).toBeDefined();
      expect(parseInt(gift.senderId)).toBe(userIdA);

      console.log('✅ C\'s received gifts:', response.body.data);
    });

    it('A should have no received gifts', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/received')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(0);
      console.log('✅ A has no received gifts (correct)');
    });
  });

  // ============================================
  // VERIFY SENT GIFTS
  // ============================================

  describe('GET /gift/sent - Verify Sent Gifts', () => {
    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/gift/sent')
        .expect(401);
    });

    it('A should see 2 sent gifts (to B and C)', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/sent')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.count).toBeGreaterThanOrEqual(2);

      const giftToB = response.body.data.find(
        (g: any) => parseInt(g.bookingId) === booking1Id
      );
      expect(giftToB).toBeDefined();
      expect(parseInt(giftToB.receiverId)).toBe(userIdB);

      const giftToC = response.body.data.find(
        (g: any) => parseInt(g.bookingId) === booking2Id
      );
      expect(giftToC).toBeDefined();
      expect(parseInt(giftToC.receiverId)).toBe(userIdC);

      console.log('✅ A\'s sent gifts:', response.body.data);
    });

    it('B should have no sent gifts', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/sent')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(0);
      console.log('✅ B has no sent gifts (correct)');
    });

    it('C should have no sent gifts', async () => {
      const response = await request(app.getHttpServer())
        .get('/gift/sent')
        .set('Authorization', `Bearer ${accessTokenC}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(0);
      console.log('✅ C has no sent gifts (correct)');
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Advanced Tests - Edge Cases', () => {
    it('should handle negative bookingId', async () => {
      await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: -1,
          receiverId: userIdB,
        })
        .expect(400);
    });

    it('should handle negative receiverId', async () => {
      // Create a new booking for this test
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift) 
         VALUES (?, 'Confirmed', 'Online', 0)`,
        [userIdA]
      );

      await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: result.insertId,
          receiverId: -1,
        })
        .expect(400);
    });

    it('should handle zero values', async () => {
      await request(app.getHttpServer())
        .post('/gift/booking')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId: 0,
          receiverId: 0,
        })
        .expect(400);
    });
  });
});
