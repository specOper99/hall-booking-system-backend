"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const user_role_enum_js_1 = require("../users/enums/user-role.enum.js");
const venue_entity_js_1 = require("../venues/entities/venue.entity.js");
const platform_settings_entity_js_1 = require("./entities/platform-settings.entity.js");
let AdminService = class AdminService {
    userRepository;
    venueRepository;
    settingsRepository;
    constructor(userRepository, venueRepository, settingsRepository) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.settingsRepository = settingsRepository;
    }
    async findAllUsers(filters) {
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
    async updateUser(id, updateUserDto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (user.role === user_role_enum_js_1.UserRole.SUPERADMIN && updateUserDto.role && updateUserDto.role !== user_role_enum_js_1.UserRole.SUPERADMIN) {
            throw new common_1.ForbiddenException('Cannot change role of superadmin');
        }
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
    async findPendingVenues() {
        return this.venueRepository.find({
            where: { status: venue_entity_js_1.VenueStatus.PENDING },
            relations: ['owner'],
            order: { createdAt: 'ASC' },
        });
    }
    async approveVenue(venueId) {
        const venue = await this.venueRepository.findOne({
            where: { id: venueId },
            relations: ['owner'],
        });
        if (!venue) {
            throw new common_1.NotFoundException(`Venue with ID "${venueId}" not found`);
        }
        if (venue.status !== venue_entity_js_1.VenueStatus.PENDING) {
            throw new common_1.ForbiddenException(`Venue is not pending approval (current status: ${venue.status})`);
        }
        venue.status = venue_entity_js_1.VenueStatus.ACTIVE;
        venue.rejectionReason = undefined;
        await this.venueRepository.save(venue);
        return venue;
    }
    async rejectVenue(venueId, rejectDto) {
        const venue = await this.venueRepository.findOne({
            where: { id: venueId },
            relations: ['owner'],
        });
        if (!venue) {
            throw new common_1.NotFoundException(`Venue with ID "${venueId}" not found`);
        }
        if (venue.status !== venue_entity_js_1.VenueStatus.PENDING) {
            throw new common_1.ForbiddenException(`Venue is not pending approval (current status: ${venue.status})`);
        }
        venue.status = venue_entity_js_1.VenueStatus.REJECTED;
        venue.rejectionReason = rejectDto.reason;
        await this.venueRepository.save(venue);
        return venue;
    }
    async getSettings() {
        let settings = await this.settingsRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' },
        });
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
    async updateSettings(updateDto) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_js_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(venue_entity_js_1.Venue)),
    __param(2, (0, typeorm_1.InjectRepository)(platform_settings_entity_js_1.PlatformSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map