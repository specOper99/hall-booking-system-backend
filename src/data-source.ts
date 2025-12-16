import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PlatformSettings } from './admin/entities/platform-settings.entity.js';
import { Booking } from './bookings/entities/booking.entity.js';
import { Hall } from './halls/entities/hall.entity.js';
import { User } from './users/entities/user.entity.js';
import { Venue } from './venues/entities/venue.entity.js';

config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'hallhub',
    entities: [User, Venue, Hall, Booking, PlatformSettings],
    synchronize: false,
    logging: true,
});
