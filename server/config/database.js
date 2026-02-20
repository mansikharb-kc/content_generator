const Sequelize = require('sequelize');

const sequelize = new Sequelize('content_db', 'root', 'Mansi@123', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
