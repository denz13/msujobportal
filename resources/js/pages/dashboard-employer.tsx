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
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
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

type JobItem = {
    id: number;
    title: string;
    category: string;
    location: string;
    vacancies: number;
    status: string;
    created_at: string | null;
};

type ApplicantModalItem = {
    id: number;
    jobseeker: {
        display_name: string;
        email: string;
        photo: string | null;
    };
    job_title: string;
    applied_at: string | null;
    status: string | null;
};

type JobseekerItem = {
    id: number;
    name: string;
    email: string;
    photo: string | null;
    last_applied: string | null;
};

export default function DashboardEmployer() {
    const getInitials = useInitials();
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

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalSubtitle, setModalSubtitle] = useState('');
    const [modalViewAllUrl, setModalViewAllUrl] = useState<string | null>(null);
    const [modalType, setModalType] = useState<'jobs' | 'applications' | 'jobseekers'>('jobs');
    const [loading, setLoading] = useState(false);
    const [jobItems, setJobItems] = useState<JobItem[]>([]);
    const [applicantItems, setApplicantItems] = useState<ApplicantModalItem[]>([]);
    const [jobseekerItems, setJobseekerItems] = useState<JobseekerItem[]>([]);

    const openItemsModal = async (config: {
        title: string;
        subtitle: string;
        type: 'jobs' | 'applications' | 'jobseekers';
        status?: string;
        viewAllUrl?: string;
    }) => {
        setModalTitle(config.title);
        setModalSubtitle(config.subtitle);
        setModalType(config.type);
        setModalViewAllUrl(config.viewAllUrl ?? null);
        setJobItems([]);
        setApplicantItems([]);
        setJobseekerItems([]);
        setLoading(true);
        setModalOpen(true);

        try {
            const params = new URLSearchParams({
                type: config.type,
                status: config.status ?? 'all',
            });
            const res = await fetch(`/employer/dashboard-items?${params.toString()}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            if (config.type === 'jobs') {
                setJobItems(Array.isArray(data.items) ? data.items : []);
            } else if (config.type === 'jobseekers') {
                setJobseekerItems(Array.isArray(data.items) ? data.items : []);
            } else {
                setApplicantItems(Array.isArray(data.items) ? data.items : []);
            }
        } catch {
            setJobItems([]);
            setApplicantItems([]);
            setJobseekerItems([]);
        } finally {
            setLoading(false);
        }
    };

    const getJobBadgeClass = (status: string | null): string => {
        const s = (status ?? '').toLowerCase();
        if (s === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
        if (s === 'approved' || s === 'active') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'declined' || s === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-muted text-muted-foreground';
    };

    const getApplicantBadgeClass = (status: string | null): string => {
        if (!status) return 'bg-muted text-muted-foreground';
        const s = status.toLowerCase();
        if (s === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
        if (s === 'approved' || s === 'accepted' || s === 'hired') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'cancelled' || s === 'declined' || s === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-muted text-muted-foreground';
    };

    const statCards = [
        {
            label: 'Total jobseekers',
            value: totalJobseekers,
            icon: Users,
            className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600',
            iconClassName: 'text-slate-600 dark:text-slate-400',
            onClick: () =>
                openItemsModal({
                    title: 'Total Jobseekers',
                    subtitle: 'Unique jobseekers who applied to your job postings',
                    type: 'jobseekers',
                    viewAllUrl: listOfAppliedApplicantsIndex.url(),
                }),
        },
        {
            label: 'Total job posts',
            value: stats?.total_jobs ?? 0,
            icon: Briefcase,
            className: 'border-primary/20 bg-primary/5 dark:bg-primary/10 cursor-pointer hover:border-primary/40',
            iconClassName: 'text-primary',
            onClick: () =>
                openItemsModal({
                    title: 'Total Job Posts',
                    subtitle: 'All job posts you have created',
                    type: 'jobs',
                    status: 'all',
                    viewAllUrl: postJobsIndex.url(),
                }),
        },
        {
            label: 'Pending jobs',
            value: stats?.pending ?? 0,
            icon: Clock,
            className: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 cursor-pointer hover:border-amber-300 dark:hover:border-amber-800',
            iconClassName: 'text-amber-600 dark:text-amber-400',
            onClick: () =>
                openItemsModal({
                    title: 'Pending Job Posts',
                    subtitle: 'Job posts awaiting administrator approval',
                    type: 'jobs',
                    status: 'pending',
                    viewAllUrl: `${postJobsIndex.url()}?status=pending`,
                }),
        },
        {
            label: 'Approved jobs',
            value: stats?.approved ?? 0,
            icon: CheckCircle2,
            className: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-800',
            iconClassName: 'text-emerald-600 dark:text-emerald-400',
            onClick: () =>
                openItemsModal({
                    title: 'Approved Job Posts',
                    subtitle: 'Job posts approved by administrator',
                    type: 'jobs',
                    status: 'approved',
                    viewAllUrl: `${postJobsIndex.url()}?status=approved`,
                }),
        },
        {
            label: 'Active jobs',
            value: stats?.active ?? 0,
            icon: TrendingUp,
            className: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30 cursor-pointer hover:border-blue-300 dark:hover:border-blue-800',
            iconClassName: 'text-blue-600 dark:text-blue-400',
            onClick: () =>
                openItemsModal({
                    title: 'Active Job Posts',
                    subtitle: 'Currently active jobs open for applicants',
                    type: 'jobs',
                    status: 'active',
                    viewAllUrl: `${postJobsIndex.url()}?status=active`,
                }),
        },
        {
            label: 'Declined jobs',
            value: stats?.declined ?? 0,
            icon: FileX2,
            className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 cursor-pointer hover:border-red-300 dark:hover:border-red-800',
            iconClassName: 'text-red-600 dark:text-red-400',
            onClick: () =>
                openItemsModal({
                    title: 'Declined Job Posts',
                    subtitle: 'Job posts declined by administrator',
                    type: 'jobs',
                    status: 'declined',
                    viewAllUrl: `${postJobsIndex.url()}?status=declined`,
                }),
        },
    ];

    const byStatus = applicationStats?.by_status ?? {};
    const statusEntries = Object.entries(byStatus).sort(([a], [b]) => a.localeCompare(b));

    const statusStyle: Record<string, { icon: typeof Clock; className: string; iconClassName: string }> = {
        pending: { icon: Clock, className: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-800', iconClassName: 'text-amber-600 dark:text-amber-400' },
        approved: { icon: CheckCircle2, className: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800', iconClassName: 'text-emerald-600 dark:text-emerald-400' },
        cancelled: { icon: FileText, className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-600', iconClassName: 'text-slate-600 dark:text-slate-400' },
        declined: { icon: FileX2, className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800', iconClassName: 'text-red-600 dark:text-red-400' },
        rejected: { icon: XCircle, className: 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800', iconClassName: 'text-red-600 dark:text-red-400' },
    };
    const defaultStyle = { icon: FileText, className: 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-600', iconClassName: 'text-slate-600 dark:text-slate-400' };
    const getStatusStyle = (status: string) => statusStyle[status.toLowerCase()] ?? defaultStyle;

    const totalApplicationCard = {
        label: 'Total applications',
        value: applicationStats?.total ?? 0,
        icon: Users,
        className: 'border-primary/20 bg-primary/5 dark:bg-primary/10 cursor-pointer hover:border-primary/40',
        iconClassName: 'text-primary',
        onClick: () =>
            openItemsModal({
                title: 'Total Applications',
                subtitle: 'All job applications submitted to your postings',
                type: 'applications',
                status: 'all',
                viewAllUrl: listOfAppliedApplicantsIndex.url(),
            }),
    };

    const applicationCards = [
        totalApplicationCard,
        ...statusEntries.map(([status, count]) => {
            const style = getStatusStyle(status);
            const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
            return {
                label: `${formattedStatus} applicants`,
                value: count,
                icon: style.icon,
                className: `${style.className} cursor-pointer`,
                iconClassName: style.iconClassName,
                onClick: () =>
                    openItemsModal({
                        title: `${formattedStatus} Applicants`,
                        subtitle: `Applicants with status: ${formattedStatus.toLowerCase()}`,
                        type: 'applications',
                        status: status.toLowerCase(),
                        viewAllUrl: `${listOfAppliedApplicantsIndex.url()}?status=${encodeURIComponent(status.toLowerCase())}`,
                    }),
            };
        }),
    ];

    const allCards = [...statCards, ...applicationCards];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Greeting card */}
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

                {/* All stats in one grid — 4 columns, interactive cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {allCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={item.label}
                                onClick={item.onClick}
                                className={`overflow-hidden transition-all duration-150 active:scale-[0.99] hover:shadow-md ${item.className}`}
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
                    })}
                </div>

                {/* Details Dialog Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-h-[85vh] !max-w-[calc(100%-2rem)] sm:!max-w-[1200px] gap-0 p-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-6 py-4 gap-2">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg font-semibold">
                                    {modalTitle}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    {modalSubtitle}
                                </p>
                            </DialogHeader>
                            {modalViewAllUrl && (
                                <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 self-start sm:self-auto">
                                    <Link href={modalViewAllUrl}>
                                        <span>View in page</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-auto px-6 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">Loading details…</p>
                                    </div>
                                </div>
                            ) : modalType === 'jobs' ? (
                                jobItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Briefcase className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">No jobs found</p>
                                        <p className="text-xs text-muted-foreground mt-1">There are no job posts for this category yet.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full table-fixed text-center text-sm">
                                            <thead>
                                                <tr className="bg-muted/60">
                                                    <th className="w-[30%] px-4 py-3 font-semibold text-muted-foreground text-left">Job Title</th>
                                                    <th className="w-[20%] px-4 py-3 font-semibold text-muted-foreground text-left">Category</th>
                                                    <th className="w-[20%] px-4 py-3 font-semibold text-muted-foreground text-left">Location</th>
                                                    <th className="w-[12%] px-4 py-3 font-semibold text-muted-foreground">Vacancies</th>
                                                    <th className="w-[18%] px-4 py-3 font-semibold text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jobItems.map((item, i) => (
                                                    <tr
                                                        key={item.id}
                                                        className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                                    >
                                                        <td className="border-t border-border/60 px-4 py-3 font-medium text-left truncate" title={item.title}>
                                                            {item.title}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 text-muted-foreground text-left truncate" title={item.category}>
                                                            {item.category}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 text-muted-foreground text-left truncate" title={item.location}>
                                                            {item.location}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 tabular-nums">
                                                            {item.vacancies}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3">
                                                            <div className="flex justify-center">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={getJobBadgeClass(item.status)}
                                                                >
                                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : modalType === 'jobseekers' ? (
                                jobseekerItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">No jobseekers found</p>
                                        <p className="text-xs text-muted-foreground mt-1">No jobseekers have applied to your jobs yet.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full table-fixed text-center text-sm">
                                            <thead>
                                                <tr className="bg-muted/60">
                                                    <th className="w-[12%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">Photo</th>
                                                    <th className="w-[30%] px-4 py-3 font-semibold text-muted-foreground text-left">Name</th>
                                                    <th className="w-[33%] px-4 py-3 font-semibold text-muted-foreground text-left">Email</th>
                                                    <th className="w-[25%] px-4 py-3 font-semibold text-muted-foreground">Applied Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jobseekerItems.map((item, i) => (
                                                    <tr
                                                        key={item.id}
                                                        className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                                    >
                                                        <td className="border-t border-border/60 px-4 py-3">
                                                            <div className="flex justify-center">
                                                                <Avatar className="h-9 w-9 shrink-0">
                                                                    <AvatarImage
                                                                        src={item.photo ? `/storage/${item.photo}` : undefined}
                                                                        alt={item.name}
                                                                    />
                                                                    <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                                                        {getInitials(item.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 font-medium text-left truncate" title={item.name}>
                                                            {item.name}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 text-muted-foreground text-left truncate" title={item.email}>
                                                            {item.email}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 tabular-nums text-muted-foreground">
                                                            {item.last_applied
                                                                ? new Date(item.last_applied).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                applicantItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">No applicants found</p>
                                        <p className="text-xs text-muted-foreground mt-1">There are no applicants with this status yet.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full table-fixed text-center text-sm">
                                            <thead>
                                                <tr className="bg-muted/60">
                                                    <th className="w-[10%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">Photo</th>
                                                    <th className="w-[22%] px-4 py-3 font-semibold text-muted-foreground text-left">Name</th>
                                                    <th className="w-[23%] px-4 py-3 font-semibold text-muted-foreground text-left">Email</th>
                                                    <th className="w-[20%] px-4 py-3 font-semibold text-muted-foreground text-left">Job Applied To</th>
                                                    <th className="w-[15%] px-4 py-3 font-semibold text-muted-foreground">Date Applied</th>
                                                    <th className="w-[10%] px-4 py-3 font-semibold text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applicantItems.map((item, i) => (
                                                    <tr
                                                        key={item.id}
                                                        className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                                    >
                                                        <td className="border-t border-border/60 px-4 py-3">
                                                            <div className="flex justify-center">
                                                                <Avatar className="h-9 w-9 shrink-0">
                                                                    <AvatarImage
                                                                        src={item.jobseeker.photo ? `/storage/${item.jobseeker.photo}` : undefined}
                                                                        alt={item.jobseeker.display_name}
                                                                    />
                                                                    <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                                                        {getInitials(item.jobseeker.display_name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 font-medium text-left truncate" title={item.jobseeker.display_name}>
                                                            {item.jobseeker.display_name}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 text-muted-foreground text-left truncate" title={item.jobseeker.email}>
                                                            {item.jobseeker.email}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 text-left truncate" title={item.job_title || undefined}>
                                                            {item.job_title || '—'}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3 tabular-nums text-muted-foreground">
                                                            {item.applied_at
                                                                ? new Date(item.applied_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                                                : '—'}
                                                        </td>
                                                        <td className="border-t border-border/60 px-4 py-3">
                                                            <div className="flex justify-center">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={getApplicantBadgeClass(item.status)}
                                                                >
                                                                    {item.status
                                                                        ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                                                                        : '—'}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
