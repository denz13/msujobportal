import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    FileX2,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { index as listOfAppliedApplicantsIndex } from '@/routes/list-of-applied-applicants';
import { index as postJobsIndex } from '@/routes/post-jobs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

type DashboardStats = {
    total_jobs: number;
    pending: number;
    approved: number;
    declined: number;
    active: number;
};

type ApplicationStats = {
    total: number;
    by_status: Record<string, number>;
};

export default function DashboardEmployer() {
    const pageProps = usePage().props as unknown as {
        auth?: { user?: { firstname?: string; lastname?: string; display_name?: string } };
        stats?: DashboardStats;
        applicationStats?: ApplicationStats;
        totalJobseekers?: number;
    };
    const { auth, stats = { total_jobs: 0, pending: 0, approved: 0, declined: 0, active: 0 }, applicationStats = { total: 0, by_status: {} }, totalJobseekers = 0 } = pageProps;
    const user = auth?.user;
    const displayName =
        user?.display_name ??
        ([user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'there');
    const greeting = getGreeting();

    const statCards = [
        {
            label: 'Total jobseekers',
            value: totalJobseekers,
            icon: Users,
            className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30',
            iconClassName: 'text-slate-600 dark:text-slate-400',
        },
        {
            label: 'Total job posts',
            value: stats?.total_jobs ?? 0,
            icon: Briefcase,
            href: postJobsIndex.url(),
            className: 'border-primary/20 bg-primary/5 dark:bg-primary/10',
            iconClassName: 'text-primary',
        },
        {
            label: 'Pending',
            value: stats?.pending ?? 0,
            icon: Clock,
            className: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30',
            iconClassName: 'text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Approved',
            value: stats?.approved ?? 0,
            icon: CheckCircle2,
            className: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30',
            iconClassName: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Active',
            value: stats?.active ?? 0,
            icon: TrendingUp,
            className: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30',
            iconClassName: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Declined',
            value: stats?.declined ?? 0,
            icon: FileX2,
            className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30',
            iconClassName: 'text-red-600 dark:text-red-400',
        },
    ];

    const byStatus = applicationStats?.by_status ?? {};
    const statusEntries = Object.entries(byStatus).sort(([a], [b]) => a.localeCompare(b));

    const statusStyle: Record<string, { icon: typeof Clock; className: string; iconClassName: string }> = {
        pending: { icon: Clock, className: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30', iconClassName: 'text-amber-600 dark:text-amber-400' },
        approved: { icon: CheckCircle2, className: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30', iconClassName: 'text-emerald-600 dark:text-emerald-400' },
        cancelled: { icon: FileText, className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30', iconClassName: 'text-slate-600 dark:text-slate-400' },
        declined: { icon: FileX2, className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30', iconClassName: 'text-red-600 dark:text-red-400' },
        rejected: { icon: XCircle, className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30', iconClassName: 'text-red-600 dark:text-red-400' },
    };
    const defaultStyle = { icon: FileText, className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30', iconClassName: 'text-slate-600 dark:text-slate-400' };
    const getStatusStyle = (status: string) => statusStyle[status.toLowerCase()] ?? defaultStyle;

    const totalApplicationCard = {
        label: 'Total applications',
        value: applicationStats?.total ?? 0,
        icon: Users,
        href: listOfAppliedApplicantsIndex.url(),
        className: 'border-primary/20 bg-primary/5 dark:bg-primary/10',
        iconClassName: 'text-primary',
    };
    const applicationCards = [
        totalApplicationCard,
        ...statusEntries.map(([status, count]) => {
            const style = getStatusStyle(status);
            return {
                label: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown',
                value: count,
                icon: style.icon,
                href: undefined as string | undefined,
                className: style.className,
                iconClassName: style.iconClassName,
            };
        }),
    ];
    const allCards = [...statCards, ...applicationCards];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Greeting card - same style as dashboard.tsx */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        {greeting}, {displayName}
                    </h1>
                    <blockquote className="mt-3 border-l-4 border-emerald-500/70 pl-4">
                        <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                            “I give you a new commandment—to love one another. Just as I have loved you, you also are to love one another. Everyone will know by this that you are my disciples—if you have love for one another.”
                        </p>
                        <cite className="mt-1 block text-xs font-medium not-italic text-emerald-600 dark:text-emerald-400">
                            — John 13:34-35
                        </cite>
                    </blockquote>
                </div>

                {/* All stats in one grid — 4 columns, no separate block below */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {allCards.map((item) => {
                        const Icon = item.icon;
                        const content = (
                            <Card
                                key={item.label}
                                className={`overflow-hidden transition-shadow hover:shadow-md ${item.className}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {item.label}
                                            </p>
                                            <p className="mt-2 text-2xl font-bold tabular-nums">
                                                {item.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                        if (item.href) {
                            return (
                                <Link key={item.label} href={item.href} className="block">
                                    {content}
                                </Link>
                            );
                        }
                        return content;
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
