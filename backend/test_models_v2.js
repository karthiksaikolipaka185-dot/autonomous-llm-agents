const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("Starting model tests...");

    for (const modelName of modelsToTry) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} responded: ${response.text().substring(0, 50)}...`);
        } catch (e) {
            console.log(`FAILURE: ${modelName} failed. Error: ${e.message}`);
        }
    }
}

testModels();
