import jwt from 'jsonwebtoken';

type Role = "user" | "mod" | "admin";

export const generateAccessToken = (userId: string, name: string, role: Role): string => {
    return jwt.sign(
        { userId, name, role },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: '15m' }
    );
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );
};

