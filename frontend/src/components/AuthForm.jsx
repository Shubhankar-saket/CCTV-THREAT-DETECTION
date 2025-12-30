import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AuthForm = ({ initialMode }) => {
    const navigate = useNavigate();
    const isLogin = initialMode === 'login';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/login' : '/register';
            const res = await axios.post(`http://localhost:8000${endpoint}`, { email, password });

            if (isLogin) {
                localStorage.setItem('token', res.data.access_token);
                navigate('/mode-select');
            } else {
                setIsLoading(false);
                alert("Account created. Please sign in.");
                navigate('/login');
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.detail || "Connection failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-950 relative overflow-hidden z-20">

            {/* LEFT SIDE: Visual Brand Area (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-800">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                {/* CSS Radar Animation */}
                <div className="relative z-10 w-96 h-96 rounded-full border border-cyan-900/50 flex items-center justify-center">
                    <div className="absolute w-full h-full border-2 border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute w-64 h-64 border border-cyan-500/30 rounded-full"></div>
                    <div className="absolute w-full h-1/2 bg-gradient-to-t from-cyan-500/10 to-transparent top-1/2 left-0 animate-[spin_4s_linear_infinite] origin-top"></div>

                    <div className="text-center z-20 bg-slate-900/80 p-6 backdrop-blur-sm rounded-xl border border-slate-700">
                        <h1 className="text-4xl font-bold text-white tracking-widest font-mono">VIGILENS</h1>
                        <p className="text-cyan-500 text-xs mt-2 tracking-[0.3em] uppercase">Advanced Threat Detection</p>
                    </div>
                </div>

                {/* Status Ticker at bottom */}
                <div className="absolute bottom-8 left-8 flex gap-4 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEM ACTIVE
                    </span>
                    <span>v2.4.0-STABLE</span>
                </div>
            </div>

            {/* RIGHT SIDE: Interactive Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md">
                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white tracking-widest font-mono">VIGILENS</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isLogin ? "Welcome Back" : "Secure Registration"}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {isLogin ? "Enter your credentials to access the dashboard." : "Create a new operative account."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-transparent border-b border-slate-700 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors placeholder-slate-700 font-mono"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                className="w-full bg-transparent border-b border-slate-700 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors placeholder-slate-700 font-mono"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/5 border-l-2 border-red-500 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-4 rounded hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                        >
                            {isLoading ? "AUTHENTICATING..." : (isLogin ? "SIGN IN" : "CREATE ACCOUNT")}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                        {isLogin ? "No access clearance?" : "Already registered?"}
                        <Link
                            to={isLogin ? "/signup" : "/login"}
                            className="ml-2 text-white hover:text-cyan-400 font-bold transition-colors underline decoration-slate-700 underline-offset-4"
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;