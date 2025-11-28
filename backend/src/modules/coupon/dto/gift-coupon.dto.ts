import { IsInt, IsPositive } from 'class-validator';

export class GiftCouponDto {
  @IsInt()
  @IsPositive()
  couponId: number;

  @IsInt()
  @IsPositive()
  receiverId: number;
}
