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

        // Verification logic
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role, isPublic: false };
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

