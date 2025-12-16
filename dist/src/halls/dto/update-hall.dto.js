"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHallDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_hall_dto_js_1 = require("./create-hall.dto.js");
class UpdateHallDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_hall_dto_js_1.CreateHallDto, ['venueId'])) {
}
exports.UpdateHallDto = UpdateHallDto;
//# sourceMappingURL=update-hall.dto.js.map