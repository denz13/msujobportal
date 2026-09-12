import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Calendar, Clock, MapPin, ExternalLink, Mail, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AppearanceToggle } from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    const [selectedNotice, setSelectedNotice] = useState<NotificationItem | null>(null);

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

    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteConfirm = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteConfirmId(id);
    };

    const confirmDeleteNotification = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/notifications/${deleteConfirmId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data?.message || 'Failed to delete notification.');
                return;
            }
            setNotifItems((prev) => prev.filter((n) => n.id !== deleteConfirmId));
            setUnreadCount(Number(data.unread_count ?? 0));
            toast.success('Notification deleted successfully.');
            setDeleteConfirmId(null);
        } catch {
            toast.error('An error occurred while deleting the notification.');
        } finally {
            setIsDeleting(false);
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
                                            className="group/notif flex cursor-pointer flex-col items-start gap-1 py-2"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                if (isUnread) {
                                                    void markRead(n.id);
                                                }
                                                const notifType = n.data?.type as string | undefined;
                                                const hasInterviewOrDetails = !!(n.data?.interview_date || n.data?.gmail_url || notifType === 'job_application_status_updated');
                                                if (hasInterviewOrDetails) {
                                                    setNotifOpen(false);
                                                    setSelectedNotice(n);
                                                } else if (actionUrl) {
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
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    {isUnread && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Mark read
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        title="Delete notification"
                                                        onClick={(e) => openDeleteConfirm(e, n.id)}
                                                        className="rounded p-1 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive focus:outline-none"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
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
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
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

            {/* Delete Notification Confirmation Modal */}
            <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle>Delete Notification</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete this notification? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteNotification}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Application Notice & Interview Details Modal */}
            <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {selectedNotice && (() => {
                        const data = selectedNotice.data ?? {};
                        const title = String(data.title ?? 'Notification Notice');
                        const status = (data.status as string) ?? '';
                        const jobTitle = (data.job_title as string) ?? 'Applied Position';
                        const isApproved = status === 'approved' || selectedNotice.data?.level === 'success';
                        const interviewDate = data.interview_date as string | undefined;
                        const interviewTime = data.interview_time as string | undefined;
                        const interviewType = data.interview_type as string | undefined;
                        const interviewLocation = data.interview_location as string | undefined;
                        const contactPerson = data.contact_person as string | undefined;
                        const contactPhone = data.contact_phone as string | undefined;
                        const interviewInstructions = data.interview_instructions as string | undefined;
                        const remarks = data.remarks as string | undefined;
                        const gmailUrl = (data.gmail_url as string | undefined) || `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(jobTitle)}`;

                        return (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                            isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                        )}>
                                            {isApproved ? <UserCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg">{title}</DialogTitle>
                                            <DialogDescription>
                                                Position: <strong className="text-foreground">{jobTitle}</strong>
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4 py-2 text-sm">
                                    <div className={cn(
                                        'rounded-lg border p-3.5',
                                        isApproved
                                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                            : 'border-red-200 bg-red-50/70 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
                                    )}>
                                        <p className="font-semibold">{String(data.message ?? '')}</p>
                                    </div>

                                    {/* Interview Schedule Card */}
                                    {isApproved && (interviewDate || interviewLocation || interviewType) && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                            <h4 className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                                                <Calendar className="h-4 w-4" />
                                                Interview Schedule & Instructions
                                            </h4>

                                            <div className="mt-3 space-y-2 text-xs sm:text-sm">
                                                {interviewDate && (
                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">Date: </span>
                                                            <span className="font-semibold">{new Date(interviewDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {interviewTime && (
                                                    <div className="flex items-start gap-2">
                                                        <Clock className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">Time: </span>
                                                            <span className="font-semibold">{interviewTime}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {interviewType && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-amber-600 shrink-0 mt-1.5 ml-1" />
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">Format: </span>
                                                            <Badge variant="outline" className="text-xs uppercase bg-amber-100 text-amber-900 border-amber-300">
                                                                {interviewType.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}

                                                {interviewLocation && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                                                        <div className="break-all">
                                                            <span className="font-medium text-muted-foreground">Venue / Link: </span>
                                                            {interviewLocation.startsWith('http://') || interviewLocation.startsWith('https://') ? (
                                                                <a href={interviewLocation} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline dark:text-blue-400 inline-flex items-center gap-1">
                                                                    {interviewLocation} <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            ) : (
                                                                <span className="font-medium">{interviewLocation}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {contactPerson && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-muted-foreground ml-6">Contact: </span>
                                                        <span className="font-semibold">
                                                            {contactPerson} {contactPhone && `(${contactPhone})`}
                                                        </span>
                                                    </div>
                                                )}

                                                {interviewInstructions && (
                                                    <div className="mt-3 border-t border-amber-200/80 pt-2.5 dark:border-amber-800">
                                                        <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                                                            Instructions:
                                                        </div>
                                                        <p className="mt-1 whitespace-pre-wrap text-xs text-amber-900/90 dark:text-amber-200">
                                                            {interviewInstructions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarks if declined */}
                                    {remarks && (
                                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                                            <div className="text-xs font-semibold uppercase text-muted-foreground">Remarks:</div>
                                            <p className="mt-1 whitespace-pre-wrap text-xs">{remarks}</p>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedNotice(null)}
                                        className="sm:order-1"
                                    >
                                        Close
                                    </Button>
                                    <a
                                        href={gmailUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#EA4335] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#d93025] focus:outline-none sm:order-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        <span>Open in Gmail</span>
                                        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                                    </a>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </header>
    );
}
