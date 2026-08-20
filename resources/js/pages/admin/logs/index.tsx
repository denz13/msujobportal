import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Mail,
    Search,
    Shield,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem } from '@/types';

type ActivityLogItem = {
    id: number;
    loggable_type: string;
    loggable_id: number;
    event: string;
    user_id: number | null;
    user: {
        id: number;
        firstname?: string;
        lastname?: string;
        email?: string;
        role?: string;
        photo?: string | null;
    } | null;
    old_values?: Record<string, any> | null;
    new_values?: Record<string, any> | null;
    changed_fields?: string[] | null;
    ip_address?: string | null;
    user_agent?: string | null;
    description?: string | null;
    created_at: string;
};

type EmailLogItem = {
    id: number;
    user_id: number | null;
    recipient_email: string;
    recipient_name?: string | null;
    sender_id: number | null;
    emailable_type?: string | null;
    emailable_id?: number | null;
    mail_type?: string | null;
    subject: string;
    body?: string | null;
    status: 'sent' | 'failed' | 'pending';
    error_message?: string | null;
    meta?: Record<string, any> | null;
    created_at: string;
    recipient?: {
        id: number;
        firstname?: string;
        lastname?: string;
        email?: string;
        role?: string;
        photo?: string | null;
    } | null;
    sender?: {
        id: number;
        firstname?: string;
        lastname?: string;
        email?: string;
        role?: string;
    } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    activeTab: 'activity' | 'email';
    filters: {
        search?: string;
        per_page?: number;
    };
    activityLogs: {
        data: ActivityLogItem[];
        pagination: {
            links: PaginationLink[];
            from: number | null;
            to: number | null;
            total: number;
            current_page: number;
        };
    };
    emailLogs: {
        data: EmailLogItem[];
        pagination: {
            links: PaginationLink[];
            from: number | null;
            to: number | null;
            total: number;
            current_page: number;
        };
    };
    stats: {
        total_activity_logs: number;
        total_email_logs: number;
        total_sent_emails: number;
        total_failed_emails: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Logs',
        href: '/admin/logs',
    },
    {
        title: 'Activity & Email Logs',
        href: '/admin/logs',
    },
];

