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
exports.VenuesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const user_role_enum_js_1 = require("../users/enums/user-role.enum.js");
const index_js_1 = require("./dto/index.js");
const venues_service_js_1 = require("./venues.service.js");
let VenuesController = class VenuesController {
    venuesService;
    constructor(venuesService) {
        this.venuesService = venuesService;
    }
    async create(user, createVenueDto) {
        return this.venuesService.create(user.id, createVenueDto);
    }
    async findAll(query) {
        return this.venuesService.findAll(query);
    }
    async findMyVenues(user) {
        return this.venuesService.findByOwner(user.id);
    }
    async findOne(id) {
        return this.venuesService.findOne(id);
    }
    async update(id, user, updateVenueDto) {
        return this.venuesService.update(id, user.id, updateVenueDto);
    }
    async remove(id, user) {
        await this.venuesService.remove(id, user.id);
        return { message: 'Venue deleted successfully' };
    }
};
exports.VenuesController = VenuesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new venue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Venue created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - OWNER role required' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_js_1.User,
        index_js_1.CreateVenueDto]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all venues with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated venues list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_js_1.VenueQueryDto]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-venues'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get venues owned by current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user venues' }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_js_1.User]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "findMyVenues", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns venue details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update venue (owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the venue owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_js_1.User,
        index_js_1.UpdateVenueDto]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete venue (owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the venue owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_js_1.User]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "remove", null);
exports.VenuesController = VenuesController = __decorate([
    (0, swagger_1.ApiTags)('Venues'),
    (0, common_1.Controller)('venues'),
    __metadata("design:paramtypes", [venues_service_js_1.VenuesService])
], VenuesController);
//# sourceMappingURL=venues.controller.js.map