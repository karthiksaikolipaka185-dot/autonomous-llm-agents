/**
 * Travel Planning Strategy Agent
 * Creates a high-level execution plan based on structured requirements.
 */

const { callLLM } = require('../../utils/llm');

const createStrategy = async (tripData) => {
    try {
        if (!tripData) {
            throw new Error('Trip data is required for strategy generation');
        }

        const { destination, total_budget, number_of_days, travel_type, number_of_people } = tripData;

        if (!destination || !total_budget || !number_of_days) {
            console.error('[Strategy] Missing required fields:', tripData);
            throw new Error('Missing required trip data fields');
        }

        // LLM Attempt for Dynamic Strategy
        const prompt = `Create a travel planning strategy for a ${number_of_days}-day ${travel_type} trip to ${destination} for ${number_of_people} people with budget ${total_budget}.
        Return JSON with a "plan_steps" array. Each step has "step_id" (number), "description" (string), "tool_required" (string from: transport_search_api, hotel_search_api, activity_recommender, cost_calculator, optimization_engine, itinerary_generator).
        Ensure logic flows: Transport -> Hotel -> Activities -> Cost Check -> Optimization -> Final Itinerary.`;

        try {
            const llmResult = await callLLM(prompt, "You are a Travel Strategy Agent. Create logical execution steps. Respond in valid JSON only.");
            if (llmResult && llmResult.plan_steps && Array.isArray(llmResult.plan_steps)) {
                console.log("[Strategy] LLM Strategy Generated:", llmResult.plan_steps.length, "steps");
                return {
                    status: "PLAN_CREATED",
                    plan_steps: llmResult.plan_steps
                };
            }
        } catch (llmError) {
            console.warn("[Strategy] LLM failed, using template fallback:", llmError.message);
        }

        // Fallback Template
        const plan_steps = [
            {
                step_id: 1,
                description: `Search for flight/train options to ${destination} for ${number_of_people} people.`,
                tool_required: "transport_search_api"
            },
            {
                step_id: 2,
                description: `Find accommodation in ${destination} within budget allocation (approx 40% of ${total_budget}).`,
                tool_required: "hotel_search_api"
            },
            {
                step_id: 3,
                description: `Identify top rated activities for a ${travel_type} trip in ${destination}.`,
                tool_required: "activity_recommender"
            },
            {
                step_id: 4,
                description: `Calculate daily expenses to ensure total stays under ${total_budget}.`,
                tool_required: "cost_calculator"
            },
        ];

        if (parseInt(number_of_days) > 3) {
            plan_steps.push({
                step_id: 5,
                description: "Optimize itinerary for a longer stay (include day trips or relaxation days).",
                tool_required: "optimization_engine"
            });
        }

        plan_steps.push({
            step_id: 6,
            description: "Compile final day-by-day itinerary with time slots.",
            tool_required: "itinerary_generator"
        });

        return {
            status: "PLAN_CREATED",
            plan_steps: plan_steps
        };
    } catch (err) {
        console.error('[Strategy] Error generating strategy:', err);
        throw err; // Re-throw to be caught by the API route
    }
};

module.exports = { createStrategy };
