import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = [
            '#6366f1', // brand
            '#8b5cf6', // violet
            '#f59e0b', // amber
            '#10b981', // emerald
            '#ec4899', // pink
            '#3b82f6', // blue
        ];

        const particles: Particle[] = [];
        const particleCount = 150;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
            });
        }

        let animationId: number;
        let frame = 0;
        const maxFrames = 180; // 3 seconds at 60fps

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                // Update
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // gravity
                p.rotation += p.rotationSpeed;
                p.opacity = Math.max(0, 1 - frame / maxFrames);

                // Draw
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            });

            if (frame < maxFrames) {
                animationId = requestAnimationFrame(animate);
            } else {
                onComplete?.();
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [active, onComplete]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[200]"
            style={{ mixBlendMode: 'normal' }}
        />
    );
};
