import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('seat')
export class Seat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'au_number' })
    auNumber: number;

    @Column({ name: 'au_theater_id' })
    auTheaterId: number;

    @Column({ name: 'row_char', length: 1 })
    rowChar: string;

    @Column({ name: 'column_number' })
    columnNumber: number;

    @Column({ length: 50 })
    type: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
}
