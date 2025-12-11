import { Repository } from 'typeorm';
import { VenuesService } from '../venues/venues.service.js';
import { CreateHallDto, UpdateHallDto } from './dto/index.js';
import { Hall } from './entities/hall.entity.js';
export declare class HallsService {
    private readonly hallRepository;
    private readonly venuesService;
    constructor(hallRepository: Repository<Hall>, venuesService: VenuesService);
    create(userId: string, createHallDto: CreateHallDto): Promise<Hall>;
    findByVenue(venueId: string): Promise<Hall[]>;
    findOne(id: string): Promise<Hall>;
    update(id: string, userId: string, updateHallDto: UpdateHallDto): Promise<Hall>;
    remove(id: string, userId: string): Promise<void>;
    private verifyVenueOwnership;
}
