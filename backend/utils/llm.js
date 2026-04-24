const Groq = require("groq-sdk");
const OpenAI = require("openai");

const callLLM = async (prompt, systemInstruction = "") => {
    console.log("Checking API Keys...");
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGroq = !!process.env.GROQ_API_KEY;

    console.log(`API KEY PRESENT: OpenAI=${hasOpenAI}, Groq=${hasGroq}`);

    if (!hasOpenAI && !hasGroq) {
        console.warn("No API Key found. Returning null (will trigger fallback logic).");
        return null;
    }

    try {
        if (hasGroq) {
            console.log("Using Groq...");
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemInstruction + "\nRespond in valid JSON only." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;
            if (!text) throw new Error("No response from Groq");
            console.log("Groq Response Text:", text.substring(0, 100) + "...");
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
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(cleanText);
    } catch (err) {
        console.error("Failed to parse LLM response as JSON:", text);
        throw new Error("Invalid JSON response from LLM");
    }
};

module.exports = { callLLM };
