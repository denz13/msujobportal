import { Head, router } from '@inertiajs/react';
import { CheckCircle2, FileText, MoreVertical, Search, User, UserCircle, XCircle } from 'lucide-react';
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';
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

type ApplicantItem = {
    id: number;
    jobseeker: {
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
    job_title: string;
    applied_at: string | null;
    status: string | null;
    resume_path: string | null;
    description?: string | null;
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
    filters?: { search?: string; status?: string };
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
    const [approveConfirm, setApproveConfirm] = useState<ApplicantItem | null>(null);
    const [declineConfirm, setDeclineConfirm] = useState<ApplicantItem | null>(null);
    const [declineRemarks, setDeclineRemarks] = useState('');
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get('/applicants/list-of-applied-applicants', {
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: 1,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter]);

    function handleStatusChange(value: string) {
        setStatusFilter(value);
    }

    function openResumeModal(path: string) {
        setResumeUrl(path.startsWith('/') ? path : `/${path}`);
        setResumeModalOpen(true);
    }

    function handleApproveConfirm() {
        if (!approveConfirm) return;
        const id = approveConfirm.id;
        setApproveConfirm(null);
        router.patch(`/applicants/list-of-applied-applicants/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Application approved. Applicant has been notified.'),
            onError: () => toast.error('Failed to approve application.'),
        });
    }

    function handleDeclineConfirm() {
        if (!declineConfirm) return;
        const id = declineConfirm.id;
        const remarks = declineRemarks.trim() || undefined;
        setDeclineConfirm(null);
        setDeclineRemarks('');
        router.patch(`/applicants/list-of-applied-applicants/${id}/decline`, { remarks }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Application declined. Applicant has been notified.'),
            onError: () => toast.error('Failed to decline application.'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List of applied applicants" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        List of applied applicants
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Jobseekers who applied to your job posts.
                    </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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

                <Card>
                    <CardContent className="p-0">
                        {applicants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <User className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="mt-4 font-medium">No applicants yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Applications to your jobs will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed text-center text-sm">
                                        <thead>
                                            <tr className="bg-muted/60">
                                                <th className="w-[8%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Photo
                                                </th>
                                                <th className="w-[14%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Name
                                                </th>
                                                <th className="w-[18%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Email
                                                </th>
                                                <th className="w-[18%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Job applied to
                                                </th>
                                                <th className="w-[20%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Date applied
                                                </th>
                                                <th className="w-[16%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="w-[12%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Resume
                                                </th>
                                                <th className="w-[12%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applicants.map((item, i) => (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        i % 2 === 0
                                                            ? 'bg-background'
                                                            : 'bg-muted/20'
                                                    }
                                                >
                                                    <td className="border-t border-border/60 px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <Avatar className="h-9 w-9 shrink-0">
                                                                <AvatarImage
                                                                    src={
                                                                        item.jobseeker.photo
                                                                            ? `/storage/${item.jobseeker.photo}`
                                                                            : undefined
                                                                    }
                                                                    alt={item.jobseeker.display_name}
                                                                />
                                                                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                                                    {getInitials(
                                                                        item.jobseeker.display_name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3 font-medium truncate" title={item.jobseeker.display_name}>
                                                        {item.jobseeker.display_name}
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3 text-muted-foreground truncate" title={item.jobseeker.email}>
                                                        {item.jobseeker.email}
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3 truncate" title={item.job_title || undefined}>
                                                        {item.job_title || '—'}
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3 tabular-nums text-muted-foreground">
                                                        {item.applied_at
                                                            ? new Date(
                                                                  item.applied_at,
                                                              ).toLocaleDateString(
                                                                  undefined,
                                                                  { dateStyle: 'medium' },
                                                              )
                                                            : '—'}
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <Badge
                                                                variant="secondary"
                                                                className={getStatusBadgeClass(
                                                                    item.status,
                                                                )}
                                                            >
                                                                {item.status
                                                                    ? item.status.charAt(0).toUpperCase() +
                                                                      item.status.slice(1).toLowerCase()
                                                                    : '—'}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3">
                                                        <div className="flex justify-center">
                                                            {item.resume_path ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openResumeModal(item.resume_path!)}
                                                                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                                                >
                                                                    <FileText className="h-4 w-4 shrink-0" />
                                                                    <span>View</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="border-t border-border/60 px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        aria-label="Actions"
                                                                    >
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedApplicant(item);
                                                                            setProfileModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <UserCircle className="mr-2 h-4 w-4" />
                                                                        View profile
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => setApproveConfirm(item)}
                                                                        className="text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                                                                    >
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                        Approve application
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setDeclineConfirm(item);
                                                                            setDeclineRemarks('');
                                                                        }}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Decline application
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
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

                <Dialog open={resumeModalOpen} onOpenChange={(open) => { setResumeModalOpen(open); if (!open) setResumeUrl(null); }}>
                    <DialogContent className="max-h-[90vh] !max-w-[calc(100%-2rem)] sm:!max-w-6xl gap-0 p-0">
                        <DialogHeader className="border-b border-border px-4 py-3">
                            <DialogTitle className="text-lg">Resume</DialogTitle>
                        </DialogHeader>
                        <div className="min-h-[70vh] w-full">
                            {resumeUrl && (
                                <iframe
                                    title="Resume"
                                    src={resumeUrl}
                                    className="h-[70vh] w-full border-0"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

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
                                        <p className="font-semibold text-foreground">
                                            {selectedApplicant.jobseeker.display_name}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedApplicant.jobseeker.email}
                                        </p>
                                    </div>
                                </div>

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
                                                ? new Date(selectedApplicant.jobseeker.date_of_birth).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                                : null
                                        }
                                    />
                                    <ProfileRow label="Age" value={selectedApplicant.jobseeker.age != null ? String(selectedApplicant.jobseeker.age) : null} />
                                    <ProfileRow label="Address" value={selectedApplicant.jobseeker.address} />
                                    <ProfileRow label="Account status" value={selectedApplicant.jobseeker.status} />
                                </ProfileSection>

                                {selectedApplicant.jobseeker.other_info && (
                                    <ProfileSection title="Other information">
                                        <ProfileRow label="Skills" value={selectedApplicant.jobseeker.other_info.skills} />
                                        <ProfileRow label="Work" value={selectedApplicant.jobseeker.other_info.work} />
                                        <ProfileRow label="Status" value={selectedApplicant.jobseeker.other_info.status} />
                                    </ProfileSection>
                                )}

                                <ProfileSection title="Application details">
                                    <ProfileRow label="Job applied to" value={selectedApplicant.job_title} />
                                    <ProfileRow
                                        label="Date applied"
                                        value={
                                            selectedApplicant.applied_at
                                                ? new Date(selectedApplicant.applied_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                                : null
                                        }
                                    />
                                    <div className="flex items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0">
                                        <span className="text-muted-foreground text-sm">Application status</span>
                                        <Badge
                                            variant="secondary"
                                            className={getStatusBadgeClass(selectedApplicant.status)}
                                        >
                                            {selectedApplicant.status
                                                ? selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1).toLowerCase()
                                                : '—'}
                                        </Badge>
                                    </div>
                                    {selectedApplicant.description && (
                                        <div className="pt-2">
                                            <span className="text-muted-foreground text-sm">Message / Cover</span>
                                            <p className="mt-1 whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                                                {selectedApplicant.description}
                                            </p>
                                        </div>
                                    )}
                                    {selectedApplicant.resume_path && (
                                        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                                            <span className="text-muted-foreground text-sm">Resume</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileModalOpen(false);
                                                    setSelectedApplicant(null);
                                                    openResumeModal(selectedApplicant.resume_path!);
                                                }}
                                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <FileText className="h-4 w-4 shrink-0" />
                                                View resume
                                            </button>
                                        </div>
                                    )}
                                </ProfileSection>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={!!approveConfirm} onOpenChange={(open) => !open && setApproveConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve application</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to approve this application? The applicant will be notified.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setApproveConfirm(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleApproveConfirm} className="bg-emerald-600 hover:bg-emerald-700">
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!declineConfirm} onOpenChange={(open) => { if (!open) { setDeclineConfirm(null); setDeclineRemarks(''); } }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Decline application</DialogTitle>
                            <DialogDescription>
                                The application status will be set to Cancelled and the applicant will be notified. You may add optional remarks below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-2">
                            <Label htmlFor="decline-remarks">Remarks (optional)</Label>
                            <textarea
                                id="decline-remarks"
                                placeholder="e.g. Reason for declining..."
                                value={declineRemarks}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDeclineRemarks(e.target.value)}
                                className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                maxLength={1000}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setDeclineConfirm(null); setDeclineRemarks(''); }}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeclineConfirm}>
                                Decline
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
