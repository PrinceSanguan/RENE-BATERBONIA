'use client';

import { FacebookIcon, LinkIcon, ShareIcon } from '@/components/icons';
import { SHARE, SITE_TITLE } from '@/lib/content';
import { useState, useSyncExternalStore } from 'react';

const canNativeShare = () => typeof navigator.share === 'function';

export function Share() {
    const [copied, setCopied] = useState(false);
    const native = useSyncExternalStore(
        () => () => {},
        canNativeShare,
        () => false,
    );

    const url = () => window.location.origin + window.location.pathname;

    const shareNative = () => {
        navigator.share({ title: SITE_TITLE, text: SHARE.body, url: url() }).catch(() => {});
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`, '_blank', 'noopener,width=640,height=560');
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            window.prompt(SHARE.copy, url());
        }
    };

    return (
        <section className="px-6 pb-24 sm:px-10 sm:pb-32">
            <div data-reveal className="share-card mx-auto max-w-4xl rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16">
                <h2 className="font-display text-3xl font-semibold sm:text-4xl">{SHARE.title}</h2>
                <p className="text-mist mt-3">{SHARE.body}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {native && (
                        <button type="button" onClick={shareNative} className="btn-candle">
                            <ShareIcon className="size-4" />
                            {SHARE.native}
                        </button>
                    )}
                    <button type="button" onClick={shareFacebook} className={native ? 'btn-ghost' : 'btn-candle'}>
                        <FacebookIcon className="size-4" />
                        {SHARE.facebook}
                    </button>
                    <button type="button" onClick={copy} className="btn-ghost" aria-live="polite">
                        <LinkIcon className="size-4" />
                        {copied ? SHARE.copied : SHARE.copy}
                    </button>
                </div>
            </div>
        </section>
    );
}
