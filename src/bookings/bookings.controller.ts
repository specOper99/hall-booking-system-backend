import {
    Body,
    Controller,
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
import { BookingsService, PaginatedBookings } from './bookings.service.js';
import { BookingQueryDto, CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all bookings for owner venues' })
    @ApiResponse({ status: 200, description: 'Returns paginated bookings' })
    async findAll(
        @CurrentUser() user: User,
        @Query() query: BookingQueryDto,
    ): Promise<PaginatedBookings> {
        return this.bookingsService.findAllForOwner(user.id, query);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new booking' })
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 409, description: 'Time slot not available' })
    async create(
        @CurrentUser() user: User,
        @Body() createBookingDto: CreateBookingDto,
    ): Promise<Booking> {
        return this.bookingsService.create(user.id, createBookingDto);
    }

    @Get('my-bookings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user bookings' })
    @ApiResponse({ status: 200, description: 'Returns user bookings' })
    async findMyBookings(@CurrentUser() user: User): Promise<Booking[]> {
        return this.bookingsService.findByUser(user.id);
    }

    @Get('hall/:hallId')
    @ApiOperation({ summary: 'Get bookings for a hall (calendar view)' })
    @ApiResponse({ status: 200, description: 'Returns hall bookings' })
    @ApiResponse({ status: 404, description: 'Hall not found' })
    async findByHall(
        @Param('hallId', ParseUUIDPipe) hallId: string,
    ): Promise<Booking[]> {
        return this.bookingsService.findByHall(hallId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get booking by ID' })
    @ApiResponse({ status: 200, description: 'Returns booking details' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Booking> {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update booking status (venue owner only)' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    @ApiResponse({ status: 403, description: 'Not the venue owner' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    @ApiResponse({ status: 409, description: 'Invalid status transition' })
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
        @Body() updateStatusDto: UpdateBookingStatusDto,
    ): Promise<Booking> {
        return this.bookingsService.updateStatus(id, user.id, updateStatusDto);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel own booking' })
    @ApiResponse({ status: 200, description: 'Booking cancelled' })
    @ApiResponse({ status: 403, description: 'Not your booking' })
    @ApiResponse({ status: 409, description: 'Cannot cancel' })
    async cancelBooking(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Booking> {
        return this.bookingsService.cancelByUser(id, user.id);
    }
}
