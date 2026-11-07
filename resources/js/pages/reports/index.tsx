import { Head, router } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    Info,
    Mail,
    Printer,
    RefreshCw,
    RotateCcw,
    Search,
    Shield,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { BreadcrumbItem } from '@/types';

export type ReportApplicationItem = {
    id: number;
    user_id?: number;
    applicant_name: string;
    email: string;
    gender: string;
    age: number | null;
    address: string;
    qualifications: string[];
    qualifications_raw: string;
    work_experience: string;
    job_title: string;
    job_category: string;
    employer_name: string;
    company_name?: string | null;
    employer_display: string;
    status: string;
    applied_at: string | null;
    applied_date_formatted: string;
    interview_date: string | null;
    interview_time: string | null;
    interview_type: string | null;
    remarks: string | null;
};

export type NormalizedApplicant = {
    key: string;
    user_id?: number;
    applicant_name: string;
    email: string;
    gender: string;
    age: number | null;
    address: string;
    qualifications: string[];
    qualifications_raw: string;
    work_experience: string;
    total_applications: number;
    applications: ReportApplicationItem[];
};

type Props = {
    applications: ReportApplicationItem[];
    stats: {
        total_applications: number;
        unique_applicants: number;
        approved: number;
        pending: number;
        cancelled: number;
    };
    jobs: { id: string; title: string }[];
    employers: { id: string; name: string }[];
    filters: {
        search: string;
        job_id: string;
        status: string;
        employer_id: string;
        date_from: string;
        date_to: string;
    };
    isAdmin: boolean;
    currentUser: {
        name: string;
        role: string;
        email: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
    {
        title: 'List of Applications',
        href: '/reports',
    },
];

function getStatusBadge(status: string) {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'accepted' || s === 'hired') {
        return (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3 inline" /> Approved
            </span>
        );
    }
    if (s === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                <Clock className="h-3 w-3 inline" /> Pending
            </span>
        );
    }
    if (s === 'cancelled' || s === 'declined' || s === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-400">
                <XCircle className="h-3 w-3 inline" /> Declined
            </span>
        );
    }
    return <span className="capitalize">{status}</span>;
}

