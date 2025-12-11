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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_js_1 = require("../bookings/entities/booking.entity.js");
const booking_status_enum_js_1 = require("../bookings/enums/booking-status.enum.js");
const hall_entity_js_1 = require("../halls/entities/hall.entity.js");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const venue_entity_js_1 = require("../venues/entities/venue.entity.js");
let DashboardService = class DashboardService {
    userRepository;
    venueRepository;
    hallRepository;
    bookingRepository;
    constructor(userRepository, venueRepository, hallRepository, bookingRepository) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.hallRepository = hallRepository;
        this.bookingRepository = bookingRepository;
    }
    async getSystemStats() {
        const totalUsers = await this.userRepository.count();
        const totalVenues = await this.venueRepository.count();
        const totalHalls = await this.hallRepository.count();
        const totalBookings = await this.bookingRepository.count();
        const bookingStats = await this.bookingRepository
            .createQueryBuilder('booking')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' OR status = '${booking_status_enum_js_1.BookingStatus.COMPLETED}' THEN "totalPrice" ELSE 0 END)`, 'revenue')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`, 'confirmed')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending')
            .getRawOne();
        return {
            totalUsers,
            totalVenues,
            totalHalls,
            totalBookings,
            totalRevenue: Number(bookingStats?.revenue) || 0,
            confirmedBookings: Number(bookingStats?.confirmed) || 0,
            pendingBookings: Number(bookingStats?.pending) || 0,
        };
    }
    async getOwnerStats(ownerId) {
        const venues = await this.venueRepository.find({
            where: { ownerId },
            select: ['id'],
        });
        const venueIds = venues.map((v) => v.id);
        if (venueIds.length === 0) {
            return {
                totalVenues: 0,
                totalHalls: 0,
                totalBookings: 0,
                totalRevenue: 0,
                confirmedBookings: 0,
                pendingBookings: 0,
                mostPopularHall: null,
            };
        }
        const totalHalls = await this.hallRepository
            .createQueryBuilder('hall')
            .where('hall.venueId IN (:...venueIds)', { venueIds })
            .getCount();
        const halls = await this.hallRepository.find({
            where: venueIds.map((id) => ({ venueId: id })),
            select: ['id'],
        });
        const hallIds = halls.map((h) => h.id);
        if (hallIds.length === 0) {
            return {
                totalVenues: venueIds.length,
                totalHalls: 0,
                totalBookings: 0,
                totalRevenue: 0,
                confirmedBookings: 0,
                pendingBookings: 0,
                mostPopularHall: null,
            };
        }
        const bookingStats = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' OR status = '${booking_status_enum_js_1.BookingStatus.COMPLETED}' THEN "totalPrice" ELSE 0 END)`, 'revenue')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`, 'confirmed')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending')
            .getRawOne();
        const popularHall = await this.bookingRepository
            .createQueryBuilder('booking')
            .innerJoin('booking.hall', 'hall')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status != :cancelled', {
            cancelled: booking_status_enum_js_1.BookingStatus.CANCELLED,
        })
            .select('hall.id', 'id')
            .addSelect('hall.name', 'name')
            .addSelect('COUNT(*)', 'bookingCount')
            .groupBy('hall.id')
            .addGroupBy('hall.name')
            .orderBy('"bookingCount"', 'DESC')
            .limit(1)
            .getRawOne();
        return {
            totalVenues: venueIds.length,
            totalHalls,
            totalBookings: Number(bookingStats?.total) || 0,
            totalRevenue: Number(bookingStats?.revenue) || 0,
            confirmedBookings: Number(bookingStats?.confirmed) || 0,
            pendingBookings: Number(bookingStats?.pending) || 0,
            mostPopularHall: popularHall
                ? {
                    id: popularHall.id,
                    name: popularHall.name,
                    bookingCount: Number(popularHall.bookingCount),
                }
                : null,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_js_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(venue_entity_js_1.Venue)),
    __param(2, (0, typeorm_1.InjectRepository)(hall_entity_js_1.Hall)),
    __param(3, (0, typeorm_1.InjectRepository)(booking_entity_js_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map