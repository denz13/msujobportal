export type ThemePaletteId =
    | 'emerald'
    | 'maroon'
    | 'blue'
    | 'indigo'
    | 'purple'
    | 'rose'
    | 'amber'
    | 'teal'
    | 'slate';

export type ThemePalette = {
    id: ThemePaletteId;
    name: string;
    description: string;
    previewHex: string;
    previewAccentHex: string;
    light: {
        primary: string;
        primaryForeground: string;
        ring: string;
        sidebarPrimary: string;
        sidebarPrimaryForeground: string;
        sidebarRing: string;
    };
    dark: {
        primary: string;
        primaryForeground: string;
        ring: string;
        sidebarPrimary: string;
        sidebarPrimaryForeground: string;
        sidebarRing: string;
    };
};

export const THEME_PALETTES: ThemePalette[] = [
    {
        id: 'emerald',
        name: 'Emerald Green',
        description: 'Vibrant green — official MSU & Peso platform style',
        previewHex: '#059669',
        previewAccentHex: '#10b981',
        light: {
            primary: 'oklch(0.55 0.17 155)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.55 0.17 155)',
            sidebarPrimary: 'oklch(0.55 0.17 155)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.55 0.17 155)',
        },
        dark: {
            primary: 'oklch(0.65 0.18 155)',
            primaryForeground: 'oklch(0.12 0.04 155)',
            ring: 'oklch(0.65 0.18 155)',
            sidebarPrimary: 'oklch(0.65 0.18 155)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 155)',
            sidebarRing: 'oklch(0.65 0.18 155)',
        },
    },
    {
        id: 'maroon',
        name: 'MSU Maroon',
        description: 'Deep crimson and garnet university colors',
        previewHex: '#881337',
        previewAccentHex: '#e11d48',
        light: {
            primary: 'oklch(0.45 0.19 18)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.45 0.19 18)',
            sidebarPrimary: 'oklch(0.45 0.19 18)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.45 0.19 18)',
        },
        dark: {
            primary: 'oklch(0.60 0.22 18)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.60 0.22 18)',
            sidebarPrimary: 'oklch(0.60 0.22 18)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.60 0.22 18)',
        },
    },
    {
        id: 'blue',
        name: 'Ocean Blue',
        description: 'Modern professional tech & corporate blue',
        previewHex: '#2563eb',
        previewAccentHex: '#3b82f6',
        light: {
            primary: 'oklch(0.55 0.20 250)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.55 0.20 250)',
            sidebarPrimary: 'oklch(0.55 0.20 250)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.55 0.20 250)',
        },
        dark: {
            primary: 'oklch(0.65 0.20 250)',
            primaryForeground: 'oklch(0.12 0.04 250)',
            ring: 'oklch(0.65 0.20 250)',
            sidebarPrimary: 'oklch(0.65 0.20 250)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 250)',
            sidebarRing: 'oklch(0.65 0.20 250)',
        },
    },
    {
        id: 'indigo',
        name: 'Royal Indigo',
        description: 'Refined deep indigo purple tone',
        previewHex: '#4f46e5',
        previewAccentHex: '#6366f1',
        light: {
            primary: 'oklch(0.50 0.22 275)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.50 0.22 275)',
            sidebarPrimary: 'oklch(0.50 0.22 275)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.50 0.22 275)',
        },
        dark: {
            primary: 'oklch(0.65 0.22 275)',
            primaryForeground: 'oklch(0.12 0.04 275)',
            ring: 'oklch(0.65 0.22 275)',
            sidebarPrimary: 'oklch(0.65 0.22 275)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 275)',
            sidebarRing: 'oklch(0.65 0.22 275)',
        },
    },
    {
        id: 'purple',
        name: 'Amethyst Purple',
        description: 'Vibrant modern purple accent',
        previewHex: '#7c3aed',
        previewAccentHex: '#8b5cf6',
        light: {
            primary: 'oklch(0.52 0.23 300)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.52 0.23 300)',
            sidebarPrimary: 'oklch(0.52 0.23 300)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.52 0.23 300)',
        },
        dark: {
            primary: 'oklch(0.68 0.23 300)',
            primaryForeground: 'oklch(0.12 0.04 300)',
            ring: 'oklch(0.68 0.23 300)',
            sidebarPrimary: 'oklch(0.68 0.23 300)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 300)',
            sidebarRing: 'oklch(0.68 0.23 300)',
        },
    },
    {
        id: 'rose',
        name: 'Rose Ruby',
        description: 'Warm energetic rose pink and ruby',
        previewHex: '#e11d48',
        previewAccentHex: '#fb7185',
        light: {
            primary: 'oklch(0.56 0.23 15)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.56 0.23 15)',
            sidebarPrimary: 'oklch(0.56 0.23 15)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.56 0.23 15)',
        },
        dark: {
            primary: 'oklch(0.68 0.22 15)',
            primaryForeground: 'oklch(0.12 0.04 15)',
            ring: 'oklch(0.68 0.22 15)',
            sidebarPrimary: 'oklch(0.68 0.22 15)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 15)',
            sidebarRing: 'oklch(0.68 0.22 15)',
        },
    },
    {
        id: 'amber',
        name: 'Golden Amber',
        description: 'Warm optimistic amber & gold energy',
        previewHex: '#d97706',
        previewAccentHex: '#f59e0b',
        light: {
            primary: 'oklch(0.62 0.18 65)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.62 0.18 65)',
            sidebarPrimary: 'oklch(0.62 0.18 65)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.62 0.18 65)',
        },
        dark: {
            primary: 'oklch(0.74 0.18 65)',
            primaryForeground: 'oklch(0.12 0.04 65)',
            ring: 'oklch(0.74 0.18 65)',
            sidebarPrimary: 'oklch(0.74 0.18 65)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 65)',
            sidebarRing: 'oklch(0.74 0.18 65)',
        },
    },
    {
        id: 'teal',
        name: 'Teal Marine',
        description: 'Serene cyan & marine balanced tone',
        previewHex: '#0d9488',
        previewAccentHex: '#14b8a6',
        light: {
            primary: 'oklch(0.54 0.15 195)',
            primaryForeground: 'oklch(0.99 0 0)',
            ring: 'oklch(0.54 0.15 195)',
            sidebarPrimary: 'oklch(0.54 0.15 195)',
            sidebarPrimaryForeground: 'oklch(0.99 0 0)',
            sidebarRing: 'oklch(0.54 0.15 195)',
        },
        dark: {
            primary: 'oklch(0.68 0.16 195)',
            primaryForeground: 'oklch(0.12 0.04 195)',
            ring: 'oklch(0.68 0.16 195)',
            sidebarPrimary: 'oklch(0.68 0.16 195)',
            sidebarPrimaryForeground: 'oklch(0.12 0.04 195)',
            sidebarRing: 'oklch(0.68 0.16 195)',
        },
    },
    {
        id: 'slate',
        name: 'Slate Monochrome',
        description: 'Classic minimalist high-contrast grayscale',
        previewHex: '#334155',
        previewAccentHex: '#64748b',
        light: {
            primary: 'oklch(0.205 0 0)',
            primaryForeground: 'oklch(0.985 0 0)',
            ring: 'oklch(0.87 0 0)',
            sidebarPrimary: 'oklch(0.205 0 0)',
            sidebarPrimaryForeground: 'oklch(0.985 0 0)',
            sidebarRing: 'oklch(0.87 0 0)',
        },
        dark: {
            primary: 'oklch(0.985 0 0)',
            primaryForeground: 'oklch(0.205 0 0)',
            ring: 'oklch(0.439 0 0)',
            sidebarPrimary: 'oklch(0.985 0 0)',
            sidebarPrimaryForeground: 'oklch(0.985 0 0)',
            sidebarRing: 'oklch(0.439 0 0)',
        },
    },
];

