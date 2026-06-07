import mongoose from 'mongoose'

async function connectDB() {
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
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export default connectDB