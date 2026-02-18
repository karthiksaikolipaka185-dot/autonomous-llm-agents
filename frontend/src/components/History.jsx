import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, DollarSign, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios';

const History = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/trips');
                setTrips(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', gap: '1rem' }}>
            <Loader size={40} className="spin" color="var(--primary-color)" />
            <p style={{ color: '#888' }}>Loading past journeys...</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container"
            style={{ paddingBottom: '4rem', paddingTop: '2rem' }}
        >
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={32} color="var(--primary-color)" /> Trip History
            </h2>

            {trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>No trips planned yet.</p>
                    <button className="neon-button">Start Planning</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {trips.map((trip) => (
                        <motion.div
                            key={trip._id}
                            className="glass-panel card-hover"
                            whileHover={{ y: -5 }}
                            style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary-color)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{trip.destination}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                                    {new Date(trip.generatedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                    <Calendar size={16} color="var(--accent-color)" /> {trip.duration}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                                    <DollarSign size={16} color="var(--secondary-color)" /> {trip.budget}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{trip.itinerary?.length || 3} Days Planned</span>
                                <ArrowRight size={18} color="var(--primary-color)" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default History;
