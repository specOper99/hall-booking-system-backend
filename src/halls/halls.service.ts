import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenuesService } from '../venues/venues.service.js';
import { CreateHallDto, UpdateHallDto } from './dto/index.js';
import { Hall } from './entities/hall.entity.js';

@Injectable()
export class HallsService {
    constructor(
        @InjectRepository(Hall)
        private readonly hallRepository: Repository<Hall>,
        private readonly venuesService: VenuesService,
    ) { }

    async create(userId: string, createHallDto: CreateHallDto): Promise<Hall> {
        // Verify user owns the venue
        const venue = await this.venuesService.findOne(createHallDto.venueId);
        this.verifyVenueOwnership(venue.ownerId, userId);

        const hall = this.hallRepository.create(createHallDto);
        return this.hallRepository.save(hall);
    }

    async findByVenue(venueId: string): Promise<Hall[]> {
        // Verify venue exists
        await this.venuesService.findOne(venueId);

        return this.hallRepository.find({
            where: { venueId },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Hall> {
        const hall = await this.hallRepository.findOne({
            where: { id },
            relations: ['venue', 'venue.owner'],
        });

        if (!hall) {
            throw new NotFoundException(`Hall with ID "${id}" not found`);
        }

        return hall;
    }

    async update(
        id: string,
        userId: string,
        updateHallDto: UpdateHallDto,
    ): Promise<Hall> {
        const hall = await this.findOne(id);

        this.verifyVenueOwnership(hall.venue.ownerId, userId);

        Object.assign(hall, updateHallDto);
        return this.hallRepository.save(hall);
    }

    async remove(id: string, userId: string): Promise<void> {
        const hall = await this.findOne(id);

        this.verifyVenueOwnership(hall.venue.ownerId, userId);

        await this.hallRepository.remove(hall);
    }

    private verifyVenueOwnership(venueOwnerId: string, userId: string): void {
        if (venueOwnerId !== userId) {
            throw new ForbiddenException(
                'You do not have permission to manage halls for this venue',
            );
        }
    }
}