/**
 * Generate CSS rules string for injecting into <style id="app-color-palette">
 */
export function generatePaletteCss(palette: ThemePalette): string {
    return `
:root {
  --primary: ${palette.light.primary} !important;
  --primary-foreground: ${palette.light.primaryForeground} !important;
  --ring: ${palette.light.ring} !important;
  --sidebar-primary: ${palette.light.sidebarPrimary} !important;
  --sidebar-primary-foreground: ${palette.light.sidebarPrimaryForeground} !important;
  --sidebar-ring: ${palette.light.sidebarRing} !important;
  --theme-color-id: "${palette.id}";
}

.dark {
  --primary: ${palette.dark.primary} !important;
  --primary-foreground: ${palette.dark.primaryForeground} !important;
  --ring: ${palette.dark.ring} !important;
  --sidebar-primary: ${palette.dark.sidebarPrimary} !important;
  --sidebar-primary-foreground: ${palette.dark.sidebarPrimaryForeground} !important;
  --sidebar-ring: ${palette.dark.sidebarRing} !important;
}
`;
}

/**
 * Find palette by id with fallback to emerald
 */
export function getPalette(id: string | null | undefined): ThemePalette {
    const found = THEME_PALETTES.find((p) => p.id === id);
    return found || THEME_PALETTES[0];
}

/**
 * Apply the palette to the DOM root immediately
 */
export function applyThemePalette(paletteId: string): void {
    if (typeof document === 'undefined') return;

    const palette = getPalette(paletteId);
    let styleTag = document.getElementById('app-color-palette') as HTMLStyleElement | null;

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'app-color-palette';
        document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = generatePaletteCss(palette);

    // Save locally
    try {
        localStorage.setItem('theme_color', palette.id);
        const maxAge = 365 * 24 * 60 * 60;
        document.cookie = `theme_color=${palette.id};path=/;max-age=${maxAge};SameSite=Lax`;
    } catch {
        // ignore
    }

    // Dispatch global event so UI reacts
    window.dispatchEvent(new CustomEvent('theme-color-changed', { detail: { id: palette.id } }));
}

/**
 * Save theme palette to database via API
 */
export async function saveThemePaletteToDatabase(paletteId: string, applyGlobal = false): Promise<boolean> {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch('/settings/theme-color', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            },
            body: JSON.stringify({
                theme_color: paletteId,
                apply_global: applyGlobal,
            }),
        });
        return res.ok;
    } catch (e) {
        console.error('Failed to save theme color to database:', e);
        return false;
    }
}

