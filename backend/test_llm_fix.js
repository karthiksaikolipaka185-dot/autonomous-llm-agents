require("dotenv").config();
const { callLLM } = require("./utils/llm");

async function test() {
    try {
        console.log("Testing callLLM with updated model...");
        const result = await callLLM("Return a simple JSON like { \"status\": \"ok\" }", "You are a helper.");
        console.log("LLM Call Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("LLM Call Failed:", e.message);
    }
}
test();
