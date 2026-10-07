'use client';

import type { CameraFrame } from '@/lib/camera';
import { useEffect, useRef, type RefObject } from 'react';

type Mote = { x: number; y: number; size: number; depth: number; rise: number; alpha: number; phase: number };

/** A soft warm glow, drawn once and stamped for every mote. */
function makeSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,248,230,1)');
    grad.addColorStop(0.25, 'rgba(255,214,150,0.75)');
    grad.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
}

function spawn(w: number, h: number): Mote {
    const depth = 0.3 + Math.random() * 1.4;
    const bokeh = depth > 1.35;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: bokeh ? 22 + Math.random() * 26 : 4 + depth * 6 + Math.random() * 4,
        depth,
        rise: 4 + Math.random() * 16,
        alpha: bokeh ? 0.08 + Math.random() * 0.12 : 0.2 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
    };
}

/**
 * Floating light motes over the scene. Each mote has a depth: it follows the camera's
 * pan and zoom by `depth` times as much as the scene does, so near motes slide past
 * faster than the picture behind them. That parallax is what makes the flat image read as 3D.
 */
export function Particles({ frameRef, active, reduced }: { frameRef: RefObject<CameraFrame | null>; active: boolean; reduced: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!active || !canvas || !ctx) return;

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const sprite = makeSprite();
        let w = 0;
        let h = 0;
        let motes: Mote[] = [];

        const resize = () => {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(70, Math.max(24, (w * h) / 18000)));
            motes = Array.from({ length: count }, () => spawn(w, h));
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        let prev: CameraFrame | null = null;
        let last = performance.now();
        let id = 0;
        const margin = 60;

        const tick = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const frame = frameRef.current;
            const follow = frame && prev && !reduced ? { frame, prev, k: frame.scale / prev.scale } : null;
            prev = frame;

            ctx.clearRect(0, 0, w, h);
            for (const m of motes) {
                if (follow) {
                    // Where the scene point under this mote moved to, exaggerated by the mote's depth.
                    const dx = follow.frame.x + follow.k * (m.x - follow.prev.x) - m.x;
                    const dy = follow.frame.y + follow.k * (m.y - follow.prev.y) - m.y;
                    m.x += dx * m.depth;
                    m.y += dy * m.depth;
                }
                m.y -= m.rise * dt;
                m.phase += dt * 1.2;
                if (m.x < -margin) m.x += w + margin * 2;
                else if (m.x > w + margin) m.x -= w + margin * 2;
                if (m.y < -margin) m.y += h + margin * 2;
                else if (m.y > h + margin) m.y -= h + margin * 2;

                ctx.globalAlpha = m.alpha * (0.65 + 0.35 * Math.sin(m.phase));
                ctx.drawImage(sprite, m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
            }
            ctx.globalAlpha = 1;
            id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(id);
            ro.disconnect();
        };
    }, [active, frameRef, reduced]);

    return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" />;
}
