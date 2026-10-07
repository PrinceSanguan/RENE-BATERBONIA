import { PERSON, STATUE } from '@/lib/content';
import { revealDelay } from '@/lib/reveal';
import { SCENE } from '@/lib/scene';

export function Statue() {
    return (
        <section className="bg-night-2 relative px-6 py-24 sm:px-10 sm:py-32">
            <div className="mx-auto max-w-6xl">
                <div className="max-w-2xl">
                    <p data-reveal className="eyebrow">
                        {STATUE.eyebrow}
                    </p>
                    <h2 data-reveal className="font-display mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                        {STATUE.title}
                    </h2>
                    <p data-reveal className="text-mist mt-6 text-lg leading-relaxed">
                        {STATUE.body}
                    </p>
                    <p data-reveal className="font-display text-candle mt-8 text-2xl italic sm:text-3xl">
                        “{PERSON.motto}”
                    </p>
                </div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-8">
                    <figure data-reveal className="frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/media/statue.webp"
                            alt={`Ang rebulto ni ${PERSON.shortName} sa Talacogon: nakasuot ng jersey ng Pilipinas, numero 2, hawak ang bola sa triple-threat stance`}
                            width={662}
                            height={880}
                            loading="lazy"
                            className="aspect-[3/4] w-full object-cover"
                        />
                        <figcaption>{STATUE.photoCaption}</figcaption>
                    </figure>
                    <figure data-reveal style={revealDelay(140)} className="frame">
                        <picture>
                            <source srcSet={SCENE.avif} type="image/avif" />
                            <source srcSet={SCENE.webp} type="image/webp" />
                            <img
                                src={SCENE.jpg}
                                alt={`Anime na likhang-sining ni ${PERSON.shortName}, hango sa kanyang rebulto`}
                                width={SCENE.width}
                                height={SCENE.height}
                                loading="lazy"
                                className="aspect-[3/4] w-full object-cover object-[69%_40%]"
                            />
                        </picture>
                        <figcaption>{STATUE.artCaption}</figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}
