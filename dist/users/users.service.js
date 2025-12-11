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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_js_1 = require("./entities/user.entity.js");
const user_role_enum_js_1 = require("./enums/user-role.enum.js");
let UsersService = UsersService_1 = class UsersService {
    userRepository;
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.seedSuperadmin();
    }
    async seedSuperadmin() {
        const existingSuperadmin = await this.findByRole(user_role_enum_js_1.UserRole.SUPERADMIN);
        if (existingSuperadmin) {
            this.logger.log('Superadmin already exists, skipping seed');
            return;
        }
        const email = this.configService.get('SUPERADMIN_EMAIL', 'admin@hallhub.com');
        const password = this.configService.get('SUPERADMIN_PASSWORD', 'Admin@123456');
        const fullName = this.configService.get('SUPERADMIN_NAME', 'Super Admin');
        try {
            const superadmin = await this.create({
                email,
                password,
                fullName,
                role: user_role_enum_js_1.UserRole.SUPERADMIN,
                isActive: true,
            });
            this.logger.log(`✅ Superadmin created successfully with email: ${superadmin.email}`);
        }
        catch (error) {
            this.logger.error('Failed to create superadmin:', error);
        }
    }
    async create(userData) {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findByRole(role) {
        return this.userRepository.findOne({ where: { role } });
    }
    async findAll() {
        return this.userRepository.find();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_js_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map