import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    // Initial check (loading)
    if (isAuthenticated === null) {
        return <div className="flex-center" style={{ height: '100vh' }}><Loader className="spin" /></div>;
    }

    // Auth check result
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            padding: '1rem 2rem',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span>🛫</span> TRAVEL<span style={{ color: 'var(--primary-color)' }}>.AI</span>
                </div>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.3s' }}>Dashboard</Link>
                        <Link to="/history" style={{ color: location.pathname === '/history' ? '#fff' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.3s' }}>My Trips</Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                color: '#000',
                                cursor: 'pointer'
                            }} title={user.name}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem' }}>Logout</button>
                        </div>
                    </>
                ) : null}
            </div>
        </nav>
    );
};

const MainApp = () => {
    const { user } = useContext(AuthContext);
    const [planData, setPlanData] = useState(null);

    return (
        <div className="App">
            <div className="bg-gradient"></div>
            {user && <Navbar />}

            <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
                <Routes>
                    <Route path="/" element={<Hero onPlanGenerated={(data) => {
                        setPlanData(data);
                    }} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {planData ? (
                                <Dashboard planData={planData} onBack={() => setPlanData(null)} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#fff', marginTop: '2rem' }}>
                                    <h2>Your Dashboard</h2>
                                    <p>Start planning a trip from the Home page!</p>
                                    <Link to="/" className="neon-button" style={{ display: 'inline-block', marginTop: '1rem' }}>Plan a Trip</Link>
                                    <div style={{ marginTop: '2rem' }}>
                                        <History />
                                    </div>
                                </div>
                            )}
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>

            <footer style={{ textAlign: 'center', padding: '2rem', color: '#666', fontSize: '0.8rem' }}>
                <p>&copy; 2026 AI Travel Planner. Built for Explorers.</p>
            </footer>
        </div>
    );
};

const AppWithRouter = () => {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
};

export default AppWithRouter;
