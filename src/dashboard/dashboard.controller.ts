import { Controller, Get, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { DashboardService, OwnerStats, SystemStats } from './dashboard.service.js';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get system-wide statistics (Superadmin only)' })
    @ApiResponse({
        status: 200,
        description: 'Returns system statistics',
        schema: {
            type: 'object',
            properties: {
                totalUsers: { type: 'number' },
                totalVenues: { type: 'number' },
                totalHalls: { type: 'number' },
                totalBookings: { type: 'number' },
                totalRevenue: { type: 'number' },
                confirmedBookings: { type: 'number' },
                pendingBookings: { type: 'number' },
            },
        },
    })
    @ApiResponse({ status: 403, description: 'Superadmin access required' })
    async getSystemStats(): Promise<SystemStats> {
        return this.dashboardService.getSystemStats();
    }

    @Get('owner-stats')
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiOperation({ summary: "Get owner's venue statistics" })
    @ApiResponse({
        status: 200,
        description: 'Returns owner statistics',
        schema: {
            type: 'object',
            properties: {
                totalVenues: { type: 'number' },
                totalHalls: { type: 'number' },
                totalBookings: { type: 'number' },
                totalRevenue: { type: 'number' },
                confirmedBookings: { type: 'number' },
                pendingBookings: { type: 'number' },
                mostPopularHall: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        bookingCount: { type: 'number' },
                    },
                },
            },
        },
    })
    async getOwnerStats(@CurrentUser() user: User): Promise<OwnerStats> {
        return this.dashboardService.getOwnerStats(user.id);
    }
}
