import logger from '../utils/logger.js';
import * as fileProcessor from '../services/fileProcessor.js';

/**
 * Handle timetable extraction request
 * POST /api/extract
 */
export async function extractTimetable(req, res) {
  const requestId = Math.random().toString(36).substring(7);

  logger.info('Extraction request received', {
    requestId,
    filename: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
  });

  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_PROVIDED',
          message: 'No file was uploaded. Please provide a file in the request.',
        },
      });
    }

    // Process file
    const result = await fileProcessor.processFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      metadata: {
        ...result.metadata,
        requestId,
        timestamp: new Date().toISOString(),
      },
      processingTime: result.processingTime,
    });
  } catch (error) {
    logger.error('Extraction request failed', {
      requestId,
      error: error.message || error,
      code: error.code,
    });

    // Determine status code
    let statusCode = 500;
    if (error.code === 'UNSUPPORTED_FILE_TYPE') statusCode = 415;
    if (error.code === 'VALIDATION_FAILED') statusCode = 422;
    if (error.code === 'FILE_TOO_LARGE') statusCode = 413;
    if (error.code?.includes('INVALID')) statusCode = 400;

    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error.details,
        requestId,
      },
    });
  }
}

/**
 * Health check endpoint
 * GET /api/health
 */
export async function healthCheck(req, res) {
  const llmService = await import('../services/llmService.js');

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      llm: llmService.isConfigured() ? 'configured' : 'not configured',
    },
    version: '1.0.0',
  });
}
