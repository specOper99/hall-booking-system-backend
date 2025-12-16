"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const platform_settings_entity_1 = require("../src/admin/entities/platform-settings.entity");
const booking_entity_1 = require("../src/bookings/entities/booking.entity");
const hall_entity_1 = require("../src/halls/entities/hall.entity");
const user_entity_1 = require("../src/users/entities/user.entity");
const venue_entity_1 = require("../src/venues/entities/venue.entity");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
async function syncDatabase() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5433),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'hallhub'),
        entities: [user_entity_1.User, venue_entity_1.Venue, hall_entity_1.Hall, booking_entity_1.Booking, platform_settings_entity_1.PlatformSettings],
        synchronize: true,
    });
    console.log('🔗 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database synchronized successfully!');
    await dataSource.destroy();
}
syncDatabase().catch(console.error);
//# sourceMappingURL=sync-db.js.map