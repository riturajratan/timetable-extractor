import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import logger from './utils/logger.js';
import extractRoutes from './routes/extract.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Increase body size limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (UI)
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// Routes
app.use('/api', extractRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Timetable Extraction API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      extract: 'POST /api/extract',
    },
    documentation: 'See README.md for API documentation',
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Timetable Extraction API started on port ${PORT}`);
  logger.info(`📋 Environment: ${config.nodeEnv}`);
  logger.info(`🤖 LLM Service: ${config.openaiApiKey ? 'Configured ✓' : 'Not configured ✗'}`);
  logger.info(`📁 Max file size: ${config.maxFileSize / 1024 / 1024}MB`);
  logger.info(`🔧 OCR enabled: ${config.enableOCR}`);
  logger.info(`👁️  LLM Vision enabled: ${config.enableLLMVision}`);
  logger.info('');
  logger.info(`Ready to accept requests at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

export default app;
