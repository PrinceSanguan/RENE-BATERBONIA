import type { CSSProperties } from 'react';

/** Stagger for a `[data-reveal]` element (read by the CSS transition-delay). */
export const revealDelay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
