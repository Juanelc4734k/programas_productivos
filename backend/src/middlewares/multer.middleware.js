import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const programId = req.params?.programId;
        const baseDir = path.join(process.cwd(), 'uploads');
        let dest = path.join(baseDir, 'documents');
        if (programId) {
            dest = path.join(baseDir, 'programas', programId, 'evidencias');
        }
        ensureDir(dest);
        cb(null, dest);
    },
    filename(req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype.startsWith('application/vnd.openxmlformats-officedocument')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter
});