import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
};

export function Pagination({ links, from, to, total }: PaginationProps) {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-4 border-t border-sidebar-border/70 px-4 py-4 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
                {from !== null && to !== null && total !== undefined && (
                    <span>
                        Showing <span className="font-medium">{from}</span> to{' '}
                        <span className="font-medium">{to}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {links.map((link, index) => {
                    if (index === 0) {
                        // Previous button
                        return (
                            <Button
                                key="previous"
                                variant="outline"
                                size="icon"
                                asChild
                                disabled={!link.url}
                                className={cn(
                                    !link.url && 'cursor-not-allowed opacity-50',
                                )}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState preserveScroll>
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="sr-only">Previous</span>
                                    </Link>
                                ) : (
                                    <span>
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="sr-only">Previous</span>
                                    </span>
                                )}
                            </Button>
                        );
                    }

                    if (index === links.length - 1) {
                        // Next button
                        return (
                            <Button
                                key="next"
                                variant="outline"
                                size="icon"
                                asChild
                                disabled={!link.url}
                                className={cn(
                                    !link.url && 'cursor-not-allowed opacity-50',
                                )}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState preserveScroll>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="sr-only">Next</span>
                                    </Link>
                                ) : (
                                    <span>
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="sr-only">Next</span>
                                    </span>
                                )}
                            </Button>
                        );
                    }

                    // Page numbers
                    return (
                        <Button
                            key={index}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            {link.url ? (
                                <Link href={link.url} preserveState preserveScroll>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Link>
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className="cursor-default"
                                />
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
