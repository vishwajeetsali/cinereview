import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('Comprehensive End-to-End Application Verification', () => {
    const timestamp = Date.now();
    const testUser = {
        name: `Tester_${timestamp}`,
        email: `tester_${timestamp}@example.com`,
        password: 'Password123!'
    };

    let accessToken = '';
    let refreshTokenCookie = '';
    let testUserId = '';
    let createdReviewId = '';
    let createdCommentId = '';

    describe('1. TMDB Movies & Person APIs', () => {
        it('GET /api/movies/trending - should return trending movies', async () => {
            const res = await request(app).get('/api/movies/trending');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/popular - should return popular movies', async () => {
            const res = await request(app).get('/api/movies/popular');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/now-playing - should return now playing movies', async () => {
            const res = await request(app).get('/api/movies/now-playing');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/genre/28 - should return Action movies', async () => {
            const res = await request(app).get('/api/movies/genre/28');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/search?query=Inception - should search movies', async () => {
            const res = await request(app).get('/api/movies/search?query=Inception');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
            expect(res.body.results.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/550 - should return Fight Club movie details', async () => {
            const res = await request(app).get('/api/movies/550');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title');
            expect(res.body.title).toContain('Fight Club');
        }, 15000);

        it('GET /api/movies/550/credits - should return movie credits', async () => {
            const res = await request(app).get('/api/movies/550/credits');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('cast');
            expect(Array.isArray(res.body.cast)).toBe(true);
            expect(res.body.cast.length).toBeGreaterThan(0);
        }, 15000);

        it('GET /api/movies/550/similar - should return similar movies', async () => {
            const res = await request(app).get('/api/movies/550/similar');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(Array.isArray(res.body.results)).toBe(true);
        }, 15000);

        it('GET /api/movies/person/287 - should return Brad Pitt details', async () => {
            const res = await request(app).get('/api/movies/person/287');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name');
            expect(res.body.name).toBe('Brad Pitt');
        }, 15000);

        it('GET /api/movies/person/287/credits - should return actor filmography', async () => {
            const res = await request(app).get('/api/movies/person/287/credits');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('cast');
            expect(Array.isArray(res.body.cast)).toBe(true);
        }, 15000);
    });

    describe('2. User Authentication LifeCycle', () => {
        it('POST /api/auth/register - should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe(testUser.email);
            testUserId = res.body.user.id;
        });

        it('POST /api/auth/login - should log in and return accessToken and cookie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body.user).toHaveProperty('id');
            accessToken = res.body.accessToken;

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            refreshTokenCookie = (Array.isArray(cookies) ? cookies[0] : cookies) || '';
            expect(refreshTokenCookie).toContain('refreshToken=');
        });

        it('POST /api/auth/refresh - should refresh accessToken using cookie', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshTokenCookie]);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            accessToken = res.body.accessToken;
        });
    });

    describe('3. User Profile, Search & Watchlist', () => {
        it('GET /api/users/:userId - should fetch user public profile', async () => {
            const res = await request(app).get(`/api/users/${testUserId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.name).toBe(testUser.name);
            expect(res.body).toHaveProperty('reviews');
        });

        it('GET /api/users/search - should find registered user', async () => {
            const res = await request(app).get(`/api/users/search?q=${testUser.name}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some((u: any) => u.name === testUser.name);
            expect(found).toBe(true);
        });

        it('POST /api/users/watchlist/toggle - should add movie to watchlist', async () => {
            const res = await request(app)
                .post('/api/users/watchlist/toggle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ tmdbId: 550, movieTitle: 'Fight Club', moviePoster: '/poster.jpg' });
            expect(res.status).toBe(200);
            expect(res.body.inWatchlist).toBe(true);
        });

        it('GET /api/users/watchlist - should return updated watchlist', async () => {
            const res = await request(app)
                .get('/api/users/watchlist')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const hasMovie = res.body.some((m: any) => m.tmdbId === 550);
            expect(hasMovie).toBe(true);
        });

        it('POST /api/users/watchlist/toggle - should remove movie from watchlist on second toggle', async () => {
            const res = await request(app)
                .post('/api/users/watchlist/toggle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ tmdbId: 550, movieTitle: 'Fight Club', moviePoster: '/poster.jpg' });
            expect(res.status).toBe(200);
            expect(res.body.inWatchlist).toBe(false);
        });
    });

    describe('4. Reviews Flow', () => {
        it('POST /api/reviews - should create a review with sentiment analysis', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    tmdbId: 550,
                    movieTitle: 'Fight Club',
                    moviePoster: '/fightclub.jpg',
                    rating: 9,
                    text: 'An absolute cinematic masterpiece with exceptional storytelling and direction.'
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.rating).toBe(9);
            expect(res.body).toHaveProperty('sentiment');
            createdReviewId = res.body._id;
        }, 15000);

        it('GET /api/reviews/:tmdbId - should fetch reviews for movie 550', async () => {
            const res = await request(app).get('/api/reviews/550');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some((r: any) => r._id === createdReviewId);
            expect(found).toBe(true);
        });

        it('POST /api/reviews/:id/like - should toggle like on review', async () => {
            const res = await request(app)
                .post(`/api/reviews/${createdReviewId}/like`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body.liked).toBe(true);
            expect(res.body.likeCount).toBeGreaterThan(0);
        });

        it('PUT /api/reviews/:id - should edit the review', async () => {
            const res = await request(app)
                .put(`/api/reviews/${createdReviewId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ rating: 10, text: 'Updated review: One of the best films ever made!' });
            expect(res.status).toBe(200);
            expect(res.body.rating).toBe(10);
            expect(res.body.text).toContain('best films ever made');
        });

        it('GET /api/reviews/user/me - should fetch current user reviews', async () => {
            const res = await request(app)
                .get('/api/reviews/user/me')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some((r: any) => r._id === createdReviewId);
            expect(found).toBe(true);
        });
    });

    describe('5. Comments Flow', () => {
        it('POST /api/comments/:reviewId - should add a comment to the review', async () => {
            const res = await request(app)
                .post(`/api/comments/${createdReviewId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ text: 'Totally agree with your review!' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.text).toBe('Totally agree with your review!');
            createdCommentId = res.body._id;
        });

        it('GET /api/comments/:reviewId - should retrieve comments for review', async () => {
            const res = await request(app).get(`/api/comments/${createdReviewId}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some((c: any) => c._id === createdCommentId);
            expect(found).toBe(true);
        });

        it('DELETE /api/comments/:id - should delete the comment', async () => {
            const res = await request(app)
                .delete(`/api/comments/${createdCommentId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('deleted');
        });
    });

    describe('6. Notifications Flow', () => {
        it('GET /api/notifications/unread - should get unread notification count', async () => {
            const res = await request(app)
                .get('/api/notifications/unread')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('count');
        });

        it('GET /api/notifications - should fetch user notifications', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('PUT /api/notifications/read - should mark notifications as read', async () => {
            const res = await request(app)
                .put('/api/notifications/read')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
        });
    });

    describe('7. Verdicts & Cleanup', () => {
        it('GET /api/verdict/:tmdbId - should handle verdict query', async () => {
            const res = await request(app).get('/api/verdict/550');
            // Can be 200 (if verdict exists) or 404 (if not generated yet), but must not be 500
            expect([200, 404]).toContain(res.status);
        });

        it('DELETE /api/reviews/:id - should delete the created review', async () => {
            const res = await request(app)
                .delete(`/api/reviews/${createdReviewId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('deleted');
        });

        it('POST /api/auth/logout - should log out successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', [refreshTokenCookie]);
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Logged out');
        });
    });
});
