'use client';

import { useEffect } from 'react';

/** Fades `[data-reveal]` elements in as they scroll into view. The pages stay server components. */
export function RevealObserver() {
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
        );
        document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
    return null;
}
