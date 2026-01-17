import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Customer } from './customer.entity';
import { Staff } from './staff.entity';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  fname: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  minit: string | null;

  @Column({ type: 'varchar', length: 255 })
  lname: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer?: Customer;

  @OneToOne(() => Staff, (staff) => staff.user)
  staff?: Staff;
}
