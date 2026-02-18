const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash"
];

const payload = JSON.stringify({
    contents: [{ parts: [{ text: "Hello" }] }]
});

console.log("Testing generateContent for candidates...");

function testModel(modelName) {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`SUCCESS: ${modelName}`);
                    resolve(modelName); // Found one!
                } else {
                    console.log(`FAILED: ${modelName} (${res.statusCode})`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`ERROR: ${modelName} - ${e.message}`);
            resolve(null);
        });

        req.write(payload);
        req.end();
    });
}

async function run() {
    for (const m of models) {
        await testModel(m);
    }
}

run();
