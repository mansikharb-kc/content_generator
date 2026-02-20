const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const OldIdea = sequelize.define('OldIdea', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// Define relationship
User.hasMany(OldIdea, { onDelete: 'CASCADE' });
OldIdea.belongsTo(User);

module.exports = OldIdea;
