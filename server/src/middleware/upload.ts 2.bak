import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Multer konfigurasjon for bildeopplasting
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generer unikt filnavn med timestamp og random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', file.mimetype);
    // Kun tillat bildefiler
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Kun bildefiler er tillatt'));
    }
  }
});

// Multer error handling middleware
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Filen er for stor. Maksimal størrelse er 10MB.' });
    }
    return res.status(400).json({ error: `Upload feil: ${error.message}` });
  }
  
  if (error.message === 'Kun bildefiler er tillatt') {
    console.error('File type error:', error);
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
}; 