const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

module.exports = async function (req, res, next) {
    try {
        // Support both header types
        let token = req.header('Authorization');
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        } else {
            token = req.header('x-auth-token');
        }

        // Allow public access if no token
        if (!token) {
            req.user = { id: 'public-user', isPublic: true };
            return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role, isPublic: false };
        next();
    } catch (err) {
        // If token invalid, use public access
        console.error('Auth error:', err.message);
        req.user = { id: 'public-user', isPublic: true };
        next();
    }
};
