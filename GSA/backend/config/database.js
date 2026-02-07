require('dotenv').config();
const DatabaseAdapter = require('../utils/dbAdapter');
const logger = require('../utils/logger');

const dbType = process.env.DB_TYPE || 'mongodb';
const connectionStrings = {
  mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/gsa',
  postgresql: process.env.POSTGRES_URI || 'postgresql://user:password@localhost:5432/gsa',
  mysql: process.env.MYSQL_URI || 'mysql://user:password@localhost:3306/gsa'
};

const db = new DatabaseAdapter(dbType);

const connectDB = async () => {
  try {
    logger.log(`Connecting to ${dbType} database...`);
    const connectionString = connectionStrings[dbType];
    
    if (!connectionString) {
      throw new Error(`No connection string found for database type: ${dbType}`);
    }
    
    await db.connect(connectionString);
    logger.log('Database connection established successfully');
    return db;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    
    // For development, we'll use in-memory storage if DB connection fails
    if (process.env.NODE_ENV === 'development') {
      logger.log('Using in-memory storage for development');
      return null;
    }
    
    process.exit(1);
  }
};

module.exports = { db, connectDB };
