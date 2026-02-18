const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { analyzeRequest } = require('./agents/planner');

const testHii = async () => {
    console.log("Testing input: 'hii'");
    try {
        const result = await analyzeRequest({ text: 'hii' });
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("CRASHED:", error);
    }
};

testHii();
