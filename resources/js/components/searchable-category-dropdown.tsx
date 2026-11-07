import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type CategoryOption = string | { id?: string | number; name: string };

type SearchableCategoryDropdownProps = {
    categories: CategoryOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    allOptionLabel?: string;
    includeAllOption?: boolean;
    className?: string;
    triggerClassName?: string;
    disabled?: boolean;
};

export function SearchableCategoryDropdown({
    categories,
    value,
    onChange,
    placeholder = 'Select a category',
    allOptionLabel = 'All Categories',
    includeAllOption = true,
    className,
    triggerClassName,
    disabled = false,
}: SearchableCategoryDropdownProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Normalize category options to strings
    const categoryNames: string[] = Array.from(
        new Set(
            categories
                .map((cat) => (typeof cat === 'string' ? cat.trim() : cat?.name?.trim() ?? ''))
                .filter((cat) => cat.length > 0)
        )
    ).sort((a, b) => a.localeCompare(b));

    const filtered = categoryNames.filter((cat) =>
        cat.toLowerCase().includes(search.trim().toLowerCase())
    );

    const isAllSelected = value === 'all' || value === '';
    const selectedLabel = isAllSelected
        ? allOptionLabel
        : categoryNames.find((cat) => cat.toLowerCase() === value.toLowerCase()) || value || placeholder;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const handleSelect = (category: string) => {
        onChange(category);
        setOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block w-full text-left', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    triggerClassName
                )}
                aria-expanded={open}
            >
                <span className={cn('truncate', isAllSelected ? 'text-muted-foreground' : 'text-foreground font-medium')}>
                    {selectedLabel}
                </span>
                <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 min-w-[220px] w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
                    {/* Search bar inside the dropdown */}
                    <div className="flex items-center border-b border-border/80 px-2.5 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search category..."
                            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto p-1 text-sm">
                        {includeAllOption && !search && (
                            <button
                                type="button"
                                onClick={() => handleSelect('all')}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                    isAllSelected && 'bg-accent/60 font-semibold text-accent-foreground'
                                )}
                            >
                                <span>{allOptionLabel}</span>
                                {isAllSelected && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        )}

                        {filtered.length === 0 ? (
                            <div className="py-3 text-center text-xs text-muted-foreground">
                                No categories match "{search}"
                            </div>
                        ) : (
                            filtered.map((cat) => {
                                const isSelected = value.toLowerCase() === cat.toLowerCase();
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleSelect(cat)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                            isSelected && 'bg-accent/60 font-semibold text-accent-foreground'
                                        )}
                                    >
                                        <span className="truncate">{cat}</span>
                                        {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

