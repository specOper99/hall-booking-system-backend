import { Venue } from '../../venues/entities/venue.entity.js';
export declare class Hall {
    id: string;
    venueId: string;
    venue: Venue;
    name: string;
    capacity: number;
    pricePerHour: number;
    amenities: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
