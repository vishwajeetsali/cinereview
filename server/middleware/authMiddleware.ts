import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../types/index.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No Token detected.' })
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as AuthUser;
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}