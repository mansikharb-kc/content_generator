module.exports = function (roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        if (req.user.isPublic) {
            return res.status(403).json({ msg: 'Access denied: login required' });
        }

        if (roles && !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: `Access denied: ${req.user.role} role not authorized` });
        }

        next();
    };
};
