import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} }).trim();
        if (!cleanName) return res.status(400).json({ message: 'Invalid name' });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name: cleanName, email, password: hashedPassword });

        return res.status(201).json({
            message: 'User successfully created.',
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user._id, user.name, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);

        return res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null },
            accessToken,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const refresh = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.refreshToken !== token) return res.status(401).json({ message: 'Invalid refresh token' });

        const accessToken = generateAccessToken(user._id, user.name, user.role);
        return res.status(200).json({
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null },
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        const user = await User.findOne({ refreshToken: token });

        if (user) {
            user.refreshToken = "";
            await user.save();
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;

        const accessToken = generateAccessToken(user._id, user.name, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    } catch (error) {
        console.error(error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
};