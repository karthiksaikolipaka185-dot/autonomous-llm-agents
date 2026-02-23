require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Basic Test Route
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: "Backend working" });
});

const { protect } = require('./middleware/authMiddleware');

// Protected Test Route
app.get('/api/protected', protect, (req, res) => {
    res.status(200).json({
        message: "You are authorized",
        user: req.user
    });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
