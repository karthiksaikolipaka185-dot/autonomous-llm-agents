const fs = require('fs');
const path = require('path');

class TaskRouter {
    constructor() {
        this.tasks = {};
        this.loadTasks();
    }

    loadTasks() {
        const tasksDir = path.join(__dirname, '../tasks');
        if (fs.existsSync(tasksDir)) {
            const taskFolders = fs.readdirSync(tasksDir);
            taskFolders.forEach(folder => {
                const taskPath = path.join(tasksDir, folder);
                if (fs.statSync(taskPath).isDirectory()) {
                    // Expecting an index.js in the task folder that exports an 'execute' function
                    try {
                        const taskModule = require(taskPath);
                        if (taskModule.execute) {
                            console.log(`[TaskRouter] Loaded task type: ${folder}`);
                            this.tasks[folder] = taskModule;
                        } else {
                            console.warn(`[TaskRouter] Task module ${folder} missing execute function.`);
                        }
                    } catch (err) {
                        console.error(`[TaskRouter] Failed to load task ${folder}:`, err.message);
                    }
                }
            });
        }
    }

    async execute(taskType, payload) {
        const taskHandler = this.tasks[taskType];
        if (!taskHandler) {
            throw new Error(`Unknown task type: ${taskType}`);
        }
        return await taskHandler.execute(payload);
    }
}

module.exports = new TaskRouter();
