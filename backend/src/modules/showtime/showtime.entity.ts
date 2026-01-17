import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('showtime')
export class Showtime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'movie_id' })
    movieId: number;

    @Column({ name: 'auditorium_id' })
    auditoriumId: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;
}
