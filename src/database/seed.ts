import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { PlatformSettings } from '../admin/entities/platform-settings.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingStatus } from '../bookings/enums/booking-status.enum.js';
import { Hall } from '../halls/entities/hall.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Venue, VenueStatus } from '../venues/entities/venue.entity.js';

config(); // Load .env

// Database configuration
const configService = new ConfigService();

async function seed() {
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

    await dataSource.initialize();
    console.log('🔗 Database connected');

    const userRepo = dataSource.getRepository(User);
    const venueRepo = dataSource.getRepository(Venue);
    const hallRepo = dataSource.getRepository(Hall);
    const bookingRepo = dataSource.getRepository(Booking);
    const settingsRepo = dataSource.getRepository(PlatformSettings);

    // Check if data already exists
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
        console.log('⚠️  Database already has data. Skipping seed.');
        await dataSource.destroy();
        return;
    }

    console.log('🌱 Seeding database...');

    // Create password hash
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Create Users
    const superadmin = await userRepo.save({
        email: 'admin@hallhub.com',
        password: passwordHash,
        fullName: 'System Administrator',
        role: UserRole.SUPERADMIN,
        isActive: true,
    });
    console.log('✅ Created superadmin user');

    const owner1 = await userRepo.save({
        email: 'john.owner@email.com',
        password: passwordHash,
        fullName: 'John Smith',
        role: UserRole.OWNER,
        isActive: true,
    });

    const owner2 = await userRepo.save({
        email: 'sarah.owner@email.com',
        password: passwordHash,
        fullName: 'Sarah Johnson',
        role: UserRole.OWNER,
        isActive: true,
    });

    const manager = await userRepo.save({
        email: 'mike.manager@email.com',
        password: passwordHash,
        fullName: 'Mike Wilson',
        role: UserRole.MANAGER,
        isActive: true,
    });

    const customer1 = await userRepo.save({
        email: 'emily.customer@email.com',
        password: passwordHash,
        fullName: 'Emily Davis',
        role: UserRole.USER,
        isActive: true,
    });

    const customer2 = await userRepo.save({
        email: 'david.customer@email.com',
        password: passwordHash,
        fullName: 'David Brown',
        role: UserRole.USER,
        isActive: true,
    });

    const customer3 = await userRepo.save({
        email: 'jennifer.customer@email.com',
        password: passwordHash,
        fullName: 'Jennifer Lee',
        role: UserRole.USER,
        isActive: false, // Banned user
    });

    console.log('✅ Created 7 users (1 superadmin, 2 owners, 1 manager, 3 customers)');

    // 2. Create Venues
    const venue1 = await venueRepo.save({
        ownerId: owner1.id,
        name: 'Grand Conference Center',
        description: 'Premium conference and event space in the heart of downtown. Features modern amenities and stunning city views.',
        address: '123 Business District, Downtown',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c'],
        status: VenueStatus.ACTIVE,
    });

    const venue2 = await venueRepo.save({
        ownerId: owner1.id,
        name: 'Skyline Events Center',
        description: 'Modern event venue with panoramic city views. Perfect for corporate events and celebrations.',
        address: '100 Tower Street, Business District',
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87'],
        status: VenueStatus.ACTIVE,
    });

    const venue3 = await venueRepo.save({
        ownerId: owner2.id,
        name: 'Garden Paradise Hall',
        description: 'Outdoor venue surrounded by nature. Ideal for weddings and intimate gatherings.',
        address: '50 Botanical Gardens, Green Zone',
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'],
        status: VenueStatus.ACTIVE,
    });

    const pendingVenue = await venueRepo.save({
        ownerId: owner2.id,
        name: 'Historic Manor House',
        description: 'Elegant historic venue for weddings and celebrations.',
        address: '25 Heritage Lane, Old Town',
        images: [],
        status: VenueStatus.PENDING,
    });

    console.log('✅ Created 4 venues (3 active, 1 pending)');

    // 3. Create Halls
    const hall1 = await hallRepo.save({
        venueId: venue1.id,
        name: 'Main Ballroom',
        capacity: 300,
        pricePerHour: 150,
        amenities: { wifi: true, projector: true, soundSystem: true, stage: true, danceFloor: true },
    });

    const hall2 = await hallRepo.save({
        venueId: venue1.id,
        name: 'Executive Boardroom',
        capacity: 20,
        pricePerHour: 80,
        amenities: { wifi: true, videoConferencing: true, whiteboard: true, coffeeMachine: true },
    });

    const hall3 = await hallRepo.save({
        venueId: venue1.id,
        name: 'Training Room A',
        capacity: 50,
        pricePerHour: 60,
        amenities: { wifi: true, projector: true, flipcharts: true },
    });

    const hall4 = await hallRepo.save({
        venueId: venue2.id,
        name: 'Panorama Suite',
        capacity: 100,
        pricePerHour: 200,
        amenities: { wifi: true, soundSystem: true, barArea: true, terraceAccess: true },
    });

    const hall5 = await hallRepo.save({
        venueId: venue3.id,
        name: 'Garden Pavilion',
        capacity: 150,
        pricePerHour: 120,
        amenities: { outdoorSeating: true, gardenViews: true, lighting: true, soundSystem: true },
    });

    console.log('✅ Created 5 halls');

    // 4. Create Bookings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Past bookings (completed)
    await bookingRepo.save({
        hallId: hall1.id,
        userId: customer1.id,
        startTime: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalPrice: 600,
    });

    await bookingRepo.save({
        hallId: hall2.id,
        userId: customer2.id,
        startTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        totalPrice: 240,
    });

    // Cancelled booking
    await bookingRepo.save({
        hallId: hall3.id,
        userId: customer3.id,
        startTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
        status: BookingStatus.CANCELLED,
        totalPrice: 240,
    });

    // Today's confirmed booking
    await bookingRepo.save({
        hallId: hall1.id,
        userId: customer1.id,
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalPrice: 600,
    });

    // Pending bookings
    await bookingRepo.save({
        hallId: hall1.id,
        userId: customer2.id,
        startTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalPrice: 750,
    });

    await bookingRepo.save({
        hallId: hall4.id,
        userId: customer1.id,
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalPrice: 1200,
    });

    await bookingRepo.save({
        hallId: hall5.id,
        userId: customer2.id,
        startTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalPrice: 480,
    });

    // Future confirmed bookings
    await bookingRepo.save({
        hallId: hall2.id,
        userId: customer1.id,
        startTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        totalPrice: 240,
    });

    console.log('✅ Created 8 bookings (2 completed, 1 cancelled, 2 confirmed, 3 pending)');

    // 5. Create Platform Settings
    await settingsRepo.save({
        commissionRate: 10,
        maintenanceMode: false,
        maxBookingsPerUser: 50,
    });

    console.log('✅ Created platform settings');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📧 Login credentials (password: Password123!):');
    console.log('   - Superadmin: admin@hallhub.com');
    console.log('   - Owner: john.owner@email.com');
    console.log('   - Owner: sarah.owner@email.com');
    console.log('   - Customer: emily.customer@email.com\n');

    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
