import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Venue } from '../venues/entities/venue.entity.js';
import { AdminService, PaginatedResult } from './admin.service.js';
import { RejectVenueDto, UpdatePlatformSettingsDto, UpdateUserDto } from './dto/index.js';
import { PlatformSettings } from './entities/platform-settings.entity.js';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    findAllUsers(role?: UserRole, isActive?: string): Promise<PaginatedResult<User>>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    findPendingVenues(): Promise<Venue[]>;
    approveVenue(id: string): Promise<Venue>;
    rejectVenue(id: string, rejectDto: RejectVenueDto): Promise<Venue>;
    getSettings(): Promise<PlatformSettings>;
    updateSettings(updateDto: UpdatePlatformSettingsDto): Promise<PlatformSettings>;
}
