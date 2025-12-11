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
exports.CreateBookingDto = exports.IsAfterStartConstraint = exports.IsAfterNowConstraint = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
let IsAfterNowConstraint = class IsAfterNowConstraint {
    validate(date) {
        return new Date(date) > new Date();
    }
    defaultMessage() {
        return 'startTime must be in the future';
    }
};
exports.IsAfterNowConstraint = IsAfterNowConstraint;
exports.IsAfterNowConstraint = IsAfterNowConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'IsAfterNow', async: false })
], IsAfterNowConstraint);
let IsAfterStartConstraint = class IsAfterStartConstraint {
    validate(endTime, args) {
        const object = args.object;
        if (!object.startTime)
            return true;
        return new Date(endTime) > new Date(object.startTime);
    }
    defaultMessage() {
        return 'endTime must be after startTime';
    }
};
exports.IsAfterStartConstraint = IsAfterStartConstraint;
exports.IsAfterStartConstraint = IsAfterStartConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'IsAfterStart', async: false })
], IsAfterStartConstraint);
class CreateBookingDto {
    hallId;
    startTime;
    endTime;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-15T10:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(IsAfterNowConstraint),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-15T12:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(IsAfterStartConstraint),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "endTime", void 0);
//# sourceMappingURL=create-booking.dto.js.map