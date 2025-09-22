import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';

export const uploadToCloudinary = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'tramites',
                resource_type: 'auto',
                type: 'upload',
                access_mode: 'public',
                overwrite: true,
                invalidate: true,
                fetch_format: 'auto',
                delivery_type: 'upload'
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ mensaje: 'Error al subir el archivo' });
                }
                req.cloudinaryUrl = result.secure_url;
                req.cloudinaryId = result.public_id;  // Agregamos el ID
                next();
            }
        );

        const buffer = req.file.buffer;
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en el proceso de subida' });
    }
};