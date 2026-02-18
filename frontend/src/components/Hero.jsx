import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Users, Sparkles, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';

const Hero = ({ onPlanGenerated }) => {
    const [status, setStatus] = useState('idle'); // idle, loading, error
    const [inputs, setInputs] = useState({
        destination: '',
        budget: '',
        days: '',
        type: 'Solo'
    });
    const [mainInput, setMainInput] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setStatus('loading');
        try {
            // Prioritize main text input if structured inputs are empty, 
            // otherwise use structured inputs.
            const payload = (inputs.destination && inputs.budget)
                ? { ...inputs, task_type: 'travel' }
                : { text: mainInput, task_type: 'travel' };

            const res = await axios.post('/api/agent/plan', payload);

            if (res.data.status === 'SUCCESS') {
                onPlanGenerated(res.data);
            } else if (res.data.status === 'READY') {
                // Fallback for partial success or older API version
                onPlanGenerated({
                    ...res.data.data,
                    strategy: res.data.strategy
                });
            } else if (res.data.status === 'NEEDS_INFO') {
                alert(`Please provide: ${res.data.missing_fields.join(', ')}`);
            } else if (res.data.status === 'ERROR') {
                console.error('Backend Error:', res.data);
                alert(`Error: ${res.data.message}\nDetails: ${res.data.details || 'None'}`);
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Agent failed to process request';
            alert(`System Error: ${msg}`);
            setStatus('error');
        } finally {
            if (status !== 'READY') setStatus('idle');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        color: '#fff',
        outline: 'none',
        fontSize: '0.9rem'
    };

    return (
        <section className="container flex-center" style={{ minHeight: '85vh', flexDirection: 'column', textAlign: 'center', paddingTop: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div style={{
                    display: 'inline-block',
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(124, 58, 237, 0.1)',
                    borderRadius: '50px',
                    border: '1px solid var(--primary-color)',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--primary-color)'
                }}>
                    ✨ AI-Powered Itineraries
                </div>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-2px' }}>
                    AI TRAVEL <span className="gradient-text">PLANNER</span>
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '2rem',
                    marginTop: '1rem',
                    textAlign: 'left'
                }}
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                        Describe your dream trip
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Sparkles size={20} color="var(--primary-color)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
                        <input
                            type="text"
                            value={mainInput}
                            onChange={(e) => setMainInput(e.target.value)}
                            placeholder="Plan a 3-day Goa trip under ₹15,000..."
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#888', fontSize: '0.8rem' }}>
                            <MapPin size={14} /> Destination
                        </label>
                        <input name="destination" value={inputs.destination} onChange={handleInputChange} type="text" placeholder="e.g. Goa" className="input-field" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#888', fontSize: '0.8rem' }}>
                            <DollarSign size={14} /> Budget
                        </label>
                        <input name="budget" value={inputs.budget} onChange={handleInputChange} type="text" placeholder="₹15,000" className="input-field" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#888', fontSize: '0.8rem' }}>
                            <Calendar size={14} /> Days
                        </label>
                        <input name="days" value={inputs.days} onChange={handleInputChange} type="number" placeholder="3" className="input-field" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#888', fontSize: '0.8rem' }}>
                            <Users size={14} /> Type
                        </label>
                        <select name="type" value={inputs.type} onChange={handleInputChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option>Solo</option>
                            <option>Couple</option>
                            <option>Family</option>
                            <option>Friends</option>
                            <option>Luxury</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={status === 'loading'}
                    className="neon-button"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                >
                    {status === 'loading' ? (
                        <>Processing Requirement... <Loader className="spin" size={20} /></>
                    ) : (
                        <>Generate Smart Travel Plan <ArrowRight size={20} /></>
                    )}
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}
            >
                Powered by Autonomous Multi-Agent Systems
            </motion.p>
        </section>
    );
};

export default Hero;
