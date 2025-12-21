import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("ERROR: Cloudinary environment variables are missing in .env file.");
    // We can't easily stop the app here without crashing, but the console error helps.
    // The storage construction below might throw or fail later.
}

// Storage for candidate photos
const candidateStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'electo-candidates',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'electo-avatars',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'fill' }],
    },
});

const uploadCandidate = multer({ storage: candidateStorage });
const uploadAvatar = multer({ storage: avatarStorage });

// Export default for candidate uploads (backward compatibility)
export default uploadCandidate;

// Named exports for specific use cases
export { uploadAvatar, uploadCandidate };
