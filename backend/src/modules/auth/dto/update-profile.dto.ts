import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from '../../user/entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Current password for verification', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  fname?: string;

  @ApiPropertyOptional({ description: 'Middle initial', example: 'A' })
  @IsOptional()
  @IsString()
  minit?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lname?: string;

  // Birthday is NOT allowed to be changed, so it's removed from UpdateProfileDto

  @ApiPropertyOptional({ description: 'Gender', enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'District', example: 'District 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  city?: string;
}
