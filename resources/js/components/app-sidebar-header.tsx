import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { AppearanceToggle } from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const pageProps = usePage().props as any;
    const { auth, unreadNotificationsCount = 0 } = pageProps as {
        auth: { user: any };
        unreadNotificationsCount?: number;
    };
    const getInitials = useInitials();

    type NotificationItem = {
        id: string;
        read_at: string | null;
        created_at: string | null;
        data: {
            title?: string;
            message?: string;
            action_url?: string | null;
            level?: 'info' | 'success' | 'warning' | 'error' | null;
        } & Record<string, unknown>;
    };

    const [notifOpen, setNotifOpen] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount);

    const csrf = useMemo(
        () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        [],
    );

    useEffect(() => {
        setUnreadCount(unreadNotificationsCount);
    }, [unreadNotificationsCount]);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const res = await fetch('/notifications?limit=1', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json().catch(() => ({}));
            setUnreadCount(Number(data.unread_count ?? 0));
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        refreshUnreadCount();
        const intervalId = window.setInterval(refreshUnreadCount, 30_000);
        return () => window.clearInterval(intervalId);
    }, [refreshUnreadCount]);

    useEffect(() => {
        return router.on('success', () => {
            refreshUnreadCount();
        });
    }, [refreshUnreadCount]);

    useEffect(() => {
        if (!notifOpen) return;
        let cancelled = false;
        (async () => {
            setNotifLoading(true);
            try {
                const res = await fetch('/notifications?limit=10', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.message ?? 'Failed to load notifications');
                if (cancelled) return;
                setNotifItems((data.notifications ?? []) as NotificationItem[]);
                setUnreadCount(Number(data.unread_count ?? 0));
            } catch {
                // swallow; keep UI quiet
            } finally {
                if (!cancelled) setNotifLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [notifOpen]);

    const markRead = async (id: string) => {
        try {
            const res = await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return;
            setNotifItems((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
            );
            setUnreadCount(Number(data.unread_count ?? 0));
        } catch {
            // ignore
        }
    };

    const markAllRead = async () => {
        try {
            const res = await fetch('/notifications/read-all', {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return;
            setNotifItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
            setUnreadCount(Number(data.unread_count ?? 0));
        } catch {
            // ignore
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="relative z-[60] flex items-center gap-2">
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen} modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative size-9 rounded-full"
                            aria-label="Notifications"
                        >
                            <Bell
                                className={cn(
                                    'size-5',
                                    unreadCount > 0 && 'origin-top animate-bell-ring',
                                )}
                            />
                            {unreadCount > 0 && (
                                <Badge
                                    className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px] leading-3"
                                    variant="destructive"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-sm font-medium">Notifications</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    void markAllRead();
                                }}
                                disabled={unreadCount === 0 || notifLoading}
                            >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                        </div>
                        <div className="max-h-80 overflow-auto">
                            {notifLoading ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    Loading…
                                </div>
                            ) : notifItems.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    No notifications yet.
                                </div>
                            ) : (
                                notifItems.map((n) => {
                                    const title = String(n.data?.title ?? 'Notification');
                                    const message = String(n.data?.message ?? '');
                                    const actionUrl = (n.data?.action_url as string | null | undefined) ?? null;
                                    const isUnread = !n.read_at;
                                    return (
                                        <DropdownMenuItem
                                            key={n.id}
                                            className="flex cursor-pointer flex-col items-start gap-1 py-2"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                if (isUnread) {
                                                    void markRead(n.id);
                                                }
                                                if (actionUrl) {
                                                    setNotifOpen(false);
                                                    router.visit(actionUrl);
                                                }
                                            }}
                                        >
                                            <div className="flex w-full items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-medium">
                                                            {title}
                                                        </span>
                                                        {isUnread && (
                                                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    {message && (
                                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                                            {message}
                                                        </p>
                                                    )}
                                                </div>
                                                {isUnread && (
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        Mark read
                                                    </span>
                                                )}
                                            </div>
                                            {actionUrl && (
                                                <span className="text-xs font-medium text-primary">
                                                    View →
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AppearanceToggle variant="icon" />
            </div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        className="relative z-[60] size-10 rounded-full p-1"
                    >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={auth.user.avatar}
                                alt={auth.user.display_name}
                            />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.display_name)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
