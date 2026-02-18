/**
 * Travel Execution Agent
 * Simulates the execution of planned steps (searching, booking, calculation).
 */

const { callLLM } = require('../../utils/llm');

const executePlan = async (strategyData, userRequest) => {
    try {
        console.log('[Executor] Starting execution of plan steps...');
        const { plan_steps } = strategyData;
        const executedSteps = [];
        const { destination, total_budget, number_of_people } = userRequest;

        // Iterate through each step and "execute" it
        for (const step of plan_steps) {
            console.log(`[Executor] Processing Step: ${step.description}`);

            let result = null;

            // Use LLM to simulate finding real-world data based on the step description
            // In a real app, this would call actual APIs (Booking.com, Skyscanner, etc.)
            const prompt = `
            Context: Planning a trip to ${destination} for ${number_of_people} people. Budget: ${total_budget}.
            Task: Execute this step: "${step.description}"
            Tool: ${step.tool_required}
            
            Output: Return a JSON object with:
            - "status": "COMPLETED"
            - "data": A short realistic summary of what was found (e.g., "Found Indigo Flight 6E-123 at ₹4,500/person", "Selected Hotel Paradise at ₹2,000/night").
            - "cost": Estimated cost for this step (number).
            `;

            try {
                result = await callLLM(prompt, "You are a Travel Executor Agent. Simulate realistic travel booking results. Return JSON.");
            } catch (e) {
                console.warn('[Executor] LLM failed for step, using mock fallback.');
            }

            // Fallback if LLM fails or returns empty
            if (!result || !result.data) {
                result = getMockExecutionResult(step, destination);
            }

            executedSteps.push({
                step_id: step.step_id,
                description: step.description,
                status: "COMPLETED",
                result: result.data,
                cost: result.cost || 0
            });
        }

        return {
            status: "EXECUTION_COMPLETE",
            results: executedSteps
        };

    } catch (err) {
        console.error('[Executor] Execution Failed:', err);
        throw new Error(`Execution failed: ${err.message}`);
    }
};

// Helper for deterministic fallback
const getMockExecutionResult = (step, destination) => {
    const desc = step.description.toLowerCase();

    if (desc.includes('flight') || desc.includes('train') || desc.includes('transport')) {
        return {
            data: `Found flights to ${destination} via AirlineXYZ starting at ₹5,000 round trip per person.`,
            cost: 5000
        };
    }
    if (desc.includes('hotel') || desc.includes('accommodation') || desc.includes('stay')) {
        return {
            data: `Identified 3 highly rated hotels in ${destination} (AVG: 4.5 stars). Recommended: 'City Center Inn'.`,
            cost: 8000
        };
    }
    if (desc.includes('activity') || desc.includes('places')) {
        return {
            data: `Added sightseeing: Famous Museum, City Park, and Local Market tour.`,
            cost: 1500
        };
    }
    if (desc.includes('cost') || desc.includes('expense')) {
        return {
            data: `Estimated daily food and local travel expenses calculated.`,
            cost: 2000
        };
    }

    return {
        data: "Step executed successfully.",
        cost: 0
    };
};

module.exports = { executePlan };
