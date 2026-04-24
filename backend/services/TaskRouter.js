const fs = require('fs');
const path = require('path');
const { logEvent } = require('../utils/logger');

class TaskRouter {
    constructor() {
        this.tasks = {};
        this.loadTasks();
    }

    // 🔹 Load all task modules dynamically
    loadTasks() {
        const tasksDir = path.join(__dirname, '../tasks');

        if (fs.existsSync(tasksDir)) {
            const taskFolders = fs.readdirSync(tasksDir);

            taskFolders.forEach(folder => {
                const taskPath = path.join(tasksDir, folder);

                if (fs.statSync(taskPath).isDirectory()) {
                    try {
                        const taskModule = require(taskPath);

                        if (taskModule.execute) {
                            logEvent("INFO", `Loaded task: ${folder}`);
                            this.tasks[folder] = taskModule;
                        } else {
                            logEvent("WARN", `Task ${folder} missing execute()`);
                        }

                    } catch (err) {
                        logEvent("ERROR", `Failed loading ${folder}: ${err.message}`);
                    }
                }
            });
        } else {
            logEvent("ERROR", "Tasks directory not found");
        }
    }

    // 🔹 Execute a single task
    async execute(taskType, payload) {
        logEvent("INFO", `Task received: ${taskType}`);

        const taskHandler = this.tasks[taskType];

        if (!taskHandler) {
            logEvent("ERROR", `Unknown task type: ${taskType}`);
            throw new Error(`Unknown task type: ${taskType}`);
        }

        try {
            logEvent("INFO", `Executing task: ${taskType}`);

            const result = await taskHandler.execute(payload);

            logEvent("SUCCESS", `Task completed: ${taskType}`);

            return result;

        } catch (error) {
            logEvent("ERROR", `Task failed: ${taskType} - ${error.message}`);
            throw error;
        }
    }

    // 🔥 Multi-Agent Pipeline (IMPORTANT)
    async runAgentPipeline(userInput) {
        logEvent("INFO", "Starting multi-agent pipeline");

        const planner = this.tasks["planner"];
        const executor = this.tasks["executor"];
        const reviewer = this.tasks["reviewer"];

        if (!planner || !executor || !reviewer) {
            logEvent("ERROR", "Agent modules missing (planner/executor/reviewer)");
            throw new Error("Agent modules not properly loaded");
        }

        try {
            // Step 1: Planner
            logEvent("INFO", "Planner started");
            const plan = await planner.execute(userInput);
            logEvent("INFO", "Planner completed");

            // Step 2: Executor
            logEvent("INFO", "Executor started");
            const execution = await executor.execute(plan);
            logEvent("INFO", "Executor completed");

            // Step 3: Reviewer
            logEvent("INFO", "Reviewer started");
            const finalResult = await reviewer.execute(execution);
            logEvent("INFO", "Reviewer completed");

            logEvent("SUCCESS", "Multi-agent pipeline completed");

            return finalResult;

        } catch (error) {
            logEvent("ERROR", `Pipeline failed: ${error.message}`);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new TaskRouter();