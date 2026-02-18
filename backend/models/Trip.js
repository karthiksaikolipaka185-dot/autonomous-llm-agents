const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    destination: { type: String, required: true },
    budget: { type: String, required: true },
    duration: { type: String, required: true },
    dates: { type: String },
    travelers: { type: String },
    generatedAt: { type: Date, default: Date.now },
    itinerary: [{
        day: Number,
        title: String,
        activities: [String]
    }],
    costs: {
        stay: String,
        travel: String,
        food: String,
        activities: String,
        total: String,
        saved: String
    },
    status: { type: String, default: 'Completed' } // Planning, Completed
});

module.exports = mongoose.model('Trip', TripSchema);
