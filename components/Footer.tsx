import { STUDIO } from '@/lib/content';

export function Footer() {
    return (
        <footer className="border-t border-white/5 px-6 py-16 sm:px-10">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
                <a href={STUDIO.url} target="_blank" rel="noopener" className="sws-card shrink-0" aria-label={STUDIO.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/media/sws-logo.webp" alt={`${STUDIO.name} logo`} width={720} height={405} loading="lazy" className="w-56" />
                </a>
                <div className="space-y-3">
                    <p className="text-cream text-lg">
                        {STUDIO.madeWith}{' '}
                        <a href={STUDIO.url} target="_blank" rel="noopener" className="text-candle font-semibold underline-offset-4 hover:underline">
                            {STUDIO.name}
                        </a>
                    </p>
                    <p className="text-mist max-w-xl text-sm leading-relaxed">{STUDIO.notForProfit}</p>
                    <p className="text-mist/80 text-sm">
                        {STUDIO.cta}{' '}
                        <a href={STUDIO.url} target="_blank" rel="noopener" className="text-cream underline-offset-4 hover:underline">
                            {STUDIO.ctaLink} →
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
