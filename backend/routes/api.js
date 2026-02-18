const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const TaskRouter = require('../services/TaskRouter');

// GET all trips (History)
router.get('/trips', async (req, res) => {
    try {
        const trips = await Trip.find().sort({ generatedAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new trip
router.post('/trips', async (req, res) => {
    const trip = new Trip({
        destination: req.body.destination,
        budget: req.body.budget,
        duration: req.body.duration,
        dates: req.body.dates,
        travelers: req.body.travelers,
        itinerary: req.body.itinerary,
        costs: req.body.costs
    });

    try {
        const newTrip = await trip.save();
        res.status(201).json(newTrip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Generic Agent Plan Endpoint
router.post('/agent/plan', async (req, res) => {
    console.log('[API] /agent/plan request received:', req.body);
    try {
        const { task_type, ...payload } = req.body;

        if (!task_type) {
            // Fallback for backward compatibility or default to travel if not specified? 
            // For now, let's error or default to travel if we want to be nice. 
            // But the user asked for "support multiple task types".
            // Let's default to 'travel' if missing, for smoother transition, or strictly require it.
            // Given the instructions, let's try to default to 'travel' if it smells like travel, or just default to travel for now.
            // Actually, the user requirements are specific: "Introduce a 'task_type' field in request payload."
            // "Receive task_type", "Load corresponding task configuration".

            // If I change the client, I can enforce it.
            // Let's support a default for testing via curl simply.
            if (!payload.destination && !payload.text) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Missing task_type or valid payload'
                });
            }
        }

        const type = task_type || 'travel'; // Defaulting to travel for safety
        console.log(`[API] Routing to task type: ${type}`);

        const result = await TaskRouter.execute(type, payload);
        res.json(result);

    } catch (err) {
        console.error('[API] Agent processing failed:', err);
        res.json({
            status: 'ERROR',
            message: 'Internal server error during agent processing',
            stage: 'SYSTEM',
            details: err.message
        });
    }
});

module.exports = router;
