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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_js_1 = require("../auth/decorators/current-user.decorator.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const user_role_enum_js_1 = require("../users/enums/user-role.enum.js");
const dashboard_service_js_1 = require("./dashboard.service.js");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSystemStats() {
        return this.dashboardService.getSystemStats();
    }
    async getOwnerStats(user) {
        return this.dashboardService.getOwnerStats(user.id);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get system-wide statistics (Superadmin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns system statistics',
        schema: {
            type: 'object',
            properties: {
                totalUsers: { type: 'number' },
                totalVenues: { type: 'number' },
                totalHalls: { type: 'number' },
                totalBookings: { type: 'number' },
                totalRevenue: { type: 'number' },
                confirmedBookings: { type: 'number' },
                pendingBookings: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Superadmin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('owner-stats'),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.OWNER, user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Get owner's venue statistics" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns owner statistics',
        schema: {
            type: 'object',
            properties: {
                totalVenues: { type: 'number' },
                totalHalls: { type: 'number' },
                totalBookings: { type: 'number' },
                totalRevenue: { type: 'number' },
                confirmedBookings: { type: 'number' },
                pendingBookings: { type: 'number' },
                mostPopularHall: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        bookingCount: { type: 'number' },
                    },
                },
            },
        },
    }),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_js_1.User]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOwnerStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_js_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map