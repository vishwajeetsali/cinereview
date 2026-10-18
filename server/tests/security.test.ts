import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

describe('API Security and Defensive Validation Tests', () => {

    describe('Server Health and Basic Routing', () => {
        it('should return 200 on base route', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Server is running');
        });

        it('should return security headers via Helmet', async () => {
            const res = await request(app).get('/');
            expect(res.headers).toHaveProperty('x-dns-prefetch-control');
            expect(res.headers).toHaveProperty('x-frame-options');
        });
    });

    describe('Authentication Input Validation & Hardening', () => {
        it('should reject registration when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com' });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });

        it('should reject registration when fields are not strings (NoSQL defense)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 12345, email: { $ne: null }, password: ['secret'] });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('strings');
        });

        it('should reject registration with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Valid Name', email: 'not-an-email', password: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid email');
        });

        it('should reject registration with password under 6 characters', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Valid Name', email: 'user@test.com', password: '123' });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('at least 6 characters');
        });

        it('should reject login when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });

        it('should reject login with non-string fields (NoSQL selector defense)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: { $gt: '' }, password: { $gt: '' } });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('strings');
        });
    });

    describe('Resource Identifier (ObjectId) Validation & CastError Defense', () => {
        it('should return 400 for malformed user ID on public profile', async () => {
            const res = await request(app).get('/api/users/invalid-id-format');
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid user ID format');
        });

        it('should return 400 for malformed review ID when fetching comments', async () => {
            const res = await request(app).get('/api/comments/not-a-valid-review-id');
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid review ID format');
        });

        it('should return 400 for malformed movie tmdbId on movie reviews', async () => {
            const res = await request(app).get('/api/reviews/not-a-number');
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Valid tmdbId is required');
        });
    });

    describe('Unauthorized Access Protection', () => {
        it('should reject creating review without auth token', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .send({ tmdbId: 100, movieTitle: 'Test Movie', rating: 8, text: 'Great!' });
            expect(res.status).toBe(401);
        });

        it('should reject editing review without auth token', async () => {
            const res = await request(app)
                .put('/api/reviews/507f1f77bcf86cd799439011')
                .send({ rating: 7, text: 'Updated review' });
            expect(res.status).toBe(401);
        });

        it('should reject adding comment without auth token', async () => {
            const res = await request(app)
                .post('/api/comments/507f1f77bcf86cd799439011')
                .send({ text: 'Nice movie!' });
            expect(res.status).toBe(401);
        });
    });

    describe('Fail-Open Cache Resilience', () => {
        it('cacheGet should gracefully handle unreachable cache without throwing', async () => {
            const result = await cacheGet('test:resilience:key');
            expect(result).toBeNull();
        }, 10000);

        it('cacheSet should not throw error if cache is unreachable', async () => {
            await expect(cacheSet('test:key', { foo: 'bar' }, { ex: 60 })).resolves.not.toThrow();
        }, 10000);

        it('cacheDel should not throw error if cache is unreachable', async () => {
            await expect(cacheDel('test:key')).resolves.not.toThrow();
        }, 10000);
    });
});
