import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('showtime_seat')
export class ShowtimeSeat {
    @PrimaryGeneratedColumn({ name: 'ticketid' })
    ticketId: number;

    @Column({ name: 'st_id' })
    stId: number;

    @Column({ name: 'seat_id' })
    seatId: number;

    @Column({ name: 'seat_au_number' })
    seatAuNumber: number;

    @Column({ name: 'seat_au_theater_id' })
    seatAuTheaterId: number;

    @Column({ length: 255 })
    status: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: number;
}
