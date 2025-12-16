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
exports.HallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const user_role_enum_js_1 = require("../users/enums/user-role.enum.js");
const index_js_1 = require("./dto/index.js");
const halls_service_js_1 = require("./halls.service.js");
let HallsController = class HallsController {
    hallsService;
    constructor(hallsService) {
        this.hallsService = hallsService;
    }
    async create(user, createHallDto) {
        return this.hallsService.create(user.id, createHallDto);
    }
    async findByVenue(venueId) {
        return this.hallsService.findByVenue(venueId);
    }
    async findOne(id) {
        return this.hallsService.findOne(id);
    }
    async update(id, user, updateHallDto) {
        return this.hallsService.update(id, user.id, updateHallDto);
    }
    async remove(id, user) {
        await this.hallsService.remove(id, user.id);
        return { message: 'Hall deleted successfully' };
    }
};
exports.HallsController = HallsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new hall' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Hall created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the venue owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_js_1.User,
        index_js_1.CreateHallDto]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('venue/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'List halls by venue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns halls for the venue' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('venueId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "findByVenue", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hall by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns hall details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hall not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update hall (venue owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hall updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the venue owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hall not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_js_1.User,
        index_js_1.UpdateHallDto]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete hall (venue owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hall deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the venue owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hall not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_js_1.User]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "remove", null);
exports.HallsController = HallsController = __decorate([
    (0, swagger_1.ApiTags)('Halls'),
    (0, common_1.Controller)('halls'),
    __metadata("design:paramtypes", [halls_service_js_1.HallsService])
], HallsController);
//# sourceMappingURL=halls.controller.js.map