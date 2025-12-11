import { Hall } from '../../halls/entities/hall.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { BookingStatus } from '../enums/booking-status.enum.js';
export declare class Booking {
    id: string;
    hallId: string;
    hall: Hall;
    userId: string;
    user: User;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
