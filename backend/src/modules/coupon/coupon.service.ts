import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GiftCouponDto } from './dto/gift-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    private dataSource: DataSource,
  ) {}

  create(createCouponDto: CreateCouponDto) {
    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  findAll() {
    return this.couponRepository.find();
  }

  findOne(id: number) {
    return this.couponRepository.findOne({ where: { id } });
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return this.couponRepository.update(id, updateCouponDto);
  }

  remove(id: number) {
    return this.couponRepository.delete(id);
  }

  /**
   * A. Gift Coupon - Transfer coupon ownership to another customer
   */
  async giftCoupon(senderId: number, giftCouponDto: GiftCouponDto) {
    const { couponId, receiverId } = giftCouponDto;

    // Call stored procedure (all validation done in SP)
    await this.dataSource.query(
      'CALL sp_gift_coupon(?, ?, ?, @p_success, @p_message, @p_sender_name, @p_receiver_name)',
      [couponId, senderId, receiverId]
    );

    // Get output parameters
    const result = await this.dataSource.query(
      'SELECT @p_success as success, @p_message as message, @p_sender_name as senderName, @p_receiver_name as receiverName'
    );
    const output = result[0];

    // MySQL OUT parameter returns STRING: '1' = success, '0' = error
    if (output.success === '0' || output.success === 0 || !output.success) {
      throw new BadRequestException(output.message || 'Gift coupon failed');
    }

    return {
      couponId,
      senderId,
      receiverId,
      senderName: output.senderName,
      receiverName: output.receiverName,
      giftedAt: new Date(),
    };
  }

  /**
   * B. Apply Coupon - Apply a coupon to a booking
   */
  async applyCoupon(customerId: number, applyCouponDto: ApplyCouponDto) {
    const { bookingId, couponId } = applyCouponDto;

    // Call stored procedure
    await this.dataSource.query(
      'CALL sp_apply_coupon(?, ?, ?, @p_success, @p_message)',
      [bookingId, couponId, customerId]
    );

    // Get output parameters
    const result = await this.dataSource.query(
      'SELECT @p_success as success, @p_message as message'
    );
    const output = result[0];

    // MySQL OUT parameter returns STRING: '1' = success, '0' = error
    if (output.success === '0' || output.success === 0 || !output.success) {
      throw new BadRequestException(output.message || 'Apply coupon failed');
    }

    // Get coupon details
    const couponResult = await this.dataSource.query(
      'SELECT balance, coupon_type FROM coupon WHERE id = ?',
      [couponId]
    );
    const couponInfo = couponResult[0];

    return {
      bookingId,
      couponId,
      balance: couponInfo?.balance,
      couponType: couponInfo?.coupon_type,
      appliedAt: new Date(),
    };
  }

  /**
   * Get received coupon gifts for current customer
   */
  async getReceivedCouponGifts(customerId: number, limit = 50, offset = 0) {
    // Get total count
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total
      FROM \`give\` g
      WHERE g.receiver_id = ?`,
      [customerId]
    );
    const total = parseInt(countResult[0].total);

    // Get paginated gifts
    const gifts = await this.dataSource.query(
      `SELECT 
        g.coupon_id as couponId,
        g.sender_id as senderId,
        CONCAT(u.fname, ' ', u.lname) as senderName,
        c.balance,
        c.coupon_type as couponType,
        c.date_expired as expiryDate
      FROM \`give\` g
      INNER JOIN customer sender ON g.sender_id = sender.user_id
      INNER JOIN User u ON sender.user_id = u.id
      INNER JOIN coupon c ON g.coupon_id = c.id
      WHERE g.receiver_id = ?
      ORDER BY g.coupon_id DESC
      LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    return {
      data: gifts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get all coupons owned by customer (my coupons)
   * Calls sp_get_customer_coupons stored procedure
   */
  async getMyCoupons(customerId: number) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_customer_coupons(?)',
        [customerId]
      );

      // SP returns array of coupons as first result set
      const coupons = result[0] || [];

      // Categorize coupons by state
      const available = coupons.filter((c: any) => c.couponState === 'Available');
      const used = coupons.filter((c: any) => c.couponState === 'Used');
      const expired = coupons.filter((c: any) => c.couponState === 'Expired');

      return {
        coupons: coupons.map((coupon: any) => ({
          couponId: coupon.couponId,
          couponCode: coupon.couponCode,
          couponType: coupon.couponType,
          balance: parseFloat(coupon.balance) || 0,
          expiryDate: coupon.expiryDate,
          state: coupon.couponState,
          isGifted: coupon.isGifted === 1,
        })),
        summary: {
          total: coupons.length,
          available: available.length,
          used: used.length,
          expired: expired.length,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.sqlMessage || error.message || 'Failed to get coupons'
      );
    }
  }

  /**
   * Get sent coupon gifts by current customer
   */
  async getSentCouponGifts(customerId: number, limit = 50, offset = 0) {
    // Get total count
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total
      FROM \`give\` g
      WHERE g.sender_id = ?`,
      [customerId]
    );
    const total = parseInt(countResult[0].total);

    // Get paginated gifts
    const gifts = await this.dataSource.query(
      `SELECT 
        g.coupon_id as couponId,
        g.receiver_id as receiverId,
        CONCAT(u.fname, ' ', u.lname) as receiverName,
        c.balance,
        c.coupon_type as couponType,
        c.date_expired as expiryDate
      FROM \`give\` g
      INNER JOIN customer receiver ON g.receiver_id = receiver.user_id
      INNER JOIN User u ON receiver.user_id = u.id
      INNER JOIN coupon c ON g.coupon_id = c.id
      WHERE g.sender_id = ?
      ORDER BY g.coupon_id DESC
      LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    return {
      data: gifts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
}