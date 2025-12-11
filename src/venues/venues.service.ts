import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto/index.js';
import { Venue } from './entities/venue.entity.js';

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class VenuesService {
    constructor(
        @InjectRepository(Venue)
        private readonly venueRepository: Repository<Venue>,
    ) { }

    async create(userId: string, createVenueDto: CreateVenueDto): Promise<Venue> {
        const venue = this.venueRepository.create({
            ...createVenueDto,
            ownerId: userId,
        });
        return this.venueRepository.save(venue);
    }

    async findAll(query: VenueQueryDto): Promise<PaginatedResult<Venue>> {
        const { city, limit = 10, offset = 0 } = query;

        const whereClause: Record<string, unknown> = {};
        if (city) {
            whereClause.address = ILike(`%${city}%`);
        }

        const [data, total] = await this.venueRepository.findAndCount({
            where: whereClause,
            relations: ['owner'],
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' },
        });

        return { data, total, limit, offset };
    }

    async findOne(id: string): Promise<Venue> {
        const venue = await this.venueRepository.findOne({
            where: { id },
            relations: ['owner'],
        });

        if (!venue) {
            throw new NotFoundException(`Venue with ID "${id}" not found`);
        }

        return venue;
    }

    async findByOwner(ownerId: string): Promise<Venue[]> {
        return this.venueRepository.find({
            where: { ownerId },
            order: { createdAt: 'DESC' },
        });
    }

    async update(
        id: string,
        userId: string,
        updateVenueDto: UpdateVenueDto,
    ): Promise<Venue> {
        const venue = await this.findOne(id);

        this.verifyOwnership(venue, userId);

        Object.assign(venue, updateVenueDto);
        return this.venueRepository.save(venue);
    }

    async remove(id: string, userId: string): Promise<void> {
        const venue = await this.findOne(id);

        this.verifyOwnership(venue, userId);

        await this.venueRepository.remove(venue);
    }

    private verifyOwnership(venue: Venue, userId: string): void {
        if (venue.ownerId !== userId) {
            throw new ForbiddenException(
                'You do not have permission to modify this venue',
            );
        }
    }
}
