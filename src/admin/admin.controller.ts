import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Venue } from '../venues/entities/venue.entity.js';
import { AdminService, PaginatedResult } from './admin.service.js';
import {
    RejectVenueDto,
    UpdatePlatformSettingsDto,
    UpdateUserDto,
} from './dto/index.js';
import { PlatformSettings } from './entities/platform-settings.entity.js';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ==================== USER MANAGEMENT ====================

    @Get('users')
    @ApiOperation({ summary: 'List all users (Superadmin only)' })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({
        status: 200,
        description: 'Returns paginated list of users',
    })
    async findAllUsers(
        @Query('role') role?: UserRole,
        @Query('isActive') isActive?: string,
    ): Promise<PaginatedResult<User>> {
        const filters: { role?: UserRole; isActive?: boolean } = {};
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        return this.adminService.findAllUsers(filters);
    }

    @Patch('users/:id')
    @ApiOperation({ summary: 'Update user (ban/unban, change role)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.adminService.updateUser(id, updateUserDto);
    }

    // ==================== VENUE APPROVAL ====================

    @Get('venues/pending')
    @ApiOperation({ summary: 'List pending venues for approval' })
    @ApiResponse({ status: 200, description: 'Returns pending venues' })
    async findPendingVenues(): Promise<Venue[]> {
        return this.adminService.findPendingVenues();
    }

    @Patch('venues/:id/approve')
    @ApiOperation({ summary: 'Approve a pending venue' })
    @ApiResponse({ status: 200, description: 'Venue approved successfully' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    @ApiResponse({ status: 403, description: 'Venue is not pending' })
    async approveVenue(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Venue> {
        return this.adminService.approveVenue(id);
    }

    @Patch('venues/:id/reject')
    @ApiOperation({ summary: 'Reject a pending venue' })
    @ApiResponse({ status: 200, description: 'Venue rejected successfully' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    @ApiResponse({ status: 403, description: 'Venue is not pending' })
    async rejectVenue(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() rejectDto: RejectVenueDto,
    ): Promise<Venue> {
        return this.adminService.rejectVenue(id, rejectDto);
    }

    // ==================== PLATFORM SETTINGS ====================

    @Get('settings')
    @ApiOperation({ summary: 'Get platform settings' })
    @ApiResponse({ status: 200, description: 'Returns platform settings' })
    async getSettings(): Promise<PlatformSettings> {
        return this.adminService.getSettings();
    }

    @Patch('settings')
    @ApiOperation({ summary: 'Update platform settings' })
    @ApiResponse({ status: 200, description: 'Settings updated successfully' })
    async updateSettings(
        @Body() updateDto: UpdatePlatformSettingsDto,
    ): Promise<PlatformSettings> {
        return this.adminService.updateSettings(updateDto);
    }
}
