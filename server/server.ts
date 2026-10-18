import './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import verdictRoutes from './routes/verdictRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from './sockets/reviewSocket.js';
import { setIO } from './controllers/reviewController.js';
import { setIO as setCommentIO } from './controllers/commentController.js';
import { Request, Response, NextFunction } from 'express';

connectDB();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true }
});

initSocket(io);
setIO(io);
setCommentIO(io);

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL?.replace(/\/$/, ''),
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean) as string[];

// Security
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    message: { message: 'Too many auth attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/verdict', verdictRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Server is running');
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid resource identifier format.' });
    }
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(Number(process.env.PORT) || 5000, () => {
        console.log(`Server running on ${process.env.PORT || 5000}`);
    });
}

export { app, httpServer };
export default app;
