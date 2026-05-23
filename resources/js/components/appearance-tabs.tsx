import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

type AppearanceToggleProps = HTMLAttributes<HTMLDivElement> & {
    variant?: 'labeled' | 'icon';
};

export function AppearanceToggle({
    className = '',
    variant = 'labeled',
    ...props
}: AppearanceToggleProps) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            className={cn(
                'pointer-events-auto inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={`${label} mode`}
                    aria-pressed={appearance === value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center justify-center rounded-md transition-colors',
                        variant === 'icon' ? 'size-8' : 'px-3.5 py-1.5',
                        appearance === value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <Icon className={cn(variant === 'icon' ? 'size-4' : '-ml-1 h-4 w-4')} />
                    {variant === 'labeled' && (
                        <span className="ml-1.5 text-sm">{label}</span>
                    )}
                </button>
            ))}
        </div>
    );
}

/** @deprecated Use AppearanceToggle with variant="labeled" */
export default function AppearanceToggleTab(props: HTMLAttributes<HTMLDivElement>) {
    return <AppearanceToggle variant="labeled" {...props} />;
}
