import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // OpenAI API
  openaiApiKey: process.env.OPENAI_API_KEY,

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/png,image/jpeg,application/pdf').split(','),
  uploadDir: './uploads',

  // Processing
  ocrConfidenceThreshold: parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.6,
  enableOCR: process.env.ENABLE_OCR !== 'false',
  enableLLMVision: process.env.ENABLE_LLM_VISION !== 'false',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // LLM Configuration
  llm: {
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0,
  },
};

// Validation
if (!config.openaiApiKey && config.nodeEnv !== 'test') {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not set. LLM features will not work.');
}
