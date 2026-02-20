const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Idea = require('./Idea');
const User = require('./User');

const IdeaPlatformContent = sequelize.define('IdeaPlatformContent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    idea_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Ideas',
            key: 'id'
        }
    },
    instagram: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    facebook: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    pinterest: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    youtube: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    linkedin: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    whatsapp_community: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'idea_platform_content'
});

// Relationships
Idea.hasOne(IdeaPlatformContent, { foreignKey: 'idea_id', onDelete: 'CASCADE' });
IdeaPlatformContent.belongsTo(Idea, { foreignKey: 'idea_id' });

User.hasMany(IdeaPlatformContent, { onDelete: 'CASCADE' });
IdeaPlatformContent.belongsTo(User);

module.exports = IdeaPlatformContent;
