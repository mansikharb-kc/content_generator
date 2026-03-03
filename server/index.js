require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Middleware
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            'http://localhost:3000',
            process.env.CORS_ORIGIN
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps or curl)
        // Or any localhost/127.0.0.1 for development ease
        if (!origin ||
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/images', require('./routes/images'));

// Root diagnostic
app.get('/api/router-health', (req, res) => res.json({
    msg: 'Server Router Health OK',
    timestamp: new Date().toISOString()
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Inspector (Diagnostic)
const listRoutes = (app) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^', '').replace('\\', '') + handler.route.path;
                    routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${path}`);
                }
            });
        }
    });
    console.log('--- REGISTERED ROUTES ---');
    routes.sort().forEach(r => console.log(r));
    console.log('-------------------------');
};
setTimeout(() => listRoutes(app), 5000);

// MongoDB connection
connectDB().catch(err => {
    console.error('Initial MongoDB Connection Failed. Server will keep running but DB requests will fail.');
});

// Start server
const PORT = process.env.PORT || 8080;
// In serverless (Vercel), app.listen is ignored, but we MUST call it for Render/Docker.
// We skip it only if we're specifically being run as a Vercel function.
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

// Export for serverless compatibility
module.exports = app;
