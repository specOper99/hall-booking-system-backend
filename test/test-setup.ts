import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { UserRole } from '../src/users/enums/user-role.enum.js';

// Test user data
export const testUsers = {
    superadmin: {
        email: 'test-superadmin@test.com',
        password: 'Password123!',
        fullName: 'Test Superadmin',
        role: UserRole.SUPERADMIN,
    },
    owner: {
        email: 'test-owner@test.com',
        password: 'Password123!',
        fullName: 'Test Owner',
        role: UserRole.OWNER,
    },
    user: {
        email: 'test-user@test.com',
        password: 'Password123!',
        fullName: 'Test User',
        role: UserRole.USER,
    },
};

// Test venue data
export const testVenue = {
    name: 'Test Venue',
    description: 'A test venue for E2E tests',
    address: 'Test Address, Test City',
    images: ['https://example.com/image1.jpg'],
};

// Test hall data
export const testHall = {
    name: 'Test Hall',
    capacity: 100,
    pricePerHour: 50.0,
    amenities: { wifi: true, projector: true },
};

// Helper to create test app
export async function createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.init();
    return app;
}

// Helper to register a user and get token
export async function registerAndLogin(
    app: INestApplication,
    userData: typeof testUsers.owner,
): Promise<{ token: string; user: Record<string, unknown> }> {
    // First try to login (user might already exist)
    const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: userData.password });

    if (loginResponse.status === 200) {
        return {
            token: loginResponse.body.accessToken,
            user: loginResponse.body.user,
        };
    }

    // If login fails, register
    const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData);

    if (registerResponse.status === 201) {
        return {
            token: registerResponse.body.accessToken,
            user: registerResponse.body.user,
        };
    }

    throw new Error(`Failed to register/login user: ${JSON.stringify(registerResponse.body)}`);
}

// Helper to clean up test data
export async function cleanupTestData(app: INestApplication): Promise<void> {
    const dataSource = app.get(DataSource);

    // Clean up in order respecting foreign key constraints
    const tables = ['bookings', 'halls', 'venues', 'users'];

    for (const table of tables) {
        await dataSource.query(
            `DELETE FROM "${table}" WHERE email LIKE 'test-%@test.com' OR name LIKE 'Test%' OR "fullName" LIKE 'Test%'`,
        ).catch(() => {
            // Ignore errors for tables that don't have these columns
        });
    }
}

// Helper to get authenticated request
export function authRequest(app: INestApplication, token: string) {
    return {
        get: (url: string) =>
            request(app.getHttpServer())
                .get(url)
                .set('Authorization', `Bearer ${token}`),
        post: (url: string) =>
            request(app.getHttpServer())
                .post(url)
                .set('Authorization', `Bearer ${token}`),
        patch: (url: string) =>
            request(app.getHttpServer())
                .patch(url)
                .set('Authorization', `Bearer ${token}`),
        delete: (url: string) =>
            request(app.getHttpServer())
                .delete(url)
                .set('Authorization', `Bearer ${token}`),
    };
}
