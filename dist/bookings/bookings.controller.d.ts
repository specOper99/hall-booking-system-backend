import { User } from '../users/entities/user.entity.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: User, createBookingDto: CreateBookingDto): Promise<Booking>;
    findMyBookings(user: User): Promise<Booking[]>;
    findByHall(hallId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, user: User, updateStatusDto: UpdateBookingStatusDto): Promise<Booking>;
    cancelBooking(id: string, user: User): Promise<Booking>;
}
