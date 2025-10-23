import logger from '../utils/logger.js';
import * as llmService from './llmService.js';

/**
 * Process PDF file and extract timetable data
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<Object>} Extracted timetable data
 */
export async function processPDF(fileBuffer) {
  logger.info('Starting PDF processing');

  try {
    // Dynamic import to avoid initialization issues in serverless
    const pdfParse = (await import('pdf-parse')).default;

    // Extract text from PDF
    const startTime = Date.now();
    const pdfData = await pdfParse(fileBuffer);
    const extractionTime = Date.now() - startTime;

    logger.info('PDF text extracted', {
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
      extractionTime,
    });

    // If text extraction was successful and we have content
    if (pdfData.text && pdfData.text.trim().length > 50) {
      logger.info('PDF contains extractable text, using LLM text extraction');
      const result = await llmService.extractFromText(pdfData.text);

      return {
        success: true,
        ...result,
        extractionMethod: 'pdf-parse + llm-text',
      };
    }

    // If text extraction failed or insufficient content (might be scanned PDF)
    logger.warn('PDF has insufficient text content, may be scanned image', {
      textLength: pdfData.text.length,
    });

    // For scanned PDFs, we would need to convert to image first
    // For this prototype, we'll return an error suggesting to upload as image
    throw new Error(
      'PDF appears to be a scanned image. Please convert to PNG/JPEG and upload again, or the PDF may be empty.'
    );
  } catch (error) {
    logger.error('PDF processing failed', {
      error: error.message,
      stack: error.stack,
    });

    throw {
      code: 'PDF_PROCESSING_FAILED',
      message: error.message,
      details: 'Failed to extract text from PDF. The file may be corrupted, password-protected, or a scanned image.',
    };
  }
}

/**
 * Check if PDF has extractable text
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {Promise<boolean>}
 */
export async function hasExtractableText(fileBuffer) {
  try {
    // Dynamic import to avoid initialization issues in serverless
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text && pdfData.text.trim().length > 50;
  } catch (error) {
    logger.error('Failed to check PDF text', { error: error.message });
    return false;
  }
}
