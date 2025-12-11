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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const user_role_enum_js_1 = require("../users/enums/user-role.enum.js");
const admin_service_js_1 = require("./admin.service.js");
const index_js_1 = require("./dto/index.js");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async findAllUsers(role, isActive) {
        const filters = {};
        if (role)
            filters.role = role;
        if (isActive !== undefined)
            filters.isActive = isActive === 'true';
        return this.adminService.findAllUsers(filters);
    }
    async updateUser(id, updateUserDto) {
        return this.adminService.updateUser(id, updateUserDto);
    }
    async findPendingVenues() {
        return this.adminService.findPendingVenues();
    }
    async approveVenue(id) {
        return this.adminService.approveVenue(id);
    }
    async rejectVenue(id, rejectDto) {
        return this.adminService.rejectVenue(id, rejectDto);
    }
    async getSettings() {
        return this.adminService.getSettings();
    }
    async updateSettings(updateDto) {
        return this.adminService.updateSettings(updateDto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (Superadmin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: user_role_enum_js_1.UserRole }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns paginated list of users',
    }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "findAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (ban/unban, change role)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_js_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Get)('venues/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending venues for approval' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pending venues' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "findPendingVenues", null);
__decorate([
    (0, common_1.Patch)('venues/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending venue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Venue is not pending' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveVenue", null);
__decorate([
    (0, common_1.Patch)('venues/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a pending venue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Venue is not pending' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, index_js_1.RejectVenueDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectVenue", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns platform settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update platform settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_js_1.UpdatePlatformSettingsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSettings", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)(user_role_enum_js_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_js_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map