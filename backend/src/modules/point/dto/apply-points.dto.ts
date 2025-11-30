import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ApplyPointsDto {
  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(10, { message: 'Minimum 10 points required for redemption' })
  pointsToUse: number;
}
