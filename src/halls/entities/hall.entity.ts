import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity.js';

@Entity('halls')
export class Hall {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    venueId!: string;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venueId' })
    venue!: Venue;

    @Column()
    name!: string;

    @Column({ type: 'int' })
    capacity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    pricePerHour!: number;

    @Column({ type: 'jsonb', nullable: true })
    amenities!: Record<string, unknown>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
