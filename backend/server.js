require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json()); // Body parser
app.use(cookieParser());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Basic Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend working" });
});

const { protect } = require('./middleware/authMiddleware');

app.get('/api/protected', protect, (req, res) => {
    res.json({
        message: "You are authorized",
        user: req.user
    });
});

// Default Route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
