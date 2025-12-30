import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LiveFeedInterface = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const [isActive, setIsActive] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [processedFrame, setProcessedFrame] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [currentThreats, setCurrentThreats] = useState({});
    const [error, setError] = useState('');

    const handleLogout = () => {
        stopDetection();
        localStorage.removeItem('token');
        navigate('/login');
    };

    const goBack = () => {
        stopDetection();
        navigate('/mode-select');
    };

    // Initialize camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraReady(true);
                setError('');
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permissions.');
            console.error('Camera error:', err);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    };

    // Capture and send frame to backend
    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg');

                const res = await axios.post('http://localhost:8000/process-frame', formData);

                if (res.data.annotated_frame) {
                    setProcessedFrame(`data:image/jpeg;base64,${res.data.annotated_frame}`);
                }

                if (res.data.alerts && Object.keys(res.data.alerts).length > 0) {
                    setCurrentThreats(res.data.alerts);
                    // Add to alert history
                    const timestamp = new Date().toLocaleTimeString();
                    setAlerts(prev => [
                        { time: timestamp, threats: res.data.alerts, total: res.data.total_threats },
                        ...prev.slice(0, 9) // Keep last 10 alerts
                    ]);
                } else {
                    setCurrentThreats({});
                }
            } catch (err) {
                console.error('Processing error:', err);
            }
        }, 'image/jpeg', 0.8);
    };

    // Start detection loop
    const startDetection = () => {
        setIsActive(true);
        setAlerts([]);
        setProcessedFrame(null);
        // Capture and process frames every 1 second
        intervalRef.current = setInterval(captureAndProcess, 1000);
    };

    // Stop detection loop
    const stopDetection = () => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setProcessedFrame(null);
        setCurrentThreats({});
    };

    // Initialize camera on mount
    useEffect(() => {
        startCamera();
        return () => {
            stopDetection();
            stopCamera();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <header className="flex justify-between items-center px-8 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button onClick={goBack} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-wider">LIVE FEED MONITOR</h1>
                    {isActive && <span className="ml-3 flex items-center gap-2 text-xs font-mono text-red-400">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        ACTIVE
                    </span>}
                </div>
                <button onClick={handleLogout} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded transition-all">
                    TERMINATE SESSION
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
                {error && (
                    <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded">
                        {error}
                    </div>
                )}

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Camera Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-slate-400 font-mono text-sm">CAMERA INPUT</h3>
                                {cameraReady && <span className="text-xs font-mono text-green-400 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    READY
                                </span>}
                            </div>
                            <div className="bg-black border border-slate-700 rounded overflow-hidden aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Processed Output */}
                        {processedFrame && (
                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
                                <h3 className="text-slate-400 font-mono text-sm mb-4">PROCESSED OUTPUT</h3>
                                <div className="bg-black border border-slate-700 rounded overflow-hidden">
                                    <img src={processedFrame} alt="Processed" className="w-full" />
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex gap-4">
                            {!isActive ? (
                                <button
                                    onClick={startDetection}
                                    disabled={!cameraReady}
                                    className="flex-1 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all"
                                >
                                    START DETECTION
                                </button>
                            ) : (
                                <button
                                    onClick={stopDetection}
                                    className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                                >
                                    STOP DETECTION
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Alerts Panel */}
                    <div className="space-y-4">
                        {/* Current Threats */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
                            <h3 className="text-slate-400 font-mono text-sm mb-4 border-b border-slate-700 pb-2">CURRENT THREATS</h3>
                            {Object.keys(currentThreats).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(currentThreats).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/30 rounded">
                                            <span className="text-red-400 uppercase font-mono text-sm">{type}</span>
                                            <span className="text-red-400 font-bold text-lg">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    {isActive ? 'No threats detected' : 'Start detection to monitor'}
                                </div>
                            )}
                        </div>

                        {/* Alert History */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
                            <h3 className="text-slate-400 font-mono text-sm mb-4 border-b border-slate-700 pb-2">DETECTION LOG</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {alerts.length > 0 ? alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/50 border border-slate-700 rounded text-xs font-mono">
                                        <div className="text-red-400 mb-1">{alert.time}</div>
                                        <div className="text-slate-300">
                                            {Object.entries(alert.threats).map(([type, count]) => (
                                                <div key={type}>{type}: {count}</div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No alerts yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveFeedInterface;
