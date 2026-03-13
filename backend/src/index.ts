import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config, isDevelopment } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import journalRoutes from './routes/journalRoutes';
import systemRoutes from './routes/systemRoutes';

// Initialize Express app
const app = express();

// ============================
// Security Middleware
// ============================
app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : undefined,
}));

// ============================
// CORS Configuration
// ============================
app.use(cors({
  origin: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
    : process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================
// Body Parsing & Compression
// ============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ============================
// Logging
// ============================
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// ============================
// Rate Limiting
// ============================
app.use('/api', apiLimiter);

// ============================
// API Routes
// ============================
app.use('/api/journal', journalRoutes);
app.use('/api', systemRoutes);

// ============================
// Root Route
// ============================
app.get('/', (req, res) => {
  res.json({
    name: 'ArvyaX Journal API',
    version: '1.0.0',
    description: 'AI-Assisted Journal System for mental wellness tracking',
    endpoints: {
      journal: {
        create: 'POST /api/journal',
        getAll: 'GET /api/journal/:userId',
        getOne: 'GET /api/journal/entry/:entryId',
        delete: 'DELETE /api/journal/:userId/:entryId',
      },
      analysis: {
        analyze: 'POST /api/journal/analyze',
        stream: 'POST /api/journal/analyze/stream',
      },
      insights: {
        get: 'GET /api/journal/insights/:userId',
      },
      system: {
        health: 'GET /api/health',
        stats: 'GET /api/stats',
      },
    },
    documentation: 'See README.md for full API documentation',
  });
});

// ============================
// 404 Handler
// ============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ============================
// Error Handler
// ============================
app.use(errorHandler);

// ============================
// Start Server
// ============================
const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🌿 ArvyaX Journal API Server                            ║
  ║                                                           ║
  ║   🚀 Server running on http://localhost:${PORT}              ║
  ║   📝 Environment: ${config.NODE_ENV.padEnd(15)}                    ║
  ║   🤖 LLM: ${config.GROQ_API_KEY ? 'Groq API Connected' : 'Fallback Mode'}                   ║
  ║                                                           ║
  ║   Endpoints:                                              ║
  ║   • POST   /api/journal          - Create entry           ║
  ║   • GET    /api/journal/:userId  - Get entries            ║
  ║   • POST   /api/journal/analyze  - Analyze text           ║
  ║   • GET    /api/journal/insights/:userId - Get insights   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
