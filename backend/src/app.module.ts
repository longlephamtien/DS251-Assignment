import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/user/entities/user.entity';
import { Customer } from './modules/user/entities/customer.entity';
import { Staff } from './modules/user/entities/staff.entity';
import { Membership } from './modules/membership/entities/membership.entity';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RefundModule } from './modules/refund/refund.module';
import { GiftModule } from './modules/gift/gift.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { Coupon } from './modules/coupon/entities/coupon.entity';
import { Booking } from './modules/booking/entities/booking.entity';
import { Refund } from './modules/refund/entities/refund.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('database') as {
          host?: string;
          port?: number;
          username?: string;
          password?: string;
          database?: string;
          ca?: string;
        } | undefined;

        const ssl = db?.ca ? { ca: db.ca } : undefined;

        return {
          type: 'mysql' as const,
          host: db?.host,
          port: db?.port ?? 14127,
          username: db?.username,
          password: db?.password,
          database: db?.database,
          entities: [User, Customer, Staff, Membership, Coupon, Booking, Refund],
          synchronize: false,
          charset: 'utf8mb4',
          collation: 'utf8mb4_unicode_ci',
          extra: ssl ? { ssl } : {},
        };
      },
    }),
    AuthModule,
    BookingModule,
    PaymentModule,
    RefundModule,
    GiftModule,
    CouponModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}