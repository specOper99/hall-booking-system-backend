import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    authRequest,
    createTestApp,
    registerAndLogin,
    testHall,
    testUsers,
    testVenue,
} from './test-setup';

describe('HallsController (e2e)', () => {
    let app: INestApplication;
    let ownerToken: string;
    let userToken: string;
    let venueId: string;
    let createdHallId: string;

    beforeAll(async () => {
        app = await createTestApp();

        // Register an owner
        const ownerResult = await registerAndLogin(app, {
            ...testUsers.owner,
            email: `test-owner-halls-${Date.now()}@test.com`,
        });
        ownerToken = ownerResult.token;

        // Register a regular user
        const userResult = await registerAndLogin(app, {
            ...testUsers.user,
            email: `test-user-halls-${Date.now()}@test.com`,
        });
        userToken = userResult.token;

        // Create a venue for hall tests
        const venueResponse = await authRequest(app, ownerToken)
            .post('/api/v1/venues')
            .send(testVenue);
        venueId = venueResponse.body.data.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/halls', () => {
        it('should create a hall as venue owner', async () => {
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/halls')
                .send({
                    ...testHall,
                    venueId,
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(testHall.name);
            expect(response.body.data.capacity).toBe(testHall.capacity);

            createdHallId = response.body.data.id;
        });

        it('should return 403 for non-owner', async () => {
            // Another owner trying to create hall in someone else venue
            const anotherOwner = await registerAndLogin(app, {
                ...testUsers.owner,
                email: `another-owner-halls-${Date.now()}@test.com`,
            });

            const response = await authRequest(app, anotherOwner.token)
                .post('/api/v1/halls')
                .send({
                    ...testHall,
                    venueId,
                });

            expect(response.status).toBe(403);
        });

        it('should return 404 for non-existent venue', async () => {
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/halls')
                .send({
                    ...testHall,
                    venueId: '00000000-0000-0000-0000-000000000000',
                });

            expect(response.status).toBe(404);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/halls')
                .send({ venueId });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/halls/venue/:venueId', () => {
        it('should list halls by venue (public)', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/halls/venue/${venueId}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should return 404 for non-existent venue', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/halls/venue/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/v1/halls/:id', () => {
        it('should return hall by ID', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/halls/${createdHallId}`);

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(createdHallId);
        });

        it('should return 404 for non-existent hall', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/halls/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/halls/:id', () => {
        it('should update hall as venue owner', async () => {
            const response = await authRequest(app, ownerToken)
                .patch(`/api/v1/halls/${createdHallId}`)
                .send({ name: 'Updated Test Hall', capacity: 150 });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe('Updated Test Hall');
            expect(response.body.data.capacity).toBe(150);
        });

        it('should return 403 for non-owner', async () => {
            const response = await authRequest(app, userToken)
                .patch(`/api/v1/halls/${createdHallId}`)
                .send({ name: 'Hijacked Hall' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/v1/halls/:id', () => {
        let hallToDelete: string;

        beforeAll(async () => {
            // Create a hall to delete
            const response = await authRequest(app, ownerToken)
                .post('/api/v1/halls')
                .send({
                    ...testHall,
                    name: 'Hall to Delete',
                    venueId,
                });
            hallToDelete = response.body.data.id;
        });

        it('should delete hall as owner', async () => {
            const response = await authRequest(app, ownerToken)
                .delete(`/api/v1/halls/${hallToDelete}`);

            expect(response.status).toBe(200);
        });

        it('should return 404 for deleted hall', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/halls/${hallToDelete}`);

            expect(response.status).toBe(404);
        });
    });
});
