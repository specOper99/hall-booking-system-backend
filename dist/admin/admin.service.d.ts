import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Venue } from '../venues/entities/venue.entity.js';
import { RejectVenueDto, UpdatePlatformSettingsDto, UpdateUserDto } from './dto/index.js';
import { PlatformSettings } from './entities/platform-settings.entity.js';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class AdminService {
    private readonly userRepository;
    private readonly venueRepository;
    private readonly settingsRepository;
    constructor(userRepository: Repository<User>, venueRepository: Repository<Venue>, settingsRepository: Repository<PlatformSettings>);
    findAllUsers(filters?: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<PaginatedResult<User>>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    findPendingVenues(): Promise<Venue[]>;
    approveVenue(venueId: string): Promise<Venue>;
    rejectVenue(venueId: string, rejectDto: RejectVenueDto): Promise<Venue>;
    getSettings(): Promise<PlatformSettings>;
    updateSettings(updateDto: UpdatePlatformSettingsDto): Promise<PlatformSettings>;
}
