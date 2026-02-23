import { Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    CheckCircle2,
    Clock,
    FileX2,
    LayoutGrid,
    Plus,
    TrendingUp,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
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

export default function DashboardEmployer() {
    const pageProps = usePage().props as unknown as {
        auth?: { user?: { firstname?: string; lastname?: string; display_name?: string } };
        stats?: DashboardStats;
    };
    const { auth, stats = { total_jobs: 0, pending: 0, approved: 0, declined: 0, active: 0 } } = pageProps;
    const user = auth?.user;
    const displayName =
        user?.display_name ??
        ([user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'there');
    const greeting = getGreeting();

    const statCards = [
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Greeting */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {greeting}, {displayName}!
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Here’s an overview of your job posts.
                        </p>
                    </div>
                    <Button asChild className="shrink-0">
                        <Link href={postJobsIndex.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Post a job
                        </Link>
                    </Button>
                </div>

                {/* Analytics cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {statCards.map((item) => {
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

                {/* Quick actions / summary */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <LayoutGrid className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Manage your job listings</p>
                                    <p className="text-sm text-muted-foreground">
                                        View, edit, or add new job posts from one place.
                                    </p>
                                </div>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={postJobsIndex.url()}>
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    Go to Post Jobs
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
