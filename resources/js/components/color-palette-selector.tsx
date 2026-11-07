import { Check, Palette, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeColor } from '@/hooks/use-theme-color';
import { THEME_PALETTES, type ThemePaletteId } from '@/lib/theme-palettes';

/**
 * Compact Header Dropdown for switching themes anywhere
 */
export function ColorPaletteDropdown() {
    const { themeColor, currentPalette, setThemeColor } = useThemeColor();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg relative text-muted-foreground hover:text-foreground"
                    title={`Current theme: ${currentPalette.name}`}
                >
                    <Palette className="size-4" />
                    <span
                        className="absolute bottom-1.5 right-1.5 size-2 rounded-full ring-2 ring-background"
                        style={{ backgroundColor: currentPalette.previewHex }}
                    />
                    <span className="sr-only">Color Palette: {currentPalette.name}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="flex items-center justify-between text-xs px-2 py-1 text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5">
                        <Palette className="size-3.5" />
                        Color Palette
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                        Database synced
                    </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <div className="space-y-1">
                    {THEME_PALETTES.map((palette) => {
                        const isSelected = themeColor === palette.id;

                        return (
                            <DropdownMenuItem
                                key={palette.id}
                                onClick={() => setThemeColor(palette.id)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer ${
                                    isSelected ? 'bg-muted/80 font-medium' : ''
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="size-4 rounded-full border border-black/10 dark:border-white/20 shrink-0 shadow-xs"
                                        style={{ backgroundColor: palette.previewHex }}
                                    />
                                    <span className="text-xs">{palette.name}</span>
                                </div>
                                {isSelected && (
                                    <Check className="size-3.5 text-primary stroke-[2.5]" />
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Full Grid Color Palette Selector for Appearance Settings Page
 */
export function ColorPaletteGrid() {
    const { themeColor, currentPalette, setThemeColor } = useThemeColor();

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        Interface Color Palette
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Choose an accent theme. This updates <code className="text-[11px] bg-muted px-1 py-0.5 rounded">:root</code> variables across the platform and saves to your database.
                    </p>
                </div>

                <Badge
                    variant="outline"
                    className="self-start sm:self-auto gap-1.5 text-xs font-medium py-1 px-2.5"
                >
                    <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: currentPalette.previewHex }}
                    />
                    Active: {currentPalette.name}
                </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEME_PALETTES.map((palette) => {
                    const isSelected = themeColor === palette.id;

                    return (
                        <div
                            key={palette.id}
                            onClick={() => setThemeColor(palette.id)}
                            className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-150 flex flex-col gap-2 relative select-none ${
                                isSelected
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    {/* Dual Tone Swatch */}
                                    <div className="relative size-6 rounded-full overflow-hidden shadow-xs border border-black/10 dark:border-white/20">
                                        <div
                                            className="absolute inset-0 w-1/2"
                                            style={{ backgroundColor: palette.previewHex }}
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 w-1/2"
                                            style={{ backgroundColor: palette.previewAccentHex }}
                                        />
                                    </div>
                                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                                        {palette.name}
                                    </span>
                                </div>

                                {isSelected && (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                                        <Check className="size-3 stroke-[3]" />
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {palette.description}
                            </p>

                            {/* Mini UI Preview Bars */}
                            <div className="mt-1 pt-2 border-t border-border/50 flex items-center gap-1.5">
                                <div
                                    className="h-2 rounded-full w-12"
                                    style={{ backgroundColor: palette.previewHex }}
                                />
                                <div
                                    className="h-2 rounded-full w-6"
                                    style={{ backgroundColor: palette.previewAccentHex }}
                                />
                                <div className="h-2 rounded-full flex-1 bg-muted" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

