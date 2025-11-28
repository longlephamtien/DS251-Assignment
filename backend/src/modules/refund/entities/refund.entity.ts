import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';

@Entity('refund')
export class Refund {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @PrimaryColumn({ type: 'bigint', name: 'booking_id' })
  bookingId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @Column({ length: 255, default: 'Requested' })
  status: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_time_at' })
  createdTimeAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'processed_time_at' })
  processedTimeAt: Date;

  @Column({ name: 'coupon_id', type: 'bigint', nullable: true })
  couponId: number;

  // Relationships
  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @OneToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}
