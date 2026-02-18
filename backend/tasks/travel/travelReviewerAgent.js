/**
 * Travel Reviewer Agent
 * Finalizes the itinerary, checks budget constraints, and formats the output.
 */

const { callLLM } = require('../../utils/llm');

const reviewItinerary = async (executionResults, userRequest) => {
    console.log('[Reviewer] Finalizing itinerary...');
    const { destination, total_budget, number_of_days } = userRequest;

    // Calculate Total Cost
    let executedCost = 0;
    executionResults.results.forEach(step => {
        executedCost += (step.cost || 0);
    });

    const isWithinBudget = executedCost <= parseFloat(total_budget.replace(/[^0-9.]/g, ''));

    // Use LLM to format the final itinerary based on executed steps
    let finalItinerary = null;
    const prompt = `
    Task: Create a final day-by-day itinerary for a trip to ${destination} (${number_of_days} days).
    Input Data (What was found/booked): ${JSON.stringify(executionResults.results)}
    Budget Status: ${isWithinBudget ? "Within Budget" : "Over Budget"} (Total: ${executedCost})
    
    Output: Return a JSON object with:
    - "itinerary": Day-by-day breakdown (Array of strings, e.g. "Day 1: Arrive...").
    - "agent_notes": Tips or warnings based on the budget/plan.
    - "confidence_score": 0-100 (based on completeness of data).
    `;

    try {
        finalItinerary = await callLLM(prompt, "You are a Travel Reviewer Agent. Format the final output clearly. Return JSON.");
    } catch (e) {
        console.warn('[Reviewer] LLM failed, using template fallback.');
    }

    if (!finalItinerary) {
        finalItinerary = {
            itinerary: [
                `Day 1: Arrival in ${destination}. Check-in to hotel.`,
                `Day 2: Sightseeing tour based on recommended activities.`,
                `Day 3: Departure.`
            ],
            agent_notes: isWithinBudget ? "Great! Your plan fits the budget." : "Warning: This plan might exceed your initial budget.",
            confidence_score: 85
        };
    }

    return {
        status: "REVIEW_COMPLETE",
        final_plan: {
            destination,
            duration: number_of_days,
            total_estimated_cost: executedCost,
            budget_status: isWithinBudget ? "OK" : "OVER_BUDGET",
            itinerary_steps: finalItinerary.itinerary,
            agent_notes: finalItinerary.agent_notes,
            confidence_score: finalItinerary.confidence_score
        }
    };
};

module.exports = { reviewItinerary };
