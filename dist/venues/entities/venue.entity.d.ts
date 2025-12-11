import { User } from '../../users/entities/user.entity.js';
export declare class Venue {
    id: string;
    ownerId: string;
    owner: User;
    name: string;
    description: string;
    address: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    halls?: unknown[];
}
