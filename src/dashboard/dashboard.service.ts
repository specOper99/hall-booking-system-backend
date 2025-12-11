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

export interface OwnerStats {
    totalVenues: number;
    totalHalls: number;
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    pendingBookings: number;
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

        // Booking stats for owner's halls
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
            .getRawOne();

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
}
