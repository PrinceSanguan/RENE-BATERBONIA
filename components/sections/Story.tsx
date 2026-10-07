import { STORY } from '@/lib/content';
import { revealDelay } from '@/lib/reveal';

export function Story() {
    return (
        <section id="kuwento" className="relative scroll-mt-8 px-6 py-24 sm:px-10 sm:py-32">
            <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <p data-reveal className="eyebrow">
                        {STORY.eyebrow}
                    </p>
                    <h2 data-reveal className="font-display mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                        {STORY.title}
                    </h2>
                    <p data-reveal className="text-mist mt-6 text-lg leading-relaxed">
                        {STORY.lead}
                    </p>
                </div>

                <ol className="timeline relative space-y-12 pl-10">
                    {STORY.milestones.map((m, i) => (
                        <li key={m.title} data-reveal style={revealDelay(Math.min(i, 3) * 80)} className="relative">
                            <span className="timeline-dot" aria-hidden />
                            <p className="text-candle text-xs font-semibold tracking-[0.3em] uppercase">{m.when}</p>
                            <h3 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{m.title}</h3>
                            <p className="text-mist mt-3 leading-relaxed">{m.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
