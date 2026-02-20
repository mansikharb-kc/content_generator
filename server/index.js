require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection
const sequelize = require('./config/database');
const User = require('./models/User');
const Idea = require('./models/Idea');
const DeletedIdea = require('./models/DeletedIdea');
const IdeaPlatformContent = require('./models/IdeaPlatformContent');

// Sync Database
sequelize.sync()
    .then(() => console.log('MySQL Connected & Models Synced'))
    .catch(err => console.log('Error syncing database:', err));

// Use Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
