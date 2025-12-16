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

describe('BookingsController (e2e)', () => {
    let app: INestApplication;
    let ownerToken: string;
    let userToken: string;
    let venueId: string;
    let hallId: string;
    let createdBookingId: string;

    beforeAll(async () => {
        app = await createTestApp();

        // Register an owner
        const ownerResult = await registerAndLogin(app, {
            ...testUsers.owner,
            email: `test-owner-bookings-${Date.now()}@test.com`,
        });
        ownerToken = ownerResult.token;

        // Register a regular user
        const userResult = await registerAndLogin(app, {
            ...testUsers.user,
            email: `test-user-bookings-${Date.now()}@test.com`,
        });
        userToken = userResult.token;

        // Create venue and hall for booking tests
        const venueResponse = await authRequest(app, ownerToken)
            .post('/api/v1/venues')
            .send(testVenue);
        venueId = venueResponse.body.data.id;

        const hallResponse = await authRequest(app, ownerToken)
            .post('/api/v1/halls')
            .send({ ...testHall, venueId });
        hallId = hallResponse.body.data.id;
    });

    afterAll(async () => {
        await app.close();
    });

    // Helper to create future booking times
    const getFutureBookingTimes = (hoursFromNow = 24) => {
        const start = new Date();
        start.setHours(start.getHours() + hoursFromNow);
        const end = new Date(start);
        end.setHours(end.getHours() + 2);
        return {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        };
    };

    describe('POST /api/v1/bookings', () => {
        it('should create a booking as authenticated user', async () => {
            const times = getFutureBookingTimes(48);
            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({
                    hallId,
                    ...times,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.hallId).toBe(hallId);

            createdBookingId = response.body.data.id;
        });

        it('should return 401 without authentication', async () => {
            const times = getFutureBookingTimes();
            const response = await request(app.getHttpServer())
                .post('/api/v1/bookings')
                .send({
                    hallId,
                    ...times,
                });

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent hall', async () => {
            const times = getFutureBookingTimes();
            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({
                    hallId: '00000000-0000-0000-0000-000000000000',
                    ...times,
                });

            expect(response.status).toBe(404);
        });

        it('should return 400 for past start time', async () => {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 1);
            const endDate = new Date(pastDate);
            endDate.setHours(endDate.getHours() + 2);

            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({
                    hallId,
                    startTime: pastDate.toISOString(),
                    endTime: endDate.toISOString(),
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for end time before start time', async () => {
            const start = new Date();
            start.setHours(start.getHours() + 24);
            const end = new Date(start);
            end.setHours(end.getHours() - 2);

            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({
                    hallId,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                });

            expect(response.status).toBe(400);
        });

        it('should return 409 for overlapping booking', async () => {
            // Try to book the same time slot
            const times = getFutureBookingTimes(48);
            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({
                    hallId,
                    ...times,
                });

            expect(response.status).toBe(409);
        });
    });

    describe('GET /api/v1/bookings', () => {
        it('should list bookings for venue owner', async () => {
            const response = await authRequest(app, ownerToken)
                .get('/api/v1/bookings');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('data');
            expect(Array.isArray(response.body.data.data)).toBe(true);
        });

        it('should return 403 for regular user', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/bookings');

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/v1/bookings/my-bookings', () => {
        it('should return user bookings', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/bookings/my-bookings');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/v1/bookings/hall/:hallId', () => {
        it('should return hall bookings (public)', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/bookings/hall/${hallId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/v1/bookings/:id', () => {
        it('should return booking by ID', async () => {
            const response = await authRequest(app, userToken)
                .get(`/api/v1/bookings/${createdBookingId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.id).toBe(createdBookingId);
        });

        it('should return 404 for non-existent booking', async () => {
            const response = await authRequest(app, userToken)
                .get('/api/v1/bookings/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/bookings/:id/status', () => {
        it('should update booking status as venue owner', async () => {
            const response = await authRequest(app, ownerToken)
                .patch(`/api/v1/bookings/${createdBookingId}/status`)
                .send({ status: 'CONFIRMED' });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('CONFIRMED');
        });

        it('should return 403 for non-owner', async () => {
            // Create another owner and verify they can't update
            const anotherOwner = await registerAndLogin(app, {
                ...testUsers.owner,
                email: `another-owner-bookings-${Date.now()}@test.com`,
            });

            const response = await authRequest(app, anotherOwner.token)
                .patch(`/api/v1/bookings/${createdBookingId}/status`)
                .send({ status: 'CANCELLED' });

            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/bookings/:id/cancel', () => {
        let bookingToCancel: string;

        beforeAll(async () => {
            // Create a booking to cancel
            const times = getFutureBookingTimes(72);
            const response = await authRequest(app, userToken)
                .post('/api/v1/bookings')
                .send({ hallId, ...times });
            bookingToCancel = response.body.data.id;
        });

        it('should cancel own booking', async () => {
            const response = await authRequest(app, userToken)
                .patch(`/api/v1/bookings/${bookingToCancel}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('CANCELLED');
        });

        it('should return 403 when cancelling another user booking', async () => {
            // Create another user
            const anotherUser = await registerAndLogin(app, {
                ...testUsers.user,
                email: `another-user-${Date.now()}@test.com`,
            });

            const response = await authRequest(app, anotherUser.token)
                .patch(`/api/v1/bookings/${createdBookingId}/cancel`);

            expect(response.status).toBe(403);
        });
    });
});
