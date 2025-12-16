"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const halls_service_js_1 = require("../halls/halls.service.js");
const booking_entity_js_1 = require("./entities/booking.entity.js");
const booking_status_enum_js_1 = require("./enums/booking-status.enum.js");
let BookingsService = class BookingsService {
    bookingRepository;
    hallsService;
    dataSource;
    constructor(bookingRepository, hallsService, dataSource) {
        this.bookingRepository = bookingRepository;
        this.hallsService = hallsService;
        this.dataSource = dataSource;
    }
    async create(userId, createBookingDto) {
        const { hallId, startTime, endTime } = createBookingDto;
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        const hall = await this.hallsService.findOne(hallId);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE');
        try {
            const overlappingBookings = await queryRunner.manager.query(`SELECT id FROM bookings 
         WHERE "hallId" = $1 
         AND status != $2
         AND "startTime" < $3 
         AND "endTime" > $4
         FOR UPDATE`, [hallId, booking_status_enum_js_1.BookingStatus.CANCELLED, endDate, startDate]);
            if (overlappingBookings.length > 0) {
                throw new common_1.ConflictException('The requested time slot is not available. Another booking already exists for this period.');
            }
            const durationHours = (endDate.getTime() - startDate.getTime()) / 3600000;
            const totalPrice = Number((durationHours * Number(hall.pricePerHour)).toFixed(2));
            const booking = queryRunner.manager.create(booking_entity_js_1.Booking, {
                hallId,
                userId,
                startTime: startDate,
                endTime: endDate,
                status: booking_status_enum_js_1.BookingStatus.PENDING,
                totalPrice,
            });
            const savedBooking = await queryRunner.manager.save(booking);
            await queryRunner.commitTransaction();
            return this.findOne(savedBooking.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findByHall(hallId) {
        await this.hallsService.findOne(hallId);
        return this.bookingRepository.find({
            where: { hallId },
            relations: ['user'],
            order: { startTime: 'ASC' },
        });
    }
    async findAllForOwner(ownerId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const qb = this.bookingRepository
            .createQueryBuilder('booking')
            .innerJoinAndSelect('booking.hall', 'hall')
            .innerJoinAndSelect('hall.venue', 'venue')
            .leftJoinAndSelect('booking.user', 'user')
            .where('venue.ownerId = :ownerId', { ownerId });
        if (query.venueId) {
            qb.andWhere('venue.id = :venueId', { venueId: query.venueId });
        }
        if (query.hallId) {
            qb.andWhere('hall.id = :hallId', { hallId: query.hallId });
        }
        if (query.status) {
            qb.andWhere('booking.status = :status', { status: query.status });
        }
        if (query.startDate) {
            qb.andWhere('booking.startTime >= :startDate', {
                startDate: new Date(query.startDate),
            });
        }
        if (query.endDate) {
            qb.andWhere('booking.endTime <= :endDate', {
                endDate: new Date(query.endDate),
            });
        }
        qb.orderBy('booking.startTime', 'DESC')
            .skip(skip)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findByUser(userId) {
        return this.bookingRepository.find({
            where: { userId },
            relations: ['hall', 'hall.venue'],
            order: { startTime: 'DESC' },
        });
    }
    async findOne(id) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['hall', 'hall.venue', 'user'],
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID "${id}" not found`);
        }
        return booking;
    }
    async updateStatus(id, userId, updateStatusDto) {
        const booking = await this.findOne(id);
        if (booking.hall.venue.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the venue owner can update booking status');
        }
        this.validateStatusTransition(booking.status, updateStatusDto.status);
        booking.status = updateStatusDto.status;
        await this.bookingRepository.save(booking);
        return this.findOne(id);
    }
    async cancelByUser(id, userId) {
        const booking = await this.findOne(id);
        if (booking.userId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own bookings');
        }
        if (booking.status === booking_status_enum_js_1.BookingStatus.CANCELLED) {
            throw new common_1.ConflictException('Booking is already cancelled');
        }
        if (booking.status === booking_status_enum_js_1.BookingStatus.COMPLETED) {
            throw new common_1.ConflictException('Cannot cancel a completed booking');
        }
        booking.status = booking_status_enum_js_1.BookingStatus.CANCELLED;
        await this.bookingRepository.save(booking);
        return this.findOne(id);
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [booking_status_enum_js_1.BookingStatus.PENDING]: [booking_status_enum_js_1.BookingStatus.CONFIRMED, booking_status_enum_js_1.BookingStatus.CANCELLED],
            [booking_status_enum_js_1.BookingStatus.CONFIRMED]: [booking_status_enum_js_1.BookingStatus.COMPLETED, booking_status_enum_js_1.BookingStatus.CANCELLED],
            [booking_status_enum_js_1.BookingStatus.CANCELLED]: [],
            [booking_status_enum_js_1.BookingStatus.COMPLETED]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.ConflictException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_js_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        halls_service_js_1.HallsService,
        typeorm_2.DataSource])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map