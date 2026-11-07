import { Head, router } from '@inertiajs/react';
import {
    Briefcase,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    Loader2,
    Mail,
    MoreVertical,
    Search,
    User,
    UserCircle,
    XCircle,
} from 'lucide-react';
import { type ChangeEvent, Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useInitials } from '@/hooks/use-initials';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';

export type AppliedJobItem = {
    id: number; // Application ID
    job_id: number;
    job_title: string;
    job_category?: string;
    job_qualifications?: string;
    applied_at: string | null;
    status: string | null;
    resume_path: string | null;
    description?: string | null;
    remarks?: string | null;
};

export type JobseekerData = {
    id: number;
    display_name: string;
    firstname?: string;
    middlename?: string;
    lastname?: string;
    suffix?: string;
    gender?: string;
    date_of_birth?: string | null;
    age?: number | null;
    address?: string;
    email: string;
    role?: string;
    photo: string | null;
    status?: string;
    other_info?: {
        skills?: string;
        work?: string;
        status?: string;
    } | null;
};

export type ApplicantItem = {
    id: number; // Jobseeker User ID
    jobseeker: JobseekerData;
    skills: string[];
    skills_raw: string;
    work_experience: string;
    total_applications: number;
    latest_applied_at: string | null;
    applications: AppliedJobItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    applicants: ApplicantItem[];
    pagination: {
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
    };
    filters?: { search?: string; status?: string; arrange_by?: string };
    uniqueStatuses?: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Applicants',
        href: '/applicants/list-of-applied-applicants',
    },
    {
        title: 'List of applied applicants',
        href: '/applicants/list-of-applied-applicants',
    },
];

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
    const v = value?.trim();
    if (v === undefined || v === '') return null;
    return (
        <div className="flex justify-between gap-2 border-b border-border/60 py-2 text-sm last:border-0">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="min-w-0 text-right font-medium">{v}</span>
        </div>
    );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
            <div className="space-y-0">{children}</div>
        </div>
    );
}

