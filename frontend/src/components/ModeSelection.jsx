import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModeSelection = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const selectMode = (mode) => {
        if (mode === 'live') {
            navigate('/live-feed');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <header className="flex justify-between items-center px-8 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-wider">VIGILENS <span className="text-cyan-500 text-xs align-top">PRO</span></h1>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded transition-all">
                    TERMINATE SESSION
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3 font-mono">SELECT DETECTION MODE</h2>
                        <p className="text-slate-400">Choose how you want to analyze footage for threats</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Live Feed Option */}
                        <button
                            onClick={() => selectMode('live')}
                            className="group relative bg-slate-900/60 border-2 border-slate-800 hover:border-cyan-500 rounded-xl p-10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(8,145,178,0.3)] overflow-hidden"
                        >
                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                {/* Camera Icon */}
                                <div className="w-24 h-24 mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 font-mono">LIVE FEED</h3>
                                <p className="text-slate-400 text-sm mb-4">Real-time camera monitoring</p>
                                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                                    REAL-TIME DETECTION
                                </div>
                            </div>
                        </button>

                        {/* Upload Video Option */}
                        <button
                            onClick={() => selectMode('upload')}
                            className="group relative bg-slate-900/60 border-2 border-slate-800 hover:border-cyan-500 rounded-xl p-10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(8,145,178,0.3)] overflow-hidden"
                        >
                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                {/* Upload Icon */}
                                <div className="w-24 h-24 mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 font-mono">UPLOAD VIDEO</h3>
                                <p className="text-slate-400 text-sm mb-4">Process recorded footage</p>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                                    BATCH PROCESSING
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModeSelection;
