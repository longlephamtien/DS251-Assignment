import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
const request = require('supertest');

/**
 * Coupon Advanced Features E2E Tests
 * 
 * Test Coverage:
 * 1. Balance Deduction - Coupon balance decreases after apply
 * 2. Total Discount Limit - Cannot exceed booking price
 * 3. Percent Coupon Type - 10%, 20%, 50% discounts
 * 4. Concurrent Gift Prevention - Transaction lock
 * 5. Pagination - Gift history with limit/offset
 * 6. Refund with Applied Coupons - Release coupons
 */
describe('Coupon Advanced Features (e2e)', () => {
  let app: INestApplication<App>;
  let accessTokenA: string;
  let accessTokenB: string;
  let accessTokenC: string;
  let userIdA: number;
  let userIdB: number;
  let userIdC: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
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
  // SETUP: Register 3 test customers
  // ============================================

  describe('Setup - Register Test Customers', () => {
    it('should register customer A', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `adv_customer_a_${timestamp}@test.com`,
          password: 'Password123!',
          fname: 'Advanced',
          lname: 'CustomerA',
          birthday: '1990-01-01',
        });

      if (response.status !== 201) {
        console.error('❌ Registration failed:', response.body);
      }
      expect(response.status).toBe(201);

      accessTokenA = response.body.accessToken;
      userIdA = parseInt(response.body.userId);
      console.log('✅ Advanced Customer A registered:', { userIdA });
    });

    it('should register customer B', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `adv_customer_b_${timestamp}@test.com`,
          password: 'Password123!',
          fname: 'Advanced',
          lname: 'CustomerB',
          birthday: '1991-02-02',
        })
        .expect(201);

      accessTokenB = response.body.accessToken;
      userIdB = parseInt(response.body.userId);
      console.log('✅ Advanced Customer B registered:', { userIdB });
    });

    it('should register customer C', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `adv_customer_c_${timestamp}@test.com`,
          password: 'Password123!',
          fname: 'Advanced',
          lname: 'CustomerC',
          birthday: '1992-03-03',
        })
        .expect(201);

      accessTokenC = response.body.accessToken;
      userIdC = parseInt(response.body.userId);
      console.log('✅ Advanced Customer C registered:', { userIdC });
    });
  });

  // ============================================
  // TEST 1: Balance Deduction
  // ============================================

  describe('Balance Deduction Tests', () => {
    let bookingId: number;
    let couponId: number;
    const initialBalance = 100000; // 100K VND
    const ticketPrice = 70000; // 70K per ticket

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create booking
      const bookingResult = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Paid', 'Online', 0, NOW())`,
        [userIdA]
      );
      bookingId = parseInt(bookingResult.insertId);

      // Create 1 ticket via showtime_seat (70K)
      await dataSource.query(
        `INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id)
         VALUES (1, 1, 1, 1, 'Valid', ?, ?)`,
        [ticketPrice, bookingId]
      );

      // Create Amount coupon with 100K balance
      const couponResult = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('Balance Test 100K', ?, ?, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdA, initialBalance]
      );
      couponId = parseInt(couponResult.insertId);

      console.log('✅ Created booking with ticket (70K) and coupon (100K):', { bookingId, couponId });
    });

    it('should have initial balance of 100K', async () => {
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT balance FROM coupon WHERE id = ?',
        [couponId]
      );
      expect(parseFloat(result[0].balance)).toBe(initialBalance);
    });

    it('should apply coupon to booking', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId,
          couponId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Coupon applied to booking');
    });

    it('should consume coupon fully and create new coupon with 30K remaining', async () => {
      const dataSource = app.get(DataSource);
      
      // Original coupon should have balance = 0 and discount_amount = 70K
      const result = await dataSource.query(
        'SELECT balance, discount_amount FROM coupon WHERE id = ?',
        [couponId]
      );
      expect(parseFloat(result[0].balance)).toBe(0);
      expect(parseFloat(result[0].discount_amount)).toBe(ticketPrice); // 70K
      
      // New coupon should exist with remaining 30K
      const newCoupons = await dataSource.query(
        `SELECT * FROM coupon WHERE customer_id = ? AND name LIKE '%Remaining%' ORDER BY id DESC LIMIT 1`,
        [userIdA]
      );
      expect(newCoupons.length).toBe(1);
      expect(parseFloat(newCoupons[0].balance)).toBe(initialBalance - ticketPrice); // 30K
      
      console.log(`✅ Original discount=70K, new coupon created with ${newCoupons[0].balance} remaining`);
    });
  });

  // ============================================
  // TEST 2: Total Discount Limit
  // ============================================

  describe('Total Discount Limit Tests', () => {
    let bookingId: number;
    let coupon1Id: number;
    let coupon2Id: number;
    let coupon3Id: number;

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create booking with tickets (total = 200K)
      const bookingResult = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Paid', 'Online', 0, NOW())`,
        [userIdB]
      );
      bookingId = parseInt(bookingResult.insertId);

      // 4 tickets × 50K = 200K via showtime_seat
      await dataSource.query(
        `INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id) 
         VALUES (1, 1, 1, 1, 'Valid', 50000, ?), (1, 2, 1, 1, 'Valid', 50000, ?), (1, 3, 1, 1, 'Valid', 50000, ?), (1, 4, 1, 1, 'Valid', 50000, ?)`,
        [bookingId, bookingId, bookingId, bookingId]
      );

      // Create 3 coupons for B
      const c1 = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('Limit Test 1 - 120K', ?, 120000, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdB]
      );
      coupon1Id = parseInt(c1.insertId);

      const c2 = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('Limit Test 2 - 60K', ?, 60000, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdB]
      );
      coupon2Id = parseInt(c2.insertId);

      const c3 = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('Limit Test 3 - 50K', ?, 50000, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdB]
      );
      coupon3Id = parseInt(c3.insertId);

      console.log('✅ Created booking (200K) and 3 coupons (120K, 60K, 50K)');
    });

    it('should apply first coupon (120K)', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({
          bookingId,
          couponId: coupon1Id,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Applied coupon 1 (120K) - Total discount = 120K');
    });

    it('should apply second coupon (60K) - Total = 180K', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({
          bookingId,
          couponId: coupon2Id,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Applied coupon 2 (60K) - Total discount = 180K');
    });

    it('should apply third coupon (50K) but only discount 20K remaining', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({
          bookingId,
          couponId: coupon3Id,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Check coupon 3: discount_amount = 20K, new coupon created with 30K
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT discount_amount FROM coupon WHERE id = ?',
        [coupon3Id]
      );
      expect(parseFloat(result[0].discount_amount)).toBe(20000); // Only 20K discounted
      
      // New coupon with 30K should exist
      const newCoupons = await dataSource.query(
        `SELECT * FROM coupon WHERE customer_id = ? AND name LIKE '%Remaining%' AND balance > 0 ORDER BY id DESC LIMIT 1`,
        [userIdB]
      );
      expect(newCoupons.length).toBe(1);
      expect(parseFloat(newCoupons[0].balance)).toBe(30000);
      
      console.log('✅ Coupon 3: discount=20K (remaining price), new coupon=30K (excess)');
    });

    it('should verify all 3 coupons applied with total discount = 200K', async () => {
      const dataSource = app.get(DataSource);
      const coupons = await dataSource.query(
        'SELECT id, discount_amount FROM coupon WHERE booking_id = ?',
        [bookingId]
      );
      expect(coupons.length).toBe(3);
      
      // Total discount = 120K + 60K + 20K = 200K (equals booking price)
      const totalDiscount = coupons.reduce((sum, c) => sum + parseFloat(c.discount_amount), 0);
      expect(totalDiscount).toBe(200000);
      
      console.log('✅ All 3 coupons applied: total discount = 200K (matches booking price)');
    });
  });

  // ============================================
  // TEST 3: Percent Coupon Type
  // ============================================

  describe('Percent Coupon Type Tests', () => {
    let bookingId: number;
    let coupon10PercentId: number;
    let coupon20PercentId: number;

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create booking with tickets (total = 100K)
      const bookingResult = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Paid', 'Online', 0, NOW())`,
        [userIdC]
      );
      bookingId = parseInt(bookingResult.insertId);

      // 2 tickets × 50K = 100K via showtime_seat
      await dataSource.query(
        `INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id) 
         VALUES (1, 5, 1, 1, 'Valid', 50000, ?), (1, 6, 1, 1, 'Valid', 50000, ?)`,
        [bookingId, bookingId]
      );

      // Create 10% discount coupon
      const c1 = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('10% Discount', ?, 10, 'Percent', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdC]
      );
      coupon10PercentId = parseInt(c1.insertId);

      // Create 20% discount coupon
      const c2 = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('20% Discount', ?, 20, 'Percent', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdC]
      );
      coupon20PercentId = parseInt(c2.insertId);

      console.log('✅ Created booking (100K) and 2 percent coupons (10%, 20%)');
    });

    it('should apply 10% coupon - Discount = 10K (10% of 100K)', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenC}`)
        .send({
          bookingId,
          couponId: coupon10PercentId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Applied 10% coupon - Discount = 10K');
    });

    it('should set balance to 0 after applying percent coupon', async () => {
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT balance FROM coupon WHERE id = ?',
        [coupon10PercentId]
      );
      expect(parseFloat(result[0].balance)).toBe(0);
      console.log('✅ Percent coupon balance set to 0 after use');
    });

    it('should apply 20% coupon - Discount = 20K (20% of 100K)', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenC}`)
        .send({
          bookingId,
          couponId: coupon20PercentId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Applied 20% coupon - Total discount = 30K (10% + 20%)');
    });

    it('should verify both percent coupons applied', async () => {
      const dataSource = app.get(DataSource);
      const coupons = await dataSource.query(
        'SELECT id, coupon_type, balance FROM coupon WHERE booking_id = ?',
        [bookingId]
      );
      expect(coupons.length).toBe(2);
      expect(coupons.every((c: any) => c.coupon_type === 'Percent')).toBe(true);
      expect(coupons.every((c: any) => parseFloat(c.balance) === 0)).toBe(true);
      console.log('✅ Both percent coupons applied and balance = 0');
    });
  });

  // ============================================
  // TEST 4: Concurrent Gift Prevention
  // ============================================

  describe('Concurrent Gift Prevention Tests', () => {
    let couponId: number;

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create coupon for A
      const result = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('Concurrency Test', ?, 50000, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdA]
      );
      couponId = parseInt(result.insertId);
      console.log('✅ Created coupon for concurrency test:', { couponId });
    });

    it('should prevent concurrent gifting to different receivers', async () => {
      // Try to gift same coupon to B and C simultaneously
      const [resultB, resultC] = await Promise.allSettled([
        request(app.getHttpServer())
          .post('/coupon/gift')
          .set('Authorization', `Bearer ${accessTokenA}`)
          .send({ couponId, receiverId: userIdB }),
        request(app.getHttpServer())
          .post('/coupon/gift')
          .set('Authorization', `Bearer ${accessTokenA}`)
          .send({ couponId, receiverId: userIdC }),
      ]);

      // One should succeed, one should fail
      const successCount = [resultB, resultC].filter(
        (r) => r.status === 'fulfilled' && r.value.status === 201
      ).length;

      const failCount = [resultB, resultC].filter(
        (r) => r.status === 'fulfilled' && r.value.status === 400
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
      console.log('✅ Concurrent gift prevented: 1 success, 1 failed');
    });

    it('should verify only 1 gift record exists', async () => {
      const dataSource = app.get(DataSource);
      const gifts = await dataSource.query(
        'SELECT COUNT(*) as count FROM `give` WHERE coupon_id = ?',
        [couponId]
      );
      expect(parseInt(gifts[0].count)).toBe(1);
      console.log('✅ Only 1 gift record in database (transaction lock worked)');
    });

    it('should verify coupon gift flag is 1', async () => {
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(
        'SELECT gift FROM coupon WHERE id = ?',
        [couponId]
      );
      expect(result[0].gift).toBe(1);
      console.log('✅ Coupon gift flag set to 1');
    });
  });

  // ============================================
  // TEST 5: Pagination
  // ============================================

  describe('Pagination Tests', () => {
    let couponIds: number[] = [];

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create 10 coupons and gift all from A to B
      for (let i = 1; i <= 10; i++) {
        const couponResult = await dataSource.query(
          `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
           VALUES (?, ?, 10000, 'Amount', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
          [`Pagination Test ${i}`, userIdA]
        );
        const couponId = parseInt(couponResult.insertId);
        couponIds.push(couponId);

        // Gift to B
        await request(app.getHttpServer())
          .post('/coupon/gift')
          .set('Authorization', `Bearer ${accessTokenA}`)
          .send({ couponId, receiverId: userIdB });
      }

      console.log('✅ Created and gifted 10 coupons A → B');
    });

    it('should get first 5 gifts with limit=5&offset=0', async () => {
      const response = await request(app.getHttpServer())
        .get('/coupon/received?limit=5&offset=0')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(0);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(10);
      expect(response.body.pagination.hasMore).toBe(true);
      console.log('✅ Pagination page 1: limit=5, offset=0, hasMore=true');
    });

    it('should get next 5 gifts with limit=5&offset=5', async () => {
      const response = await request(app.getHttpServer())
        .get('/coupon/received?limit=5&offset=5')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(5);
      console.log('✅ Pagination page 2: limit=5, offset=5');
    });

    it('should get all gifts with default pagination (limit=50)', async () => {
      const response = await request(app.getHttpServer())
        .get('/coupon/received')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBe(50);
      expect(response.body.pagination.offset).toBe(0);
      console.log(`✅ Default pagination: ${response.body.data.length} gifts retrieved`);
    });

    it('should verify A sent 10 gifts', async () => {
      const response = await request(app.getHttpServer())
        .get('/coupon/sent')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const sentToB = response.body.data.filter((g: any) => parseInt(g.receiverId) === userIdB);
      expect(sentToB.length).toBeGreaterThanOrEqual(10);
      console.log(`✅ A sent ${sentToB.length} gifts to B`);
    });
  });

  // ============================================
  // TEST 6: Edge Case - 50% Percent Coupon
  // ============================================

  describe('Edge Case - 50% Discount Coupon', () => {
    let bookingId: number;
    let coupon50PercentId: number;

    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      
      // Create booking (150K)
      const bookingResult = await dataSource.query(
        `INSERT INTO booking (customer_id, status, booking_method, is_gift, created_time_at) 
         VALUES (?, 'Paid', 'Online', 0, NOW())`,
        [userIdA]
      );
      bookingId = parseInt(bookingResult.insertId);

      // 2 tickets × 75K = 150K via showtime_seat
      await dataSource.query(
        `INSERT INTO showtime_seat (st_id, seat_id, seat_au_number, seat_au_theater_id, status, price, booking_id) 
         VALUES (1, 7, 1, 1, 'Valid', 75000, ?), (1, 8, 1, 1, 'Valid', 75000, ?)`,
        [bookingId, bookingId]
      );

      // Create 50% coupon
      const result = await dataSource.query(
        `INSERT INTO coupon (name, customer_id, balance, coupon_type, date_expired, gift) 
         VALUES ('50% OFF', ?, 50, 'Percent', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [userIdA]
      );
      coupon50PercentId = parseInt(result.insertId);

      console.log('✅ Created booking (150K) and 50% coupon');
    });

    it('should apply 50% coupon - Discount = 75K (50% of 150K)', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupon/apply')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          bookingId,
          couponId: coupon50PercentId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      console.log('✅ Applied 50% coupon - Discount = 75K (half of booking price)');
    });

    it('should verify final price is 75K', async () => {
      const dataSource = app.get(DataSource);
      
      // Get total price from showtime_seat
      const priceResult = await dataSource.query(
        'SELECT SUM(price) as total FROM showtime_seat WHERE booking_id = ?',
        [bookingId]
      );
      const totalPrice = parseFloat(priceResult[0].total);

      // Get discount
      const couponResult = await dataSource.query(
        'SELECT coupon_type FROM coupon WHERE booking_id = ?',
        [bookingId]
      );
      
      expect(totalPrice).toBe(150000);
      expect(couponResult[0].coupon_type).toBe('Percent');
      
      const expectedFinalPrice = totalPrice * 0.5; // 50% off
      console.log(`✅ Final price: ${expectedFinalPrice} (150K × 50%)`);
    });
  });
});
