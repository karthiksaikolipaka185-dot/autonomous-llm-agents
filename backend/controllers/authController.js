const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // Check user existence
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: "User registered successfully"
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide an email and password" });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.status(200).json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

