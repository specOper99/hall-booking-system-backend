import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HallsService } from '../halls/halls.service.js';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/index.js';
import { Booking } from './entities/booking.entity.js';
import { BookingStatus } from './enums/booking-status.enum.js';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly hallsService: HallsService,
        private readonly dataSource: DataSource,
    ) { }

    async create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
        const { hallId, startTime, endTime } = createBookingDto;
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        // Verify hall exists and get price
        const hall = await this.hallsService.findOne(hallId);

        // Use transaction with SERIALIZABLE isolation for concurrency control
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE');

        try {
            // Check for overlapping bookings with row-level lock
            const overlappingBookings = await queryRunner.manager.query(
                `SELECT id FROM bookings 
         WHERE "hallId" = $1 
         AND status != $2
         AND "startTime" < $3 
         AND "endTime" > $4
         FOR UPDATE`,
                [hallId, BookingStatus.CANCELLED, endDate, startDate],
            );

            if (overlappingBookings.length > 0) {
                throw new ConflictException(
                    'The requested time slot is not available. Another booking already exists for this period.',
                );
            }

            // Calculate total price
            const durationHours = (endDate.getTime() - startDate.getTime()) / 3600000;
            const totalPrice = Number((durationHours * Number(hall.pricePerHour)).toFixed(2));

            // Create booking
            const booking = queryRunner.manager.create(Booking, {
                hallId,
                userId,
                startTime: startDate,
                endTime: endDate,
                status: BookingStatus.PENDING,
                totalPrice,
            });

            const savedBooking = await queryRunner.manager.save(booking);

            await queryRunner.commitTransaction();

            // Fetch with relations for response
            return this.findOne(savedBooking.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findByHall(hallId: string): Promise<Booking[]> {
        // Verify hall exists
        await this.hallsService.findOne(hallId);

        return this.bookingRepository.find({
            where: { hallId },
            relations: ['user'],
            order: { startTime: 'ASC' },
        });
    }

    async findByUser(userId: string): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { userId },
            relations: ['hall', 'hall.venue'],
            order: { startTime: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Booking> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['hall', 'hall.venue', 'user'],
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID "${id}" not found`);
        }

        return booking;
    }

    async updateStatus(
        id: string,
        userId: string,
        updateStatusDto: UpdateBookingStatusDto,
    ): Promise<Booking> {
        const booking = await this.findOne(id);

        // Verify user owns the venue
        if (booking.hall.venue.ownerId !== userId) {
            throw new ForbiddenException(
                'Only the venue owner can update booking status',
            );
        }

        // Validate status transitions
        this.validateStatusTransition(booking.status, updateStatusDto.status);

        booking.status = updateStatusDto.status;
        await this.bookingRepository.save(booking);

        return this.findOne(id);
    }

    async cancelByUser(id: string, userId: string): Promise<Booking> {
        const booking = await this.findOne(id);

        if (booking.userId !== userId) {
            throw new ForbiddenException('You can only cancel your own bookings');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new ConflictException('Booking is already cancelled');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new ConflictException('Cannot cancel a completed booking');
        }

        booking.status = BookingStatus.CANCELLED;
        await this.bookingRepository.save(booking);

        return this.findOne(id);
    }

    private validateStatusTransition(
        currentStatus: BookingStatus,
        newStatus: BookingStatus,
    ): void {
        const validTransitions: Record<BookingStatus, BookingStatus[]> = {
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
            [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
            [BookingStatus.CANCELLED]: [],
            [BookingStatus.COMPLETED]: [],
        };

        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new ConflictException(
                `Cannot transition from ${currentStatus} to ${newStatus}`,
            );
        }
    }
}
