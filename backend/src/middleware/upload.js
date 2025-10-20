import multer from 'multer';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  logger.debug('Validating uploaded file', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Check MIME type
  if (!config.allowedFileTypes.includes(file.mimetype)) {
    const error = new Error(
      `File type ${file.mimetype} is not supported. Allowed types: ${config.allowedFileTypes.join(', ')}`
    );
    error.code = 'UNSUPPORTED_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
    files: 1,
  },
});

// Error handler for multer errors
export function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error', { error: err.message, code: err.code });

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`,
        },
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Unexpected file field. Use field name "file"',
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  // Custom file filter errors
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Pass to next error handler
  next(err);
}
