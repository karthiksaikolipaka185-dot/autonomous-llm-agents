const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For some versions of the SDK, getting the model is different. 
    // But generally we might not have a direct listModels method on the client instance in some older versions,
    // but looking at source or docs, it is often via a specific manager or just try/catch on a known one.
    // Actually, the error says "Call ListModels", which is an API call. 
    // valid way in node SDK might not be exposed directly locally, but let's try to just run a simple generation with 'gemini-pro' to see if that works,
    // or use the rest API directly if SDK doesn't support listing easily (SDK usually does).

    // Let's try to use the model that IS usually there 'gemini-1.5-flash' but maybe there is a typo in my understanding or env.
    // We can also try 'gemini-pro'.

    try {
        console.log("Trying gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);
    }

    try {
        console.log("Trying gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-pro:", e.message);
    }
}

listModels();
