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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Halls relation will be added when Hall entity is created
    halls?: unknown[];
}
