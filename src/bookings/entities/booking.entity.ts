import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Hall } from '../../halls/entities/hall.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { BookingStatus } from '../enums/booking-status.enum.js';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    hallId!: string;

    @ManyToOne(() => Hall, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'hallId' })
    hall!: Hall;

    @Column()
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ type: 'timestamp with time zone' })
    startTime!: Date;

    @Column({ type: 'timestamp with time zone' })
    endTime!: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status!: BookingStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