export default function AdminLogsIndex({
    activeTab: initialTab = 'activity',
    filters,
    activityLogs,
    emailLogs,
    stats,
}: Props) {
    const getInitials = useInitials();
    const [currentTab, setCurrentTab] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLogItem | null>(null);
    const [selectedActivityLog, setSelectedActivityLog] = useState<ActivityLogItem | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(
                '/admin/logs',
                {
                    tab: currentTab,
                    search: searchQuery || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 350);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, currentTab]);

    function handleTabChange(value: string) {
        const tab = value as 'activity' | 'email';
        setCurrentTab(tab);
        router.get(
            '/admin/logs',
            {
                tab,
                search: searchQuery || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    const getEventBadgeVariant = (event: string) => {
        switch (event?.toLowerCase()) {
            case 'created':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
            case 'updated':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
            case 'deleted':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Logs - Activity & Email Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">System & Audit Logs</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor system changes, user actions, and tracked email notifications.
                        </p>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Activity Logs</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_activity_logs.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">System action records</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                            <Mail className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_sent_emails.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Delivered via SMTP</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Failed Emails</CardTitle>
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {stats.total_failed_emails.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Delivery issues or bounces</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">All Email Events</CardTitle>
                            <Shield className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_email_logs.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total logged notifications</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs & Search */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList className="grid w-full sm:w-auto grid-cols-2">
                            <TabsTrigger value="activity" className="gap-2">
                                <Activity className="h-4 w-4" />
                                <span>Activity Logs ({activityLogs.pagination.total})</span>
                            </TabsTrigger>
                            <TabsTrigger value="email" className="gap-2">
                                <Mail className="h-4 w-4" />
                                <span>Email Logs ({emailLogs.pagination.total})</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={`Search in ${currentTab === 'activity' ? 'activity' : 'email'} logs...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* ACTIVITY LOGS TAB */}
                    <TabsContent value="activity" className="space-y-4 m-0">
                        <Card>
                            <CardContent className="p-0">
                                {activityLogs.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <Activity className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <p className="mt-4 font-medium">No activity logs found</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            User and model actions will automatically appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">User</th>
                                                    <th className="px-4 py-3">Event</th>
                                                    <th className="px-4 py-3">Model</th>
                                                    <th className="px-4 py-3">Description / IP</th>
                                                    <th className="px-4 py-3">Timestamp</th>
                                                    <th className="px-4 py-3 text-right">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {activityLogs.data.map((log) => {
                                                    const userName = log.user
                                                        ? `${log.user.firstname ?? ''} ${log.user.lastname ?? ''}`.trim() || log.user.email
                                                        : 'System';
                                                    const modelName = log.loggable_type ? log.loggable_type.split('\\').pop() : '—';

                                                    return (
                                                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage
                                                                            src={log.user?.photo ? `/storage/${log.user.photo}` : undefined}
                                                                            alt={userName || ''}
                                                                        />
                                                                        <AvatarFallback className="text-xs bg-muted">
                                                                            {getInitials(userName || 'User')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-foreground truncate">{userName}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">{log.user?.email || '—'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="secondary" className={getEventBadgeVariant(log.event)}>
                                                                    {log.event}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                                {modelName} #{log.loggable_id}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-foreground truncate max-w-xs" title={log.description || ''}>
                                                                    {log.description || '—'}
                                                                </p>
                                                                {log.ip_address && (
                                                                    <p className="text-xs text-muted-foreground font-mono">
                                                                        IP: {log.ip_address}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                                {new Date(log.created_at).toLocaleString(undefined, {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setSelectedActivityLog(log)}
                                                                >
                                                                    View
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {activityLogs.pagination.links.length > 3 && (
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Showing {activityLogs.pagination.from ?? 0} to {activityLogs.pagination.to ?? 0} of {activityLogs.pagination.total} records
                                </p>
                                <Pagination links={activityLogs.pagination.links} />
                            </div>
                        )}
                    </TabsContent>

                    {/* EMAIL LOGS TAB */}
                    <TabsContent value="email" className="space-y-4 m-0">
                        <Card>
                            <CardContent className="p-0">
                                {emailLogs.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <Mail className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <p className="mt-4 font-medium">No email logs found</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Sent application approvals, declines, and notifications will be tracked here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">Recipient</th>
                                                    <th className="px-4 py-3">Subject / Type</th>
                                                    <th className="px-4 py-3">Sender</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Sent At</th>
                                                    <th className="px-4 py-3 text-right">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {emailLogs.data.map((log) => {
                                                    const recipientDisplay = (log.recipient
                                                        ? `${log.recipient.firstname ?? ''} ${log.recipient.lastname ?? ''}`.trim() || log.recipient.email
                                                        : log.recipient_name || log.recipient_email) || '';

                                                    const senderDisplay = log.sender
                                                        ? `${log.sender.firstname ?? ''} ${log.sender.lastname ?? ''}`.trim() || log.sender.email
                                                        : 'System';

                                                    return (
                                                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage
                                                                            src={log.recipient?.photo ? `/storage/${log.recipient.photo}` : undefined}
                                                                            alt={recipientDisplay}
                                                                        />
                                                                        <AvatarFallback className="text-xs bg-muted">
                                                                            {getInitials(recipientDisplay)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-foreground truncate">{recipientDisplay}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">{log.recipient_email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-foreground truncate max-w-xs" title={log.subject}>
                                                                    {log.subject}
                                                                </p>
                                                                {log.mail_type && (
                                                                    <Badge variant="outline" className="mt-1 text-[11px] font-normal">
                                                                        {log.mail_type.replace('_', ' ')}
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                {senderDisplay}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {log.status === 'sent' && (
                                                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 gap-1">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        <span>Sent</span>
                                                                    </Badge>
                                                                )}
                                                                {log.status === 'failed' && (
                                                                    <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 gap-1">
                                                                        <XCircle className="h-3 w-3" />
                                                                        <span>Failed</span>
                                                                    </Badge>
                                                                )}
                                                                {log.status === 'pending' && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>Pending</span>
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                                {new Date(log.created_at).toLocaleString(undefined, {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setSelectedEmailLog(log)}
                                                                >
                                                                    View
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {emailLogs.pagination.links.length > 3 && (
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Showing {emailLogs.pagination.from ?? 0} to {emailLogs.pagination.to ?? 0} of {emailLogs.pagination.total} emails
                                </p>
                                <Pagination links={emailLogs.pagination.links} />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Activity Log Details Dialog */}
                <Dialog open={!!selectedActivityLog} onOpenChange={(open) => !open && setSelectedActivityLog(null)}>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Activity Log Details</DialogTitle>
                            <DialogDescription>Full record of the triggered event.</DialogDescription>
                        </DialogHeader>
                        {selectedActivityLog && (
                            <div className="space-y-4 py-2 text-sm">
                                <div className="grid grid-cols-2 gap-2 border-b pb-3">
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Event</span>
                                        <p className="font-medium capitalize">{selectedActivityLog.event}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Target Model</span>
                                        <p className="font-mono text-xs">{selectedActivityLog.loggable_type} (#{selectedActivityLog.loggable_id})</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Performed By</span>
                                        <p className="font-medium">{selectedActivityLog.user?.email || 'System'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">IP Address</span>
                                        <p className="font-mono text-xs">{selectedActivityLog.ip_address || '—'}</p>
                                    </div>
                                </div>

                                {selectedActivityLog.description && (
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Description</span>
                                        <p className="mt-1 rounded-md bg-muted/40 p-2 text-xs">{selectedActivityLog.description}</p>
                                    </div>
                                )}

                                {selectedActivityLog.new_values && (
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Changed / New Values</span>
                                        <pre className="mt-1 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
                                            {JSON.stringify(selectedActivityLog.new_values, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Email Log Details Dialog */}
                <Dialog open={!!selectedEmailLog} onOpenChange={(open) => !open && setSelectedEmailLog(null)}>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Email Log Information</DialogTitle>
                            <DialogDescription>Audit details of the dispatched email message.</DialogDescription>
                        </DialogHeader>
                        {selectedEmailLog && (
                            <div className="space-y-4 py-2 text-sm">
                                <div className="space-y-2 border-b pb-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Recipient Email:</span>
                                        <span className="font-medium text-foreground">{selectedEmailLog.recipient_email}</span>
                                    </div>
                                    {selectedEmailLog.recipient_name && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Recipient Name:</span>
                                            <span className="font-medium text-foreground">{selectedEmailLog.recipient_name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subject:</span>
                                        <span className="font-medium text-foreground">{selectedEmailLog.subject}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge
                                            className={
                                                selectedEmailLog.status === 'sent'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            }
                                        >
                                            {selectedEmailLog.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date Sent:</span>
                                        <span className="text-xs font-mono">
                                            {new Date(selectedEmailLog.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {selectedEmailLog.error_message && (
                                    <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                                        <p className="font-semibold">Error Message:</p>
                                        <p className="mt-1 font-mono">{selectedEmailLog.error_message}</p>
                                    </div>
                                )}

                                {selectedEmailLog.meta && (
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Metadata Payload</span>
                                        <pre className="mt-1 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
                                            {JSON.stringify(selectedEmailLog.meta, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
