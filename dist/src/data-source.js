"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv_1 = require("dotenv");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const platform_settings_entity_js_1 = require("./admin/entities/platform-settings.entity.js");
const booking_entity_js_1 = require("./bookings/entities/booking.entity.js");
const hall_entity_js_1 = require("./halls/entities/hall.entity.js");
const user_entity_js_1 = require("./users/entities/user.entity.js");
const venue_entity_js_1 = require("./venues/entities/venue.entity.js");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'hallhub',
    entities: [user_entity_js_1.User, venue_entity_js_1.Venue, hall_entity_js_1.Hall, booking_entity_js_1.Booking, platform_settings_entity_js_1.PlatformSettings],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=data-source.js.map