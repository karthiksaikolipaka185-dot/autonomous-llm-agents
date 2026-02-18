const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = new User({
            name: 'Test Repro',
            email: 'repro_' + Date.now() + '@example.com',
            password: 'password123'
        });

        console.log('Attempting to save user...');
        await user.save();
        console.log('User saved successfully');

    } catch (err) {
        console.error('ERROR CAUGHT:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

run();
