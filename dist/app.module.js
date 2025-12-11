"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const bookings_module_js_1 = require("./bookings/bookings.module.js");
const dashboard_module_js_1 = require("./dashboard/dashboard.module.js");
const halls_module_js_1 = require("./halls/halls.module.js");
const uploads_module_js_1 = require("./uploads/uploads.module.js");
const users_module_js_1 = require("./users/users.module.js");
const venues_module_js_1 = require("./venues/venues.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            autoLoadEntities: true,
                            synchronize: false,
                            ssl: { rejectUnauthorized: false },
                        };
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'postgres'),
                        password: configService.get('DB_PASSWORD', 'postgres'),
                        database: configService.get('DB_DATABASE', 'hallhub'),
                        autoLoadEntities: true,
                        synchronize: configService.get('NODE_ENV') === 'development',
                        logging: configService.get('NODE_ENV') === 'development',
                    };
                },
                inject: [config_1.ConfigService],
            }),
            users_module_js_1.UsersModule,
            auth_module_js_1.AuthModule,
            venues_module_js_1.VenuesModule,
            halls_module_js_1.HallsModule,
            bookings_module_js_1.BookingsModule,
            uploads_module_js_1.UploadsModule,
            dashboard_module_js_1.DashboardModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map