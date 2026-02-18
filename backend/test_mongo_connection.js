const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');
console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