function getStatusBadgeClass(status: string | null): string {
    if (!status) return 'bg-muted text-muted-foreground';
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    if (s === 'approved' || s === 'accepted' || s === 'hired') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (s === 'cancelled' || s === 'declined' || s === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-muted text-muted-foreground';
}

export default function ListOfAppliedApplicants({
    applicants,
    pagination,
    filters = {},
    uniqueStatuses = [],
}: Props) {
    const getInitials = useInitials();
    const [resumeModalOpen, setResumeModalOpen] = useState(false);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null);

    // Selected application for approval/decline modals
    const [approveConfirm, setApproveConfirm] = useState<{
        application: AppliedJobItem;
        applicantName: string;
    } | null>(null);
    const [declineConfirm, setDeclineConfirm] = useState<{
        application: AppliedJobItem;
        applicantName: string;
    } | null>(null);
    const [declineRemarks, setDeclineRemarks] = useState('');
    const [isProcessingApprove, setIsProcessingApprove] = useState(false);
    const [isProcessingDecline, setIsProcessingDecline] = useState(false);

    // Expanded jobseeker rows state (Set of seeker user IDs)
    const [expandedSeekers, setExpandedSeekers] = useState<Set<number>>(new Set());

    // Interview Details Form State
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [interviewType, setInterviewType] = useState('face-to-face');
    const [interviewLocation, setInterviewLocation] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [interviewInstructions, setInterviewInstructions] = useState('');

    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [arrangeBy, setArrangeBy] = useState(filters.arrange_by ?? 'latest');
    const isInitialMount = useRef(true);

    const toggleExpand = (seekerId: number) => {
        setExpandedSeekers((prev) => {
            const next = new Set(prev);
            if (next.has(seekerId)) {
                next.delete(seekerId);
            } else {
                next.add(seekerId);
            }
            return next;
        });
    };

    const toggleAllExpand = () => {
        if (expandedSeekers.size === applicants.length) {
            setExpandedSeekers(new Set());
        } else {
            setExpandedSeekers(new Set(applicants.map((a) => a.id)));
        }
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(
                '/applicants/list-of-applied-applicants',
                {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    arrange_by: arrangeBy !== 'latest' ? arrangeBy : undefined,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter, arrangeBy]);

    function handleStatusChange(value: string) {
        setStatusFilter(value);
    }

    function handleArrangeChange(value: string) {
        setArrangeBy(value);
    }

    function openResumeModal(path: string) {
        setResumeUrl(path.startsWith('/') ? path : `/${path}`);
        setResumeModalOpen(true);
    }

    function resetApproveForm() {
        setApproveConfirm(null);
        setInterviewDate('');
        setInterviewTime('');
        setInterviewType('face-to-face');
        setInterviewLocation('');
        setContactPerson('');
        setContactPhone('');
        setInterviewInstructions('');
    }

    function handleApproveConfirm() {
        if (!approveConfirm || isProcessingApprove) return;
        const id = approveConfirm.application.id;
        setIsProcessingApprove(true);
        router.patch(
            `/applicants/list-of-applied-applicants/${id}/approve`,
            {
                interview_date: interviewDate || undefined,
                interview_time: interviewTime.trim() || undefined,
                interview_type: interviewType || undefined,
                interview_location: interviewLocation.trim() || undefined,
                contact_person: contactPerson.trim() || undefined,
                contact_phone: contactPhone.trim() || undefined,
                interview_instructions: interviewInstructions.trim() || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Application approved. Interview notification and email sent!');
                    resetApproveForm();
                },
                onError: () => toast.error('Failed to approve application.'),
                onFinish: () => setIsProcessingApprove(false),
            }
        );
    }

    function handleDeclineConfirm() {
        if (!declineConfirm || isProcessingDecline) return;
        const id = declineConfirm.application.id;
        const remarks = declineRemarks.trim() || undefined;
        setIsProcessingDecline(true);
        router.patch(
            `/applicants/list-of-applied-applicants/${id}/decline`,
            { remarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Application declined. Email notification sent!');
                    setDeclineConfirm(null);
                    setDeclineRemarks('');
                },
                onError: () => toast.error('Failed to decline application.'),
                onFinish: () => setIsProcessingDecline(false),
            }
        );
    }

    const allExpanded = applicants.length > 0 && expandedSeekers.size === applicants.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List of applied applicants" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            List of applied applicants
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Jobseekers who applied to your job posts. Grouped by applicant to eliminate duplicate entries.
                        </p>
                    </div>

                    {applicants.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAllExpand}
                            className="gap-2 shrink-0 self-start sm:self-auto"
                        >
                            {allExpanded ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    <span>Collapse All</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    <span>Expand All Jobs</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Filters Bar: Search, Status, and Qualification Arranging */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or qualification..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Arrange / Sort based on qualification */}
                        <div className="w-full sm:w-[220px]">
                            <Select value={arrangeBy} onValueChange={handleArrangeChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Arrange by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Arrange: Latest Applied</SelectItem>
                                    <SelectItem value="qualification">
                                        Arrange: By Qualification (A-Z)
                                    </SelectItem>
                                    <SelectItem value="name">Arrange: Applicant Name (A-Z)</SelectItem>
                                    <SelectItem value="applications">
                                        Arrange: Most Applied Jobs
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full sm:w-[170px]">
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {uniqueStatuses.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <Card>
                    <CardContent className="p-0">
                        {applicants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <User className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="mt-4 font-medium">No applicants found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'Try clearing your search or status filter.'
                                        : 'Applications to your jobs will appear here.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                                <th className="w-[60px] py-3.5 pl-4 pr-2 text-center">Photo</th>
                                                <th className="w-[180px] px-4 py-3.5">Applicant Name</th>
                                                <th className="w-[200px] px-4 py-3.5">Email</th>
                                                <th className="px-4 py-3.5">Qualifications & Skills</th>
                                                <th className="w-[130px] px-4 py-3.5 text-center">Jobs Applied</th>
                                                <th className="w-[150px] px-4 py-3.5 text-center">Show / Hide</th>
                                                <th className="w-[100px] py-3.5 pl-2 pr-4 text-center">Profile</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {applicants.map((seeker) => {
                                                const isExpanded = expandedSeekers.has(seeker.id);
                                                return (
                                                    <Fragment key={seeker.id}>
                                                        {/* Parent Row: Exactly One Row per Jobseeker */}
                                                        <tr
                                                            onClick={() => toggleExpand(seeker.id)}
                                                            className={`cursor-pointer transition-colors hover:bg-muted/30 select-none ${
                                                                isExpanded ? 'bg-muted/20 font-medium' : ''
                                                            }`}
                                                            title="Click row to show/hide applied jobs"
                                                        >
                                                            <td className="py-3 pl-4 pr-2 text-center">
                                                                <div className="flex justify-center">
                                                                    <Avatar className="h-10 w-10 shrink-0 border border-border/80">
                                                                        <AvatarImage
                                                                            src={
                                                                                seeker.jobseeker.photo
                                                                                    ? `/storage/${seeker.jobseeker.photo}`
                                                                                    : undefined
                                                                            }
                                                                            alt={seeker.jobseeker.display_name}
                                                                        />
                                                                        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                                                                            {getInitials(
                                                                                seeker.jobseeker.display_name
                                                                            )}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 font-semibold text-foreground">
                                                                <div className="flex flex-col">
                                                                    <span>{seeker.jobseeker.display_name}</span>
                                                                    {seeker.jobseeker.gender && (
                                                                        <span className="text-xs font-normal text-muted-foreground">
                                                                            {seeker.jobseeker.gender}
                                                                            {seeker.jobseeker.age ? `, ${seeker.jobseeker.age} yrs` : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-muted-foreground text-xs sm:text-sm">
                                                                {seeker.jobseeker.email}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                                                                    {seeker.skills.length > 0 ? (
                                                                        seeker.skills.slice(0, 4).map((skill, sIdx) => (
                                                                            <Badge
                                                                                key={sIdx}
                                                                                variant="secondary"
                                                                                className="text-[11px] font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                                                            >
                                                                                {skill}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground italic">
                                                                            No specific qualifications listed
                                                                        </span>
                                                                    )}
                                                                    {seeker.skills.length > 4 && (
                                                                        <Badge variant="outline" className="text-[10px]">
                                                                            +{seeker.skills.length - 4} more
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-background font-semibold border-border px-2.5 py-0.5"
                                                                >
                                                                    {seeker.total_applications}{' '}
                                                                    {seeker.total_applications === 1 ? 'Job' : 'Jobs'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Button
                                                                    type="button"
                                                                    variant={isExpanded ? 'secondary' : 'outline'}
                                                                    size="sm"
                                                                    onClick={() => toggleExpand(seeker.id)}
                                                                    className="gap-1.5 text-xs font-medium h-8"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                                                            <span>Hide Jobs</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                                                            <span>Show Jobs ({seeker.applications.length})</span>
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </td>
                                                            <td className="py-3 pl-2 pr-4 text-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedApplicant(seeker);
                                                                        setProfileModalOpen(true);
                                                                    }}
                                                                    className="h-8 gap-1.5 text-xs"
                                                                    title="View applicant full profile"
                                                                >
                                                                    <UserCircle className="h-4 w-4 text-primary" />
                                                                    <span className="hidden sm:inline">Profile</span>
                                                                </Button>
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Sub-Row: Displays all jobs this applicant applied for */}
                                                        {isExpanded && (
                                                            <tr className="bg-muted/15 border-b border-border/80">
                                                                <td colSpan={7} className="p-0">
                                                                    <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
                                                                        <div className="mb-2 flex items-center justify-between">
                                                                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                                <Briefcase className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                                All Jobs Applied by {seeker.jobseeker.display_name} ({seeker.applications.length})
                                                                            </h4>
                                                                        </div>

                                                                        <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-xs">
                                                                            <table className="w-full text-left text-xs">
                                                                                <thead>
                                                                                    <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                                                                                        <th className="px-4 py-2.5">Job Title</th>
                                                                                        <th className="px-4 py-2.5">Category</th>
                                                                                        <th className="px-4 py-2.5">Date Applied</th>
                                                                                        <th className="px-4 py-2.5 text-center">Status</th>
                                                                                        <th className="px-4 py-2.5 text-center">Resume</th>
                                                                                        <th className="px-4 py-2.5 text-right">Actions</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-border/60">
                                                                                    {seeker.applications.map((app) => (
                                                                                        <tr
                                                                                            key={app.id}
                                                                                            className="hover:bg-muted/20 transition-colors"
                                                                                        >
                                                                                            <td className="px-4 py-2.5 font-medium text-foreground">
                                                                                                {app.job_title}
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                                                                <Badge variant="outline" className="text-[10px]">
                                                                                                    {app.job_category || 'General'}
                                                                                                </Badge>
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                                                                {app.applied_at
                                                                                                    ? new Date(app.applied_at).toLocaleDateString(undefined, {
                                                                                                          dateStyle: 'medium',
                                                                                                      })
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 text-center">
                                                                                                <Badge
                                                                                                    variant="secondary"
                                                                                                    className={getStatusBadgeClass(app.status)}
                                                                                                >
                                                                                                    {app.status
                                                                                                        ? app.status.charAt(0).toUpperCase() +
                                                                                                          app.status.slice(1).toLowerCase()
                                                                                                        : '—'}
                                                                                                </Badge>
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 text-center">
                                                                                                {app.resume_path ? (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => openResumeModal(app.resume_path!)}
                                                                                                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                                                                                    >
                                                                                                        <FileText className="h-3.5 w-3.5 shrink-0" />
                                                                                                        <span>View</span>
                                                                                                    </button>
                                                                                                ) : (
                                                                                                    <span className="text-muted-foreground">—</span>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-4 py-2.5 text-right">
                                                                                                <DropdownMenu>
                                                                                                    <DropdownMenuTrigger asChild>
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="icon"
                                                                                                            className="h-7 w-7"
                                                                                                            aria-label="Actions"
                                                                                                        >
                                                                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                                                                        </Button>
                                                                                                    </DropdownMenuTrigger>
                                                                                                    <DropdownMenuContent align="end">
                                                                                                        <DropdownMenuItem
                                                                                                            onClick={() => {
                                                                                                                setSelectedApplicant(seeker);
                                                                                                                setProfileModalOpen(true);
                                                                                                            }}
                                                                                                        >
                                                                                                            <UserCircle className="mr-2 h-4 w-4" />
                                                                                                            View profile
                                                                                                        </DropdownMenuItem>
                                                                                                        <DropdownMenuItem
                                                                                                            onClick={() =>
                                                                                                                setApproveConfirm({
                                                                                                                    application: app,
                                                                                                                    applicantName:
                                                                                                                        seeker.jobseeker.display_name,
                                                                                                                })
                                                                                                            }
                                                                                                            className="text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                                                                                                        >
                                                                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                                                            Approve application
                                                                                                        </DropdownMenuItem>
                                                                                                        <DropdownMenuItem
                                                                                                            onClick={() => {
                                                                                                                setDeclineConfirm({
                                                                                                                    application: app,
                                                                                                                    applicantName:
                                                                                                                        seeker.jobseeker.display_name,
                                                                                                                });
                                                                                                                setDeclineRemarks('');
                                                                                                            }}
                                                                                                            className="text-destructive focus:text-destructive"
                                                                                                        >
                                                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                                                            Decline application
                                                                                                        </DropdownMenuItem>
                                                                                                    </DropdownMenuContent>
                                                                                                </DropdownMenu>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    links={pagination.links}
                                    from={pagination.from}
                                    to={pagination.to}
                                    total={pagination.total}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Resume Modal */}
                <Dialog
                    open={resumeModalOpen}
                    onOpenChange={(open) => {
                        setResumeModalOpen(open);
                        if (!open) setResumeUrl(null);
                    }}
                >
                    <DialogContent className="max-h-[90vh] !max-w-[calc(100%-2rem)] sm:!max-w-4xl gap-0 p-0">
                        <DialogHeader className="border-b border-border px-4 py-3">
                            <DialogTitle className="text-lg">Resume</DialogTitle>
                            <DialogDescription className="sr-only">Resume preview or download options</DialogDescription>
                        </DialogHeader>
                        <div className="flex min-h-[50vh] w-full items-center justify-center p-4">
                            {resumeUrl &&
                                (resumeUrl.match(/\.(docx?|doc)$/i) ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">Word Document (.docx)</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm">
                                                Direct browser preview is not supported for Word documents. You can download the file to view it.
                                            </p>
                                        </div>
                                        <Button asChild className="gap-2">
                                            <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                                Download Resume
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <iframe
                                        title="Resume"
                                        src={resumeUrl}
                                        className="h-[70vh] w-full border-0 rounded-b-lg"
                                    />
                                ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Jobseeker Profile Modal */}
                <Dialog
                    open={profileModalOpen}
                    onOpenChange={(open) => {
                        setProfileModalOpen(open);
                        if (!open) setSelectedApplicant(null);
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-hide sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-lg">Jobseeker profile</DialogTitle>
                            <DialogDescription className="sr-only">Detailed profile information of the jobseeker</DialogDescription>
                        </DialogHeader>
                        {selectedApplicant && (
                            <div className="space-y-6 py-2">
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                    <Avatar className="h-20 w-20 shrink-0">
                                        <AvatarImage
                                            src={
                                                selectedApplicant.jobseeker.photo
                                                    ? `/storage/${selectedApplicant.jobseeker.photo}`
                                                    : undefined
                                            }
                                            alt={selectedApplicant.jobseeker.display_name}
                                        />
                                        <AvatarFallback className="bg-muted text-lg font-medium text-muted-foreground">
                                            {getInitials(selectedApplicant.jobseeker.display_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1 text-center sm:text-left">
                                        <p className="font-semibold text-foreground text-lg">
                                            {selectedApplicant.jobseeker.display_name}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedApplicant.jobseeker.email}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            <Badge variant="outline" className="text-xs">
                                                {selectedApplicant.total_applications} job application(s)
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <ProfileSection title="Qualifications & Skills">
                                    {selectedApplicant.skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 py-2">
                                            {selectedApplicant.skills.map((s, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                >
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <ProfileRow label="Skills" value={selectedApplicant.jobseeker.other_info?.skills || 'None'} />
                                    )}
                                    <ProfileRow label="Work experience" value={selectedApplicant.jobseeker.other_info?.work} />
                                    <ProfileRow label="Status" value={selectedApplicant.jobseeker.other_info?.status} />
                                </ProfileSection>

                                <ProfileSection title="Personal information">
                                    <ProfileRow label="First name" value={selectedApplicant.jobseeker.firstname} />
                                    <ProfileRow label="Middle name" value={selectedApplicant.jobseeker.middlename} />
                                    <ProfileRow label="Last name" value={selectedApplicant.jobseeker.lastname} />
                                    <ProfileRow label="Suffix" value={selectedApplicant.jobseeker.suffix} />
                                    <ProfileRow label="Gender" value={selectedApplicant.jobseeker.gender} />
                                    <ProfileRow
                                        label="Date of birth"
                                        value={
                                            selectedApplicant.jobseeker.date_of_birth
                                                ? new Date(selectedApplicant.jobseeker.date_of_birth).toLocaleDateString(
                                                      undefined,
                                                      { dateStyle: 'medium' }
                                                  )
                                                : null
                                        }
                                    />
                                    <ProfileRow
                                        label="Age"
                                        value={
                                            selectedApplicant.jobseeker.age != null
                                                ? String(selectedApplicant.jobseeker.age)
                                                : null
                                        }
                                    />
                                    <ProfileRow label="Address" value={selectedApplicant.jobseeker.address} />
                                    <ProfileRow label="Account status" value={selectedApplicant.jobseeker.status} />
                                </ProfileSection>

                                <ProfileSection title={`Applied Jobs (${selectedApplicant.applications.length})`}>
                                    <div className="space-y-2 pt-1">
                                        {selectedApplicant.applications.map((app) => (
                                            <div
                                                key={app.id}
                                                className="flex items-center justify-between rounded-lg border border-border/70 p-3 bg-muted/20"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{app.job_title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Applied on{' '}
                                                        {app.applied_at
                                                            ? new Date(app.applied_at).toLocaleDateString(undefined, {
                                                                  dateStyle: 'medium',
                                                              })
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={getStatusBadgeClass(app.status)}
                                                >
                                                    {app.status || 'pending'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ProfileSection>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Approve Application Modal */}
                <Dialog
                    open={!!approveConfirm}
                    onOpenChange={(open) => {
                        if (!open && !isProcessingApprove) resetApproveForm();
                    }}
                >
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                                Approve Application & Set Interview Schedule
                            </DialogTitle>
                            <DialogDescription>
                                Set the interview schedule and instructions for{' '}
                                <strong className="text-foreground">{approveConfirm?.applicantName}</strong> for the position of{' '}
                                <strong className="text-foreground">{approveConfirm?.application.job_title}</strong>.
                                A notification and email with a direct Gmail link will be automatically sent to the applicant.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="interview_date" className="text-xs font-semibold">
                                        Interview Date <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="interview_date"
                                        type="date"
                                        disabled={isProcessingApprove}
                                        value={interviewDate}
                                        onChange={(e) => setInterviewDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="interview_time" className="text-xs font-semibold">
                                        Interview Time <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="interview_time"
                                        type="text"
                                        placeholder="e.g. 10:00 AM"
                                        disabled={isProcessingApprove}
                                        value={interviewTime}
                                        onChange={(e) => setInterviewTime(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="interview_type" className="text-xs font-semibold">
                                        Interview Format
                                    </Label>
                                    <Select
                                        value={interviewType}
                                        onValueChange={setInterviewType}
                                        disabled={isProcessingApprove}
                                    >
                                        <SelectTrigger id="interview_type" className="mt-1">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="face-to-face">Face-to-Face (On-site)</SelectItem>
                                            <SelectItem value="virtual">Online (Google Meet / Zoom)</SelectItem>
                                            <SelectItem value="phone">Phone Call</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="interview_location" className="text-xs font-semibold">
                                        {interviewType === 'virtual' ? 'Meeting Link (Meet / Zoom)' : 'Location / Office Address'}
                                    </Label>
                                    <Input
                                        id="interview_location"
                                        type="text"
                                        placeholder={interviewType === 'virtual' ? 'https://meet.google.com/...' : 'e.g. HR Dept, 2nd Floor Admin Bldg'}
                                        disabled={isProcessingApprove}
                                        value={interviewLocation}
                                        onChange={(e) => setInterviewLocation(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="contact_person" className="text-xs font-semibold">
                                        Contact Person / Interviewer
                                    </Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        placeholder="e.g. Juan Dela Cruz (HR Head)"
                                        disabled={isProcessingApprove}
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_phone" className="text-xs font-semibold">
                                        Contact Phone / Mobile
                                    </Label>
                                    <Input
                                        id="contact_phone"
                                        type="text"
                                        placeholder="e.g. 09123456789"
                                        disabled={isProcessingApprove}
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="interview_instructions" className="text-xs font-semibold">
                                    Instructions for Applicant <span className="text-muted-foreground font-normal">(Requirements, dress code, etc.)</span>
                                </Label>
                                <textarea
                                    id="interview_instructions"
                                    rows={3}
                                    placeholder="e.g. Please wear formal/corporate attire. Bring 2 copies of your updated resume, transcript of records, and valid ID."
                                    disabled={isProcessingApprove}
                                    value={interviewInstructions}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInterviewInstructions(e.target.value)}
                                    className="mt-1 flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    maxLength={2000}
                                />
                            </div>
                        </div>

                        {isProcessingApprove && (
                            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                <span>Sending approval email with interview details to applicant...</span>
                            </div>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" disabled={isProcessingApprove} onClick={resetApproveForm}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApproveConfirm}
                                disabled={isProcessingApprove}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                            >
                                {isProcessingApprove ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Sending Email...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        <span>Approve & Send Notice</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Decline Application Modal */}
                <Dialog
                    open={!!declineConfirm}
                    onOpenChange={(open) => {
                        if (!open && !isProcessingDecline) {
                            setDeclineConfirm(null);
                            setDeclineRemarks('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Decline application</DialogTitle>
                            <DialogDescription>
                                The application for position <strong>{declineConfirm?.application.job_title}</strong> will be set to Cancelled and a notification email will be sent to <strong>{declineConfirm?.applicantName}</strong>. You may add optional remarks below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-2">
                            <Label htmlFor="decline-remarks">Remarks (optional)</Label>
                            <textarea
                                id="decline-remarks"
                                placeholder="e.g. Reason for declining..."
                                value={declineRemarks}
                                disabled={isProcessingDecline}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDeclineRemarks(e.target.value)}
                                className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                maxLength={1000}
                            />
                        </div>
                        {isProcessingDecline && (
                            <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                                <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
                                <span>Sending decline email to applicant...</span>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                disabled={isProcessingDecline}
                                onClick={() => {
                                    setDeclineConfirm(null);
                                    setDeclineRemarks('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={isProcessingDecline}
                                onClick={handleDeclineConfirm}
                                className="gap-2"
                            >
                                {isProcessingDecline ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Sending Email...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        <span>Decline & Send Email</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
