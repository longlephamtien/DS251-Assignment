import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { Booking } from '../../booking/entities/booking.entity';

@Entity('send_gift')
export class SendGift {
  @PrimaryColumn({ name: 'booking_id', type: 'bigint' })
  bookingId: number;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'bigint' })
  receiverId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'sender_id' })
  sender: Customer;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Customer;
}