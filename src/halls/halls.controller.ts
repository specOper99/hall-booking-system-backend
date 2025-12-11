import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
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
import { CreateHallDto, UpdateHallDto } from './dto/index.js';
import { Hall } from './entities/hall.entity.js';
import { HallsService } from './halls.service.js';

@ApiTags('Halls')
@Controller('halls')
export class HallsController {
    constructor(private readonly hallsService: HallsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new hall' })
    @ApiResponse({ status: 201, description: 'Hall created successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async create(
        @CurrentUser() user: User,
        @Body() createHallDto: CreateHallDto,
    ): Promise<Hall> {
        return this.hallsService.create(user.id, createHallDto);
    }

    @Get('venue/:venueId')
    @ApiOperation({ summary: 'List halls by venue' })
    @ApiResponse({ status: 200, description: 'Returns halls for the venue' })
    @ApiResponse({ status: 404, description: 'Venue not found' })
    async findByVenue(
        @Param('venueId', ParseUUIDPipe) venueId: string,
    ): Promise<Hall[]> {
        return this.hallsService.findByVenue(venueId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get hall by ID' })
    @ApiResponse({ status: 200, description: 'Returns hall details' })
    @ApiResponse({ status: 404, description: 'Hall not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Hall> {
        return this.hallsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update hall (venue owner only)' })
    @ApiResponse({ status: 200, description: 'Hall updated successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Hall not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() updateHallDto: UpdateHallDto,
    ): Promise<Hall> {
        return this.hallsService.update(id, user.id, updateHallDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete hall (venue owner only)' })
    @ApiResponse({ status: 200, description: 'Hall deleted successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Hall not found' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string }> {
        await this.hallsService.remove(id, user.id);
        return { message: 'Hall deleted successfully' };
    }
}
