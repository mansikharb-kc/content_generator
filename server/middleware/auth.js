// Simple auth middleware - allows authenticated requests
// For production, implement proper JWT verification

module.exports = async function (req, res, next) {
    // Support both header types
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    } else {
        token = req.header('x-auth-token');
    }

    // Check if token exists
    if (!token) {
        // For now, allow public access with generic user ID
        req.user = { id: 'public-user', isPublic: true };
        return next();
    }

    // If token provided, use it as user ID (simple verification)
    try {
        req.user = { id: token, isPublic: false };
        next();
    } catch (err) {
        console.error('Auth error:', err);
        // Still allow request with public user
        req.user = { id: 'public-user', isPublic: true };
        next();
    }
};

