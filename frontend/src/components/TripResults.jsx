import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Download, Share2, Save, Edit3, CheckCircle, ArrowRight, History, Send, X } from 'lucide-react';
import axios from 'axios';

const TripResults = ({ onRefine, history = [], plan }) => {
    const [isRefining, setIsRefining] = useState(false);
    const [refinementText, setRefinementText] = useState('');

    const handleRefineSubmit = () => {
        if (refinementText.trim()) {
            onRefine(refinementText);
            setRefinementText('');
            setIsRefining(false);
        }
    };

    // Fallback data if plan is missing (for safety)
    const tripData = plan || {
        trip_summary: { destination: "Goa, India", budget: "₹14,200", duration: "3 Days" },
        itinerary: [],
        cost_breakdown: {}
    };

    const handleSaveTrip = async () => {
        try {
            const dataToSave = {
                destination: tripData.trip_summary?.destination || "Unknown",
                budget: tripData.trip_summary?.budget || "0",
                duration: tripData.trip_summary?.duration || "0 Days",
                itinerary: tripData.itinerary?.map(day => ({
                    day: day.day,
                    title: "Day " + day.day,
                    activities: day.activities?.map(a => a.time + ": " + a.activity) || []
                })) || [],
                costs: tripData.cost_breakdown || {}
            };
            await axios.post('/api/trips', dataToSave);
            alert("Trip saved to History!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save trip");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container"
            style={{ maxWidth: '1000px', paddingBottom: '4rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 255, 157, 0.1)', color: 'var(--secondary-color)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <CheckCircle size={16} /> Trip Generation Complete
                    </div>
                    <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                        Your <span className="gradient-text">Goa Getaway</span> Plan
                    </h2>
                </div>

                {history.length > 0 && (
                    <div className="glass-panel" style={{ padding: '1rem', minWidth: '200px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                            <History size={14} /> Version History
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {history.map((ver, idx) => (
                                <div key={idx} style={{ fontSize: '0.85rem', color: '#aaa', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                    v{idx + 1}: {ver.refinement || 'Initial Plan'}
                                </div>
                            ))}
                            <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold', padding: '0.3rem 0.5rem' }}>
                                v{history.length + 1} (Current)
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 1. Trip Summary */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <SummaryItem icon={<MapPin size={24} color="#7c3aed" />} label="Destination" value={tripData.trip_summary?.destination} />
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                <SummaryItem icon={<DollarSign size={24} color="#00ff9d" />} label="Total Budget" value={tripData.trip_summary?.budget} sub="(Saved ₹800)" />
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                <SummaryItem icon={<Calendar size={24} color="#ff0055" />} label="Duration" value={tripData.trip_summary?.duration} sub="Oct 12 - 15" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* 2. Day-by-Day Itinerary */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="var(--primary-color)" /> Daily Itinerary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {tripData.itinerary?.length > 0 ? tripData.itinerary.map((day, idx) => (
                            <DayPlan
                                key={idx}
                                day={day.day}
                                title={day.day === 1 ? "Arrival & Chill" : "Exploration"}
                                activities={day.activities.map(a => typeof a === 'string' ? a : a.activity)}
                            />
                        )) : (
                            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                                No itinerary details available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Cost & Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* 3. Cost Breakdown */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={20} color="var(--secondary-color)" /> Cost Breakdown
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <CostItem label="Stay" value={tripData.cost_breakdown?.stay || "Calculating..."} />
                            <CostItem label="Travel" value={tripData.cost_breakdown?.travel || "Calculating..."} />
                            <CostItem label="Food" value={tripData.cost_breakdown?.food || "Calculating..."} />
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--secondary-color)' }}>{tripData.trip_summary?.budget}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Optimization Insights / Agent Notes */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--primary-color)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                            ✨ Agent Notes
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5', marginBottom: '1rem' }}>
                            {tripData.agent_notes || "Your AI Travel Agent has optimized this plan for your budget and preferences."}
                        </p>
                    </div>

                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={handleSaveTrip}
                    className="neon-button"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <Save size={18} /> Save Trip
                </button>
                <button className="neon-button" style={{ borderColor: '#fff', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Share2 size={18} /> Share Plan
                </button>
                <button
                    className="neon-button"
                    onClick={() => setIsRefining(true)}
                    style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Edit3 size={18} /> Refine Plan
                </button>
            </div>

            {/* Refine Overlay */}
            <AnimatePresence>
                {isRefining && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            width: '400px',
                            background: '#0f0f15',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Refine your Plan</span>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsRefining(false)} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                            Tell the agents what to adjust. New layout will be generated.
                        </p>
                        <textarea
                            value={refinementText}
                            onChange={(e) => setRefinementText(e.target.value)}
                            placeholder="e.g. Reduce budget by ₹2,000, add paragliding, or find a hotel with a pool..."
                            style={{
                                width: '100%',
                                height: '80px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: '#fff',
                                padding: '0.8rem',
                                marginBottom: '1rem',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {['Reduce Budget', 'Add Adventure', 'Upgrade Hotel', 'Nearby Attractions'].map(tag => (
                                <span
                                    key={tag}
                                    onClick={() => setRefinementText(tag)}
                                    style={{ fontSize: '0.75rem', background: 'rgba(124, 58, 237, 0.2)', color: 'var(--primary-color)', padding: '0.3rem 0.6rem', borderRadius: '12px', cursor: 'pointer' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={handleRefineSubmit}
                            className="neon-button"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Send size={16} /> Update Plan
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

const SummaryItem = ({ icon, label, value, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>{label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>{sub}</div>}
        </div>
    </div>
);

const DayPlan = ({ day, title, activities }) => (
    <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
        <div style={{ position: 'absolute', left: '-11px', top: '0', background: 'var(--bg-color)', border: '2px solid var(--primary-color)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{day}</div>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Day {day}: {title}</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {activities.map((act, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.95rem' }}>
                    <span>•</span> {act}
                </li>
            ))}
        </ul>
    </div>
);

const CostItem = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#ddd' }}>
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default TripResults;
