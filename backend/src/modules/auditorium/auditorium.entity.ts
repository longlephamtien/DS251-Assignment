import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('auditorium')
export class Auditorium {
    @PrimaryColumn({ type: 'int' })
    number: number;

    @PrimaryColumn({ type: 'bigint', name: 'theater_id' })
    theater_id: number;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'int' })
    capacity: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
