import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  fname: string;

  @ApiProperty({ description: 'User last name' })
  lname: string;

  @ApiProperty({ description: 'User type (customer or staff)' })
  userType: string;
}
