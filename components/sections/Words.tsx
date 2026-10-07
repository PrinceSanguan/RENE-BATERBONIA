import { CandleIcon } from '@/components/icons';
import { WORDS } from '@/lib/content';

export function Words() {
    return (
        <section className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32">
            <div className="words-glow absolute inset-0 -z-10" aria-hidden />
            <div className="mx-auto max-w-4xl text-center">
                <p data-reveal className="eyebrow">
                    {WORDS.eyebrow}
                </p>
                <div className="mt-12 space-y-16">
                    {WORDS.quotes.map((q) => (
                        <figure key={q.who} data-reveal>
                            <blockquote className="font-display text-2xl leading-snug text-balance italic sm:text-4xl">“{q.text}”</blockquote>
                            <figcaption className="text-candle mt-5 text-sm font-medium tracking-[0.2em] uppercase">{q.who}</figcaption>
                        </figure>
                    ))}
                </div>
                <p data-reveal className="text-mist/70 mt-10 text-xs">
                    {WORDS.quoteSource}
                </p>

                <div data-reveal className="mt-24">
                    <CandleIcon className="candle text-candle mx-auto size-10" />
                    <p className="font-display mt-6 text-3xl font-semibold text-balance sm:text-5xl">{WORDS.farewell}</p>
                    <p className="text-mist mt-6">{WORDS.alsoRemember}</p>
                </div>
            </div>
        </section>
    );
}
