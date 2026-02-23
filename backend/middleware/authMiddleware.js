const jwt = require('jsonwebtoken');

/**
 * @desc    Middleware to protect routes - Verify Bearer token
 */
const protect = async (req, res, next) => {
    let token;

    // Read token from cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = { protect };
