const User = require('../models/User');

const jwt = require('jsonwebtoken');

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

        // Response (No JWT yet)
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

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
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

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
