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

        // Handle case where token is literally "null" or "undefined" as a string from client
        if (token === 'null' || token === 'undefined') {
            token = null;
        }

        // Allow public access ONLY if no token is provided at all
        if (!token) {
            req.user = { id: 'public-user', isPublic: true };
            return next();
        }

        // Verify JWT token
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = { id: decoded.userId, role: decoded.role, isPublic: false };
            next();
        } catch (err) {
            console.error('[AUTH] Token verification failed:', err.message);
            // If a token was provided but is invalid, we should return 401
            // instead of silently falling back to public-user in most cases,
            // but for backward compatibility with "soft" auth, we'll keep the fallback 
            // but make it easier to debug.
            return res.status(401).json({ msg: 'Invalid or expired token', error: err.message });
        }
    } catch (err) {
        console.error('[AUTH] Middleware error:', err.message);
        res.status(500).json({ msg: 'Server authentication error' });
    }
};
