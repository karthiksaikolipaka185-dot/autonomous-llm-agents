const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

module.exports = { protect };
