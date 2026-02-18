const TaskRouter = require('./services/TaskRouter');

async function testTaskRouter() {
    console.log('Testing TaskRouter...');

    const payload = {
        text: "Plan a trip to Paris for 5 days with budget 2000 EUR",
        task_type: 'travel'
    };

    try {
        console.log('Dispatching travel task...');
        // Mocking the result to avoid actual LLM calls if possible, or just checking if it runs through steps.
        // Since we are running in an environment where LLM might cost or be slow, 
        // and the agents mock LLM if it fails (which it might if no key), let's see.
        // The agents use `../utils/llm`, assuming it works or fails gracefully.

        const result = await TaskRouter.execute('travel', payload);

        console.log('TaskRouter Result:', JSON.stringify(result, null, 2));

        if (result.status === 'SUCCESS' || result.status === 'NEEDS_INFO' || result.status === 'READY') {
            console.log('TEST PASSED: Travel task executed successfully.');
        } else {
            console.error('TEST FAILED: Unexpected status', result.status);
        }

    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

async function testUnknownTask() {
    console.log('\nTesting Unknown Task...');
    try {
        await TaskRouter.execute('unknown_type', {});
    } catch (error) {
        if (error.message.includes('Unknown task type')) {
            console.log('TEST PASSED: Unknown task correctly threw error.');
        } else {
            console.error('TEST FAILED: Unexpected error for unknown task:', error);
        }
    }
}

(async () => {
    await testTaskRouter();
    await testUnknownTask();
})();
