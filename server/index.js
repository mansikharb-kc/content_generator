require('dotenv').config();
// Override DNS to bypass ISP SRV record blocking
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (always works, even without DB)
app.get('/', (req, res) => res.json({ status: 'API running', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));

// Start server FIRST, then connect DB (so server doesn't crash on DB failure)
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// Connect MongoDB with auto-retry
const connectWithRetry = () => {
    console.log('🔌 Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ MongoDB Atlas connected!');
        })
        .catch(err => {
            console.error('❌ MongoDB connection failed:', err.message);
            console.log('🔄 Retrying in 10 seconds...');
            setTimeout(connectWithRetry, 10000);
        });
};

connectWithRetry();
