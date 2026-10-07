import { SOURCES } from '@/lib/content';

export function Sources() {
    return (
        <section className="border-t border-white/5 px-6 py-16 sm:px-10">
            <div className="mx-auto max-w-6xl">
                <h2 className="eyebrow">{SOURCES.title}</h2>
                <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                    {SOURCES.items.map((s) => (
                        <li key={s.url} className="text-sm">
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-mist hover:text-cream transition-colors">
                                <span className="text-cream/90 font-medium">{s.outlet}</span>: {s.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
