import logger from '../utils/logger.js';
import * as imageProcessor from './imageProcessor.js';
import * as pdfProcessor from './pdfProcessor.js';
import { validateTimetable, validateTimeRanges, enrichTimeBlocks } from '../schemas/timetable.js';

/**
 * Main file processing orchestrator
 * Routes to appropriate processor based on file type
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimetype - File MIME type
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Processing result
 */
export async function processFile(fileBuffer, mimetype, filename) {
  logger.info('Starting file processing', { mimetype, filename, size: fileBuffer.length });

  const startTime = Date.now();

  try {
    let result;

    // Route to appropriate processor
    if (mimetype.startsWith('image/')) {
      result = await imageProcessor.processImage(fileBuffer, mimetype);
    } else if (mimetype === 'application/pdf') {
      result = await pdfProcessor.processPDF(fileBuffer);
    } else {
      throw {
        code: 'UNSUPPORTED_FILE_TYPE',
        message: `File type ${mimetype} is not supported`,
        details: 'Supported types: image/png, image/jpeg, application/pdf',
      };
    }

    // Validate extracted data
    const validation = await validateExtraction(result.data);

    if (!validation.isValid) {
      logger.error('Validation failed', { errors: validation.errors });

      // Return partial result with warnings
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Extracted data failed validation',
          details: validation.errors,
        },
        partialData: result.data,
        extractionMethod: result.extractionMethod,
        processingTime: Date.now() - startTime,
      };
    }

    const totalTime = Date.now() - startTime;

    logger.info('File processing completed successfully', {
      extractionMethod: result.extractionMethod,
      timeblocks: result.data.timeblocks.length,
      confidence: result.data.metadata.extraction_confidence,
      totalTime,
    });

    return {
      success: true,
      data: validation.enrichedData,
      metadata: {
        ...result.metadata,
        extractionMethod: result.extractionMethod,
        filename,
        fileType: mimetype,
        validationWarnings: validation.warnings,
      },
      processingTime: totalTime,
    };
  } catch (error) {
    const totalTime = Date.now() - startTime;

    logger.error('File processing failed', {
      error: error.message || error,
      mimetype,
      filename,
      totalTime,
    });

    // Structure error response
    if (error.code) {
      throw error;
    }

    throw {
      code: 'PROCESSING_FAILED',
      message: error.message || 'An unexpected error occurred during processing',
      details: error.stack,
    };
  }
}

/**
 * Validate and enrich extracted timetable data
 * @param {Object} data - Extracted timetable data
 * @returns {Promise<Object>} Validation result
 */
async function validateExtraction(data) {
  logger.info('Validating extracted data');

  // Schema validation
  const schemaValidation = validateTimetable(data);

  if (!schemaValidation.success) {
    return {
      isValid: false,
      errors: schemaValidation.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Business logic validation
  const timeRangeErrors = validateTimeRanges(data.timeblocks);
  const warnings = timeRangeErrors.filter((e) => e.severity === 'warning');
  const errors = timeRangeErrors.filter((e) => !e.severity || e.severity === 'error');

  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.map((e) => ({
        block: e.block.subject,
        message: e.error,
      })),
      warnings,
    };
  }

  // Enrich data (calculate durations, etc.)
  const enrichedTimeblocks = enrichTimeBlocks(data.timeblocks);

  return {
    isValid: true,
    enrichedData: {
      metadata: data.metadata,
      timeblocks: enrichedTimeblocks,
    },
    warnings: warnings.map((w) => ({
      block: w.block.subject,
      message: w.error,
    })),
  };
}

/**
 * Check if file type is supported
 * @param {string} mimetype - File MIME type
 * @returns {boolean}
 */
export function isFileTypeSupported(mimetype) {
  const supported = ['image/png', 'image/jpeg', 'application/pdf'];
  return supported.includes(mimetype);
}

/**
 * Estimate processing time based on file type and size
 * @param {string} mimetype - File MIME type
 * @param {number} fileSize - File size in bytes
 * @returns {number} Estimated time in milliseconds
 */
export function estimateProcessingTime(mimetype, fileSize) {
  // Very rough estimates
  if (mimetype === 'application/pdf') {
    return 3000 + fileSize / 1000; // 3-5 seconds
  }

  if (mimetype.startsWith('image/')) {
    return 5000 + fileSize / 500; // 5-15 seconds
  }

  return 5000;
}
