const { analyzeRequest } = require('./agents/planner');
const { createStrategy } = require('./agents/strategy');

const errorTestCases = [
    {
        name: "Null Input",
        input: null,
        expectedStatus: "ERROR"
    },
    {
        name: "Empty Object",
        input: {},
        expectedStatus: "ERROR"
    },
    {
        name: "Valid Analysis but Missing Strategy Data (Simulated)",
        input: { destination: "Goa", budget: "15000", days: "3" },
        simulateStrategyError: true
    }
];

console.log("--- Starting Error Handling Verification ---\n");

const runTests = async () => {
    for (const test of errorTestCases) {
        console.log(`Testing Case: ${test.name}`);

        // Test Planner
        const plannerResult = await analyzeRequest(test.input);
        console.log(`Planner Result Status: ${plannerResult.status}`);
        if (plannerResult.status === 'ERROR') {
            console.log(`Error Check Passed for Planner: ${plannerResult.message}`);
        }

        // Test Strategy Error
        if (test.simulateStrategyError) {
            try {
                // Passing incomplete data to strategy to trigger its internal validation
                await createStrategy({});
            } catch (e) {
                console.log(`Strategy Error Caught successfully: ${e.message}`);
            }
        }
        console.log("--------------------------------------------------\n");
    }
};

runTests();
