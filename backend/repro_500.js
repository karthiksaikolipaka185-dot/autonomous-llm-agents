require('dotenv').config();
const express = require('express');
const http = require('http');

const app = express();
const apiRouter = require('./routes/api');

app.use(express.json());
app.use('/api', apiRouter);

const PORT = 5001;
const server = app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);

    const postData = JSON.stringify({
        destination: "Goa",
        budget: "15000",
        days: "3",
        type: "Solo"
    });

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/agent/plan',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            console.log('Response Body:', data);
            server.close();
            if (res.statusCode === 500) {
                console.error("SUCCESS: 500 ERROR REPRODUCED");
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        server.close();
    });

    req.write(postData);
    req.end();
});
