/** The anime scene the camera moves across (public/media, built by scripts/prepare-media.ps1). */
export const SCENE = {
    width: 2752,
    height: 1536,
    avif: '/media/scene.avif',
    webp: '/media/scene.webp',
    jpg: '/media/scene.jpg',
    blur: '/media/scene-blur.jpg',
};

/** Rene's face in the scene, as fractions of the image size. */
export const FACE = { x: 0.693, y: 0.21 };

export const AUDIO_SRC = '/media/tribute.mp3';
export const AUDIO_DURATION = 14.93;

/** Second in the audio where "MAMA!" is shouted: the camera punches in on his face here. Fine-tune with `/?tune=1`. */
export const SHOUT_AT = 11.2;

/** Second the name card fades in. */
export const TITLE_AT = 12.0;

export type Ease = 'linear' | 'inOutSine' | 'inOutCubic' | 'inQuad' | 'outExpo' | 'outSine';

/**
 * One camera position. `f` is the fraction of the image height in view (smaller = closer);
 * `cx`/`cy` is the point at the centre of the frame, as fractions of the image size.
 * `ease` shapes the move that arrives at this keyframe.
 */
export type Keyframe = { t: number; f: number; cx: number; cy: number; ease?: Ease };

/** Crowd first, then a pan that reveals Rene under the spotlight, a slow push, and the punch-in at the shout. */
export const KEYFRAMES: Keyframe[] = [
    { t: 0, f: 0.52, cx: 0.18, cy: 0.46 },
    { t: 3, f: 0.48, cx: 0.26, cy: 0.45, ease: 'inOutSine' },
    { t: 7.5, f: 0.82, cx: 0.66, cy: 0.49, ease: 'inOutCubic' },
    { t: SHOUT_AT, f: 0.55, cx: 0.69, cy: 0.34, ease: 'inQuad' },
    { t: SHOUT_AT + 0.27, f: 0.4, cx: FACE.x, cy: 0.28, ease: 'outExpo' },
    { t: AUDIO_DURATION, f: 0.37, cx: FACE.x, cy: 0.275, ease: 'outSine' },
];

/** The single still framing used when the visitor prefers reduced motion. */
export const REDUCED_FRAMING: Keyframe = { t: 0, f: 0.85, cx: 0.68, cy: 0.47 };
