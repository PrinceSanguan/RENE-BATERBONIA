import { KEYFRAMES, REDUCED_FRAMING, SCENE, SHOUT_AT, type Ease, type Keyframe } from './scene.ts';

export type Viewport = { w: number; h: number };

export type CameraFrame = {
    /** CSS scale applied to the full-size image (transform-origin 0 0). */
    scale: number;
    /** Image offset in CSS px, already clamped so the image always covers the viewport. */
    x: number;
    y: number;
    /** Shake offset to add on top of x/y. */
    shakeX: number;
    shakeY: number;
    /** White flash opacity at the shout, 0..1. */
    flash: number;
};

const EASES: Record<Ease, (p: number) => number> = {
    linear: (p) => p,
    inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    inQuad: (p) => p * p,
    outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    outSine: (p) => Math.sin((p * Math.PI) / 2),
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Where the camera points at time `t`, before it is fitted to a viewport. */
export function framingAt(t: number, keyframes: Keyframe[] = KEYFRAMES): Pick<Keyframe, 'f' | 'cx' | 'cy'> {
    if (t <= keyframes[0].t) return keyframes[0];
    for (let i = 1; i < keyframes.length; i++) {
        const to = keyframes[i];
        if (t <= to.t) {
            const from = keyframes[i - 1];
            const p = EASES[to.ease ?? 'linear']((t - from.t) / (to.t - from.t));
            return { f: lerp(from.f, to.f, p), cx: lerp(from.cx, to.cx, p), cy: lerp(from.cy, to.cy, p) };
        }
    }
    return keyframes[keyframes.length - 1];
}

/**
 * The camera at time `t` (seconds into the audio) for a viewport. The scale keeps the
 * image covering the screen in any orientation, so phones get the same shot, cropped
 * tighter, and the pan across the crowd becomes longer.
 */
export function cameraAt(t: number, vp: Viewport, reducedMotion = false): CameraFrame {
    const { f, cx, cy } = reducedMotion ? REDUCED_FRAMING : framingAt(t);
    const scale = Math.max(vp.h / (f * SCENE.height), vp.w / SCENE.width);
    const dw = SCENE.width * scale;
    const dh = SCENE.height * scale;
    const x = clamp(vp.w / 2 - cx * dw, vp.w - dw, 0);
    const y = clamp(vp.h / 2 - cy * dh, vp.h - dh, 0);

    const since = t - SHOUT_AT;
    if (reducedMotion || since < 0) return { scale, x, y, shakeX: 0, shakeY: 0, flash: 0 };

    const amp = Math.min(vp.w, vp.h) * 0.018 * Math.exp(-since / 0.35);
    return {
        scale,
        x,
        y,
        shakeX: amp * Math.sin(since * 47),
        shakeY: amp * Math.cos(since * 39),
        flash: 0.38 * Math.exp(-since / 0.16),
    };
}