export default function ReportsIndex({
    applications = [],
    stats,
    jobs = [],
    employers = [],
    filters,
    isAdmin = false,
    currentUser,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [jobId, setJobId] = useState(filters.job_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [employerId, setEmployerId] = useState(filters.employer_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Normalize applications by applicant so each applicant only appears once
    const normalizedApplicants = useMemo(() => {
        const map = new Map<string, NormalizedApplicant>();
        applications.forEach((app) => {
            const key = app.user_id
                ? `uid-${app.user_id}`
                : app.email && app.email !== '—'
                  ? `email-${app.email}`
                  : `name-${app.applicant_name}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    user_id: app.user_id,
                    applicant_name: app.applicant_name,
                    email: app.email,
                    gender: app.gender,
                    age: app.age,
                    address: app.address,
                    qualifications: app.qualifications,
                    qualifications_raw: app.qualifications_raw,
                    work_experience: app.work_experience,
                    total_applications: 0,
                    applications: [],
                });
            }
            const group = map.get(key)!;
            group.total_applications += 1;
            group.applications.push(app);
        });
        return Array.from(map.values());
    }, [applications]);

    const [expandedApplicants, setExpandedApplicants] = useState<Set<string>>(new Set());

    const toggleApplicant = (key: string) => {
        setExpandedApplicants((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (expandedApplicants.size === normalizedApplicants.length) {
            setExpandedApplicants(new Set());
        } else {
            setExpandedApplicants(new Set(normalizedApplicants.map((a) => a.key)));
        }
    };

    const [viewMode, setViewMode] = useState<'applications' | 'applicants'>('applications');

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                '/reports',
                {
                    search: search.trim() || undefined,
                    job_id: jobId !== 'all' ? jobId : undefined,
                    status: status !== 'all' ? status : undefined,
                    employer_id: employerId !== 'all' ? employerId : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, jobId, status, employerId, dateFrom, dateTo]);

    const handleResetFilters = () => {
        setSearch('');
        setJobId('all');
        setStatus('all');
        setEmployerId('all');
        setDateFrom('');
        setDateTo('');
        router.visit('/reports');
    };

    const getPdfUrl = (download: boolean = false) => {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (jobId !== 'all') params.set('job_id', jobId);
        if (status !== 'all') params.set('status', status);
        if (employerId !== 'all') params.set('employer_id', employerId);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        params.set('view_mode', viewMode);
        if (download) params.set('download', '1');
        return `/reports/pdf?${params.toString()}`;
    };

    const handlePrintPdf = () => {
        // Stream inline using Dompdf: Opens new tab formatted for A4 landscape printing
        window.open(getPdfUrl(false), '_blank');
    };

    const handleDownloadPdf = () => {
        window.location.href = getPdfUrl(true);
    };

    const handleBrowserPrint = () => {
        window.print();
    };

    const exportToCSV = () => {
        if (applications.length === 0) return;

        const headers = [
            'No.',
            'Applicant Name',
            'Email',
            'Gender',
            'Age',
            'Address',
            'Qualifications/Skills',
            'Work Experience',
            'Job Applied To',
            'Job Category',
            ...(isAdmin ? ['Employer/Company'] : []),
            'Date Applied',
            'Status',
            'Interview Schedule',
            'Remarks',
        ];

        const rows = applications.map((app, idx) => [
            idx + 1,
            `"${(app.applicant_name || '').replace(/"/g, '""')}"`,
            `"${(app.email || '').replace(/"/g, '""')}"`,
            app.gender || '—',
            app.age ?? '—',
            `"${(app.address || '').replace(/"/g, '""')}"`,
            `"${(app.qualifications_raw || '').replace(/"/g, '""')}"`,
            `"${(app.work_experience || '').replace(/"/g, '""')}"`,
            `"${(app.job_title || '').replace(/"/g, '""')}"`,
            `"${(app.job_category || '').replace(/"/g, '""')}"`,
            ...(isAdmin ? [`"${(app.employer_display || '').replace(/"/g, '""')}"`] : []),
            app.applied_date_formatted || '—',
            app.status || '—',
            app.interview_date ? `"${app.interview_date} ${app.interview_time || ''}"` : '—',
            `"${(app.remarks || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `list_of_applications_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatedAt = new Date().toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List of Applications - Printable Report" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 print:p-0 print:m-0">
                {/* Screen Header Controls (Hidden during printing) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileSpreadsheet className="h-6 w-6 text-primary" />
                            List of Applications (Reports)
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isAdmin
                                ? 'Admin / Super Admin view: Official printable report of job applications across all employers.'
                                : 'Employer view: Official printable report of job applications submitted to your job postings.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={applications.length === 0}
                            className="gap-2 text-xs font-semibold"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPdf}
                            disabled={applications.length === 0}
                            className="gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Download PDF</span>
                        </Button>

                        <Button
                            type="button"
                            onClick={handlePrintPdf}
                            disabled={applications.length === 0}
                            className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Print Report (PDF)</span>
                        </Button>
                    </div>
                </div>

                {/* Filters Section (Hidden during printing) */}
                <Card className="print:hidden border-border/80 shadow-xs">
                    <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-border/60">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Report Filters
                            </CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-end">
                            {/* Search Filter */}
                            <div className="space-y-1.5 xl:col-span-2">
                                <Label htmlFor="report-search" className="text-xs font-medium">
                                    Search Candidate / Skill
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="report-search"
                                        type="text"
                                        placeholder="Name, email, qualification..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-9 pl-8 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Job Post Filter */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Job Post</Label>
                                <Select value={jobId} onValueChange={setJobId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="All Jobs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Jobs</SelectItem>
                                        {jobs.map((j) => (
                                            <SelectItem key={j.id} value={j.id}>
                                                {j.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Application Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="cancelled">Declined / Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Employer Filter (Admin only) */}
                            {isAdmin && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Employer / Company</Label>
                                    <Select value={employerId} onValueChange={setEmployerId}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="All Employers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employers</SelectItem>
                                            {employers.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Date From */}
                            <div className="space-y-1.5">
                                <Label htmlFor="date_from" className="text-xs font-medium">
                                    Applied From
                                </Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Date To */}
                            <div className="space-y-1.5">
                                <Label htmlFor="date_to" className="text-xs font-medium">
                                    Applied To
                                </Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Metrics Cards (Screen Mode) */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 print:hidden">
                    <Card className="p-3.5 border-border/80">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>Total Applied</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {stats.total_applications}
                        </p>
                    </Card>

                    <Card className="p-3.5 border-border/80">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>Unique Jobseekers</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {stats.unique_applicants}
                        </p>
                    </Card>

                    <Card className="p-3.5 border-border/80">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Approved</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.approved}
                        </p>
                    </Card>

                    <Card className="p-3.5 border-border/80">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span>Pending</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {stats.pending}
                        </p>
                    </Card>

                    <Card className="p-3.5 border-border/80 col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Declined</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.cancelled}
                        </p>
                    </Card>
                </div>

                {/* Printable Report Document Wrapper */}
                <div id="printable-report" className="rounded-xl border border-border bg-card p-6 shadow-sm print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
                    {/* Official Document Header (Prominently styled for print & preview) */}
                    <div className="border-b-2 border-border/80 pb-4 mb-6 text-center print:border-black">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <FileText className="h-6 w-6 text-primary print:text-black" />
                            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-foreground print:text-black">
                                OFFICIAL LIST OF APPLICATIONS & SUMMARY REPORT
                            </h2>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground print:text-black">
                            <span>
                                <strong>Generated On:</strong> {generatedAt}
                            </span>
                            <span>
                                <strong>Generated By:</strong> {currentUser.name} (
                                <span className="uppercase">{currentUser.role}</span>)
                            </span>
                            <span>
                                <strong>Total Applications:</strong> {applications.length}
                            </span>
                            <span>
                                <strong>Total Applicants:</strong> {normalizedApplicants.length}
                            </span>
                        </div>

                        {/* Filter Scope Summary in Print Header */}
                        <div className="mt-2.5 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground print:bg-gray-100 print:text-black print:border print:border-gray-300">
                            <strong>Applied Filters:</strong>{' '}
                            {status !== 'all' ? `Status: ${status} | ` : 'Status: All | '}
                            {jobId !== 'all'
                                ? `Job: ${jobs.find((j) => j.id === jobId)?.title || jobId} | `
                                : 'Jobs: All | '}
                            {isAdmin &&
                                (employerId !== 'all'
                                     ? `Employer: ${employers.find((e) => e.id === employerId)?.name || employerId} | `
                                     : 'Employer: All | ')}
                            {dateFrom || dateTo
                                ? `Date Range: ${dateFrom || 'Any'} to ${dateTo || 'Present'} | `
                                : 'Date: All Time | '}
                            {search ? `Search Query: "${search}"` : 'Search: None'}
                        </div>
                    </div>

                    {/* View Mode & Expand/Collapse Toolbar (Hidden during print) */}
                    {applications.length > 0 && (
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
                            <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-lg border border-border/80 self-start sm:self-auto">
                                <Button
                                    type="button"
                                    variant={viewMode === 'applications' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('applications')}
                                    className="h-8 text-xs font-semibold gap-1.5"
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>All Applications ({applications.length})</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={viewMode === 'applicants' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('applicants')}
                                    className="h-8 text-xs font-semibold gap-1.5"
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Grouped by Applicant ({normalizedApplicants.length})</span>
                                </Button>
                            </div>

                            {viewMode === 'applicants' ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleAll}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    {expandedApplicants.size === normalizedApplicants.length &&
                                    normalizedApplicants.length > 0 ? (
                                        <>
                                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Collapse All</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Expand All</span>
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    Displaying all <strong className="text-foreground">{applications.length}</strong> official job application records
                                </span>
                            )}
                        </div>
                    )}

                    {/* Report Data Table */}
                    {applications.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
                            <p className="font-semibold text-base">No application records found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                No job applications match the specified criteria or filters.
                            </p>
                        </div>
                    ) : viewMode === 'applications' ? (
                        /* VIEW MODE 1: All Applications Table (Line by line) */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse print:text-[10px]">
                                <thead>
                                    <tr className="border-y-2 border-border/80 bg-muted/50 text-foreground font-bold print:border-black print:bg-gray-100 print:text-black">
                                        <th className="py-2.5 px-2 text-center w-8">#</th>
                                        <th className="py-2.5 px-3">Applicant Name</th>
                                        <th className="py-2.5 px-3">Contact Details</th>
                                        <th className="py-2.5 px-3">Position Applied</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        {isAdmin && <th className="py-2.5 px-3">Employer / Company</th>}
                                        <th className="py-2.5 px-3">Qualifications / Skills</th>
                                        <th className="py-2.5 px-3">Date Applied</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3">Interview / Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 print:divide-gray-300">
                                    {applications.map((app, index) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-muted/20 print:hover:bg-transparent break-inside-avoid"
                                        >
                                            <td className="py-2.5 px-2 text-center text-muted-foreground font-medium print:text-black">
                                                {index + 1}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-foreground print:text-black">
                                                <div>{app.applicant_name}</div>
                                                {app.gender && app.gender !== '—' && (
                                                    <span className="text-[11px] font-normal text-muted-foreground print:text-gray-600">
                                                        {app.gender}
                                                        {app.age ? `, ${app.age} yrs` : ''}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                <div>{app.email}</div>
                                                {app.address && app.address !== '—' && (
                                                    <div className="text-[10px] text-muted-foreground line-clamp-1 print:text-gray-600">
                                                        {app.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-foreground print:text-black">
                                                {app.job_title}
                                            </td>
                                            <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                {app.job_category}
                                            </td>
                                            {isAdmin && (
                                                <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                    <div className="font-medium text-foreground print:text-black">
                                                        {app.company_name || app.employer_name}
                                                    </div>
                                                    {app.company_name && (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {app.employer_name}
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                            <td className="py-2.5 px-3 text-foreground print:text-black">
                                                {app.qualifications.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {app.qualifications.map((q, qIdx) => (
                                                            <span
                                                                key={qIdx}
                                                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium print:border print:border-gray-300 print:bg-white"
                                                            >
                                                                {q}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="italic text-muted-foreground print:text-gray-500">
                                                        None listed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground print:text-black">
                                                {app.applied_date_formatted}
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                {getStatusBadge(app.status)}
                                            </td>
                                            <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                {app.interview_date ? (
                                                    <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 print:text-black">
                                                        Sched: {app.interview_date} {app.interview_time || ''}
                                                        {app.interview_type ? ` (${app.interview_type})` : ''}
                                                    </div>
                                                ) : app.remarks ? (
                                                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                                                        {app.remarks}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/60">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* VIEW MODE 2: Normalized by Applicant with expandable rows */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse print:text-[10px]">
                                <thead>
                                    <tr className="border-y-2 border-border/80 bg-muted/50 text-foreground font-bold print:border-black print:bg-gray-100 print:text-black">
                                        <th className="py-2.5 px-2 text-center w-8">#</th>
                                        <th className="py-2.5 px-3">Applicant Name</th>
                                        <th className="py-2.5 px-3">Contact Details</th>
                                        <th className="py-2.5 px-3">Qualifications / Skills</th>
                                        <th className="py-2.5 px-3">Work Experience</th>
                                        <th className="py-2.5 px-3 text-center">Jobs Applied</th>
                                        <th className="py-2.5 px-3 text-center print:hidden">Show / Hide</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 print:divide-gray-300">
                                    {normalizedApplicants.map((applicant, index) => {
                                        const isExpanded = expandedApplicants.has(applicant.key);
                                        return (
                                            <Fragment key={applicant.key}>
                                                <tr
                                                    onClick={() => toggleApplicant(applicant.key)}
                                                    className={`cursor-pointer transition-colors hover:bg-muted/30 select-none break-inside-avoid ${
                                                        isExpanded ? 'bg-muted/20 font-medium' : ''
                                                    }`}
                                                    title="Click to view all jobs applied by this applicant"
                                                >
                                                    <td className="py-2.5 px-2 text-center text-muted-foreground font-medium print:text-black">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold text-foreground print:text-black">
                                                        <div>{applicant.applicant_name}</div>
                                                        {applicant.gender && applicant.gender !== '—' && (
                                                            <span className="text-[11px] font-normal text-muted-foreground print:text-gray-600">
                                                                {applicant.gender}
                                                                {applicant.age ? `, ${applicant.age} yrs` : ''}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                        <div>{applicant.email}</div>
                                                        {applicant.address && applicant.address !== '—' && (
                                                            <div className="text-[10px] text-muted-foreground line-clamp-1 print:text-gray-600">
                                                                {applicant.address}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-foreground print:text-black">
                                                        {applicant.qualifications.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {applicant.qualifications.map((q, qIdx) => (
                                                                    <span
                                                                        key={qIdx}
                                                                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium print:border print:border-gray-300 print:bg-white"
                                                                    >
                                                                        {q}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="italic text-muted-foreground print:text-gray-500">
                                                                None listed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-muted-foreground print:text-black">
                                                        <span className="line-clamp-2">{applicant.work_experience || '—'}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-semibold px-2 py-0.5 text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 print:border-gray-300 print:bg-gray-100 print:text-black"
                                                        >
                                                            {applicant.total_applications}{' '}
                                                            {applicant.total_applications === 1 ? 'Job' : 'Jobs'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center print:hidden">
                                                        <Button
                                                            type="button"
                                                            variant={isExpanded ? 'secondary' : 'outline'}
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleApplicant(applicant.key);
                                                            }}
                                                            className="gap-1 text-xs h-7 font-medium"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp className="h-3 w-3" />
                                                                    <span>Hide</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="h-3 w-3" />
                                                                    <span>Show Jobs ({applicant.total_applications})</span>
                                                                </>
                                                            )}
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Applied Jobs Row */}
                                                <tr
                                                    className={`${
                                                        isExpanded ? 'table-row' : 'hidden print:table-row'
                                                    } bg-muted/15 border-b border-border/80 break-inside-avoid`}
                                                >
                                                    <td colSpan={7} className="p-0">
                                                        <div className="border-t border-border/60 bg-muted/10 px-5 py-3.5 print:bg-white print:px-2 print:py-2">
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black">
                                                                    <Briefcase className="h-3.5 w-3.5 text-emerald-600 print:text-black" />
                                                                    Applied Jobs ({applicant.total_applications}) by {applicant.applicant_name}
                                                                </h4>
                                                                <span className="text-[11px] text-muted-foreground print:hidden">
                                                                    {applicant.email}
                                                                </span>
                                                            </div>
                                                            <div className="overflow-x-auto rounded border border-border/70 bg-card print:border-gray-400 print:bg-white">
                                                                <table className="w-full text-left text-xs border-collapse print:text-[9px]">
                                                                    <thead>
                                                                        <tr className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/70 print:bg-gray-100 print:text-black print:border-gray-400">
                                                                            <th className="py-1.5 px-3">Position Applied</th>
                                                                            <th className="py-1.5 px-3">Job Category</th>
                                                                            {isAdmin && <th className="py-1.5 px-3">Employer / Company</th>}
                                                                            <th className="py-1.5 px-3">Date Applied</th>
                                                                            <th className="py-1.5 px-3 text-center">Status</th>
                                                                            <th className="py-1.5 px-3">Interview / Remarks</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-border/50 print:divide-gray-300">
                                                                        {applicant.applications.map((app) => (
                                                                            <tr key={app.id} className="hover:bg-muted/20">
                                                                                <td className="py-1.5 px-3 font-semibold text-foreground print:text-black">
                                                                                    {app.job_title}
                                                                                </td>
                                                                                <td className="py-1.5 px-3 text-muted-foreground print:text-black">
                                                                                    {app.job_category}
                                                                                </td>
                                                                                {isAdmin && (
                                                                                    <td className="py-1.5 px-3 text-muted-foreground print:text-black">
                                                                                        <span className="font-medium text-foreground print:text-black">
                                                                                            {app.company_name || app.employer_name}
                                                                                        </span>
                                                                                        {app.company_name && (
                                                                                            <span className="text-[10px] text-muted-foreground ml-1">
                                                                                                ({app.employer_name})
                                                                                            </span>
                                                                                        )}
                                                                                    </td>
                                                                                )}
                                                                                <td className="py-1.5 px-3 whitespace-nowrap text-muted-foreground print:text-black">
                                                                                    {app.applied_date_formatted}
                                                                                </td>
                                                                                <td className="py-1.5 px-3 text-center whitespace-nowrap">
                                                                                    {getStatusBadge(app.status)}
                                                                                </td>
                                                                                <td className="py-1.5 px-3 text-muted-foreground print:text-black">
                                                                                    {app.interview_date ? (
                                                                                        <span className="font-medium text-emerald-800 dark:text-emerald-300 print:text-black">
                                                                                            Sched: {app.interview_date} {app.interview_time || ''}
                                                                                        </span>
                                                                                    ) : app.remarks ? (
                                                                                        <span className="line-clamp-1">{app.remarks}</span>
                                                                                    ) : (
                                                                                        <span>—</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Report Summary in Printout */}
                    <div className="mt-6 border-t-2 border-border/80 pt-4 flex flex-wrap justify-between items-center text-xs text-muted-foreground print:border-black print:text-black">
                        <div>
                            <span>Total Applicants: <strong>{normalizedApplicants.length}</strong></span>
                            <span className="ml-4">Total Applications: <strong>{applications.length}</strong></span>
                            <span className="ml-4">Approved: <strong>{stats.approved}</strong></span>
                            <span className="ml-4">Pending: <strong>{stats.pending}</strong></span>
                            <span className="ml-4">Declined: <strong>{stats.cancelled}</strong></span>
                        </div>
                        <div className="italic text-[11px]">
                            End of Official Report — List of Applications
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 12mm;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                    }
                    aside, header, nav, .print\\:hidden {
                        display: none !important;
                    }
                    #printable-report {
                        border: none !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-color: #d1d5db !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}

