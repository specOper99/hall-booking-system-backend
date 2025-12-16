import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    authRequest,
    createTestApp,
    registerAndLogin,
    testUsers,
    testVenue,
} from './test-setup';

describe('VenuesController (e2e)', () => {
    let app: INestApplication;
    let ownerToken: string;
    let userToken: string;
    let createdVenueId: string;

    beforeAll(async () => {
        app = await createTestApp();

        // Register an owner
        const ownerResult = await registerAndLogin(app, {
            ...testUsers.owner,
            email: `test-owner-venues-${Date.now()}@test.com`,
        });
        ownerToken = ownerResult.token;

        // Register a regular user
        const userResult = await registerAndLogin(app, {
            ...testUsers.user,
            email: `test-user-venues-${Date.now()}@test.com`,
        });
        userToken = userResult.token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/venues', () => {
        it('should create a venue as owner', async () => {
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/venues')
                .send(testVenue);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(testVenue.name);
            expect(response.body.data.address).toBe(testVenue.address);

            createdVenueId = response.body.data.id;
        });

        it('should return 403 for regular user', async () => {
            const response = await authRequest(app, userToken)
                .post('/api/v1/venues')
                .send(testVenue);

            expect(response.status).toBe(403);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/venues')
                .send(testVenue);

            expect(response.status).toBe(401);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/venues')
                .send({ description: 'Missing name and address' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/venues', () => {
        it('should list all venues (public)', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/venues');

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('data');
            expect(Array.isArray(response.body.data.data)).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/venues')
                .query({ limit: 5, offset: 0 });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('total');
            expect(response.body.data).toHaveProperty('limit');
        });
    });

    describe('GET /api/v1/venues/my-venues', () => {
        it('should return owner venues', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/venues/my-venues');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return 403 for regular user', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/venues/my-venues');

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/v1/venues/:id', () => {
        it('should return venue by ID', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/venues/${createdVenueId}`);

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(createdVenueId);
        });

        it('should return 404 for non-existent venue', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/venues/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });

        it('should return 400 for invalid UUID', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/venues/invalid-uuid');

            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/v1/venues/:id', () => {
        it('should update venue as owner', async () => {
            const response = await authRequest(app, ownerToken)
                .patch(`/api/v1/venues/${createdVenueId}`)
                .send({ name: 'Updated Test Venue' });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Updated Test Venue');
        });

        it('should return 403 for non-owner', async () => {
            // Create another owner
            const anotherOwner = await registerAndLogin(app, {
                ...testUsers.owner,
                email: `another-owner-${Date.now()}@test.com`,
            });

            const response = await authRequest(app, anotherOwner.token)
                .patch(`/api/v1/venues/${createdVenueId}`)
                .send({ name: 'Hijacked Venue' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/v1/venues/:id', () => {
        let venueToDelete: string;

        beforeAll(async () => {
            // Create a venue to delete
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/venues')
                .send({
                    ...testVenue,
                    name: 'Venue to Delete',
                });
            venueToDelete = response.body.data.id;
        });

        it('should delete venue as owner', async () => {
            const response = await authRequest(app, ownerToken)
                .delete(`/api/v1/venues/${venueToDelete}`);

            expect(response.status).toBe(200);
        });

        it('should return 404 for deleted venue', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/venues/${venueToDelete}`);

            expect(response.status).toBe(404);
        });
    });
});
