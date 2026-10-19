import mongoose from 'mongoose'

async function connectDB(): Promise<void> {
    if (!process.env.MONGO_URI) {
        if (process.env.NODE_ENV === 'test') {
            console.warn('Skipping MongoDB connection in test environment: MONGO_URI is not set');
            return;
        }
        console.error("Database connection failed: MONGO_URI is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected')
        })

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected')
        })

    } catch (error) {
        if (process.env.NODE_ENV === 'test') {
            console.warn('Database connection failed in test mode, continuing suite:', error);
            return;
        }
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export default connectDB