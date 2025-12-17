import React from 'react';

const SecurityBackground = () => {
    return (
        <div className="fixed inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
            {/* Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px),
                                      linear-gradient(to bottom, #334155 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Radar Scan Line Animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent animate-scan"></div>
            
            {/* Vignette for focus */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-80"></div>
        </div>
    );
};

export default SecurityBackground;