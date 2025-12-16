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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVenueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const venue_entity_js_1 = require("../entities/venue.entity.js");
const create_venue_dto_js_1 = require("./create-venue.dto.js");
class UpdateVenueDto extends (0, swagger_1.PartialType)(create_venue_dto_js_1.CreateVenueDto) {
    status;
}
exports.UpdateVenueDto = UpdateVenueDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: venue_entity_js_1.VenueStatus, description: 'Venue status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(venue_entity_js_1.VenueStatus),
    __metadata("design:type", String)
], UpdateVenueDto.prototype, "status", void 0);
//# sourceMappingURL=update-venue.dto.js.map