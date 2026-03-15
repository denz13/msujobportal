import { Form, Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Briefcase,
    Calendar,
    MapPin,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    Eye,
    DollarSign,
    Users,
    FileText,
} from 'lucide-react';
import PostJobsController from '@/actions/App/Http/Controllers/Jobs/PostJobsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageDropzone } from '@/components/ui/image-dropzone';
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
import { Switch } from '@/components/ui/switch';
import type { BreadcrumbItem } from '@/types';
import { index as postJobsIndex } from '@/routes/post-jobs';

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
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Post Jobs',
        href: postJobsIndex.url(),
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

export default function PostJobs() {
    const pageProps = usePage().props as unknown as {
        flash?: { toast?: { type: string; message: string } };
        jobs?: Job[];
        errors?: Record<string, string>;
        filters?: { search?: string; status?: string };
        uniqueStatuses?: string[];
        pagination?: {
            links: PaginationLink[];
            from: number | null;
            to: number | null;
            total: number;
        };
    };
    const {
        flash,
        jobs = [],
        errors: pageErrors,
        filters = {},
        uniqueStatuses = [],
        pagination,
    } = pageProps;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [detailsJob, setDetailsJob] = useState<Job | null>(null);
    const [availabilityTogglingId, setAvailabilityTogglingId] = useState<number | null>(null);
    const [availabilityOverride, setAvailabilityOverride] = useState<Record<number, boolean>>({});
    const [dropzoneKey, setDropzoneKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const photoInputRef = useRef<HTMLInputElement>(null);
    const flashShown = useRef(false);
    const isInitialMount = useRef(true);

    const openModal = () => {
        setEditingJob(null);
        setDropzoneKey((k) => k + 1);
        setModalOpen(true);
    };

    const fetchAndOpenEdit = async (job: Job) => {
        try {
            const res = await fetch(`/jobs/post-jobs/${job.id}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Failed to load job');
            const data = (await res.json()) as Job;
            setEditingJob(data);
            setDropzoneKey((k) => k + 1);
            setModalOpen(true);
        } catch {
            toast.error('Failed to load job');
        }
    };

    const handleDelete = async (job: Job) => {
        if (!window.confirm(`Delete job "${job.job_title}"? This cannot be undone.`)) return;
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) {
            toast.error('CSRF token not found');
            return;
        }
        try {
            const res = await fetch(`/jobs/post-jobs/${job.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to delete job');
                return;
            }
            toast.success(data.message ?? 'Job deleted');
            router.reload();
        } catch {
            toast.error('An error occurred');
        }
    };

    useEffect(() => {
        if (flash?.toast && !flashShown.current) {
            flashShown.current = true;
            if (flash.toast.type === 'success') {
                toast.success(flash.toast.message);
                setModalOpen(false);
                setEditingJob(null);
            } else {
                toast.error(flash.toast.message);
            }
        }
    }, [flash]);

    useEffect(() => {
        if (pageErrors && Object.keys(pageErrors).length > 0 && modalOpen && !flashShown.current) {
            toast.error('Please fix the errors and try again.');
        }
    }, [pageErrors, modalOpen]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(postJobsIndex.url(), {
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: 1,
            }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, statusFilter]);

    const isNotAvailable = (status: string | null | undefined) =>
        String(status ?? '').toLowerCase().replace(/-/g, '_') === 'not_available';

    const handleAvailabilityChange = async (job: Job, available: boolean) => {
        setAvailabilityOverride((prev) => ({ ...prev, [job.id]: available }));
        setAvailabilityTogglingId(job.id);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) {
            toast.error('CSRF token not found');
            setAvailabilityOverride((prev) => {
                const next = { ...prev };
                delete next[job.id];
                return next;
            });
            setAvailabilityTogglingId(null);
            return;
        }
        try {
            const res = await fetch(`/jobs/post-jobs/${job.id}/availability`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ available }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to update availability');
                setAvailabilityOverride((prev) => {
                    const next = { ...prev };
                    delete next[job.id];
                    return next;
                });
                setAvailabilityTogglingId(null);
                return;
            }
            toast.success(data.message ?? (available ? 'Job is now available.' : 'Job is now not available.'));
            router.reload();
        } catch {
            toast.error('An error occurred');
            setAvailabilityOverride((prev) => {
                const next = { ...prev };
                delete next[job.id];
                return next;
            });
            setAvailabilityTogglingId(null);
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get(postJobsIndex.url(), {
            search: searchQuery || undefined,
            status: value !== 'all' ? value : undefined,
            page: 1,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const storeForm = PostJobsController.store.form();
    const isEdit = editingJob != null;
    const updateUrl = isEdit ? `/jobs/post-jobs/${editingJob.id}` : storeForm.action;

    const photoUrl = (photo: string | null) => {
        if (!photo) return undefined;
        return photo.startsWith('http') || photo.startsWith('/') ? photo : `/${photo}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Post Jobs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        variant="small"
                        title="Post Jobs"
                        description="Manage job listings. Add a new job via the button below."
                    />
                    <Button onClick={openModal} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Post Job Now
                    </Button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <label htmlFor="search" className="sr-only">Search jobs</label>
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
                        <div className="w-full sm:w-[180px]">
                            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger id="status-filter" className="w-full">
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
                </div>

                <Card>
                    <CardContent className="p-0">
                        {jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">No jobs posted yet.</p>
                                <Button onClick={openModal}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Post Job Now
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-sidebar-border/70">
                                                <th className="w-14 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Photo
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Job Title
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Category
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Location
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Vacancies
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Not Available
                                                </th>
                                                <th className="w-[80px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map((job) => (
                                                <tr
                                                    key={job.id}
                                                    className="border-b border-sidebar-border/70 transition-colors hover:bg-accent/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-muted">
                                                            {job.photo ? (
                                                                <img
                                                                    src={photoUrl(job.photo) ?? ''}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {job.job_title}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {job.job_category ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {job.location ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {job.number_of_vacancies ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                                statusBadgeClass[
                                                                    (job.status ?? '').toLowerCase().replace(/-/g, '_')
                                                                ] ??
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                            }`}
                                                        >
                                                            {(job.status ?? '—').replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={
                                                                    availabilityOverride[job.id] ??
                                                                    !isNotAvailable(job.status)
                                                                }
                                                                onCheckedChange={(checked) => handleAvailabilityChange(job, checked)}
                                                                disabled={availabilityTogglingId === job.id}
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {availabilityOverride[job.id] ?? !isNotAvailable(job.status)
                                                                    ? 'On'
                                                                    : 'Off'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                    <span className="sr-only">Actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => setDetailsJob(job)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => fetchAndOpenEdit(job)}
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Update
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(job)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                            </div>
                        )}
                        {pagination && pagination.links?.length > 0 && (
                            <Pagination
                                links={pagination.links}
                                from={pagination.from}
                                to={pagination.to}
                                total={pagination.total}
                            />
                        )}
                    </CardContent>
                </Card>
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
                                                    statusBadgeClass[detailsJob.status ?? ''] ??
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}
                                            >
                                                {detailsJob.status ?? '—'}
                                            </span>
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
                                    <div className="rounded-lg border bg-muted/20 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                            {detailsJob.job_description || '—'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-semibold">Required qualifications</h4>
                                    </div>
                                    <div className="rounded-lg border bg-muted/20 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                            {detailsJob.required_qualifications || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="border-t px-6 py-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setDetailsJob(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        const job = detailsJob;
                                        setDetailsJob(null);
                                        fetchAndOpenEdit(job);
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Update job
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingJob(null);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto scrollbar-hide overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Update Job' : 'Post a Job'}</DialogTitle>
                    </DialogHeader>
                    <Form
                        action={updateUrl}
                        method="post"
                        encType="multipart/form-data"
                        options={{ preserveScroll: true }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {isEdit && (
                                    <input type="hidden" name="_method" value="PUT" />
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="modal_job_title">Job title</Label>
                                    <Input
                                        id="modal_job_title"
                                        name="job_title"
                                        required
                                        defaultValue={editingJob?.job_title ?? ''}
                                        placeholder="e.g. Software Engineer"
                                    />
                                    <InputError message={errors.job_title} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="modal_job_description">Job description</Label>
                                    <textarea
                                        id="modal_job_description"
                                        name="job_description"
                                        required
                                        rows={3}
                                        defaultValue={editingJob?.job_description ?? ''}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe the role and responsibilities..."
                                    />
                                    <InputError message={errors.job_description} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="modal_job_category">Job category</Label>
                                    <Input
                                        id="modal_job_category"
                                        name="job_category"
                                        required
                                        defaultValue={editingJob?.job_category ?? ''}
                                        placeholder="e.g. IT, Healthcare, Education"
                                    />
                                    <InputError message={errors.job_category} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="modal_required_qualifications">Required qualifications</Label>
                                    <textarea
                                        id="modal_required_qualifications"
                                        name="required_qualifications"
                                        rows={2}
                                        defaultValue={editingJob?.required_qualifications ?? ''}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="List qualifications, experience, skills..."
                                    />
                                    <InputError message={errors.required_qualifications} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="modal_location">Location</Label>
                                        <Input
                                            id="modal_location"
                                            name="location"
                                            defaultValue={editingJob?.location ?? ''}
                                            placeholder="e.g. Manila, Remote"
                                        />
                                        <InputError message={errors.location} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="modal_salary">Salary</Label>
                                        <Input
                                            id="modal_salary"
                                            name="salary"
                                            defaultValue={editingJob?.salary ?? ''}
                                            placeholder="e.g. 50,000 - 70,000 PHP"
                                        />
                                        <InputError message={errors.salary} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="modal_number_of_vacancies">Number of vacancies</Label>
                                    <Input
                                        id="modal_number_of_vacancies"
                                        name="number_of_vacancies"
                                        type="number"
                                        min={1}
                                        defaultValue={editingJob?.number_of_vacancies ?? ''}
                                        placeholder="1"
                                    />
                                    <InputError message={errors.number_of_vacancies} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Status will be set to <strong>Pending</strong> and will require admin approval. You cannot edit status here.
                                </p>
                                <div className="grid gap-2">
                                    <Label>Photo</Label>
                                    <ImageDropzone
                                        key={dropzoneKey}
                                        name="photo"
                                        inputRef={photoInputRef}
                                        hint="Optional. Saved to public/uploads/jobs."
                                        error={errors.photo}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setModalOpen(false); setEditingJob(null); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Job' : 'Post Job')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
