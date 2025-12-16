import { User } from '../users/entities/user.entity.js';
import { BookingsService, PaginatedBookings } from './bookings.service.js';
import { BookingQueryDto, CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(user: User, query: BookingQueryDto): Promise<PaginatedBookings>;
    create(user: User, createBookingDto: CreateBookingDto): Promise<Booking>;
    findMyBookings(user: User): Promise<Booking[]>;
    findByHall(hallId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, user: User, updateStatusDto: UpdateBookingStatusDto): Promise<Booking>;
    cancelBooking(id: string, user: User): Promise<Booking>;
}
