"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const venues_module_js_1 = require("../venues/venues.module.js");
const hall_entity_js_1 = require("./entities/hall.entity.js");
const halls_controller_js_1 = require("./halls.controller.js");
const halls_service_js_1 = require("./halls.service.js");
let HallsModule = class HallsModule {
};
exports.HallsModule = HallsModule;
exports.HallsModule = HallsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([hall_entity_js_1.Hall]), venues_module_js_1.VenuesModule],
        controllers: [halls_controller_js_1.HallsController],
        providers: [halls_service_js_1.HallsService],
        exports: [halls_service_js_1.HallsService],
    })
], HallsModule);
//# sourceMappingURL=halls.module.js.map