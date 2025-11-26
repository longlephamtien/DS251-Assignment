import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Gender } from '../../user/entities/user.entity';

export class UpdateProfileDto {
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

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

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
