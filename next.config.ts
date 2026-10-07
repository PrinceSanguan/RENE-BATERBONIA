import type { NextConfig } from 'next';

/** Same security headers as the Student Web Solutions site. */
const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
    { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    // Media is pre-encoded by scripts/prepare-media.ps1, so the image optimizer (and its quota) is not needed.
    images: { unoptimized: true },
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
    async headers() {
        return [
            { source: '/:path*', headers: securityHeaders },
            // Not content-hashed (re-running the media script keeps the names), so cache for a day, not forever.
            { source: '/media/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
        ];
    },
};

export default nextConfig;
