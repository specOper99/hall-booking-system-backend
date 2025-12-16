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
        const emptyStats = {
            totalBookings: 0,
            totalRevenue: 0,
            pendingRequests: 0,
            occupancyRate: 0,
            totalVenues: venueIds.length,
            totalHalls: 0,
            confirmedBookings: 0,
            revenueByMonth: this.getEmptyRevenueByMonth(),
            bookingsByStatus: { confirmed: 0, cancelled: 0, pending: 0, completed: 0 },
            recentActivity: [],
            mostPopularHall: null,
        };
        if (venueIds.length === 0) {
            return emptyStats;
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
            return { ...emptyStats, totalHalls: 0 };
        }
        const bookingStats = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' OR status = '${booking_status_enum_js_1.BookingStatus.COMPLETED}' THEN "totalPrice" ELSE 0 END)`, 'revenue')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`, 'confirmed')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.CANCELLED}' THEN 1 ELSE 0 END)`, 'cancelled')
            .addSelect(`SUM(CASE WHEN status = '${booking_status_enum_js_1.BookingStatus.COMPLETED}' THEN 1 ELSE 0 END)`, 'completed')
            .getRawOne();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const revenueByMonthData = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status IN (:...statuses)', {
            statuses: [booking_status_enum_js_1.BookingStatus.CONFIRMED, booking_status_enum_js_1.BookingStatus.COMPLETED],
        })
            .andWhere('booking.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
            .select("TO_CHAR(booking.createdAt, 'Mon')", 'month')
            .addSelect('SUM(booking.totalPrice)', 'revenue')
            .groupBy("TO_CHAR(booking.createdAt, 'Mon')")
            .addGroupBy("TO_CHAR(booking.createdAt, 'YYYY-MM')")
            .orderBy("TO_CHAR(booking.createdAt, 'YYYY-MM')", 'ASC')
            .getRawMany();
        const revenueByMonth = this.fillRevenueByMonth(revenueByMonthData);
        const recentBookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .innerJoin('booking.hall', 'hall')
            .innerJoin('booking.user', 'user')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .select([
            'booking.id',
            'booking.status',
            'booking.createdAt',
            'hall.name',
            'user.fullName',
        ])
            .orderBy('booking.createdAt', 'DESC')
            .limit(5)
            .getMany();
        const recentActivity = recentBookings.map((b) => ({
            id: b.id,
            type: this.getActivityType(b.status),
            title: this.getActivityTitle(b.status, b.user?.fullName || 'Unknown'),
            description: `${b.hall?.name || 'Hall'} - ${new Date(b.createdAt).toLocaleDateString()}`,
            timestamp: b.createdAt.toISOString(),
            status: b.status === booking_status_enum_js_1.BookingStatus.PENDING ? 'pending'
                : b.status === booking_status_enum_js_1.BookingStatus.CONFIRMED ? 'confirmed'
                    : 'cancelled',
        }));
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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const confirmedBookingsHours = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status IN (:...statuses)', {
            statuses: [booking_status_enum_js_1.BookingStatus.CONFIRMED, booking_status_enum_js_1.BookingStatus.COMPLETED],
        })
            .andWhere('booking.startTime >= :thirtyDaysAgo', { thirtyDaysAgo })
            .select('SUM(EXTRACT(EPOCH FROM (booking.endTime - booking.startTime)) / 3600)', 'totalHours')
            .getRawOne();
        const totalHours = Number(confirmedBookingsHours?.totalHours) || 0;
        const totalAvailableHours = hallIds.length * 12 * 30;
        const occupancyRate = totalAvailableHours > 0
            ? Math.round((totalHours / totalAvailableHours) * 100)
            : 0;
        return {
            totalBookings: Number(bookingStats?.total) || 0,
            totalRevenue: Number(bookingStats?.revenue) || 0,
            pendingRequests: Number(bookingStats?.pending) || 0,
            occupancyRate,
            totalVenues: venueIds.length,
            totalHalls,
            confirmedBookings: Number(bookingStats?.confirmed) || 0,
            revenueByMonth,
            bookingsByStatus: {
                confirmed: Number(bookingStats?.confirmed) || 0,
                cancelled: Number(bookingStats?.cancelled) || 0,
                pending: Number(bookingStats?.pending) || 0,
                completed: Number(bookingStats?.completed) || 0,
            },
            recentActivity,
            mostPopularHall: popularHall
                ? {
                    id: popularHall.id,
                    name: popularHall.name,
                    bookingCount: Number(popularHall.bookingCount),
                }
                : null,
        };
    }
    getEmptyRevenueByMonth() {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: date.toLocaleString('en-US', { month: 'short' }),
                revenue: 0,
            });
        }
        return months;
    }
    fillRevenueByMonth(data) {
        const months = this.getEmptyRevenueByMonth();
        data.forEach((item) => {
            const idx = months.findIndex((m) => m.month === item.month);
            if (idx !== -1) {
                months[idx].revenue = Number(item.revenue) || 0;
            }
        });
        return months;
    }
    getActivityType(status) {
        switch (status) {
            case booking_status_enum_js_1.BookingStatus.CONFIRMED:
                return 'booking_confirmed';
            case booking_status_enum_js_1.BookingStatus.CANCELLED:
                return 'booking_cancelled';
            default:
                return 'booking_created';
        }
    }
    getActivityTitle(status, userName) {
        switch (status) {
            case booking_status_enum_js_1.BookingStatus.CONFIRMED:
                return 'Booking confirmed';
            case booking_status_enum_js_1.BookingStatus.CANCELLED:
                return 'Booking cancelled';
            default:
                return `New booking from ${userName}`;
        }
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