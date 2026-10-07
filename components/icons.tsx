import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true } as const;
const stroke = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const PlayIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
    </svg>
);

export const SpeakerIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...stroke} />
    </svg>
);

export const SpeakerOffIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
        <path d="m16 9.5 5 5m0-5-5 5" {...stroke} />
    </svg>
);

export const ReplayIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M4 12a8 8 0 1 0 2.35-5.65M4 4v4.5h4.5" {...stroke} />
    </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M12 5v14m0 0-6-6m6 6 6-6" {...stroke} />
    </svg>
);

export const ShareIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" {...stroke} />
    </svg>
);

export const LinkIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path
            d="M10 14a4.5 4.5 0 0 0 6.36 0l3-3a4.5 4.5 0 0 0-6.36-6.36l-1.25 1.25M14 10a4.5 4.5 0 0 0-6.36 0l-3 3a4.5 4.5 0 0 0 6.36 6.36l1.25-1.25"
            {...stroke}
        />
    </svg>
);

export const FacebookIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path
            d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 3.96v2.24H8v3h2.5V21h3Z"
            fill="currentColor"
        />
    </svg>
);

export const CandleIcon = (p: IconProps) => (
    <svg {...base} {...p}>
        <path d="M12 2.5c1.6 1.9 2.4 3.3 2.4 4.4a2.4 2.4 0 1 1-4.8 0c0-1.1.8-2.5 2.4-4.4Z" fill="currentColor" />
        <path d="M9 11.5h6V21H9z" {...stroke} />
    </svg>
);
