import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Briefcase,
    Calendar,
    MapPin,
    Eye,
    DollarSign,
    Users,
    FileText,
    Search,
    User,
    CheckSquare,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';

type Job = {
    id: number;
    job_title: string;
    job_description?: string | null;
    job_category: string | null;
    required_qualifications?: string | null;
    location: string | null;
    salary: string | null;
    number_of_vacancies: number | null;
    status: string | null;
    photo: string | null;
    created_at: string | null;
    employer_name?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'List Request Jobs Post',
        href: '/jobs/list-request-jobs-post',
    },
];

const statusBadgeClass: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    not_available: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function ListRequestJobsPost() {
    const pageProps = usePage().props as {
        jobs?: Job[];
        filters?: { search?: string; status?: string };
        uniqueStatuses?: string[];
        pagination?: {
            links: PaginationLink[];
            from: number | null;
            to: number | null;
            total: number;
            current_page?: number;
        };
    };
    const {
        jobs = [],
        filters = {},
        uniqueStatuses = [],
        pagination,
    } = pageProps;

    const [detailsJob, setDetailsJob] = useState<Job | null>(null);
    const [approveConfirmJob, setApproveConfirmJob] = useState<Job | null>(null);
    const [declineJob, setDeclineJob] = useState<Job | null>(null);
    const [declineRemarks, setDeclineRemarks] = useState('');
    const [actionSubmitting, setActionSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'pending');
    const isInitialMount = useRef(true);

    const photoUrl = (photo: string | null) => {
        if (!photo) return undefined;
        return photo.startsWith('http') || photo.startsWith('/') ? photo : `/${photo}`;
    };

    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const handleApproveConfirm = async () => {
        if (!approveConfirmJob) return;
        setActionSubmitting(true);
        try {
            const res = await fetch(`/jobs/list-request-jobs-post/${approveConfirmJob.id}/approve`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to approve job');
                setActionSubmitting(false);
                return;
            }
            toast.success(data.message ?? 'Job approved.');
            setApproveConfirmJob(null);
            router.reload();
        } catch {
            toast.error('An error occurred');
        }
        setActionSubmitting(false);
    };

    const handleDeclineSubmit = async () => {
        if (!declineJob || !declineRemarks.trim()) {
            toast.error('Please enter remarks for declining.');
            return;
        }
        setActionSubmitting(true);
        try {
            const res = await fetch(`/jobs/list-request-jobs-post/${declineJob.id}/decline`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ remarks: declineRemarks.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to decline job');
                setActionSubmitting(false);
                return;
            }
            toast.success(data.message ?? 'Job declined.');
            setDeclineJob(null);
            setDeclineRemarks('');
            router.reload();
        } catch {
            toast.error('An error occurred');
        }
        setActionSubmitting(false);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get('/jobs/list-request-jobs-post', {
                search: searchQuery || undefined,
                status: statusFilter,
                page: 1,
            }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, statusFilter]);

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get('/jobs/list-request-jobs-post', {
            search: searchQuery || undefined,
            status: value,
            page: 1,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Request Jobs Post" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="List Request Jobs Post"
                        description="Pending job posts awaiting approval."
                    />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label htmlFor="search" className="sr-only">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Search by title, category, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger id="status-filter">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {uniqueStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        <span className="capitalize">{s}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {jobs.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-2 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                                {filters.search
                                    ? 'No pending jobs match your search.'
                                    : 'No pending job posts.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-12 gap-4 sm:gap-5">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2"
                                >
                                    <Card className="overflow-hidden">
                                        <div className="p-4">
                                            {/* Image + overlay - smaller height */}
                                            <div className="relative h-28 overflow-hidden rounded-md 2xl:h-36 before:absolute before:inset-0 before:z-10 before:block before:bg-gradient-to-t before:from-black before:to-black/10 before:content-['']">
                                                {job.photo ? (
                                                    <img
                                                        src={photoUrl(job.photo) ?? ''}
                                                        alt=""
                                                        className="h-full w-full rounded-md object-cover object-center"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
                                                        <Briefcase className="h-10 w-10 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span className="absolute left-3 top-3 z-20 rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-medium capitalize text-white">
                                                    {(job.status ?? '—').replace(/_/g, ' ')}
                                                </span>
                                                <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 text-white">
                                                    <p className="block truncate text-sm font-medium leading-tight">
                                                        {job.job_title}
                                                    </p>
                                                    <span className="mt-1 block truncate text-[10px] text-white/90">
                                                        {job.job_category ?? '—'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Body: 3 rows */}
                                            <div className="mt-3 text-slate-600 dark:text-slate-500">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">Salary: {job.salary ?? '—'}</span>
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">Vacancies: {job.number_of_vacancies ?? '—'}</span>
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                                    <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate capitalize">
                                                        Status: {(job.status ?? '—').replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Footer: Preview · Approve · Decline (Approve/Decline only for pending) */}
                                        <div className="flex items-center justify-start gap-0.5 border-t border-slate-200/60 px-2 py-2 dark:border-border">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1 text-[10px] font-medium text-primary hover:bg-primary/10"
                                                onClick={() => setDetailsJob(job)}
                                            >
                                                <Eye className="h-3 w-3" />
                                                Preview
                                            </Button>
                                            {(job.status ?? '').toLowerCase() === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                                                        onClick={() => setApproveConfirmJob(job)}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-[10px] font-medium text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            setDeclineJob(job);
                                                            setDeclineRemarks('');
                                                        }}
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                        {pagination && pagination.links?.length > 0 && (
                            <Pagination
                                links={pagination.links}
                                from={pagination.from}
                                to={pagination.to}
                                total={pagination.total}
                            />
                        )}
                    </>
                )}
            </div>

            {/* View details modal */}
            <Dialog open={!!detailsJob} onOpenChange={(open) => !open && setDetailsJob(null)}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-hide overflow-x-hidden p-0">
                    {detailsJob && (
                        <>
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                                    <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {detailsJob.photo ? (
                                            <img
                                                src={photoUrl(detailsJob.photo) ?? ''}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Briefcase className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <DialogTitle className="text-xl font-semibold leading-tight">
                                            {detailsJob.job_title}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1">
                                            {detailsJob.job_category ?? '—'} · {detailsJob.location ?? '—'}
                                        </DialogDescription>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                    statusBadgeClass[
                                                        (detailsJob.status ?? '').toLowerCase().replace(/-/g, '_')
                                                    ] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}
                                            >
                                                {(detailsJob.status ?? '—').replace(/_/g, ' ')}
                                            </span>
                                            {detailsJob.employer_name && (
                                                <span className="text-xs text-muted-foreground">
                                                    Employer: {detailsJob.employer_name}
                                                </span>
                                            )}
                                            {detailsJob.created_at && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(detailsJob.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 px-6 py-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Location
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {detailsJob.location || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Salary
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {detailsJob.salary || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Vacancies
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {detailsJob.number_of_vacancies ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Category
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {detailsJob.job_category ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-semibold">Job description</h4>
                                    </div>
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <p className="whitespace-pre-wrap text-sm">
                                            {detailsJob.job_description || '—'}
                                        </p>
                                    </div>
                                </div>
                                {detailsJob.required_qualifications && (
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="text-sm font-semibold">Required qualifications</h4>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <p className="whitespace-pre-wrap text-sm">
                                                {detailsJob.required_qualifications}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve confirmation modal */}
            <Dialog open={!!approveConfirmJob} onOpenChange={(open) => !open && setApproveConfirmJob(null)}>
                <DialogContent className="max-w-md">
                    <DialogTitle>Confirm Approve</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to approve this job? It will be marked as approved and evaluated.
                        {approveConfirmJob && (
                            <span className="mt-2 block font-medium text-foreground">
                                Job: {approveConfirmJob.job_title}
                            </span>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveConfirmJob(null)}
                            disabled={actionSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApproveConfirm}
                            disabled={actionSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {actionSubmitting ? 'Approving…' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline modal – manual remarks */}
            <Dialog
                open={!!declineJob}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeclineJob(null);
                        setDeclineRemarks('');
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogTitle>Decline Job</DialogTitle>
                    <DialogDescription>
                        {declineJob && (
                            <>
                                Enter remarks for declining this job. The employer will see this feedback.
                                <span className="mt-2 block font-medium text-foreground">
                                    Job: {declineJob.job_title}
                                </span>
                            </>
                        )}
                    </DialogDescription>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="decline-remarks">Remarks (required)</Label>
                        <textarea
                            id="decline-remarks"
                            value={declineRemarks}
                            onChange={(e) => setDeclineRemarks(e.target.value)}
                            placeholder="e.g. Missing required information..."
                            rows={4}
                            className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={actionSubmitting}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeclineJob(null);
                                setDeclineRemarks('');
                            }}
                            disabled={actionSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeclineSubmit}
                            disabled={actionSubmitting || !declineRemarks.trim()}
                        >
                            {actionSubmitting ? 'Declining…' : 'Decline'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
