import { BookingStatus } from '../enums/booking-status.enum.js';
export declare class BookingQueryDto {
    venueId?: string;
    hallId?: string;
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
