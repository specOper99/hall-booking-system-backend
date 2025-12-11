import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Venue, VenueStatus } from '../venues/entities/venue.entity.js';
import {
    RejectVenueDto,
    UpdatePlatformSettingsDto,
    UpdateUserDto,
} from './dto/index.js';
import { PlatformSettings } from './entities/platform-settings.entity.js';

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
        @InjectRepository(PlatformSettings)
        private readonly settingsRepository: Repository<PlatformSettings>,
    ) { }

    // ==================== USER MANAGEMENT ====================

    async findAllUsers(filters?: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<PaginatedResult<User>> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (filters?.role) {
            queryBuilder.andWhere('user.role = :role', { role: filters.role });
        }

        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }

        queryBuilder.orderBy('user.createdAt', 'DESC');

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page: 1,
            limit: total,
            totalPages: 1,
        };
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }

        // Prevent modifying superadmin
        if (user.role === UserRole.SUPERADMIN && updateUserDto.role && updateUserDto.role !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Cannot change role of superadmin');
        }

        // Apply updates
        if (updateUserDto.name !== undefined) {
            user.fullName = updateUserDto.name;
        }
        if (updateUserDto.role !== undefined) {
            user.role = updateUserDto.role;
        }
        if (updateUserDto.isActive !== undefined) {
            user.isActive = updateUserDto.isActive;
        }

        await this.userRepository.save(user);
        return user;
    }

    // ==================== VENUE APPROVAL ====================

    async findPendingVenues(): Promise<Venue[]> {
        return this.venueRepository.find({
            where: { status: VenueStatus.PENDING },
            relations: ['owner'],
            order: { createdAt: 'ASC' },
        });
    }

    async approveVenue(venueId: string): Promise<Venue> {
        const venue = await this.venueRepository.findOne({
            where: { id: venueId },
            relations: ['owner'],
        });

        if (!venue) {
            throw new NotFoundException(`Venue with ID "${venueId}" not found`);
        }

        if (venue.status !== VenueStatus.PENDING) {
            throw new ForbiddenException(
                `Venue is not pending approval (current status: ${venue.status})`,
            );
        }

        venue.status = VenueStatus.ACTIVE;
        venue.rejectionReason = undefined;
        await this.venueRepository.save(venue);

        return venue;
    }

    async rejectVenue(
        venueId: string,
        rejectDto: RejectVenueDto,
    ): Promise<Venue> {
        const venue = await this.venueRepository.findOne({
            where: { id: venueId },
            relations: ['owner'],
        });

        if (!venue) {
            throw new NotFoundException(`Venue with ID "${venueId}" not found`);
        }

        if (venue.status !== VenueStatus.PENDING) {
            throw new ForbiddenException(
                `Venue is not pending approval (current status: ${venue.status})`,
            );
        }

        venue.status = VenueStatus.REJECTED;
        venue.rejectionReason = rejectDto.reason;
        await this.venueRepository.save(venue);

        return venue;
    }

    // ==================== PLATFORM SETTINGS ====================

    async getSettings(): Promise<PlatformSettings> {
        let settings = await this.settingsRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' },
        });

        // Create default settings if none exist
        if (!settings) {
            settings = this.settingsRepository.create({
                commissionRate: 10,
                maintenanceMode: false,
                maxBookingsPerUser: 50,
            });
            await this.settingsRepository.save(settings);
        }

        return settings;
    }

    async updateSettings(
        updateDto: UpdatePlatformSettingsDto,
    ): Promise<PlatformSettings> {
        const settings = await this.getSettings();

        if (updateDto.commissionRate !== undefined) {
            settings.commissionRate = updateDto.commissionRate;
        }
        if (updateDto.maintenanceMode !== undefined) {
            settings.maintenanceMode = updateDto.maintenanceMode;
        }
        if (updateDto.maxBookingsPerUser !== undefined) {
            settings.maxBookingsPerUser = updateDto.maxBookingsPerUser;
        }

        await this.settingsRepository.save(settings);
        return settings;
    }
}
