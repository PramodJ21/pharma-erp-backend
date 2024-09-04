const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Token is usually sent as "Bearer <token>"
        req.user = decoded; // Attach the decoded user information to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware to check if the user has a specific role
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'User not authenticated.' });
        }

        const { roles } = req.user;
        const hasRole = allowedRoles.some(role => roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Access denied. You do not have permission to perform this action.' });
        }

        next();
    };
};

module.exports = { verifyToken, authorizeRoles };
