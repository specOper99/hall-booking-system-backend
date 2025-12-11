import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingStatus } from '../bookings/enums/booking-status.enum.js';
import { Hall } from '../halls/entities/hall.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Venue } from '../venues/entities/venue.entity.js';

export interface SystemStats {
    totalUsers: number;
    totalVenues: number;
    totalHalls: number;
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    pendingBookings: number;
}

export interface RevenueByMonth {
    month: string;
    revenue: number;
}

export interface BookingsByStatus {
    confirmed: number;
    cancelled: number;
    pending: number;
    completed: number;
}

export interface RecentActivityItem {
    id: string;
    type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'venue_created';
    title: string;
    description: string;
    timestamp: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface OwnerStats {
    totalBookings: number;
    totalRevenue: number;
    pendingRequests: number;
    occupancyRate: number;
    totalVenues: number;
    totalHalls: number;
    confirmedBookings: number;
    revenueByMonth: RevenueByMonth[];
    bookingsByStatus: BookingsByStatus;
    recentActivity: RecentActivityItem[];
    mostPopularHall: {
        id: string;
        name: string;
        bookingCount: number;
    } | null;
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
        @InjectRepository(Hall)
        private readonly hallRepository: Repository<Hall>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
    ) { }

    async getSystemStats(): Promise<SystemStats> {
        // Total users
        const totalUsers = await this.userRepository.count();

        // Total venues
        const totalVenues = await this.venueRepository.count();

        // Total halls
        const totalHalls = await this.hallRepository.count();

        // Total bookings
        const totalBookings = await this.bookingRepository.count();

        // Booking stats with revenue
        const bookingStats = await this.bookingRepository
            .createQueryBuilder('booking')
            .select('COUNT(*)', 'total')
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.CONFIRMED}' OR status = '${BookingStatus.COMPLETED}' THEN "totalPrice" ELSE 0 END)`,
                'revenue',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`,
                'confirmed',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.PENDING}' THEN 1 ELSE 0 END)`,
                'pending',
            )
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

    async getOwnerStats(ownerId: string): Promise<OwnerStats> {
        // Get owner's venues
        const venues = await this.venueRepository.find({
            where: { ownerId },
            select: ['id'],
        });
        const venueIds = venues.map((v) => v.id);

        const emptyStats: OwnerStats = {
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

        // Total halls for owner's venues
        const totalHalls = await this.hallRepository
            .createQueryBuilder('hall')
            .where('hall.venueId IN (:...venueIds)', { venueIds })
            .getCount();

        // Get all hall IDs for owner's venues
        const halls = await this.hallRepository.find({
            where: venueIds.map((id) => ({ venueId: id })),
            select: ['id'],
        });
        const hallIds = halls.map((h) => h.id);

        if (hallIds.length === 0) {
            return { ...emptyStats, totalHalls: 0 };
        }

        // Booking stats by status
        const bookingStats = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .select('COUNT(*)', 'total')
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.CONFIRMED}' OR status = '${BookingStatus.COMPLETED}' THEN "totalPrice" ELSE 0 END)`,
                'revenue',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`,
                'confirmed',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.PENDING}' THEN 1 ELSE 0 END)`,
                'pending',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.CANCELLED}' THEN 1 ELSE 0 END)`,
                'cancelled',
            )
            .addSelect(
                `SUM(CASE WHEN status = '${BookingStatus.COMPLETED}' THEN 1 ELSE 0 END)`,
                'completed',
            )
            .getRawOne();

        // Revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const revenueByMonthData = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status IN (:...statuses)', {
                statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
            })
            .andWhere('booking.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
            .select("TO_CHAR(booking.createdAt, 'Mon')", 'month')
            .addSelect('SUM(booking.totalPrice)', 'revenue')
            .groupBy("TO_CHAR(booking.createdAt, 'Mon')")
            .addGroupBy("TO_CHAR(booking.createdAt, 'YYYY-MM')")
            .orderBy("TO_CHAR(booking.createdAt, 'YYYY-MM')", 'ASC')
            .getRawMany();

        const revenueByMonth = this.fillRevenueByMonth(revenueByMonthData);

        // Recent activity (last 5 bookings)
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

        const recentActivity: RecentActivityItem[] = recentBookings.map((b) => ({
            id: b.id,
            type: this.getActivityType(b.status),
            title: this.getActivityTitle(b.status, b.user?.fullName || 'Unknown'),
            description: `${b.hall?.name || 'Hall'} - ${new Date(b.createdAt).toLocaleDateString()}`,
            timestamp: b.createdAt.toISOString(),
            status: b.status === BookingStatus.PENDING ? 'pending'
                : b.status === BookingStatus.CONFIRMED ? 'confirmed'
                    : 'cancelled',
        }));

        // Most popular hall
        const popularHall = await this.bookingRepository
            .createQueryBuilder('booking')
            .innerJoin('booking.hall', 'hall')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status != :cancelled', {
                cancelled: BookingStatus.CANCELLED,
            })
            .select('hall.id', 'id')
            .addSelect('hall.name', 'name')
            .addSelect('COUNT(*)', 'bookingCount')
            .groupBy('hall.id')
            .addGroupBy('hall.name')
            .orderBy('"bookingCount"', 'DESC')
            .limit(1)
            .getRawOne();

        // Calculate occupancy rate (simplified: confirmed bookings hours / total available hours in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const confirmedBookingsHours = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.hallId IN (:...hallIds)', { hallIds })
            .andWhere('booking.status IN (:...statuses)', {
                statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
            })
            .andWhere('booking.startTime >= :thirtyDaysAgo', { thirtyDaysAgo })
            .select('SUM(EXTRACT(EPOCH FROM (booking.endTime - booking.startTime)) / 3600)', 'totalHours')
            .getRawOne();

        const totalHours = Number(confirmedBookingsHours?.totalHours) || 0;
        // Assume 12 hours availability per day per hall for 30 days
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

    private getEmptyRevenueByMonth(): RevenueByMonth[] {
        const months: RevenueByMonth[] = [];
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

    private fillRevenueByMonth(data: { month: string; revenue: string }[]): RevenueByMonth[] {
        const months = this.getEmptyRevenueByMonth();
        data.forEach((item) => {
            const idx = months.findIndex((m) => m.month === item.month);
            if (idx !== -1) {
                months[idx].revenue = Number(item.revenue) || 0;
            }
        });
        return months;
    }

    private getActivityType(status: string): RecentActivityItem['type'] {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'booking_confirmed';
            case BookingStatus.CANCELLED:
                return 'booking_cancelled';
            default:
                return 'booking_created';
        }
    }

    private getActivityTitle(status: string, userName: string): string {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'Booking confirmed';
            case BookingStatus.CANCELLED:
                return 'Booking cancelled';
            default:
                return `New booking from ${userName}`;
        }
    }
}

