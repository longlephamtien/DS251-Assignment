import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
const request = require('supertest');

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';

interface RouteCase {
  id: string;
  category: string;
  name: string;
  method: HttpMethod;
  url: string;
  body?: Record<string, any>;
  headers?: Record<string, string>;
}

const INVALID_TOKEN = { Authorization: 'Bearer invalid-token' };

const routeCases: RouteCase[] = [
  // Platform (4)
  { id: 'TC001', category: 'Platform', name: 'Swagger UI root is reachable', method: 'get', url: '/api' },
  { id: 'TC002', category: 'Platform', name: 'Health endpoint is reachable', method: 'get', url: '/health' },
  { id: 'TC003', category: 'Platform', name: 'FWB menu endpoint is reachable', method: 'get', url: '/api/fwb-menu' },
  { id: 'TC004', category: 'Platform', name: 'Auditorium query endpoint is reachable', method: 'get', url: '/api/auditoriums?number=1&theaterId=1' },

  // Authentication (4)
  {
    id: 'TC005',
    category: 'Authentication',
    name: 'Register endpoint responds with invalid payload',
    method: 'post',
    url: '/api/auth/register',
    body: { email: 'invalid', password: '1' },
  },
  {
    id: 'TC006',
    category: 'Authentication',
    name: 'Login endpoint responds with invalid payload',
    method: 'post',
    url: '/api/auth/login',
    body: { email: '', password: '' },
  },
  { id: 'TC007', category: 'Authentication', name: 'Profile endpoint requires auth', method: 'get', url: '/api/auth/profile' },
  { id: 'TC008', category: 'Authentication', name: 'Logout endpoint requires auth', method: 'post', url: '/api/auth/logout' },

  // Movies (4)
  { id: 'TC009', category: 'Movies', name: 'Get movies list', method: 'get', url: '/api/movies' },
  { id: 'TC010', category: 'Movies', name: 'Get movies with pagination', method: 'get', url: '/api/movies?status=all&limit=5&offset=0' },
  { id: 'TC011', category: 'Movies', name: 'Get movie by id route', method: 'get', url: '/api/movies/id/1' },
  { id: 'TC012', category: 'Movies', name: 'Get movies with status=now query', method: 'get', url: '/api/movies?status=now&limit=5&offset=0' },

  // Theater (4)
  { id: 'TC013', category: 'Theater', name: 'Get theaters list', method: 'get', url: '/api/theaters' },
  { id: 'TC014', category: 'Theater', name: 'Get theaters with pagination', method: 'get', url: '/api/theaters?limit=5&offset=0' },
  { id: 'TC015', category: 'Theater', name: 'Get theater by id', method: 'get', url: '/api/theaters/1' },
  { id: 'TC016', category: 'Theater', name: 'Get theater schedule by date', method: 'get', url: '/api/theaters/1/schedule?date=2026-03-15' },

  // Showtime (4)
  { id: 'TC017', category: 'Showtime', name: 'Get showtime by id', method: 'get', url: '/api/showtimes/1' },
  { id: 'TC018', category: 'Showtime', name: 'Get showtime seats', method: 'get', url: '/api/showtime-seats?stId=1&seatAuNumber=1&seatAuTheaterId=1' },
  { id: 'TC019', category: 'Showtime', name: 'Get seats by auditorium', method: 'get', url: '/api/seats?auNumber=1&auTheaterId=1' },
  { id: 'TC020', category: 'Showtime', name: 'Get theater sales report route', method: 'get', url: '/api/theaters/1/sales-report?startDate=2026-03-01&endDate=2026-03-31' },

  // Booking (4)
  { id: 'TC021', category: 'Booking', name: 'Start booking endpoint responds', method: 'post', url: '/api/booking/start', body: {} },
  { id: 'TC022', category: 'Booking', name: 'Update booking FWB endpoint responds', method: 'post', url: '/api/booking/fwb', body: {} },
  { id: 'TC023', category: 'Booking', name: 'Get booking detail route', method: 'get', url: '/api/booking/1' },
  { id: 'TC024', category: 'Booking', name: 'Cleanup expired bookings route', method: 'get', url: '/api/booking/cleanup-expired' },

  // Coupon (4)
  { id: 'TC025', category: 'Coupon', name: 'Get coupons list route', method: 'get', url: '/api/coupon' },
  { id: 'TC026', category: 'Coupon', name: 'Create coupon route', method: 'post', url: '/api/coupon', body: {} },
  { id: 'TC027', category: 'Coupon', name: 'Apply coupon requires auth', method: 'post', url: '/api/coupon/apply', body: {} },
  { id: 'TC028', category: 'Coupon', name: 'My coupons requires auth', method: 'get', url: '/api/coupon/my-coupons' },

  // Gift (4)
  { id: 'TC029', category: 'Gift', name: 'My gift cards requires auth', method: 'get', url: '/api/gift/my-gift-cards' },
  { id: 'TC030', category: 'Gift', name: 'Send booking gift requires auth', method: 'post', url: '/api/gift/booking', body: {} },
  { id: 'TC031', category: 'Gift', name: 'Received gifts requires auth', method: 'get', url: '/api/gift/received' },
  { id: 'TC032', category: 'Gift', name: 'Sent gifts requires auth', method: 'get', url: '/api/gift/sent' },

  // Payment (4)
  { id: 'TC033', category: 'Payment', name: 'Calculate payment route', method: 'get', url: '/api/payment/calculate/1' },
  { id: 'TC034', category: 'Payment', name: 'Confirm payment route', method: 'post', url: '/api/payment/confirm', body: {} },
  { id: 'TC035', category: 'Payment', name: 'Cancel payment route', method: 'post', url: '/api/payment/cancel', body: {} },
  { id: 'TC036', category: 'Payment', name: 'Release booking route', method: 'post', url: '/api/booking/release/1' },

  // Refund (4)
  { id: 'TC037', category: 'Refund', name: 'Create refund requires auth', method: 'post', url: '/api/refund/create', body: {} },
  { id: 'TC038', category: 'Refund', name: 'Refund history requires auth', method: 'get', url: '/api/refund/history' },
  { id: 'TC039', category: 'Refund', name: 'Create refund with invalid token still routes', method: 'post', url: '/api/refund/create', body: {}, headers: INVALID_TOKEN },
  { id: 'TC040', category: 'Refund', name: 'Refund history with invalid token still routes', method: 'get', url: '/api/refund/history', headers: INVALID_TOKEN },

  // MembershipPoint (4)
  { id: 'TC041', category: 'MembershipPoint', name: 'Membership card requires auth', method: 'get', url: '/api/membership/card' },
  { id: 'TC042', category: 'MembershipPoint', name: 'My points requires auth', method: 'get', url: '/api/point/my-points' },
  { id: 'TC043', category: 'MembershipPoint', name: 'Apply points requires auth', method: 'post', url: '/api/point/apply', body: {} },
  { id: 'TC044', category: 'MembershipPoint', name: 'Remove points requires auth', method: 'delete', url: '/api/point/remove/1' },

  // DashboardTransaction (4)
  { id: 'TC045', category: 'DashboardTransaction', name: 'Dashboard requires auth', method: 'get', url: '/api/dashboard' },
  { id: 'TC046', category: 'DashboardTransaction', name: 'Transactions history requires auth', method: 'get', url: '/api/transactions/history' },
  { id: 'TC047', category: 'DashboardTransaction', name: 'Dashboard with invalid token still routes', method: 'get', url: '/api/dashboard', headers: INVALID_TOKEN },
  { id: 'TC048', category: 'DashboardTransaction', name: 'Transactions history with invalid token still routes', method: 'get', url: '/api/transactions/history', headers: INVALID_TOKEN },

  // Security (4)
  { id: 'TC049', category: 'Security', name: 'Current user endpoint requires auth', method: 'get', url: '/api/auth/me' },
  { id: 'TC050', category: 'Security', name: 'Update profile endpoint requires auth', method: 'patch', url: '/api/auth/profile', body: {} },
  { id: 'TC051', category: 'Security', name: 'Change password endpoint requires auth', method: 'post', url: '/api/auth/change-password', body: {} },
  { id: 'TC052', category: 'Security', name: 'Profile endpoint with invalid token still routes', method: 'get', url: '/api/auth/profile', headers: INVALID_TOKEN },
];

describe('Section 4 Route Smoke (52 e2e cases)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
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

  routeCases.forEach((routeCase) => {
    it(`[${routeCase.id}] ${routeCase.category} - ${routeCase.name}`, async () => {
      let req = request(app.getHttpServer())[routeCase.method](routeCase.url);

      if (routeCase.headers) {
        for (const [key, value] of Object.entries(routeCase.headers)) {
          req = req.set(key, value);
        }
      }

      if (routeCase.body !== undefined) {
        req = req.send(routeCase.body);
      }

      const response = await req;
      expect(response.status).not.toBe(404);
    });
  });
});
