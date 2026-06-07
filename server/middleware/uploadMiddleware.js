import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cinereview/avatars',
        allowed_formats: ['jpg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill' }]
    }
});

export default multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});