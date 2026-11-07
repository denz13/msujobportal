import type { SVGProps } from 'react';

/**
 * Philippine Peso (₱) SVG icon styled to match Lucide React icons (24x24, 2px stroke).
 */
export function PhilippinePeso({ className = 'h-4 w-4', ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...props}
        >
            {/* Main P shape */}
            <path d="M7 21V4" />
            <path d="M7 4h6.5a4.5 4.5 0 0 1 0 9H7" />
            {/* Philippine Peso horizontal crossbars */}
            <line x1="4" y1="7.5" x2="15.5" y2="7.5" />
            <line x1="4" y1="11" x2="15.5" y2="11" />
        </svg>
    );
}

export default PhilippinePeso;

