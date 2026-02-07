const mongoose = require('mongoose');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

class DatabaseAdapter {
  constructor(type) {
    this.type = type || 'mongodb';
    this.connection = null;
    logger.log(`DatabaseAdapter initialized with type: ${this.type}`);
  }

  async connect(connectionString) {
    logger.log(`Attempting to connect to ${this.type} database...`);
    
    try {
      switch (this.type) {
        case 'mongodb':
          await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 3000,
          });
          this.connection = mongoose.connection;
          logger.log('MongoDB connected successfully');
          break;

        case 'postgresql':
          this.connection = new Pool({ connectionString });
          await this.connection.query('SELECT NOW()');
          logger.log('PostgreSQL connected successfully');
          break;

        case 'mysql':
          this.connection = await mysql.createConnection(connectionString);
          await this.connection.query('SELECT 1');
          logger.log('MySQL connected successfully');
          break;

        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
      return true;
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  async find(collection, query = {}) {
    logger.log(`Finding in ${collection}:`, query);
    
    try {
      switch (this.type) {
        case 'mongodb':
          const Model = mongoose.model(collection);
          return await Model.find(query);

        case 'postgresql':
        case 'mysql':
          const whereClause = Object.keys(query).length > 0
            ? 'WHERE ' + Object.keys(query).map(k => `${k} = ?`).join(' AND ')
            : '';
          const values = Object.values(query);
          
          if (this.type === 'postgresql') {
            const pgQuery = whereClause.replace(/\?/g, (_, i) => `$${i + 1}`);
            const result = await this.connection.query(
              `SELECT * FROM ${collection} ${pgQuery}`,
              values
            );
            return result.rows;
          } else {
            const [rows] = await this.connection.query(
              `SELECT * FROM ${collection} ${whereClause}`,
              values
            );
            return rows;
          }

        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error(`Error finding in ${collection}:`, error);
      throw error;
    }
  }

  async insert(collection, data) {
    logger.log(`Inserting into ${collection}:`, data);
    
    try {
      switch (this.type) {
        case 'mongodb':
          const Model = mongoose.model(collection);
          return await Model.create(data);

        case 'postgresql':
          const pgColumns = Object.keys(data).join(', ');
          const pgPlaceholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
          const pgValues = Object.values(data);
          const pgResult = await this.connection.query(
            `INSERT INTO ${collection} (${pgColumns}) VALUES (${pgPlaceholders}) RETURNING *`,
            pgValues
          );
          return pgResult.rows[0];

        case 'mysql':
          const columns = Object.keys(data).join(', ');
          const placeholders = Object.keys(data).map(() => '?').join(', ');
          const values = Object.values(data);
          const [result] = await this.connection.query(
            `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`,
            values
          );
          return { id: result.insertId, ...data };

        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error(`Error inserting into ${collection}:`, error);
      throw error;
    }
  }

  async update(collection, query, data) {
    logger.log(`Updating ${collection} where:`, query, 'with:', data);
    
    try {
      switch (this.type) {
        case 'mongodb':
          const Model = mongoose.model(collection);
          return await Model.updateMany(query, data);

        case 'postgresql':
        case 'mysql':
          const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
          const whereClause = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
          const values = [...Object.values(data), ...Object.values(query)];
          
          if (this.type === 'postgresql') {
            const pgQuery = (setClause + ' ' + whereClause).replace(/\?/g, (_, i) => `$${i + 1}`);
            return await this.connection.query(
              `UPDATE ${collection} SET ${pgQuery.split(' ').slice(0, Object.keys(data).length).join(' ')} WHERE ${pgQuery.split(' WHERE ')[1]}`,
              values
            );
          } else {
            return await this.connection.query(
              `UPDATE ${collection} SET ${setClause} WHERE ${whereClause}`,
              values
            );
          }

        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error(`Error updating ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection, query) {
    logger.log(`Deleting from ${collection} where:`, query);
    
    try {
      switch (this.type) {
        case 'mongodb':
          const Model = mongoose.model(collection);
          return await Model.deleteMany(query);

        case 'postgresql':
        case 'mysql':
          const whereClause = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
          const values = Object.values(query);
          
          if (this.type === 'postgresql') {
            const pgQuery = whereClause.replace(/\?/g, (_, i) => `$${i + 1}`);
            return await this.connection.query(
              `DELETE FROM ${collection} WHERE ${pgQuery}`,
              values
            );
          } else {
            return await this.connection.query(
              `DELETE FROM ${collection} WHERE ${whereClause}`,
              values
            );
          }

        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error(`Error deleting from ${collection}:`, error);
      throw error;
    }
  }

  async disconnect() {
    logger.log('Disconnecting from database...');
    
    try {
      switch (this.type) {
        case 'mongodb':
          await mongoose.disconnect();
          break;

        case 'postgresql':
          await this.connection.end();
          break;

        case 'mysql':
          await this.connection.end();
          break;
      }
      logger.log('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }
}

module.exports = DatabaseAdapter;
