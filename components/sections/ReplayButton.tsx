'use client';

import { ReplayIcon } from '@/components/icons';
import { REPLAY_EVENT } from '@/components/intro/events';

export function ReplayButton({ label }: { label: string }) {
    // Dispatched synchronously inside the click, so the intro's audio.play() still counts as a user gesture.
    return (
        <button type="button" onClick={() => window.dispatchEvent(new Event(REPLAY_EVENT))} className="btn-candle">
            <ReplayIcon className="size-4" />
            {label}
        </button>
    );
}
