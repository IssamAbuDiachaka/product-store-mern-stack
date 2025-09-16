//  Logger Configuration
//  Winston logger setup for structured logging

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// link the colors to winston
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different colors for each level
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors to the message
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Allow the use of the console to print the messages
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  // Allow to print all the messages inside the all.log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false
});

// Create a stream object with a 'write' function for morgan
logger.stream = {
  write: (message) => {
    // Use the http severity level
    logger.http(message.trim());
  }
};

// Custom logging methods for different scenarios
logger.logRequest = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms - ${req.ip}`;
  
  if (res.statusCode >= 400) {
    logger.error(message);
  } else {
    logger.http(message);
  }
};

logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString()
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (req.user) {
      errorInfo.user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      };
    }
  }

  logger.error(JSON.stringify(errorInfo, null, 2));
};

logger.logAuth = (event, userId, details = {}) => {
  const authInfo = {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  };

  logger.info(`AUTH: ${JSON.stringify(authInfo)}`);
};

logger.logBusiness = (event, data = {}) => {
  const businessInfo = {
    event,
    timestamp: new Date().toISOString(),
    ...data
  };

  logger.info(`BUSINESS: ${JSON.stringify(businessInfo)}`);
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  const perfInfo = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  if (duration > 1000) {
    logger.warn(`PERFORMANCE: Slow operation detected - ${JSON.stringify(perfInfo)}`);
  } else {
    logger.debug(`PERFORMANCE: ${JSON.stringify(perfInfo)}`);
  }
};

export default logger;
