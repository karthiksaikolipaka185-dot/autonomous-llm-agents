/**
 * Travel Requirement Analyzer Agent
 * Extracts structured data from user input.
 */

const { callLLM } = require('../../utils/llm');

const analyzeRequest = async (input) => {
    try {
        if (!input) {
            console.error('[Planner] Input is null or undefined');
            return {
                status: "ERROR",
                message: "Input is required",
                stage: "COLLECTING_INFO"
            };
        }

        // 1. If input is already structured (from dropdowns)
        if (typeof input === 'object' && input.destination) {
            const { destination, budget, days, type } = input;

            const missing = [];
            if (!destination) missing.push('destination');
            if (!budget) missing.push('total_budget');
            if (!days) missing.push('number_of_days');

            if (missing.length > 0) {
                return {
                    status: "NEEDS_INFO",
                    missing_fields: missing
                };
            }

            return {
                status: "READY",
                data: {
                    destination,
                    total_budget: budget,
                    number_of_days: days,
                    travel_type: type || 'Solo',
                    number_of_people: '1',
                    accommodation_preference: 'Any',
                    transport_preference: 'Any'
                }
            };
        }

        // 2. If input is unstructured text, try LLM
        const text = input.text || input;

        if (!text || typeof text !== 'string') {
            console.error('[Planner] Invalid text input:', input);
            return {
                status: "ERROR",
                message: "Invalid input format",
                stage: "COLLECTING_INFO"
            };
        }

        // LLM Attempt
        const prompt = `Extract travel requirements from this text: "${text}".
        Return JSON with fields: destination, total_budget, number_of_days, travel_type, number_of_people.
        If missing, return null for that field. 
        Budget should be a number (remove currency symbols).`;

        try {
            const llmResult = await callLLM(prompt, "You are a Travel Requirement Analyzer Agent. Output valid JSON only.");
            if (llmResult && llmResult.destination) {
                console.log("[Planner] LLM Analysis Success:", llmResult);

                // Validate required fields from LLM
                const missing = [];
                if (!llmResult.destination) missing.push('destination');
                if (!llmResult.total_budget) missing.push('total_budget');
                if (!llmResult.number_of_days) missing.push('number_of_days');

                if (missing.length > 0) {
                    return {
                        status: "NEEDS_INFO",
                        missing_fields: missing
                    };
                }

                return {
                    status: "READY",
                    data: {
                        destination: llmResult.destination,
                        total_budget: llmResult.total_budget,
                        number_of_days: llmResult.number_of_days,
                        travel_type: llmResult.travel_type || 'Solo',
                        number_of_people: llmResult.number_of_people || '1',
                        accommodation_preference: 'Any',
                        transport_preference: 'Any'
                    }
                };
            }
        } catch (llmError) {
            console.warn("[Planner] LLM failed, falling back to regex:", llmError.message);
        }

        // 3. Fallback: Regex heuristics
        console.log("[Planner] Using Regex Fallback");
        const daysMatch = text.match(/(\d+)\s*-?\s*day/i);
        const budgetMatch = text.match(/(?:under|budget|cost|for)\s*(?:₹|INR|Rs\.?|\$|€|Euros?)?\s*(\d[\d,]*)/i);

        let destination = null;
        const destKeywords = ['trip to', 'visit', 'in', 'tour of'];
        for (const kw of destKeywords) {
            const idx = text.toLowerCase().indexOf(kw);
            if (idx !== -1) {
                const after = text.substring(idx + kw.length).trim();
                const words = after.split(' ');
                if (words.length > 0) destination = words[0].replace(/[^a-zA-Z]/g, '');
                break;
            }
        }

        // Fallback if structured inputs provided alongside text
        if (!destination && input.destination) destination = input.destination;

        const missing = [];
        if (!destination) missing.push('destination');
        const budget = budgetMatch ? budgetMatch[1] : (input.budget || null);
        if (!budget) missing.push('total_budget');
        const days = daysMatch ? daysMatch[1] : (input.days || null);
        if (!days) missing.push('number_of_days');

        if (missing.length > 0) {
            return {
                status: "NEEDS_INFO",
                missing_fields: missing
            };
        }

        return {
            status: "READY",
            data: {
                destination: destination,
                total_budget: budget,
                number_of_days: days,
                travel_type: 'Solo',
                number_of_people: '1',
                accommodation_preference: 'Any',
                transport_preference: 'Any'
            }
        };

    } catch (err) {
        console.error('[Planner] Optimization Error:', err);
        return {
            status: "ERROR",
            message: "Failed to analyze requirements",
            stage: "COLLECTING_INFO",
            details: err.message
        };
    }
};

module.exports = { analyzeRequest };
