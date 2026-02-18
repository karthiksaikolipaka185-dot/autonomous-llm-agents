const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const callLLM = async (prompt, systemInstruction = "") => {
    console.log("Checking API Keys...");
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    console.log(`API KEY PRESENT: OpenAI=${hasOpenAI}, Gemini=${hasGemini}`);

    if (!hasOpenAI && !hasGemini) {
        console.warn("No API Key found. Returning null (will trigger fallback logic).");
        return null;
    }

    try {
        // Prefer Gemini for this demo (often free tier available)
        if (hasGemini) {
            const modelsToTry = [
                "gemini-1.5-flash",
                "gemini-1.5-flash-001",
                "gemini-1.5-flash-latest",
                "gemini-flash",
                "gemini-2.0-flash-exp",
                "gemini-pro",
                "gemini-1.5-pro-latest",
                "gemini-1.0-pro"
            ];

            let lastError = null;
            let result = null;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`Trying Gemini model: ${modelName}...`);
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    result = await model.generateContent(systemInstruction + "\n\n" + prompt);
                    console.log(`Success with ${modelName}`);
                    break;
                } catch (e) {
                    console.warn(`Failed with ${modelName}: ${e.message}`);
                    lastError = e;
                    if (e.message.includes("429")) {
                        // If rate limited, maybe we should stop or try next? 
                        // Usually rate limit applies to the project, but different models might have different quotas.
                        // We continue to try others.
                    }
                }
            }

            if (!result) {
                throw lastError || new Error("All Gemini models failed.");
            }

            const response = result.response;

            if (!response) {
                throw new Error("No response from Gemini");
            }

            // Check for safety blocks if available
            if (response.promptFeedback && response.promptFeedback.blockReason) {
                throw new Error(`Gemini Blocked: ${response.promptFeedback.blockReason}`);
            }

            const text = response.text();
            console.log("Gemini Response Text:", text.substring(0, 100) + "..."); // Log start of response

            return parseJSON(text);
        }

        // Fallback to OpenAI
        if (hasOpenAI) {
            console.log("Using OpenAI...");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction + "\nRespond in valid JSON only." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-3.5-turbo",
            });

            return parseJSON(completion.choices[0].message.content);
        }

    } catch (error) {
        console.error("LLM Call Failed:", error);
        throw new Error(`LLM Processing Failed: ${error.message}`);
    }
};

const parseJSON = (text) => {
    try {
        // Cleaning markdown code blocks if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(cleanText);
    } catch (err) {
        console.error("Failed to parse LLM response as JSON:", text);
        throw new Error("Invalid JSON response from LLM");
    }
};

module.exports = { callLLM };
