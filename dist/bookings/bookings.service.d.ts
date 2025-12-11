import { DataSource, Repository } from 'typeorm';
import { HallsService } from '../halls/halls.service.js';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly hallsService;
    private readonly dataSource;
    constructor(bookingRepository: Repository<Booking>, hallsService: HallsService, dataSource: DataSource);
    create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking>;
    findByHall(hallId: string): Promise<Booking[]>;
    findByUser(userId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, userId: string, updateStatusDto: UpdateBookingStatusDto): Promise<Booking>;
    cancelByUser(id: string, userId: string): Promise<Booking>;
    private validateStatusTransition;
}
