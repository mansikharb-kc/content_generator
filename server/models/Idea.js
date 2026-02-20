const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Idea = sequelize.define('Idea', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lockedData: {
        type: DataTypes.TEXT, // Store JSON string of the results
        allowNull: true
    }
});

// Define relationship
User.hasMany(Idea, { onDelete: 'CASCADE' });
Idea.belongsTo(User);

module.exports = Idea;
