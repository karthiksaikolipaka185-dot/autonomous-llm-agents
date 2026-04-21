const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123'
};

async function testLogin() {
    console.log('Testing Login API...');
    try {
        // 1. Try to register first (in case it doesn't exist)
        try {
            await axios.post(`${API_URL}/register`, {
                name: 'Test User',
                ...TEST_USER
            });
            console.log('User registered.');
        } catch (err) {
            console.log('User might already exist.');
        }

        // 2. Perform Login
        const response = await axios.post(`${API_URL}/login`, TEST_USER);

        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.token) {
            console.log('✅ Login Successful - Token received');
        } else {
            console.log('❌ Login Failed - Token is missing');
        }
    } catch (error) {
        console.error('❌ Error during login test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testLogin();
