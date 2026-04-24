const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // Wait 30s instead of 10s for DNS resolution
            socketTimeoutMS: 75000,         // Prevent network firewalls from killing idle connections
            heartbeatFrequencyMS: 10000     // Keep the heartbeat strong on restrictive Wi-Fi
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
