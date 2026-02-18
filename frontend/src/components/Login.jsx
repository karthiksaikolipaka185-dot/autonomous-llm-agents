import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        const success = await login(email, password);
        setSubmitting(false);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '0.8rem',
                        background: 'rgba(124, 58, 237, 0.1)',
                        borderRadius: '50%',
                        marginBottom: '1rem'
                    }}>
                        <Sparkles color="var(--primary-color)" size={32} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: '#888' }}>Login to access your dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#666' }} />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="Email Address"
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#666' }} />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="neon-button"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? <Loader className="spin" size={20} /> : <>Login <ArrowRight size={20} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
