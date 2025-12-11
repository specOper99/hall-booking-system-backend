import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum VenueStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended',
}

@Entity('venues')
export class Venue {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    ownerId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ownerId' })
    owner!: User;

    @Column()
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column()
    address!: string;

    @Column('simple-array', { nullable: true })
    images!: string[];

    @Column({
        type: 'enum',
        enum: VenueStatus,
        default: VenueStatus.PENDING,
    })
    status!: VenueStatus;

    @Column({ type: 'text', nullable: true })
    rejectionReason?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Halls relation will be added when Hall entity is created
    halls?: unknown[];
}

