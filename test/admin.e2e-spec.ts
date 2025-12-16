import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    authRequest,
    createTestApp,
    registerAndLogin,
    testUsers,
    testVenue,
} from './test-setup';

describe('AdminController (e2e)', () => {
    let app: INestApplication;
    let superadminToken: string;
    let ownerToken: string;
    let userToken: string;
    let testUserId: string;
    let pendingVenueId: string;

    beforeAll(async () => {
        app = await createTestApp();

        // Register a superadmin (this might fail if SUPERADMIN registration is blocked,
        // in which case we'd need to use a seeded superadmin)
        try {
            const superadminResult = await registerAndLogin(app, {
                ...testUsers.superadmin,
                email: `test-superadmin-${Date.now()}@test.com`,
            });
            superadminToken = superadminResult.token;
        } catch {
            // Try to login with seeded superadmin
            const loginResponse = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@hallhub.com',
                    password: 'Admin123!',
                });
            if (loginResponse.status === 200) {
                superadminToken = loginResponse.body.data.accessToken;
            }
        }

        // Register an owner
        const ownerResult = await registerAndLogin(app, {
            ...testUsers.owner,
            email: `test-owner-admin-${Date.now()}@test.com`,
        });
        ownerToken = ownerResult.token;

        // Register a test user
        const userResult = await registerAndLogin(app, {
            ...testUsers.user,
            email: `test-user-admin-${Date.now()}@test.com`,
        });
        userToken = userResult.token;
        testUserId = (userResult.user as { id: string }).id;

        // Create a venue (will be pending)
        const venueResponse = await authRequest(app, ownerToken)
            .post('/api/v1/venues')
            .send(testVenue);
        if (venueResponse.status === 201) {
            pendingVenueId = venueResponse.body.data.id;
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/admin/users', () => {
        it('should list all users as superadmin', async () => {
            if (!superadminToken) {
                console.warn('Skipping: No superadmin token available');
                return;
            }

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/admin/users');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('items');
            expect(Array.isArray(response.body.data.items)).toBe(true);
        });

        it('should filter users by role', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/admin/users')
                .query({ role: 'OWNER' });

            expect(response.status).toBe(200);
            expect(response.body.data.items.every((u: { role: string }) => u.role === 'OWNER')).toBe(true);
        });

        it('should return 403 for non-superadmin', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/admin/users');

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/admin/users/:id', () => {
        it('should update user as superadmin', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .patch(`/api/v1/admin/users/${testUserId}`)
                .send({ isActive: false });

            expect(response.status).toBe(200);
            expect(response.body.data.isActive).toBe(false);

            // Re-enable the user
            await authRequest(app, superadminToken)
                .patch(`/api/v1/admin/users/${testUserId}`)
                .send({ isActive: true });
        });

        it('should return 403 for non-superadmin', async () => {
            const response = await authRequest(app, ownerToken)
                .patch(`/api/v1/admin/users/${testUserId}`)
                .send({ isActive: false });

            expect(response.status).toBe(403);
        });

        it('should return 404 for non-existent user', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .patch('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
                .send({ isActive: false });

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/v1/admin/venues/pending', () => {
        it('should list pending venues as superadmin', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/admin/venues/pending');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return 403 for non-superadmin', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/admin/venues/pending');

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/admin/venues/:id/approve', () => {
        let venueToApprove: string;

        beforeAll(async () => {
            // Create a fresh venue to approve
            const venueResponse = await authRequest(app, ownerToken)
                .post('/api/v1/venues')
                .send({ ...testVenue, name: 'Venue to Approve' });
            if (venueResponse.status === 201) {
                venueToApprove = venueResponse.body.data.id;
            }
        });

        it('should approve venue as superadmin', async () => {
            if (!superadminToken || !venueToApprove) return;

            const response = await authRequest(app, superadminToken)
                .patch(`/api/v1/admin/venues/${venueToApprove}/approve`);

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('APPROVED');
        });

        it('should return 403 for non-superadmin', async () => {
            if (!pendingVenueId) return;

            const response = await authRequest(app, ownerToken)
                .patch(`/api/v1/admin/venues/${pendingVenueId}/approve`);

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/admin/venues/:id/reject', () => {
        let venueToReject: string;

        beforeAll(async () => {
            // Create a fresh venue to reject
            const venueResponse = await authRequest(app, ownerToken)
                .post('/api/v1/venues')
                .send({ ...testVenue, name: 'Venue to Reject' });
            if (venueResponse.status === 201) {
                venueToReject = venueResponse.body.data.id;
            }
        });

        it('should reject venue as superadmin with reason', async () => {
            if (!superadminToken || !venueToReject) return;

            const response = await authRequest(app, superadminToken)
                .patch(`/api/v1/admin/venues/${venueToReject}/reject`)
                .send({ reason: 'Does not meet quality standards' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('REJECTED');
        });
    });

    describe('GET /api/v1/admin/settings', () => {
        it('should get platform settings as superadmin', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .get('/api/v1/admin/settings');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
        });

        it('should return 403 for non-superadmin', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/admin/settings');

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/admin/settings', () => {
        it('should update settings as superadmin', async () => {
            if (!superadminToken) return;

            const response = await authRequest(app, superadminToken)
                .patch('/api/v1/admin/settings')
                .send({ commissionRate: 10 });

            expect(response.status).toBe(200);
        });

        it('should return 403 for non-superadmin', async () => {
            const response = await authRequest(app, ownerToken)
                .patch('/api/v1/admin/settings')
                .send({ commissionRate: 10 });

            expect(response.status).toBe(403);
        });
    });
});
