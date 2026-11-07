import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    applyThemePalette,
    getPalette,
    saveThemePaletteToDatabase,
    THEME_PALETTES,
    type ThemePalette,
    type ThemePaletteId,
} from '@/lib/theme-palettes';

export function useThemeColor() {
    const page = usePage();
    const serverColor = (page.props as any)?.themeColor as string | undefined;

    const [currentColor, setCurrentColor] = useState<ThemePaletteId>(() => {
        if (typeof window !== 'undefined') {
            const local = localStorage.getItem('theme_color') as ThemePaletteId | null;
            if (local && THEME_PALETTES.some((p) => p.id === local)) {
                return local;
            }
        }
        if (serverColor && THEME_PALETTES.some((p) => p.id === serverColor)) {
            return serverColor as ThemePaletteId;
        }
        return 'emerald';
    });

    // Keep state synced with server prop if it changes
    useEffect(() => {
        if (serverColor && THEME_PALETTES.some((p) => p.id === serverColor)) {
            setCurrentColor(serverColor as ThemePaletteId);
            applyThemePalette(serverColor);
        }
    }, [serverColor]);

    // Initial apply on mount
    useEffect(() => {
        applyThemePalette(currentColor);

        const handleColorChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.id && THEME_PALETTES.some((p) => p.id === detail.id)) {
                setCurrentColor(detail.id);
            }
        };

        window.addEventListener('theme-color-changed', handleColorChange);
        return () => window.removeEventListener('theme-color-changed', handleColorChange);
    }, [currentColor]);

    const changeThemeColor = useCallback(
        async (paletteId: ThemePaletteId, applyGlobal = false) => {
            setCurrentColor(paletteId);
            applyThemePalette(paletteId);

            const saved = await saveThemePaletteToDatabase(paletteId, applyGlobal);
            if (saved) {
                const palette = getPalette(paletteId);
                toast.success(`Theme palette changed to ${palette.name}`, {
                    description: 'Color saved to database and applied across the interface.',
                });
            } else {
                toast.error('Theme applied locally, but failed to sync to database.');
            }
        },
        []
    );

    return {
        themeColor: currentColor,
        currentPalette: getPalette(currentColor),
        palettes: THEME_PALETTES,
        setThemeColor: changeThemeColor,
    };
}

