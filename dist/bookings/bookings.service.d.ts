import { DataSource, Repository } from 'typeorm';
import { HallsService } from '../halls/halls.service.js';
import { BookingQueryDto, CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';
export interface PaginatedBookings {
    data: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly hallsService;
    private readonly dataSource;
    constructor(bookingRepository: Repository<Booking>, hallsService: HallsService, dataSource: DataSource);
    create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking>;
    findByHall(hallId: string): Promise<Booking[]>;
    findAllForOwner(ownerId: string, query: BookingQueryDto): Promise<PaginatedBookings>;
    findByUser(userId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, userId: string, updateStatusDto: UpdateBookingStatusDto): Promise<Booking>;
    cancelByUser(id: string, userId: string): Promise<Booking>;
    private validateStatusTransition;
}
