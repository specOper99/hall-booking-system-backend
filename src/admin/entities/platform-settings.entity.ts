import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
    commissionRate: number;

    @Column({ default: false })
    maintenanceMode: boolean;

    @Column({ default: 50 })
    maxBookingsPerUser: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
