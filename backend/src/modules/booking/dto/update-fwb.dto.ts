import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, Min } from 'class-validator';

class FwbItemDto {
  @ApiProperty({ example: 1, description: 'ID of the food or beverage item' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateFwbDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  bookingId: number;

  @ApiProperty({ type: [FwbItemDto] })
  @IsArray()
  items: FwbItemDto[];
}
