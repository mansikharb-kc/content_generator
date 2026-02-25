require('dotenv').config();

// Override DNS to bypass ISP SRV record blocking (needed for MongoDB Atlas srv)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://content-generator-beta-one.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/', (req, res) => res.json({
    status: 'API running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));


// MongoDB connection (cached for serverless reuse)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            family: 4
        });
        isConnected = true;
        console.log('✅ MongoDB Atlas connected!');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
    }
};

connectDB();

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// Export for serverless compatibility
module.exports = app;
