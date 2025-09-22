import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dabhl7kz1',
        api_key: process.env.CLOUDINARY_API_KEY || '129147462155153',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'uaZ6hzGwfqM081b2GFKA-qO_gbc',
        secure: true,
        private_cdn: false,
        force_version: false
})

export default cloudinary;