import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity.js';
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
export declare class DashboardService {
    private readonly userRepository;
    private readonly venueRepository;
    private readonly hallRepository;
    private readonly bookingRepository;
    constructor(userRepository: Repository<User>, venueRepository: Repository<Venue>, hallRepository: Repository<Hall>, bookingRepository: Repository<Booking>);
    getSystemStats(): Promise<SystemStats>;
    getOwnerStats(ownerId: string): Promise<OwnerStats>;
    private getEmptyRevenueByMonth;
    private fillRevenueByMonth;
    private getActivityType;
    private getActivityTitle;
}
