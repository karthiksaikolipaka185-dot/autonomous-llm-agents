const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
};

async function testAuth() {
    console.log('Starting Auth Tests...');

    try {
        // 1. Register
        console.log(`1. Testing Registration for ${TEST_USER.email}...`);
        const regRes = await axios.post(`${API_URL}/register`, TEST_USER);
        if (regRes.data.token && regRes.data.user) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed:', regRes.data);
        }

        // 2. Login
        console.log('2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        const token = loginRes.data.token;
        if (token) {
            console.log('✅ Login Successful');
        } else {
            console.error('❌ Login Failed:', loginRes.data);
            return;
        }

        // 3. Protected Route
        console.log('3. Testing Protected User Route...');
        try {
            const userRes = await axios.get(`${API_URL}/user`, {
                headers: { 'x-auth-token': token }
            });
            if (userRes.data.email === TEST_USER.email) {
                console.log('✅ Protected Route Success');
            } else {
                console.error('❌ Protected Route Failed:', userRes.data);
            }
        } catch (err) {
            console.error('❌ Protected Route Error:', err.message);
        }

    } catch (error) {
        console.error('⚠️ Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testAuth();
