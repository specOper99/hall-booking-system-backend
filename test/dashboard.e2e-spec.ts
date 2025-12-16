import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    authRequest,
    createTestApp,
    registerAndLogin,
    testUsers,
    testVenue
} from './test-setup';

describe('DashboardController (e2e)', () => {
    let app: INestApplication;
    let superadminToken: string;
    let ownerToken: string;
    let userToken: string;

    beforeAll(async () => {
        app = await createTestApp();

        // Try to get superadmin token
        try {
            const superadminResult = await registerAndLogin(app, {
                ...testUsers.superadmin,
                email: `test-superadmin-dashboard-${Date.now()}@test.com`,
            });
            superadminToken = superadminResult.token;
        } catch {
            // Try seeded superadmin
            const loginResponse = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@hallhub.com',
                    password: 'Admin@123456',
                });
            if (loginResponse.status === 200) {
                superadminToken = loginResponse.body.data.accessToken;
            }
        }

        // Register an owner
        const ownerResult = await registerAndLogin(app, {
            ...testUsers.owner,
            email: `test-owner-dashboard-${Date.now()}@test.com`,
        });
        ownerToken = ownerResult.token;

        // Register a regular user
        const userResult = await registerAndLogin(app, {
            ...testUsers.user,
            email: `test-user-dashboard-${Date.now()}@test.com`,
        });
        userToken = userResult.token;

        // Create some test data for stats
        await authRequest(app, ownerToken)
            .post('/api/v1/venues')
            .send(testVenue);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/dashboard/stats', () => {
        it('should return system stats as superadmin', async () => {
            if (!superadminToken) {
                console.warn('Skipping: No superadmin token available');
                return;
            }

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/dashboard/stats');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('totalUsers');
            expect(response.body.data).toHaveProperty('totalVenues');
            expect(response.body.data).toHaveProperty('totalBookings');
            expect(typeof response.body.data.totalUsers).toBe('number');
        });

        it('should return 403 for owner', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/dashboard/stats');

            expect(response.status).toBe(403);
        });

        it('should return 403 for regular user', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/dashboard/stats');

            expect(response.status).toBe(403);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/dashboard/stats');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/dashboard/owner-stats', () => {
        it('should return owner stats for venue owner', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/dashboard/owner-stats');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('totalVenues');
            expect(response.body.data).toHaveProperty('totalHalls');
            expect(response.body.data).toHaveProperty('totalBookings');
            expect(response.body.data).toHaveProperty('totalRevenue');
        });

        it('should return owner stats for superadmin', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/dashboard/owner-stats');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
        });

        it('should return 403 for regular user', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/dashboard/owner-stats');

            expect(response.status).toBe(403);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/dashboard/owner-stats');

            expect(response.status).toBe(401);
        });

        it('should return correct structure for owner stats', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/dashboard/owner-stats');

            expect(response.status).toBe(200);
            const data = response.body.data;

            expect(typeof data.totalVenues).toBe('number');
            expect(typeof data.totalHalls).toBe('number');
            expect(typeof data.totalBookings).toBe('number');
            expect(typeof data.totalRevenue).toBe('number');
        });
    });
});
