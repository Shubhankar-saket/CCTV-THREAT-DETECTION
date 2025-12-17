import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const CANVAS = canvasRef.current;
        const CTX = CANVAS.getContext("2d");
        let W = window.innerWidth;
        let H = window.innerHeight;
        let XO = W / 2;
        let YO = H / 2;
        let animationFrameId;
        const PARTICLES = [];
        const NUM_PARTICLES = 150;
        const MAX_Z = 2.0;
        const MAX_R = 1.0;
        const Z_SPD = 0.5;

        class Vector {
            constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
            add(v) { this.x += v.x; this.y += v.y; this.z += v.z; }
            scale(n) { this.x *= n; this.y *= n; this.z *= n; }
        }

        class Particle {
            constructor(x, y, z) {
                this.pos = new Vector(x, y, z);
                this.vel = new Vector(0, 0, -Z_SPD);
                this.vel.scale(0.005);
                this.fill = "rgba(168, 85, 247, 0.4)";
            }
            update() { this.pos.add(this.vel); }
            render() {
                const X_COORD = this.pos.x - XO;
                const Y_COORD = this.pos.y - YO;
                const PX = (X_COORD / this.pos.z) + XO;
                const PY = (Y_COORD / this.pos.z) + YO;
                const R = (MAX_Z - this.pos.z) / MAX_Z * MAX_R;

                if (PX < 0 || PX > W || PY < 0 || PY > H || this.pos.z <= 0) {
                    this.pos.z = MAX_Z;
                    this.pos.x = Math.random() * W;
                    this.pos.y = Math.random() * H;
                }
                
                this.update();
                CTX.beginPath();
                CTX.fillStyle = this.fill;
                CTX.arc(PX, PY, Math.max(0, R), 0, Math.PI * 2);
                CTX.fill();
            }
        }

        const resize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            XO = W / 2;
            YO = H / 2;
            CANVAS.width = W;
            CANVAS.height = H;
        };

        const init = () => {
            resize();
            for (let i = 0; i < NUM_PARTICLES; i++) {
                PARTICLES.push(new Particle(Math.random() * W, Math.random() * H, Math.random() * MAX_Z));
            }
        };

        const loop = () => {
            animationFrameId = requestAnimationFrame(loop);
            CTX.fillStyle = "rgba(10, 10, 10, 0.1)";
            CTX.fillRect(0, 0, W, H);
            PARTICLES.forEach(p => p.render());
        };

        init();
        loop();
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-50" />;
};

export default ParticleBackground;