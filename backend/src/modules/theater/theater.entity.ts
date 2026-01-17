import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('theater')
export class Theater {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    street: string;

    @Column()
    district: string;

    @Column()
    city: string;

    @Column({ nullable: true })
    image: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
