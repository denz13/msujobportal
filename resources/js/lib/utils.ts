import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format salary strings to use Philippine Peso (₱).
 * Converts dollar signs ($) to (₱) and formats raw numeric ranges.
 */
export function formatSalary(salary?: string | null, fallback = '—'): string {
    if (!salary || salary.trim() === '') {
        return fallback;
    }

    const trimmed = salary.trim();
    // Replace dollar signs with Philippine Peso symbol
    let formatted = trimmed.replace(/\$/g, '₱');

    // If pure number (e.g. "25000") or pure range (e.g. "25000 - 35000"), add ₱ and comma separation
    if (/^\d{3,}(\s*-\s*\d{3,})?$/.test(formatted)) {
        formatted = formatted.replace(/\b\d{3,}\b/g, (num) => '₱' + Number(num).toLocaleString('en-PH'));
    }

    return formatted;
}
