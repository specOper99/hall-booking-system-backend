import { User } from '../../users/entities/user.entity.js';
export declare enum VenueStatus {
    PENDING = "pending",
    ACTIVE = "active",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare class Venue {
    id: string;
    ownerId: string;
    owner: User;
    name: string;
    description: string;
    address: string;
    images: string[];
    status: VenueStatus;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    halls?: unknown[];
}
