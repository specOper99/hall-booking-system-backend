"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenuesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venue_entity_js_1 = require("./entities/venue.entity.js");
let VenuesService = class VenuesService {
    venueRepository;
    constructor(venueRepository) {
        this.venueRepository = venueRepository;
    }
    async create(userId, createVenueDto) {
        const venue = this.venueRepository.create({
            ...createVenueDto,
            ownerId: userId,
        });
        return this.venueRepository.save(venue);
    }
    async findAll(query) {
        const { city, limit = 10, offset = 0 } = query;
        const whereClause = {};
        if (city) {
            whereClause.address = (0, typeorm_2.ILike)(`%${city}%`);
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
    async findOne(id) {
        const venue = await this.venueRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!venue) {
            throw new common_1.NotFoundException(`Venue with ID "${id}" not found`);
        }
        return venue;
    }
    async findByOwner(ownerId) {
        return this.venueRepository.find({
            where: { ownerId },
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, userId, updateVenueDto) {
        const venue = await this.findOne(id);
        this.verifyOwnership(venue, userId);
        Object.assign(venue, updateVenueDto);
        return this.venueRepository.save(venue);
    }
    async remove(id, userId) {
        const venue = await this.findOne(id);
        this.verifyOwnership(venue, userId);
        await this.venueRepository.remove(venue);
    }
    verifyOwnership(venue, userId) {
        if (venue.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this venue');
        }
    }
};
exports.VenuesService = VenuesService;
exports.VenuesService = VenuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venue_entity_js_1.Venue)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VenuesService);
//# sourceMappingURL=venues.service.js.map