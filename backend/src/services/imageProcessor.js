import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import logger from '../utils/logger.js';
import * as llmService from './llmService.js';
import { config } from '../config/index.js';

/**
 * Preprocess image for better OCR/analysis
 * @param {Buffer} imageBuffer - Original image buffer
 * @returns {Promise<Buffer>} Preprocessed image buffer
 */
async function preprocessImage(imageBuffer) {
  logger.info('Preprocessing image for analysis');

  try {
    // Enhance image: resize if too large, increase contrast, convert to grayscale
    const processed = await sharp(imageBuffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .normalize() // Enhance contrast
      .toBuffer();

    logger.info('Image preprocessed successfully');
    return processed;
  } catch (error) {
    logger.error('Image preprocessing failed', { error: error.message });
    // Return original if preprocessing fails
    return imageBuffer;
  }
}

/**
 * Perform OCR on image using Tesseract
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} OCR result with text and confidence
 */
async function performOCR(imageBuffer) {
  logger.info('Starting Tesseract OCR');

  const worker = await createWorker('eng');

  try {
    const startTime = Date.now();

    const {
      data: { text, confidence },
    } = await worker.recognize(imageBuffer);

    const processingTime = Date.now() - startTime;

    logger.info('OCR completed', {
      textLength: text.length,
      confidence: confidence.toFixed(2),
      processingTime,
    });

    return {
      text,
      confidence: confidence / 100, // Convert to 0-1 scale
      processingTime,
    };
  } catch (error) {
    logger.error('OCR failed', { error: error.message });
    throw error;
  } finally {
    await worker.terminate();
  }
}

/**
 * Process image file and extract timetable data
 * Strategy: Use Claude Vision API primarily, with OCR as fallback/enhancement
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Extracted timetable data
 */
export async function processImage(fileBuffer, mimeType) {
  logger.info('Starting image processing', { mimeType });

  try {
    // Preprocess image
    const processedImage = await preprocessImage(fileBuffer);

    // Strategy: Try LLM vision first (more robust for complex layouts)
    if (config.enableLLMVision && llmService.isConfigured()) {
      logger.info('Using Claude Vision API for extraction (primary method)');

      try {
        const result = await llmService.extractWithVision(processedImage, mimeType);

        return {
          success: true,
          ...result,
          extractionMethod: 'claude-vision',
        };
      } catch (visionError) {
        logger.error('Claude Vision failed, falling back to OCR', {
          error: visionError.message,
        });

        // Fallback to OCR if vision fails
        if (config.enableOCR) {
          return await extractWithOCR(processedImage);
        }

        throw visionError;
      }
    }

    // If LLM vision is disabled, use OCR
    if (config.enableOCR) {
      logger.info('LLM Vision disabled, using OCR + text extraction');
      return await extractWithOCR(processedImage);
    }

    throw new Error('No extraction method available. Enable LLM Vision or OCR in configuration.');
  } catch (error) {
    logger.error('Image processing failed', {
      error: error.message,
      stack: error.stack,
    });

    throw {
      code: 'IMAGE_PROCESSING_FAILED',
      message: error.message,
      details:
        'Failed to extract timetable from image. The image may be unclear, corrupted, or in an unsupported format.',
    };
  }
}

/**
 * Extract timetable using OCR + LLM text parsing
 * @param {Buffer} imageBuffer - Preprocessed image buffer
 * @returns {Promise<Object>} Extracted timetable data
 */
async function extractWithOCR(imageBuffer) {
  logger.info('Starting OCR-based extraction');

  // Perform OCR
  const ocrResult = await performOCR(imageBuffer);

  // Check if OCR confidence is too low
  if (ocrResult.confidence < config.ocrConfidenceThreshold) {
    logger.warn('OCR confidence too low', {
      confidence: ocrResult.confidence,
      threshold: config.ocrConfidenceThreshold,
    });

    throw new Error(
      `OCR confidence too low (${(ocrResult.confidence * 100).toFixed(1)}%). Image quality may be insufficient. Try a clearer image.`
    );
  }

  // Check if we have meaningful text
  if (!ocrResult.text || ocrResult.text.trim().length < 50) {
    throw new Error('Insufficient text extracted from image. Image may be unclear or contain no timetable data.');
  }

  // Use LLM to parse OCR text
  if (llmService.isConfigured()) {
    logger.info('Using LLM to parse OCR text');
    const result = await llmService.extractFromText(ocrResult.text);

    return {
      success: true,
      ...result,
      extractionMethod: 'ocr + llm-text',
      ocrConfidence: ocrResult.confidence,
    };
  }

  // If LLM is not available, return raw OCR result
  logger.warn('LLM not configured, returning raw OCR text');
  return {
    success: false,
    error: 'LLM not configured for text parsing',
    rawText: ocrResult.text,
    ocrConfidence: ocrResult.confidence,
  };
}

/**
 * Get image metadata
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Image metadata
 */
export async function getImageMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    };
  } catch (error) {
    logger.error('Failed to get image metadata', { error: error.message });
    return null;
  }
}
