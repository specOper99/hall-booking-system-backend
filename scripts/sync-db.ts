import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { PlatformSettings } from '../src/admin/entities/platform-settings.entity';
import { Booking } from '../src/bookings/entities/booking.entity';
import { Hall } from '../src/halls/entities/hall.entity';
import { User } from '../src/users/entities/user.entity';
import { Venue } from '../src/venues/entities/venue.entity';

config();

const configService = new ConfigService();

async function syncDatabase() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'hallhub'),
        entities: [User, Venue, Hall, Booking, PlatformSettings],
        synchronize: true,
    });

    console.log('🔗 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database synchronized successfully!');
    await dataSource.destroy();
}

syncDatabase().catch(console.error);
