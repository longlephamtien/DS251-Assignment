import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movies')
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    duration: number;

    @Column({ name: 'release_date' })
    releaseDate: Date;

    @Column({ name: 'end_date', nullable: true })
    endDate: Date;

    @Column({ name: 'age_rating' })
    ageRating: string;

    @Column({ name: 'poster_url', nullable: true })
    posterUrl: string;

    @Column({ name: 'poster_file', nullable: true })
    posterFile: string;

    @Column({ nullable: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'trailer_url', nullable: true })
    trailerUrl: string;
}
