declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        MONGO_URI: string;
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
        CLIENT_URL: string;
        TMDB_API_KEY: string;
        TMDB_READ_ACCESS_TOKEN: string;
        UPSTASH_REDIS_REST_URL: string;
        UPSTASH_REDIS_REST_TOKEN: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        GOOGLE_CALLBACK_URL: string;
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
        MAIL_HOST: string;
        MAIL_PORT: string;
        MAIL_USER: string;
        MAIL_PASS: string;
        MAIL_FROM: string;
    }
}

declare module 'multer-storage-cloudinary';