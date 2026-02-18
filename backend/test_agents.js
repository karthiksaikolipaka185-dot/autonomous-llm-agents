const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { analyzeRequest } = require('./tasks/travel/travelRequirementAgent');
const { createStrategy } = require('./tasks/travel/travelPlannerAgent');

const testCases = [
    {
        name: "Structured Input - Goa Trip",
        input: {
            destination: "Goa",
            budget: "20000",
            days: "4",
            type: "Friends"
        }
    },
    {
        name: "Unstructured Input - Paris (Mocked parsing)",
        input: {
            text: "Plan a trip to Paris for 5 days with budget 1500 Euros"
        }
    }
];

const { executePlan } = require('./tasks/travel/travelExecutorAgent');
const { reviewItinerary } = require('./tasks/travel/travelReviewerAgent');

const runTests = async () => {
    for (const test of testCases) {
        console.log(`\n--- Testing: ${test.name} ---`);

        // 1. Analyzer Agent
        console.log("1. Running Analyzer Agent...");
        const analysis = await analyzeRequest(test.input);
        console.log("Analysis Output:", JSON.stringify(analysis, null, 2));

        if (analysis.status === 'READY') {
            // 2. Strategy Agent
            console.log("2. Running Strategy Agent...");
            const strategy = await createStrategy(analysis.data);
            console.log("Strategy Output:", JSON.stringify(strategy, null, 2));

            // 3. Executor Agent
            console.log("3. Running Executor Agent...");
            const execution = await executePlan(strategy, analysis.data);
            console.log("Execution Output:", JSON.stringify(execution, null, 2));

            // 4. Reviewer Agent
            console.log("4. Running Reviewer Agent...");
            const review = await reviewItinerary(execution, analysis.data);
            console.log("Review Output:", JSON.stringify(review, null, 2));

        } else {
            console.log("Skipping downstream agents (Analysis not ready)");
        }
    }
};

runTests();
