import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScannerInterface = () => {
    const navigate = useNavigate();
    const [scanState, setScanState] = useState('initial');
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setScanState('ready');
        }
    };

    const handleUpload = async () => {
        setScanState('scanning');
        // Fake progress for UI
        const interval = setInterval(() => setProgress(p => p < 90 ? p + 5 : p), 200);
        
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await axios.post('http://localhost:8000/upload', formData);
            
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setResult(res.data);
                setScanState('result');
            }, 500);
        } catch (error) {
            clearInterval(interval);
            alert("Upload Error");
            setScanState('ready');
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

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800 rounded-lg p-10 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                    
                    {/* Decorators */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg"></div>

                    {scanState === 'initial' && (
                        <label className="group cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-lg bg-slate-950/50 transition-all">
                            <div className="w-16 h-16 mb-4 text-slate-500 group-hover:text-cyan-400 transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <p className="text-lg font-medium text-slate-300">Initialize Feed Analysis</p>
                            <p className="text-sm text-slate-500 mt-2 font-mono">DROP VIDEO OR CLICK TO BROWSE</p>
                            <input type="file" className="hidden" onChange={handleFileSelect} />
                        </label>
                    )}

                    {scanState === 'ready' && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">📼</div>
                            <h3 className="text-xl font-mono text-white mb-2">{selectedFile?.name}</h3>
                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setScanState('initial')} className="px-6 py-2 border border-slate-600 text-slate-400 hover:text-white rounded">CANCEL</button>
                                <button onClick={handleUpload} className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_rgba(8,145,178,0.5)]">EXECUTE SCAN</button>
                            </div>
                        </div>
                    )}

                    {scanState === 'scanning' && (
                        <div className="w-full max-w-lg">
                            <div className="flex justify-between text-xs font-mono text-cyan-400 mb-2">
                                <span>PROCESSING FOOTAGE</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 bg-slate-800 w-full overflow-hidden">
                                <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                            </div>
                            <p className="text-center text-slate-500 text-xs mt-4 animate-pulse">Running YOLOv8 Inference Models...</p>
                        </div>
                    )}

                    {scanState === 'result' && result && (
                        <div className="w-full animate-fadeIn flex flex-col items-center">
                            <div className={`text-2xl font-bold font-mono mb-6 ${result.total_threats > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                STATUS: {result.total_threats > 0 ? "THREATS DETECTED" : "CLEAR"}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                                <div className="border border-slate-700 bg-black p-1">
                                    <video controls className="w-full" src={`http://localhost:8000/video/${result.output_video}`} />
                                </div>
                                <div className="border border-slate-700 bg-slate-900/50 p-4 font-mono text-sm">
                                    <h4 className="text-slate-400 border-b border-slate-700 pb-2 mb-3">DETECTION LOG</h4>
                                    {Object.entries(result.alerts).map(([k, v]) => (
                                        <div key={k} className="flex justify-between py-2 border-b border-slate-800/50">
                                            <span className="text-slate-300 uppercase">{k}</span>
                                            <span className="text-red-400 font-bold">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <button onClick={() => setScanState('initial')} className="mt-8 px-6 py-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded font-mono text-sm">
                                NEW SCAN
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ScannerInterface;