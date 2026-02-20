const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const DeletedIdea = sequelize.define('DeletedIdea', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    originalId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: true
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

User.hasMany(DeletedIdea, { onDelete: 'CASCADE' });
DeletedIdea.belongsTo(User);

module.exports = DeletedIdea;
