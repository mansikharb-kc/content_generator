const { clerkClient } = require('@clerk/clerk-sdk-node');

module.exports = async function (req, res, next) {
    // Support both header types
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    } else {
        token = req.header('x-auth-token');
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = await clerkClient.verifyToken(token);
        // Clerk uses 'sub' for the user ID
        req.user = { id: decoded.sub };
        next();
    } catch (err) {
        console.error('Clerk verify error:', err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

