import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Cpu, Plane, FileText, ArrowLeft } from 'lucide-react';
import TripResults from './TripResults';

// Simple spinner component
const LoaderSpin = ({ size, color }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: size, height: size, border: `2px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%' }}
    />
);

const Dashboard = ({ planData, onBack }) => {
    // 1: Planning, 2: Execution, 3: Review, 4: Done
    const [activeStage, setActiveStage] = useState(1);
    const [expandedStage, setExpandedStage] = useState(1);
    const [showResults, setShowResults] = useState(false);

    // Refinement History System
    const [history, setHistory] = useState([]);
    const [currentRefinement, setCurrentRefinement] = useState(null);

    // Dynamic Data from Agent
    const req = planData?.original_request || planData || {};
    const dest = req.destination || "Unknown";
    const budget = req.total_budget || "0";
    const days = req.number_of_days || "3";

    // Initial Logs
    const initialLogs = {
        planning: planData?.strategy?.plan_steps
            ? planData.strategy.plan_steps.map(s => `Planned: ${s.description}`)
            : [
                `Analyzing request: "${days}-day trip to ${dest}"`,
                `Constraints: Budget=${budget}`,
                "Formulating strategy..."
            ],
        execution: planData?.execution?.results
            ? planData.execution.results.map(r => `Executed: ${r.description} -> ${r.status}`)
            : [
                "Waiting for strategy...",
                "Initializing search agents..."
            ],
        review: planData?.final_itinerary?.status === "REVIEW_COMPLETE"
            ? [
                "Consolidating execution results...",
                `Total Estimated Cost: ₹${planData.final_itinerary.final_plan.total_estimated_cost}`,
                `Budget Check: ${planData.final_itinerary.final_plan.budget_status}`,
                "Finalizing Itinerary."
            ]
            : [
                "Waiting for execution...",
                "Pending final review."
            ]
    };

    const [logs, setLogs] = useState(initialLogs);

    // Dynamic Stages
    const stages = [
        {
            id: 1,
            title: "Planning Agent",
            icon: <Cpu size={20} />,
            logs: logs.planning
        },
        {
            id: 2,
            title: "Execution Agent",
            icon: <Plane size={20} />,
            logs: logs.execution
        },
        {
            id: 3,
            title: "Review Agent",
            icon: <FileText size={20} />,
            logs: logs.review
        }
    ];

    const handleRefine = (criteria) => {
        setHistory(prev => [...prev, { refinement: currentRefinement || "Initial Plan" }]);
        setCurrentRefinement(criteria);

        setLogs({
            planning: [
                `Analyzing refinement: "${criteria}"`,
                "Loading previous context...",
                "Adjusting constraints...",
                "Strategy updated."
            ],
            execution: [
                "Re-scanning database...",
                `Filtering for: ${criteria}`,
                "Regenerating itinerary..."
            ],
            review: [
                "Verifying new constraints...",
                "Finalizing refined plan..."
            ]
        });

        setShowResults(false);
        setActiveStage(1);
        setExpandedStage(1);
    };

    useEffect(() => {
        let timer;
        if (activeStage === 1) {
            timer = setTimeout(() => { setActiveStage(2); setExpandedStage(2); }, 3000);
        } else if (activeStage === 2) {
            timer = setTimeout(() => { setActiveStage(3); setExpandedStage(3); }, 4000);
        } else if (activeStage === 3) {
            timer = setTimeout(() => {
                setActiveStage(4);
                setExpandedStage(null);
                setTimeout(() => setShowResults(true), 1000);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [activeStage]);

    const toggleExpand = (id) => {
        setExpandedStage(expandedStage === id ? null : id);
    };

    // Construct Result Data (Mocked based on inputs)
    // Construct Result Data from Real API Response
    const finalItinerary = planData?.final_itinerary?.final_plan;
    const executionResults = planData?.execution?.results || [];

    // Calculate dynamic costs from execution results
    const calculateCost = (category) => {
        const items = executionResults.filter(item =>
            item.description.toLowerCase().includes(category) ||
            item.result.toLowerCase().includes(category)
        );
        const total = items.reduce((sum, item) => sum + (item.cost || 0), 0);
        return total > 0 ? `₹${total.toLocaleString()}` : "Calculating...";
    };

    const generatedPlan = {
        trip_summary: {
            destination: finalItinerary?.destination || dest,
            budget: finalItinerary?.budget_status === "OVER_BUDGET"
                ? `₹${finalItinerary?.total_estimated_cost} (Over Budget)`
                : (finalItinerary ? `₹${finalItinerary.total_estimated_cost}` : budget),
            duration: finalItinerary?.duration ? `${finalItinerary.duration} Days` : `${days} Days`
        },
        // Transform "Day 1: Arrive..." strings into objects for TripResults
        itinerary: finalItinerary?.itinerary_steps?.map((stepStr, i) => {
            const parts = stepStr.split(':');
            const title = parts.length > 1 ? parts.slice(1).join(':').trim() : stepStr;
            return {
                day: i + 1,
                title: title,
                activities: [
                    "Check Agent Logs for details",
                    ...(executionResults.slice(i * 2, (i * 2) + 2).map(e => e.result)) // Map some execution results to days roughly
                ]
            };
        }) || [],
        cost_breakdown: {
            stay: calculateCost('hotel') || calculateCost('stay'),
            travel: calculateCost('flight') || calculateCost('transport') || calculateCost('train'),
            food: calculateCost('food') || "₹3,000 (Est.)"
        },
        agent_notes: finalItinerary?.agent_notes || "No notes available."
    };

    if (showResults) {
        return <TripResults onRefine={handleRefine} history={history} plan={generatedPlan} />;
    }

    return (
        <section className="container" style={{ paddingBottom: '4rem', maxWidth: '900px' }}>
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={18} /> Back to Search
                </button>
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
                Live <span className="gradient-text">Journey Generation</span>
            </h2>

            {currentRefinement && (
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#888', fontStyle: 'italic' }}>
                    Refining: "{currentRefinement}"
                </div>
            )}

            <div className="timeline-container" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '24px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />

                {stages.map((stage, index) => {
                    let status = 'Pending';
                    if (activeStage > stage.id) status = 'Completed';
                    else if (activeStage === stage.id) status = 'Running';

                    const isCompleted = status === 'Completed';
                    const isRunning = status === 'Running';

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}
                        >
                            <div className={`glass-panel ${isRunning ? 'active-border' : ''}`} style={{ padding: '0', overflow: 'hidden' }}>
                                <div
                                    onClick={() => toggleExpand(stage.id)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        background: isRunning ? 'rgba(124, 58, 237, 0.05)' : 'transparent'
                                    }}
                                >
                                    <div style={{ marginRight: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px' }}>
                                        {isCompleted && <CheckCircle size={28} color="var(--secondary-color)" />}
                                        {isRunning && <div className="pulsing-circle"><LoaderSpin size={28} color="var(--primary-color)" /></div>}
                                        {status === 'Pending' && <Circle size={28} color="#444" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            {stage.title}
                                            {isRunning && <span className="status-badge running">Processing</span>}
                                            {isCompleted && <span className="status-badge completed">Done</span>}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.3rem' }}>
                                            {isRunning ? 'Currently executing tasks...' : isCompleted ? 'Tasks completed successfully' : 'Waiting in queue'}
                                        </p>
                                    </div>
                                    <div style={{ color: '#666' }}>
                                        {expandedStage === stage.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedStage === stage.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--glass-border)' }}
                                        >
                                            <div style={{ padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.6' }}>
                                                {stage.logs.map((log, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ color: 'var(--primary-color)' }}>➜</span>
                                                        <span>{log}</span>
                                                    </div>
                                                ))}
                                                {isRunning && <span className="blink">_</span>}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <style>{`
                .active-border { border-color: var(--primary-color) !important; box-shadow: 0 0 20px rgba(124, 58, 237, 0.15); }
                .status-badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
                .status-badge.running { background: rgba(124, 58, 237, 0.2); color: var(--primary-color); border: 1px solid rgba(124, 58, 237, 0.3); }
                .status-badge.completed { background: rgba(0, 255, 157, 0.1); color: var(--secondary-color); border: 1px solid rgba(0, 255, 157, 0.2); }
                .blink { animation: blink 1s infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </section>
    );
};

export default Dashboard;
