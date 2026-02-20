const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'content_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Mansi@123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
            ? { ssl: { rejectUnauthorized: false } }   // required by most cloud MySQL hosts
            : {}
    }
);

module.exports = sequelize;
