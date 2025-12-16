import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
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
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto/index.js';
import { Venue } from './entities/venue.entity.js';
import { PaginatedResult, VenuesService } from './venues.service.js';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new venue' })
    @ApiResponse({ status: 201, description: 'Venue created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - OWNER role required' })
    async create(
        @CurrentUser() user: User,
        @Body() createVenueDto: CreateVenueDto,
    ): Promise<Venue> {
        return this.venuesService.create(user.id, createVenueDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all venues with filtering and pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated venues list' })
    async findAll(@Query() query: VenueQueryDto): Promise<PaginatedResult<Venue>> {
        return this.venuesService.findAll(query);
    }

    @Get('my-venues')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get venues owned by current user' })
    @ApiResponse({ status: 200, description: 'Returns user venues' })
    async findMyVenues(@CurrentUser() user: User): Promise<Venue[]> {
        return this.venuesService.findByOwner(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get venue by ID' })
    @ApiResponse({ status: 200, description: 'Returns venue details' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Venue> {
        return this.venuesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update venue (owner only)' })
    @ApiResponse({ status: 200, description: 'Venue updated successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() updateVenueDto: UpdateVenueDto,
    ): Promise<Venue> {
        return this.venuesService.update(id, user.id, user.role, updateVenueDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete venue (owner only)' })
    @ApiResponse({ status: 200, description: 'Venue deleted successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string }> {
        await this.venuesService.remove(id, user.id, user.role);
        return { message: 'Venue deleted successfully' };
    }
}
