import { ArrowDownIcon } from '@/components/icons';
import { HERO, PERSON } from '@/lib/content';
import { revealDelay } from '@/lib/reveal';
import { SCENE } from '@/lib/scene';
import { ReplayButton } from './ReplayButton';

export function Hero() {
    return (
        <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
            <picture>
                <source srcSet={SCENE.avif} type="image/avif" />
                <source srcSet={SCENE.webp} type="image/webp" />
                <img
                    src={SCENE.jpg}
                    alt={`Anime na larawan ni ${PERSON.shortName} na may hawak na bola, nakasuot ng jersey ng Pilipinas, sa gitna ng mga nagchi-cheer na kababayan sa Talacogon`}
                    width={SCENE.width}
                    height={SCENE.height}
                    className="hero-img absolute inset-0 -z-20 h-full w-full object-cover"
                />
            </picture>
            <div className="hero-shade absolute inset-0 -z-10" />

            <div className="mx-auto w-full max-w-6xl px-6 pt-32 pb-16 sm:px-10 sm:pb-24">
                <p data-reveal className="text-candle text-xs font-medium tracking-[0.45em] uppercase">
                    {HERO.eyebrow}
                </p>
                <h1
                    data-reveal
                    style={revealDelay(120)}
                    className="font-display mt-4 max-w-2xl text-5xl leading-[1.02] font-semibold text-balance sm:text-7xl"
                >
                    {PERSON.fullName}
                </h1>
                <p data-reveal style={revealDelay(240)} className="text-cream/80 mt-5 text-base tracking-[0.2em] sm:text-lg">
                    {PERSON.dates}
                </p>
                <p data-reveal style={revealDelay(360)} className="font-display text-cream/85 mt-6 max-w-xl text-2xl italic sm:text-3xl">
                    {HERO.line}
                </p>
                <div data-reveal style={revealDelay(480)} className="mt-10 flex flex-wrap items-center gap-3">
                    <ReplayButton label={HERO.replay} />
                    <a href="#kuwento" className="btn-ghost">
                        {HERO.read}
                        <ArrowDownIcon className="size-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
