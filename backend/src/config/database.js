const { Sequelize } = require('sequelize');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const dbUrl = process.env.DATABASE_URL;

const sequelize = dbUrl && !dbUrl.startsWith('sqlite')
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: isDev ? console.log : false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: isDev ? console.log : false
    });

module.exports = sequelize;
