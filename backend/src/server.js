// Server Setup
// Features: Security, monitoring, error handling.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import utilities and config
import { connectDB, dbHealthCheck } from './config/database.js';
import logger from './utils/logger.js';
import { AppError, handleCastError, handleDuplicateKeyError, handleValidationError, handleJWTError, handleJWTExpiredError } from './utils/AppError.js';

// Import middleware
import { logRequest, requestId, securityHeaders } from './middlewares/auth.js';
import { sanitizeInput } from './middlewares/validation.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8000;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      await connectDB();
      logger.info('✅ Database initialization completed');
    } catch (error) {
      logger.error(`❌ Database initialization failed: ${error.message}`);
      process.exit(1);
    }
  }

  initializeMiddlewares() {
    // Trust proxy (for apps behind reverse proxy like nginx)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // CORS configuration
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL?.split(',') || ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 hours
    };
    this.app.use(cors(corsOptions));

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('combined', { stream: logger.stream }));
    }

    // Custom middleware
    this.app.use(requestId);
    this.app.use(securityHeaders);
    this.app.use(logRequest);

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf, encoding) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Input sanitization
    this.app.use(sanitizeInput);
  }

  initializeRoutes() {
    // Health check endpoints
    this.app.get('/health', this.healthCheck);
    this.app.get('/api/health', this.healthCheck);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/orders', orderRoutes);

    // Root endpoint
    this.app.get('/', this.rootEndpoint);

    // API documentation endpoint
    this.app.get('/api', this.apiDocumentation);

    // Handle 404 for API routes
    this.app.all('/api/*', this.handleNotFound);

    // Catch all other routes
    this.app.all('*', this.handleNotFound);
  }

  initializeErrorHandling() {
    // Global error handling middleware
    this.app.use(this.globalErrorHandler);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', this.handleUnhandledRejection);

    // Handle uncaught exceptions
    process.on('uncaughtException', this.handleUncaughtException);

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown);
    process.on('SIGINT', this.gracefulShutdown);
  }

  // Route handlers
  healthCheck = async (req, res) => {
    try {
      const dbHealth = await dbHealthCheck();
      const uptime = process.uptime();
      const memory = process.memoryUsage();

      const healthData = {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbHealth,
        memory: {
          used: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memory.external / 1024 / 1024)}MB`
        },
        cpu: {
          usage: process.cpuUsage(),
          platform: process.platform,
          arch: process.arch
        }
      };

      const statusCode = healthData.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json({
        success: statusCode === 200,
        data: healthData
      });
    } catch (error) {
      logger.error(`Health check failed: ${error.message}`);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  rootEndpoint = (req, res) => {
    res.json({
      success: true,
      message: 'Product Store API Server',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        orders: '/api/orders'
      },
      documentation: '/api'
    });
  };

  apiDocumentation = (req, res) => {
    res.json({
      success: true,
      message: 'Product Store API Documentation',
      version: '2.0.0',
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      endpoints: {
        authentication: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          logout: 'POST /auth/logout',
          refreshToken: 'POST /auth/refresh-token',
          profile: 'GET /auth/profile'
        },
        products: {
          list: 'GET /products',
          create: 'POST /products (admin)',
          get: 'GET /products/:id',
          update: 'PUT /products/:id (admin)',
          delete: 'DELETE /products/:id (admin)',
          search: 'GET /products/search?q=query',
          categories: 'GET /products/categories',
          featured: 'GET /products/featured'
        },
        orders: {
          create: 'POST /orders',
          list: 'GET /orders (admin) | GET /users/orders (customer)',
          get: 'GET /orders/:id',
          updateStatus: 'PATCH /orders/:id/status (admin)',
          cancel: 'DELETE /orders/:id'
        },
        users: {
          profile: 'GET /users/profile',
          updateProfile: 'PUT /users/profile',
          changePassword: 'POST /users/change-password',
          cart: 'GET /users/cart',
          addToCart: 'POST /users/cart',
          orders: 'GET /users/orders'
        }
      },
      authentication: 'JWT tokens via HTTP-only cookies or Authorization header',
      rateLimit: '1000 requests per 15 minutes per IP',
      cors: 'Enabled for configured origins'
    });
  };

  handleNotFound = (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path
    });
  };

  // Error handlers
  globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error details
    logger.logError(error, req);

    // MongoDB errors
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }

    if (err.code === 11000) {
      error = handleDuplicateKeyError(error);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
  };

  handleUnhandledRejection = (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    logger.error(err.stack);
    
    // Close server gracefully
    this.server.close(() => {
      process.exit(1);
    });
  };

  handleUncaughtException = (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    
    // Exit immediately
    process.exit(1);
  };

  gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    
    this.server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });

    // Force close server after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  start() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`📍 API available at http://localhost:${this.port}/api`);
      logger.info(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 Health check: http://localhost:${this.port}/health`);
      
      // Additional startup information
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔧 Development mode: Enhanced logging enabled`);
      }
    });

    return this.server;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
