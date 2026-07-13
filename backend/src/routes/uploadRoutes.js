import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { fileUploadLimiter } from '../middleware/rateLimiter.js';

import { fileTypeFromFile } from 'file-type';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define isolated upload directory inside backend
const uploadDir = path.join(__dirname, '../../uploads/agencies');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only! (jpg, jpeg, png, webp)');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', protect, fileUploadLimiter, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  // Deep content validation (magic bytes)
  const meta = await fileTypeFromFile(req.file.path);
  if (!meta || !['image/jpeg', 'image/png', 'image/webp'].includes(meta.mime)) {
    // Malicious or invalid file detected -> delete it
    fs.unlinkSync(req.file.path);
    return res.status(400).send({ message: 'Invalid file content! Images only.' });
  }

  // Return the secure backend static serving path
  res.send({
    message: 'Image Uploaded Successfully',
    image: `/api/uploads/agencies/${req.file.filename}`,
  });
});

export default router;
