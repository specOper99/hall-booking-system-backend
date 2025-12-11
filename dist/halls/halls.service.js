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
exports.HallsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venues_service_js_1 = require("../venues/venues.service.js");
const hall_entity_js_1 = require("./entities/hall.entity.js");
let HallsService = class HallsService {
    hallRepository;
    venuesService;
    constructor(hallRepository, venuesService) {
        this.hallRepository = hallRepository;
        this.venuesService = venuesService;
    }
    async create(userId, createHallDto) {
        const venue = await this.venuesService.findOne(createHallDto.venueId);
        this.verifyVenueOwnership(venue.ownerId, userId);
        const hall = this.hallRepository.create(createHallDto);
        return this.hallRepository.save(hall);
    }
    async findByVenue(venueId) {
        await this.venuesService.findOne(venueId);
        return this.hallRepository.find({
            where: { venueId },
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const hall = await this.hallRepository.findOne({
            where: { id },
            relations: ['venue', 'venue.owner'],
        });
        if (!hall) {
            throw new common_1.NotFoundException(`Hall with ID "${id}" not found`);
        }
        return hall;
    }
    async update(id, userId, updateHallDto) {
        const hall = await this.findOne(id);
        this.verifyVenueOwnership(hall.venue.ownerId, userId);
        Object.assign(hall, updateHallDto);
        return this.hallRepository.save(hall);
    }
    async remove(id, userId) {
        const hall = await this.findOne(id);
        this.verifyVenueOwnership(hall.venue.ownerId, userId);
        await this.hallRepository.remove(hall);
    }
    verifyVenueOwnership(venueOwnerId, userId) {
        if (venueOwnerId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to manage halls for this venue');
        }
    }
};
exports.HallsService = HallsService;
exports.HallsService = HallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(hall_entity_js_1.Hall)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        venues_service_js_1.VenuesService])
], HallsService);
//# sourceMappingURL=halls.service.js.map