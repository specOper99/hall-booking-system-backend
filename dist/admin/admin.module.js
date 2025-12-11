"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const venue_entity_js_1 = require("../venues/entities/venue.entity.js");
const admin_controller_js_1 = require("./admin.controller.js");
const admin_service_js_1 = require("./admin.service.js");
const platform_settings_entity_js_1 = require("./entities/platform-settings.entity.js");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_js_1.User, venue_entity_js_1.Venue, platform_settings_entity_js_1.PlatformSettings])],
        controllers: [admin_controller_js_1.AdminController],
        providers: [admin_service_js_1.AdminService],
        exports: [admin_service_js_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map