import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  gift?: number;

  @IsNumber()
  balance: number;

  @IsEnum(CouponType)
  couponType: CouponType;

  @IsDateString()
  @IsOptional()
  dateExpired?: Date;

  @IsNumber()
  @IsOptional()
  bookingId?: number;

  @IsNumber()
  @IsOptional()
  customerId?: number;
}