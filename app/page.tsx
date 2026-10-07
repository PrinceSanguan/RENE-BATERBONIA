import { Footer } from '@/components/Footer';
import { TributeIntro } from '@/components/intro/TributeIntro';
import { RevealObserver } from '@/components/RevealObserver';
import { Hero } from '@/components/sections/Hero';
import { Share } from '@/components/sections/Share';
import { Sources } from '@/components/sections/Sources';
import { Statue } from '@/components/sections/Statue';
import { Story } from '@/components/sections/Story';
import { Words } from '@/components/sections/Words';
import { PERSON, SITE_DESCRIPTION } from '@/lib/content';
import { SCENE } from '@/lib/scene';

const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rene Clert Baterbonia',
    alternateName: 'Bobet',
    birthDate: '2008-05-08',
    deathDate: '2026-06-08',
    birthPlace: { '@type': 'Place', name: PERSON.hometown },
    description: SITE_DESCRIPTION,
    image: SCENE.jpg,
};

export default function Page() {
    return (
        <>
            <TributeIntro />
            <main>
                <Hero />
                <Story />
                <Statue />
                <Words />
                <Share />
                <Sources />
            </main>
            <Footer />
            <RevealObserver />
            {/* Without JavaScript the intro cannot play: skip it and show everything. */}
            <noscript>
                <style>
                    {'#intro{display:none!important}html{overflow:auto!important}[data-reveal]{opacity:1!important;transform:none!important}'}
                </style>
            </noscript>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        </>
    );
}
