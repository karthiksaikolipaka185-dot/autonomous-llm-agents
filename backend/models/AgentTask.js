const mongoose = require('mongoose');

const AgentTaskSchema = new mongoose.Schema({
    agentName: {
        type: String,
        required: true,
        enum: ['Planner', 'Executor', 'Reviewer'], // Example agent roles
        default: 'Planner'
    },
    taskDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
        default: 'Pending'
    },
    result: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AgentTask', AgentTaskSchema);
