import express from 'express';
import { extractTimetable, healthCheck } from '../controllers/extractController.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

/**
 * POST /api/extract
 * Extract timetable data from uploaded file
 *
 * Request: multipart/form-data with 'file' field
 * Response: JSON with extracted timetable data
 */
router.post('/extract', upload.single('file'), handleMulterError, extractTimetable);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', healthCheck);

export default router;
