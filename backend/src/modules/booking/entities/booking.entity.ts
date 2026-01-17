import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,OneToMany } from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
@Entity('booking')
export class Booking {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'customer_id', type: 'bigint' })
  customerId: number;

  @Column({ length: 50 })
  status: string;

  @Column({ type: 'tinyint', default: 0 })
  is_gift: number;

  @CreateDateColumn({ name: 'created_time_at', type: 'timestamp' })
  createdTimeAt: Date;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => Coupon, (coupon) => coupon.customer)
coupons: Coupon[]
}