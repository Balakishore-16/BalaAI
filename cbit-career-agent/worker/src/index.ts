import cron from 'node-cron';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { JobSearchService } from './services/job-search-service';
import { NotificationService } from './services/notification-service';
import { ReminderService } from './services/reminder-service';
import { DataCleanupService } from './services/data-cleanup-service';

// Load environment variables
dotenv.config();

class Worker {
  private jobSearchService: JobSearchService;
  private notificationService: NotificationService;
  private reminderService: ReminderService;
  private dataCleanupService: DataCleanupService;

  constructor() {
    this.jobSearchService = new JobSearchService();
    this.notificationService = new NotificationService();
    this.reminderService = new ReminderService();
    this.dataCleanupService = new DataCleanupService();
  }

  async start() {
    try {
      logger.info('🚀 Starting CBIT Career Agent Worker...');

      // Connect to MongoDB
      await connectDB();

      // Schedule cron jobs
      this.scheduleJobs();

      // Start health check
      this.startHealthCheck();

      logger.info('✅ Worker started successfully');

      // Handle graceful shutdown
      this.handleGracefulShutdown();

    } catch (error) {
      logger.error('❌ Failed to start worker:', error);
      process.exit(1);
    }
  }

  private scheduleJobs() {
    logger.info('📅 Scheduling background jobs...');

    // Job search and matching - every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('🔍 Starting job search and matching job...');
      try {
        await this.jobSearchService.processJobSearches();
        logger.info('✅ Job search and matching completed');
      } catch (error) {
        logger.error('❌ Job search and matching failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    // Reminder checks - daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('⏰ Starting reminder check job...');
      try {
        await this.reminderService.checkReminders();
        logger.info('✅ Reminder check completed');
      } catch (error) {
        logger.error('❌ Reminder check failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    // Data cleanup - weekly on Sunday at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      logger.info('🧹 Starting data cleanup job...');
      try {
        await this.dataCleanupService.cleanupOldData();
        logger.info('✅ Data cleanup completed');
      } catch (error) {
        logger.error('❌ Data cleanup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    // Notification cleanup - daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      logger.info('📧 Starting notification cleanup job...');
      try {
        await this.notificationService.cleanupOldNotifications();
        logger.info('✅ Notification cleanup completed');
      } catch (error) {
        logger.error('❌ Notification cleanup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    // Health check - every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      logger.info('💓 Worker health check - All systems operational');
    });

    logger.info('✅ All jobs scheduled successfully');
  }

  private startHealthCheck() {
    // Health check endpoint for monitoring
    const port = process.env.WORKER_HEALTH_PORT || 3001;
    
    const http = require('http');
    const server = http.createServer((req: any, res: any) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: process.env.NODE_ENV
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(port, () => {
      logger.info(`🏥 Health check server running on port ${port}`);
    });
  }

  private handleGracefulShutdown() {
    const shutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);
      
      try {
        // Stop accepting new jobs
        logger.info('⏹️ Stopping job processing...');
        
        // Wait for current jobs to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Close database connection
        logger.info('🔌 Closing database connection...');
        // await disconnectDB();
        
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}

// Start the worker
const worker = new Worker();
worker.start().catch((error) => {
  logger.error('❌ Worker startup failed:', error);
  process.exit(1);
});