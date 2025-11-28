import { Entity, Column, PrimaryColumn } from 'typeorm';

// Auditorium type enum matching database ENUM
export enum AuditoriumType {
    TWO_D = '2D',
    SCREEN_X = 'ScreenX',
    IMAX = 'IMAX',
    FOUR_DX = '4DX'
}

@Entity('auditorium')
export class Auditorium {
    @PrimaryColumn({ type: 'int' })
    number: number;

    @PrimaryColumn({ type: 'bigint', name: 'theater_id' })
    theater_id: number;

    @Column({
        type: 'enum',
        enum: AuditoriumType,
        default: AuditoriumType.TWO_D
    })
    type: AuditoriumType;

    @Column({ type: 'int', default: 0 })
    capacity: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
