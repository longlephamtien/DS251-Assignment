import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user by calling stored procedure
   * The procedure will hash the password and create customer record via trigger
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const {
      fname,
      minit,
      lname,
      email,
      password,
      birthday,
      gender,
      district,
      city,
    } = registerDto;

    // Hash password before sending to database
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Call stored procedure sp_register_user
      await this.dataSource.query(
        `CALL sp_register_user(?, ?, ?, ?, ?, ?, ?, ?, ?, @user_id, @success, @message)`,
        [
          fname,
          minit || null,
          lname,
          email,
          hashedPassword,
          birthday || null,
          gender || 'Other',
          district || null,
          city || null,
        ],
      );

      // Get output parameters in separate query
      const result = await this.dataSource.query(
        `SELECT @user_id as userId, @success as success, @message as message`
      );

      const output = result[0];
      
      console.log('Stored procedure output:', output); // Debug log

      // Convert success from TINYINT/string to boolean
      const success = output.success === 1 || output.success === '1' || output.success === true;

      if (!success) {
        if (output.message === 'Email already registered') {
          throw new ConflictException(output.message);
        }
        throw new InternalServerErrorException(output.message);
      }

      // Only throw if userId is null or undefined
      if (!output.userId) {
        throw new InternalServerErrorException('Registration failed: No userId returned');
      }

      // Generate JWT token
      const payload = { sub: output.userId, email, type: 'customer' };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        userId: output.userId,
        email,
        fname,
        lname,
        userType: 'customer',
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Registration error:', error);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Login user by calling stored procedure
   * The procedure retrieves user data and we verify password
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    try {
      // Call stored procedure sp_login_user (1 IN, 6 OUT)
      await this.dataSource.query(
        `CALL sp_login_user(?, @user_id, @password, @fname, @lname, @success, @message)`,
        [email],
      );

      // Get output parameters in separate query
      const result = await this.dataSource.query(
        `SELECT @user_id as userId, @password as password, @fname as fname, @lname as lname, @success as success, @message as message`
      );

      const output = result[0];
      console.log('Login stored procedure output:', output); // Debug log

      // Convert success from TINYINT/string to boolean
      const success = output.success === 1 || output.success === '1' || output.success === true;

      if (!success) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify password using bcrypt (password comparison must be done in Node.js)
      const isPasswordValid = await bcrypt.compare(password, output.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Get user type (customer or staff)
      const userTypeResult = await this.dataSource.query(
        `SELECT 
          CASE 
            WHEN EXISTS(SELECT 1 FROM customer WHERE user_id = ?) THEN 'customer'
            WHEN EXISTS(SELECT 1 FROM staff WHERE user_id = ?) THEN 'staff'
            ELSE 'unknown'
          END as userType`,
        [output.userId, output.userId],
      );
      const userType = userTypeResult[0].userType;

      // Generate JWT token
      const payload = { sub: output.userId, email, type: userType };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        userId: output.userId,
        email,
        fname: output.fname,
        lname: output.lname,
        userType,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  /**
   * Get user profile by ID using stored procedure
   */
  async getProfile(userId: number) {
    try {
      const result = await this.dataSource.query(
        `CALL sp_get_user_by_id(?)`,
        [userId],
      );

      if (!result[0] || result[0].length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = result[0][0];
      // Remove password from response
      delete user.password;

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve profile');
    }
  }

  /**
   * Update user profile using stored procedure
   * Note: birthday is NOT allowed to be changed
   */
  async updateProfile(
    userId: number, 
    updateProfileDto: Omit<UpdateProfileDto, 'currentPassword'>, 
    currentPassword: string
  ) {
    const { fname, minit, lname, gender, district, city } = updateProfileDto;

    // Explicitly reject birthday updates
    if ('birthday' in updateProfileDto) {
      throw new BadRequestException('Birthday cannot be changed');
    }

    try {
      // Verify current password first
      await this.dataSource.query(
        `CALL sp_get_user_password(?, @password, @success, @message)`,
        [userId],
      );

      const passwordResult = await this.dataSource.query(
        `SELECT @password as password, @success as success, @message as message`
      );

      const passwordOutput = passwordResult[0];

      if (!passwordOutput.success || !passwordOutput.password) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, passwordOutput.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Now update the profile
      await this.dataSource.query(
        `CALL sp_update_user_profile(?, ?, ?, ?, ?, ?, ?, ?, @success, @message)`,
        [
          userId,
          fname || null,
          minit || null,
          lname || null,
          null, // birthday is not allowed to be changed
          gender || null,
          district || null,
          city || null,
        ],
      );

      // Get output parameters in separate query
      const result = await this.dataSource.query(
        `SELECT @success as success, @message as message`
      );

      const output = result[0];

      if (!output.success) {
        throw new InternalServerErrorException(output.message);
      }

      return { message: output.message };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  /**
   * Change user password using stored procedure
   * Verifies current password before updating
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      // Call stored procedure to get user password
      await this.dataSource.query(
        `CALL sp_get_user_password(?, @password, @success, @message)`,
        [userId],
      );

      // Get output parameters
      const passwordResult = await this.dataSource.query(
        `SELECT @password as password, @success as success, @message as message`
      );

      const passwordOutput = passwordResult[0];

      if (!passwordOutput.success || !passwordOutput.password) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, passwordOutput.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Call stored procedure to change password
      await this.dataSource.query(
        `CALL sp_change_password(?, ?, @success, @message)`,
        [userId, hashedPassword],
      );

      // Get output parameters
      const result = await this.dataSource.query(
        `SELECT @success as success, @message as message`
      );

      const output = result[0];

      if (!output.success) {
        throw new InternalServerErrorException(output.message);
      }

      return { message: output.message };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Change password error:', error);
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: number, email: string) {
    try {
      const result = await this.dataSource.query(
        `CALL sp_get_user_by_id(?)`,
        [userId],
      );

      if (!result[0] || result[0].length === 0) {
        return null;
      }

      const user = result[0][0];
      if (user.email !== email) {
        return null;
      }

      // Remove password from response
      delete user.password;
      return user;
    } catch (error) {
      return null;
    }
  }
}
