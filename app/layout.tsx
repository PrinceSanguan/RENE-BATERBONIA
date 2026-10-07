import { SITE_DESCRIPTION, SITE_TITLE, STUDIO } from '@/lib/content';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });

const cormorant = Cormorant_Garamond({
    variable: '--font-cormorant',
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
});

/** Absolute base for OG links: an explicit override, else the Vercel production domain. */
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'fil_PH',
        url: '/',
        siteName: SITE_TITLE,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
    },
    twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION },
    authors: [{ name: STUDIO.name, url: STUDIO.url }],
    creator: STUDIO.name,
};

export const viewport: Viewport = {
    themeColor: '#070b14',
    colorScheme: 'dark',
    viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="fil" data-scroll-behavior="smooth" className={`${inter.variable} ${cormorant.variable} antialiased`}>
            <body className="bg-night text-cream min-h-svh font-sans">
                {children}
                {/* Visitor counts and Core Web Vitals; both only send data on a Vercel deployment. */}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
