import { IsInt, IsPositive } from 'class-validator';

export class ApplyCouponDto {
  @IsInt()
  @IsPositive()
  bookingId: number;

  @IsInt()
  @IsPositive()
  couponId: number;
}
