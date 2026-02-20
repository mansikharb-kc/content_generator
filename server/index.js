require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('API is running...'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
