// Enhanced Database Configuration
// MongoDB connection with connection pooling, monitoring, and error handling

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

class Database {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const options = {
      // Connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      
      // Buffer options
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      
      // Additional options
      retryWrites: true,
      w: 'majority'
    };

    try {
      await mongoose.connect(process.env.MONGO_URI, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      logger.info(`📊 Database: ${mongoose.connection.name}`);
      
      this.setupEventListeners();
      
    } catch (error) {
      this.isConnected = false;
      logger.error(`❌ Database connection failed: ${error.message}`);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        logger.warn(`🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries}) in ${this.retryDelay/1000}s...`);
        
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      } else {
        logger.error('❌ Maximum connection retries reached. Exiting...');
        process.exit(1);
      }
    }
  }

  setupEventListeners() {
    const db = mongoose.connection;

    // Connection events
    db.on('connecting', () => {
      logger.info('🔄 Connecting to MongoDB...');
    });

    db.on('connected', () => {
      logger.info('✅ Connected to MongoDB');
      this.isConnected = true;
    });

    db.on('open', () => {
      logger.info('📖 MongoDB connection opened');
    });

    db.on('disconnecting', () => {
      logger.warn('⚠️ Disconnecting from MongoDB...');
      this.isConnected = false;
    });

    db.on('disconnected', () => {
      logger.warn('❌ Disconnected from MongoDB');
      this.isConnected = false;
    });

    db.on('close', () => {
      logger.warn('🔒 MongoDB connection closed');
      this.isConnected = false;
    });

    db.on('reconnected', () => {
      logger.info('🔄 Reconnected to MongoDB');
      this.isConnected = true;
    });

    // Error handling
    db.on('error', (error) => {
      logger.error(`❌ MongoDB connection error: ${error.message}`);
      this.isConnected = false;
    });

    // Monitoring events
    db.on('fullsetup', () => {
      logger.info('🔧 MongoDB replica set fully set up');
    });

    db.on('all', () => {
      logger.info('🌟 All MongoDB servers connected');
    });

    // Process termination handlers
    process.on('SIGINT', this.gracefulShutdown.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.gracefulShutdown.bind(this, 'SIGTERM'));
    process.on('SIGUSR2', this.gracefulShutdown.bind(this, 'SIGUSR2')); // Nodemon restart
  }

  async gracefulShutdown(signal) {
    logger.info(`🔄 Received ${signal}. Gracefully shutting down...`);
    
    try {
      await mongoose.connection.close();
      logger.info('✅ Database connection closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error(`❌ Error during database shutdown: ${error.message}`);
      process.exit(1);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        ping: result.ok === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  // Get connection statistics
  getStats() {
    const db = mongoose.connection;
    
    return {
      readyState: this.getReadyStateText(db.readyState),
      host: db.host,
      name: db.name,
      collections: Object.keys(db.collections),
      models: mongoose.modelNames()
    };
  }

  getReadyStateText(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    return states[state] || 'unknown';
  }

  // Database seeding helper
  async seed() {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('⚠️ Seeding disabled in production environment');
      return;
    }

    logger.info('🌱 Starting database seeding...');
    
    try {
      // Add seeding logic here if needed
      logger.info('✅ Database seeding completed');
    } catch (error) {
      logger.error(`❌ Database seeding failed: ${error.message}`);
      throw error;
    }
  }

  // Create indexes for better performance
  async createIndexes() {
    try {
      logger.info('📊 Creating database indexes...');
      
      // User indexes
      await mongoose.connection.collection('users').createIndex(
        { email: 1 }, 
        { unique: true, background: true }
      );
      
      // Product indexes
      await mongoose.connection.collection('products').createIndex(
        { name: 'text', description: 'text', category: 'text' },
        { background: true }
      );
      
      await mongoose.connection.collection('products').createIndex(
        { category: 1, status: 1, isActive: 1 },
        { background: true }
      );
      
      // Order indexes
      await mongoose.connection.collection('orders').createIndex(
        { customer: 1, createdAt: -1 },
        { background: true }
      );
      
      await mongoose.connection.collection('orders').createIndex(
        { orderNumber: 1 },
        { unique: true, background: true }
      );
      
      logger.info('✅ Database indexes created successfully');
    } catch (error) {
      logger.error(`❌ Failed to create indexes: ${error.message}`);
    }
  }
}

// Create singleton instance
const database = new Database();

// Export both the class and instance
export default database;
export { Database };

// Helper function for other modules
export const connectDB = async () => {
  await database.connect();
  await database.createIndexes();
};

// Export health check function
export const dbHealthCheck = async () => {
  return await database.healthCheck();
};
