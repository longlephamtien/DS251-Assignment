import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GiftCouponDto } from './dto/gift-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../utils/response.util';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  /**
   * A. Gift Coupon - Customer gifts coupon to another customer
   * POST /coupon/gift
   */
  @Post('gift')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async giftCoupon(
    @CurrentUser() user: any,
    @Body() giftCouponDto: GiftCouponDto,
  ) {
    const result = await this.couponService.giftCoupon(user.userId, giftCouponDto);
    return successResponse('Coupon gifted successfully', result);
  }

  /**
   * B. Apply Coupon - Customer applies coupon to booking
   * POST /coupon/apply
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async applyCoupon(
    @CurrentUser() user: any,
    @Body() applyCouponDto: ApplyCouponDto,
  ) {
    const result = await this.couponService.applyCoupon(user.userId, applyCouponDto);
    return successResponse('Coupon applied successfully', result);
  }

  /**
   * Get received coupon gifts
   * GET /coupon/received?limit=50&offset=0
   */
  @Get('received')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getReceivedCouponGifts(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.couponService.getReceivedCouponGifts(
      user.userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
    return successResponse('Received coupon gifts retrieved', result.data, result.data.length, result.pagination);
  }

  /**
   * Get sent coupon gifts
   * GET /coupon/sent?limit=50&offset=0
   */
  @Get('sent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getSentCouponGifts(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.couponService.getSentCouponGifts(
      user.userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
    return successResponse('Sent coupon gifts retrieved', result.data, result.data.length, result.pagination);
  }

  /**
   * Get my coupons - all coupons owned by customer
   * GET /coupon/my-coupons
   */
  @Get('my-coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getMyCoupons(@CurrentUser() user: any) {
    const result = await this.couponService.getMyCoupons(user.userId);
    return successResponse('My coupons retrieved successfully', result);
  }

  /**
   * CRUD operations - These must be AFTER specific routes to avoid conflicts
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}