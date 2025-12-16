import { Repository } from 'typeorm';
import { UserRole } from '../users/enums/user-role.enum.js';
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto/index.js';
import { Venue } from './entities/venue.entity.js';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}
export declare class VenuesService {
    private readonly venueRepository;
    constructor(venueRepository: Repository<Venue>);
    create(userId: string, createVenueDto: CreateVenueDto): Promise<Venue>;
    findAll(query: VenueQueryDto): Promise<PaginatedResult<Venue>>;
    findOne(id: string): Promise<Venue>;
    findByOwner(ownerId: string): Promise<Venue[]>;
    update(id: string, userId: string, userRole: UserRole, updateVenueDto: UpdateVenueDto): Promise<Venue>;
    remove(id: string, userId: string, userRole: UserRole): Promise<void>;
    private verifyOwnership;
}
