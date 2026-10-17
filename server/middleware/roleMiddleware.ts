import User from '../models/User.js'
import { Request, Response, NextFunction } from 'express'
import { Role } from '../types/index.js'

const requireRole = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction

    ) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        try {
            const user = await User.findById(req.user.userId)
            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            next()
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong. Please try again.' })
        }
    }
}

export default requireRole