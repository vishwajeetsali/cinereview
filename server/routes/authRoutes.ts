import express from 'express';
import { register, login, refresh, logout, googleCallback } from '../controllers/authController.js';
import passport from '../config/passport.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`, session: false }), googleCallback);

export default router;