'use client';

import { CandleIcon, PlayIcon, SpeakerIcon, SpeakerOffIcon } from '@/components/icons';
import { cameraAt, type CameraFrame } from '@/lib/camera';
import { INTRO, PERSON, STUDIO } from '@/lib/content';
import { AUDIO_DURATION, AUDIO_SRC, SCENE, SHOUT_AT, TITLE_AT } from '@/lib/scene';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { REPLAY_EVENT } from './events';
import { Particles } from './Particles';

/**
 * loading: fetching the scene · gate: waiting for a tap (the browser blocked autoplay with sound)
 * playing: the camera runs on the audio clock · ending: fading out · done: hidden, page scrolls
 */
type Phase = 'loading' | 'gate' | 'playing' | 'ending' | 'done';

const FADE_OUT_MS = 1600;
const IMAGE_TIMEOUT_MS = 10000;

const reducedQuery = '(prefers-reduced-motion: reduce)';
function useReducedMotion() {
    return useSyncExternalStore(
        (onChange) => {
            const mq = matchMedia(reducedQuery);
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        },
        () => matchMedia(reducedQuery).matches,
        () => false,
    );
}

/** `/?tune=1` shows the audio clock and lets Space mark the second of the shout. */
function useTuneMode() {
    return useSyncExternalStore(
        () => () => {},
        () => new URLSearchParams(location.search).has('tune'),
        () => false,
    );
}

