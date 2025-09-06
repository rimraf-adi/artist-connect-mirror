import { PrismaClient } from '../generated/prisma';
import { getRedisClient } from '../utils/redis';
import { logger } from '../utils/logger';

async function testConnections() {
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    logger.info('Testing database connection...');
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    // Test Redis connection
    logger.info('Testing Redis connection...');
    const redis = getRedisClient();
    await redis.ping();
    logger.info('✅ Redis connection successful');

    // Test basic database operations
    logger.info('Testing database operations...');
    const artisanCount = await prisma.artisan.count();
    logger.info(`✅ Database operations successful. Found ${artisanCount} artisans`);

    logger.info('🎉 All connections and operations successful!');
  } catch (error) {
    logger.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnections();
