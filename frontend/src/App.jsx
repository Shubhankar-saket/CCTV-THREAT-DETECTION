import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SecurityBackground from './components/SecurityBackground';
import AuthForm from './components/AuthForm';
import ScannerInterface from './components/ScannerInterface';
import ModeSelection from './components/ModeSelection';
import LiveFeedInterface from './components/LiveFeedInterface';

// Layout Wrapper to ensure background stays behind everything
const Layout = ({ children }) => (
    <div className="relative min-h-screen w-full text-slate-200 font-sans selection:bg-cyan-500/30">
        <SecurityBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
            {children}
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<AuthForm initialMode="login" />} />
                <Route path="/signup" element={<AuthForm initialMode="signup" />} />
                <Route
                    path="/mode-select"
                    element={
                        <ProtectedRoute>
                            <ModeSelection />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <ScannerInterface />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/live-feed"
                    element={
                        <ProtectedRoute>
                            <LiveFeedInterface />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Layout>
    );
}

export default App;