export function TributeIntro() {
    const [phase, setPhase] = useState<Phase>('loading');
    const [muted, setMuted] = useState(false);
    const [stalled, setStalled] = useState(false);
    const [titleOn, setTitleOn] = useState(false);
    const [marks, setMarks] = useState<number[]>([]);
    const reduced = useReducedMotion();
    const tune = useTuneMode();

    const stageRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const clockRef = useRef<HTMLSpanElement>(null);
    const frameRef = useRef<CameraFrame | null>(null);
    const reducedRef = useRef(reduced);
    const view = useRef({ w: 0, h: 0 });
    // audioT/perfT smooth the coarse audio clock; virtualStart >= 0 means audio failed and a timer drives the camera.
    const clock = useRef({ audioT: 0, perfT: 0, virtualStart: -1, titleShown: false, hiddenPause: false });

    useEffect(() => {
        reducedRef.current = reduced;
    }, [reduced]);

    /** Seconds into the tribute. */
    const timeAt = useCallback((perf: number) => {
        const c = clock.current;
        const audio = audioRef.current;
        if (c.virtualStart >= 0 || !audio) return Math.max(0, (perf - c.virtualStart) / 1000);
        if (audio.currentTime !== c.audioT) {
            c.audioT = audio.currentTime;
            c.perfT = perf;
        }
        return audio.paused ? audio.currentTime : c.audioT + Math.min(0.25, (perf - c.perfT) / 1000);
    }, []);

    const draw = useCallback((t: number) => {
        const img = imgRef.current;
        if (!img || !view.current.w) return;
        const f = cameraAt(t, view.current, reducedRef.current);
        frameRef.current = f;
        img.style.transform = `translate3d(${f.x + f.shakeX}px, ${f.y + f.shakeY}px, 0) scale(${f.scale})`;
        if (flashRef.current) flashRef.current.style.opacity = String(f.flash);
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, t / AUDIO_DURATION)})`;
        if (clockRef.current) clockRef.current.textContent = t.toFixed(2);
    }, []);

    const resetClock = useCallback(() => {
        clock.current = { audioT: 0, perfT: performance.now(), virtualStart: -1, titleShown: false, hiddenPause: false };
        setTitleOn(false);
        setStalled(false);
    }, []);

    /** Start from the top. Must run inside a tap/key handler so the browser lets the audio play. */
    const begin = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        resetClock();
        audio.currentTime = 0;
        audio.muted = false;
        setMuted(false);
        audio.play().catch(() => {
            // Audio could not play at all (missing file, decoder error): run the camera silently on a timer.
            clock.current.virtualStart = performance.now();
        });
        window.scrollTo(0, 0);
        setPhase('playing');
    }, [resetClock]);

    const finish = useCallback(() => setPhase((p) => (p === 'playing' ? 'ending' : p)), []);

    const skip = useCallback(() => {
        audioRef.current?.pause();
        finish();
    }, [finish]);

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !audio.muted;
        setMuted(audio.muted);
    };

    const resume = () => {
        audioRef.current
            ?.play()
            .then(() => setStalled(false))
            .catch(() => {});
    };

    // Track the stage size; redraw so the gate shows the opening frame behind the blur.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const ro = new ResizeObserver(([entry]) => {
            view.current = { w: entry.contentRect.width, h: entry.contentRect.height };
            draw(timeAt(performance.now()));
        });
        ro.observe(stage);
        return () => ro.disconnect();
    }, [draw, timeAt]);

    // Once the scene is decoded, try to start with sound. Most browsers refuse on a first
    // visit, which is expected: the visitor then gets the "Simulan" gate.
    useEffect(() => {
        const img = imgRef.current;
        const audio = audioRef.current;
        if (!img || !audio) return;
        let cancelled = false;

        const loaded =
            img.complete && img.naturalWidth > 0
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                      img.addEventListener('load', () => resolve(), { once: true });
                      img.addEventListener('error', () => resolve(), { once: true });
                  });
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, IMAGE_TIMEOUT_MS));

        Promise.race([loaded.then(() => img.decode().catch(() => {})), timeout]).then(() => {
            if (cancelled) return;
            img.classList.add('is-ready');
            draw(0);
            audio
                .play()
                .then(() => {
                    if (cancelled) return audio.pause();
                    resetClock();
                    setPhase('playing');
                })
                .catch(() => {
                    if (!cancelled) setPhase('gate');
                });
        });

        return () => {
            cancelled = true;
        };
    }, [draw, resetClock]);

    // The camera loop: every frame reads the audio clock and moves the camera to match.
    useEffect(() => {
        if (phase !== 'playing' && phase !== 'ending') return;
        let id = 0;
        const tick = (perf: number) => {
            const t = timeAt(perf);
            draw(t);
            const c = clock.current;
            if (!c.titleShown && t >= TITLE_AT) {
                c.titleShown = true;
                setTitleOn(true);
            }
            if (c.virtualStart >= 0 && t >= AUDIO_DURATION) finish();
            id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(id);
    }, [phase, draw, timeAt, finish]);

    // Fade out, then hand the page back.
    useEffect(() => {
        if (phase !== 'ending') return;
        const id = setTimeout(() => setPhase('done'), FADE_OUT_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Lock page scroll while the intro covers it.
    useEffect(() => {
        const html = document.documentElement;
        html.style.overflow = phase === 'done' ? '' : 'hidden';
        return () => {
            html.style.overflow = '';
        };
    }, [phase]);

    // Pause with the tab hidden, pick up again when the visitor comes back.
    useEffect(() => {
        if (phase !== 'playing') return;
        const onVisibility = () => {
            const audio = audioRef.current;
            const c = clock.current;
            if (!audio) return;
            if (document.hidden) {
                if (!audio.paused) {
                    audio.pause();
                    c.hiddenPause = true;
                }
            } else if (c.hiddenPause) {
                c.hiddenPause = false;
                audio.play().catch(() => setStalled(true));
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [phase]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (phase === 'gate' && e.key === 'Enter') begin();
            else if (phase === 'playing' && e.key === 'Escape') skip();
            else if (tune && phase === 'playing' && e.code === 'Space') {
                e.preventDefault();
                const t = audioRef.current?.currentTime ?? 0;
                console.info(`[tune] marked ${t.toFixed(2)}s (SHOUT_AT is ${SHOUT_AT}s)`);
                setMarks((m) => [...m, t]);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, tune, begin, skip]);

    useEffect(() => {
        window.addEventListener(REPLAY_EVENT, begin);
        return () => window.removeEventListener(REPLAY_EVENT, begin);
    }, [begin]);

    const live = phase === 'playing' || phase === 'ending';
    const waiting = phase === 'loading' || phase === 'gate';

    return (
        <div
            id="intro"
            role="dialog"
            aria-modal="true"
            aria-label={`Pagpupugay kay ${PERSON.shortName}`}
            hidden={phase === 'done'}
            className={`bg-night fixed inset-0 z-50 overflow-hidden transition-opacity duration-[1600ms] ease-in ${phase === 'ending' ? 'opacity-0' : 'opacity-100'}`}
        >
            <div ref={stageRef} className={`intro-stage ${live ? 'is-live' : ''}`} style={{ backgroundImage: `url(${SCENE.blur})` }}>
                <picture>
                    <source srcSet={SCENE.avif} type="image/avif" />
                    <source srcSet={SCENE.webp} type="image/webp" />
                    {/* A plain <img>: the camera needs the full-size source and moves it with transforms. */}
                    <img
                        ref={imgRef}
                        src={SCENE.jpg}
                        alt=""
                        width={SCENE.width}
                        height={SCENE.height}
                        fetchPriority="high"
                        decoding="async"
                        draggable={false}
                        className="intro-img"
                    />
                </picture>
            </div>

            <Particles frameRef={frameRef} active={phase !== 'done'} reduced={reduced} />
            <div className="intro-vignette" />
            <div className="intro-grain" aria-hidden />
            <div ref={flashRef} className="intro-flash" aria-hidden />
            <div className={`intro-bars ${phase === 'playing' ? 'is-on' : ''}`} aria-hidden>
                <span />
                <span />
            </div>

            {/* Name card after the shout, on a darkened lower third so it reads over the jersey */}
            <div className={`intro-title-shade ${titleOn ? 'is-on' : ''}`} aria-hidden />
            <div className={`intro-title ${titleOn ? 'is-on' : ''}`} aria-hidden={!titleOn}>
                <p className="text-candle text-[0.7rem] font-medium tracking-[0.45em] uppercase sm:text-xs">{INTRO.eyebrow}</p>
                <p className="font-display text-cream mt-3 text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
                    {PERSON.fullName}
                </p>
                <p className="text-cream/80 mt-3 text-sm tracking-[0.3em] sm:text-base">{PERSON.years}</p>
                <p className="font-display text-cream/75 mt-4 text-lg italic sm:text-2xl">“{PERSON.motto}”</p>
            </div>

            {waiting && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
                    <p className="text-candle text-xs font-medium tracking-[0.45em] uppercase">{INTRO.eyebrow}</p>
                    <p className="font-display text-cream mt-4 text-5xl leading-[1.02] font-semibold text-balance sm:text-7xl">{PERSON.shortName}</p>
                    <p className="text-cream/75 mt-4 text-sm tracking-[0.2em] sm:text-base">{PERSON.dates}</p>
                    <button
                        type="button"
                        onClick={begin}
                        disabled={phase === 'loading'}
                        className="glow-btn group mt-10 inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold tracking-wide disabled:cursor-wait"
                    >
                        {phase === 'loading' ? (
                            <>
                                <span className="spinner" aria-hidden />
                                {INTRO.loading}
                            </>
                        ) : (
                            <>
                                <PlayIcon className="size-5 transition-transform group-hover:scale-110" />
                                {INTRO.start}
                            </>
                        )}
                    </button>
                    <p className="text-cream/60 mt-5 inline-flex items-center gap-2 text-sm">
                        <SpeakerIcon className="size-4" />
                        {INTRO.soundHint}
                    </p>
                </div>
            )}

            {live && (
                <div className="intro-safe-top absolute right-4 z-30 flex gap-2 sm:right-6">
                    <button type="button" onClick={toggleMute} className="intro-chip" aria-label={muted ? INTRO.unmute : INTRO.mute}>
                        {muted ? <SpeakerOffIcon className="size-4" /> : <SpeakerIcon className="size-4" />}
                    </button>
                    <button type="button" onClick={skip} className="intro-chip px-4">
                        {INTRO.skip} <span aria-hidden>›</span>
                    </button>
                </div>
            )}

            {stalled && (
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <button type="button" onClick={resume} className="glow-btn inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-semibold">
                        <PlayIcon className="size-5" />
                        {INTRO.resume}
                    </button>
                </div>
            )}

            <a
                href={STUDIO.url}
                target="_blank"
                rel="noopener"
                className={`sws-pill intro-safe-bottom absolute left-4 z-30 sm:left-6 ${titleOn ? 'is-on' : ''}`}
                tabIndex={titleOn ? 0 : -1}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/media/sws-logo.webp" alt="" width={720} height={405} />
                <span>
                    <b>{STUDIO.builtBy}</b>
                    {STUDIO.name}
                </span>
            </a>

            <div className="absolute inset-x-0 bottom-0 z-30 h-0.5 bg-white/10" aria-hidden>
                <div ref={progressRef} className="bg-candle/80 h-full origin-left" style={{ transform: 'scaleX(0)' }} />
            </div>

            {tune && (
                <div className="absolute top-4 left-4 z-40 rounded-lg bg-black/70 px-3 py-2 font-mono text-xs text-white">
                    <CandleIcon className="text-candle mr-1 inline size-3.5" />t = <span ref={clockRef}>0.00</span>s · SHOUT_AT = {SHOUT_AT}s · Space
                    = markahan
                    {marks.length > 0 && <div className="text-candle mt-1">marks: {marks.map((m) => m.toFixed(2)).join(', ')}</div>}
                </div>
            )}

            <audio ref={audioRef} src={AUDIO_SRC} preload="auto" onEnded={finish} />
        </div>
    );
}
