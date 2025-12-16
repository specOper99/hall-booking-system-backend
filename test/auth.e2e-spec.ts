import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    authRequest,
    createTestApp,
    registerAndLogin,
    testUsers,
} from './test-setup';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/auth/register', () => {
        const uniqueEmail = `test-register-${Date.now()}@test.com`;

        it('should register a new user successfully', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: uniqueEmail,
                    password: 'Password123!',
                    fullName: 'Test Register User',
                    role: 'USER',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(uniqueEmail);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123!',
                    fullName: 'Test User',
                    role: 'USER',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for short password', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'short-pass@test.com',
                    password: 'short',
                    fullName: 'Test User',
                    role: 'USER',
                });

            expect(response.status).toBe(400);
        });

        it('should return 409 for duplicate email', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: uniqueEmail,
                    password: 'Password123!',
                    fullName: 'Duplicate User',
                    role: 'USER',
                });

            expect(response.status).toBe(409);
        });

        it('should return 403 when trying to register as SUPERADMIN', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'superadmin-attempt@test.com',
                    password: 'Password123!',
                    fullName: 'Fake Superadmin',
                    role: 'SUPERADMIN',
                });

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const loginEmail = `test-login-${Date.now()}@test.com`;

        beforeAll(async () => {
            // Register a user for login tests
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: loginEmail,
                    password: 'Password123!',
                    fullName: 'Login Test User',
                    role: 'USER',
                });
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: loginEmail,
                    password: 'Password123!',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
        });

        it('should return 401 for wrong password', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: loginEmail,
                    password: 'WrongPassword123!',
                });

            expect(response.status).toBe(401);
        });

        it('should return 401 for non-existent user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Password123!',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let token: string;

        beforeAll(async () => {
            const result = await registerAndLogin(app, {
                ...testUsers.user,
                email: `test-me-${Date.now()}@test.com`,
            });
            token = result.token;
        });

        it('should return current user profile', async () => {
            const response = await authRequest(app, token).get('/api/v1/auth/me');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('fullName');
            expect(response.body).toHaveProperty('role');
        });

        it('should return 401 without token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
        });

        it('should return 401 with invalid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });
});
