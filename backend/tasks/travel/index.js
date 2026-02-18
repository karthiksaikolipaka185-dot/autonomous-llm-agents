const { analyzeRequest } = require('./travelRequirementAgent');
const { createStrategy } = require('./travelPlannerAgent');
const { executePlan } = require('./travelExecutorAgent');
const { reviewItinerary } = require('./travelReviewerAgent');

const execute = async (data) => {
    console.log('[TravelTask] Starting execution with data:', data);

    // 1. Requirement Analysis
    console.log('[TravelTask] Invoking Requirement Agent...');
    const planningResult = await analyzeRequest(data);

    if (planningResult.status !== 'READY') {
        return planningResult;
    }

    // 2. Strategy Generation
    console.log('[TravelTask] Invoking Strategy Agent...');
    const strategyResult = await createStrategy(planningResult.data);

    // 3. Execution/Booking
    console.log('[TravelTask] Invoking Executor Agent...');
    const executionResult = await executePlan(strategyResult, planningResult.data);

    // 4. Review
    console.log('[TravelTask] Invoking Reviewer Agent...');
    const reviewResult = await reviewItinerary(executionResult, planningResult.data);

    return {
        status: 'SUCCESS',
        original_request: planningResult.data,
        strategy: strategyResult,
        execution: executionResult,
        final_itinerary: reviewResult
    };
};

module.exports = { execute };
