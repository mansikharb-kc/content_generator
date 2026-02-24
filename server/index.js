require('dotenv').config();

// Override DNS to bypass ISP SRV record blocking (needed for MongoDB Atlas srv)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({
    status: 'API running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// Routes
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

// Start server if not running as a Vercel serverless function
// Render and other traditional hosts need app.listen()
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Export for Vercel serverless (optional for Render but keeps compatibility)
module.exports = app;
