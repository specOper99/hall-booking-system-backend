import { User } from '../users/entities/user.entity.js';
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto/index.js';
import { Venue } from './entities/venue.entity.js';
import { PaginatedResult, VenuesService } from './venues.service.js';
export declare class VenuesController {
    private readonly venuesService;
    constructor(venuesService: VenuesService);
    create(user: User, createVenueDto: CreateVenueDto): Promise<Venue>;
    findAll(query: VenueQueryDto): Promise<PaginatedResult<Venue>>;
    findMyVenues(user: User): Promise<Venue[]>;
    findOne(id: string): Promise<Venue>;
    update(id: string, user: User, updateVenueDto: UpdateVenueDto): Promise<Venue>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
