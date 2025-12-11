import { User } from '../users/entities/user.entity.js';
import { CreateHallDto, UpdateHallDto } from './dto/index.js';
import { Hall } from './entities/hall.entity.js';
import { HallsService } from './halls.service.js';
export declare class HallsController {
    private readonly hallsService;
    constructor(hallsService: HallsService);
    create(user: User, createHallDto: CreateHallDto): Promise<Hall>;
    findByVenue(venueId: string): Promise<Hall[]>;
    findOne(id: string): Promise<Hall>;
    update(id: string, user: User, updateHallDto: UpdateHallDto): Promise<Hall>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
