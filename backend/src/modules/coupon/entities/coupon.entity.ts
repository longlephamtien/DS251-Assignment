import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Exclude } from 'class-transformer';

export enum CouponType {
    AMOUNT = 'Amount',
    PERCENT = 'Percent',
    GIFTCARD = 'GiftCard',
}

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'tinyint', default: 0 })
  gift: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({
    type: 'enum',
    enum: CouponType,
    name: 'coupon_type',
  })
  couponType: CouponType;

  @Column({ type: 'date', nullable: true, name: 'date_expired' })
  dateExpired: Date;

  @Column({ name: 'booking_id', type: 'bigint', nullable: true })
  bookingId: number;

  @Column({ name: 'customer_id', type: 'bigint', nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.coupons)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Booking, (booking) => booking.coupons)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}