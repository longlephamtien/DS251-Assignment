import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Membership } from '../../membership/entities/membership.entity';

@Entity('customer')
export class Customer {
  @PrimaryColumn({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', default: 0, name: 'accumulated_points' })
  accumulatedPoints: number;

  @Column({ type: 'varchar', length: 255, name: 'membership_name' })
  membershipName: string;

  @OneToOne(() => User, (user) => user.customer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membership)
  @JoinColumn({ name: 'membership_name', referencedColumnName: 'tierName' })
  membership: Membership;
}
