import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, name, role) => {
    return jwt.sign(
        { userId, name, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};