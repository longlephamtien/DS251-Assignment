import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('membership')
export class Membership {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'tier_name' })
  tierName: string;

  @Column({ type: 'int', unique: true, name: 'min_point' })
  minPoint: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, unique: true })
  discount: number;
}
