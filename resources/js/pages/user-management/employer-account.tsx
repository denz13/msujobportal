import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle,
    FileText,
    Mail,
    MapPin,
    MoreVertical,
    Pencil,
    Phone,
    Search,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem } from '@/types';

type EmployerInformation = {
    id: number;
    users_id: number;
    position: string | null;
    contact_number: string | null;
    business_address: string | null;
    business_permit: string | null;
    tin: string | null;
    type_of_business: string | null;
    status: string | null;
};

type Employer = {
    id: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    suffix: string | null;
    email: string;
    role: string;
    status: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
    display_name: string;
    employer_information?: EmployerInformation | null;
    has_incomplete_info?: boolean;
    has_complete_info?: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedEmployers = {
    data: Employer[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type Props = {
    employers: PaginatedEmployers;
    filters?: {
        search?: string;
        status?: string;
    };
    uniqueStatuses?: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/user-management',
    },
    {
        title: 'Employer Accounts',
        href: '/user-management/employer-account',
    },
];

export default function EmployerAccount({
    employers,
    filters = {},
    uniqueStatuses = [],
}: Props) {
    const getInitials = useInitials();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.status || 'all',
    );
    const isInitialMount = useRef(true);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
        null,
    );
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'decline' | 'approve-business' | 'decline-business' | null>(null);
    const [employerToAction, setEmployerToAction] = useState<Employer | null>(null);

    // Debounce search and update URL (skip on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                '/user-management/employer-account',
                {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page: 1, // Reset to first page on filter change
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter]);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/user-management/employer-account',
            {
                search: searchQuery || undefined,
                status: value !== 'all' ? value : undefined,
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'declined':
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };


    const handleDeleteEmployer = async (employer: Employer) => {
        const confirmed = window.confirm(
            `Delete employer account for ${employer.display_name}? This cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/user-management/employer-account/${employer.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                toast.error(data.message || 'Failed to delete employer account');
                return;
            }

            toast.success(data.message || 'Employer account deleted');
            router.reload({ only: ['employers', 'uniqueStatuses'] });
        } catch {
            toast.error('An error occurred while deleting employer account');
        }
    };

    const handleApproveEmployer = (employer: Employer) => {
        setEmployerToAction(employer);
        setConfirmAction('approve');
        setConfirmOpen(true);
    };

    const handleDeclineEmployer = (employer: Employer) => {
        setEmployerToAction(employer);
        setConfirmAction('decline');
        setConfirmOpen(true);
    };

    const handleApproveBusiness = (employer: Employer) => {
        setEmployerToAction(employer);
        setConfirmAction('approve-business');
        setConfirmOpen(true);
    };

    const handleDeclineBusiness = (employer: Employer) => {
        setEmployerToAction(employer);
        setConfirmAction('decline-business');
        setConfirmOpen(true);
    };

    const executeApprove = async () => {
        if (!employerToAction) return;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                toast.error('CSRF token not found');
                return;
            }

            const response = await fetch(
                `/user-management/employer-account/${employerToAction.id}/toggle-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 'approved' }),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.message || 'Failed to approve employer account');
                return;
            }

            const data = await response.json();
            toast.success(data.message || 'Employer account approved');
            setConfirmOpen(false);
            setEmployerToAction(null);
            setConfirmAction(null);
            router.reload({ only: ['employers', 'uniqueStatuses'] });
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('An error occurred while approving employer account');
        }
    };

    const executeDecline = async () => {
        if (!employerToAction) return;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                toast.error('CSRF token not found');
                return;
            }

            const response = await fetch(
                `/user-management/employer-account/${employerToAction.id}/toggle-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 'declined' }),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.message || 'Failed to decline employer account');
                return;
            }

            const data = await response.json();
            toast.success(data.message || 'Employer account declined');
            setConfirmOpen(false);
            setEmployerToAction(null);
            setConfirmAction(null);
            router.reload({ only: ['employers', 'uniqueStatuses'] });
        } catch (error) {
            console.error('Decline error:', error);
            toast.error('An error occurred while declining employer account');
        }
    };

    const executeApproveBusiness = async () => {
        if (!employerToAction) return;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                toast.error('CSRF token not found');
                return;
            }

            const response = await fetch(
                `/user-management/employer-account/${employerToAction.id}/business-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 'approved' }),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.message || 'Failed to approve business information');
                return;
            }

            const data = await response.json();
            toast.success(data.message || 'Business information approved');
            setConfirmOpen(false);
            setEmployerToAction(null);
            setConfirmAction(null);
            router.reload({ only: ['employers', 'uniqueStatuses'] });
        } catch (error) {
            console.error('Approve business error:', error);
            toast.error('An error occurred while approving business information');
        }
    };

    const executeDeclineBusiness = async () => {
        if (!employerToAction) return;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                toast.error('CSRF token not found');
                return;
            }

            const response = await fetch(
                `/user-management/employer-account/${employerToAction.id}/business-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 'declined' }),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.message || 'Failed to decline business information');
                return;
            }

            const data = await response.json();
            toast.success(data.message || 'Business information declined');
            setConfirmOpen(false);
            setEmployerToAction(null);
            setConfirmAction(null);
            router.reload({ only: ['employers', 'uniqueStatuses'] });
        } catch (error) {
            console.error('Decline business error:', error);
            toast.error('An error occurred while declining business information');
        }
    };

    const handleViewDetails = (employer: Employer) => {
        setSelectedEmployer(employer);
        setDetailsOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employer Accounts" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Employer Accounts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and view all employer accounts registered in the
                        system.
                    </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Label htmlFor="search" className="sr-only">
                            Search employers
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <Label htmlFor="status-filter" className="sr-only">
                            Filter by status
                        </Label>
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger id="status-filter">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {uniqueStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        <span className="capitalize">{status}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {employers.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No employer accounts found.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-sidebar-border/70">
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Employer
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Business Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employers.data.map((employer) => (
                                            <tr
                                                key={employer.id}
                                                className="border-b border-sidebar-border/70 transition-colors hover:bg-accent/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage
                                                                src={
                                                                    employer.photo
                                                                        ? (employer.photo.startsWith('http') || employer.photo.startsWith('/')
                                                                            ? employer.photo
                                                                            : `/${employer.photo}`)
                                                                        : undefined
                                                                }
                                                                alt={
                                                                    employer.display_name
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                {getInitials(
                                                                    employer.display_name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">
                                                            {employer.display_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {employer.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {employer.status ? (
                                                        <Badge
                                                            className={getStatusColor(
                                                                employer.status,
                                                            )}
                                                        >
                                                            {employer.status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {employer.employer_information?.status ? (
                                                        <Badge
                                                            className={getStatusColor(
                                                                employer.employer_information.status,
                                                            )}
                                                        >
                                                            {employer.employer_information.status}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                        >
                                                            Incomplete
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Actions"
                                                            >
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleViewDetails(
                                                                        employer,
                                                                    )
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <span className="inline-block size-2 rounded-full bg-primary" />
                                                                <span>View details</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/user-management/employer-account/${employer.id}/edit`}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Pencil className="size-4" />
                                                                    <span>Update</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleApproveEmployer(
                                                                        employer,
                                                                    )
                                                                }
                                                                disabled={
                                                                    employer.status?.toLowerCase() !==
                                                                        'pending'
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="size-4" />
                                                                <span>Approve</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeclineEmployer(
                                                                        employer,
                                                                    )
                                                                }
                                                                disabled={
                                                                    employer.status ===
                                                                        'declined' ||
                                                                    employer.status ===
                                                                        'rejected'
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <XCircle className="size-4" />
                                                                <span>Decline</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleApproveBusiness(
                                                                        employer,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !employer.employer_information ||
                                                                    employer.employer_information.status === 'approved'
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="size-4" />
                                                                <span>Approve Business</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeclineBusiness(
                                                                        employer,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !employer.employer_information ||
                                                                    employer.employer_information.status === 'declined'
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <XCircle className="size-4" />
                                                                <span>Decline Business</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeleteEmployer(
                                                                        employer,
                                                                    )
                                                                }
                                                                variant="destructive"
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    links={employers.links}
                                    from={employers.from}
                                    to={employers.to}
                                    total={employers.total}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="w-[95vw] max-w-[90vw] sm:max-w-[85vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        {selectedEmployer && (
                            <div className="space-y-4 sm:space-y-6">
                                <DialogHeader>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20 shrink-0">
                                            <AvatarImage
                                                src={
                                                    selectedEmployer.photo
                                                        ? (selectedEmployer.photo.startsWith('http') || selectedEmployer.photo.startsWith('/')
                                                            ? selectedEmployer.photo
                                                            : `/${selectedEmployer.photo}`)
                                                        : undefined
                                                }
                                                alt={selectedEmployer.display_name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-semibold">
                                                {getInitials(selectedEmployer.display_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 w-full">
                                            <DialogTitle className="text-xl sm:text-2xl break-words">
                                                {selectedEmployer.display_name}
                                            </DialogTitle>
                                            <DialogDescription className="flex items-center gap-2 mt-1 break-words">
                                                <Mail className="size-4 shrink-0" />
                                                <span className="truncate">{selectedEmployer.email}</span>
                                            </DialogDescription>
                                        </div>
                                        {selectedEmployer.status && (
                                            <Badge
                                                className={`${getStatusColor(
                                                    selectedEmployer.status,
                                                )} text-xs sm:text-sm px-2 sm:px-3 py-1 shrink-0`}
                                            >
                                                {selectedEmployer.status}
                                            </Badge>
                                        )}
                                    </div>
                                </DialogHeader>

                                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                                    <Card>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                                                <User className="size-4 sm:size-5 text-primary shrink-0" />
                                                <h3 className="text-base sm:text-lg font-semibold">
                                                    User Information
                                                </h3>
                                            </div>
                                            <dl className="space-y-3 sm:space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                                                        First name
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                        {selectedEmployer.firstname}
                                                    </dd>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                                                        Middle name
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                        {selectedEmployer.middlename || (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                                                        Last name
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                        {selectedEmployer.lastname}
                                                    </dd>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                                                        Suffix
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                        {selectedEmployer.suffix || (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0">
                                                        Role
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 capitalize break-words min-w-0">
                                                        {selectedEmployer.role || '-'}
                                                    </dd>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 pt-2 border-t">
                                                    <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[120px] md:min-w-[140px] shrink-0 flex items-center gap-2">
                                                        <Calendar className="size-3 sm:size-4 shrink-0" />
                                                        <span>Joined</span>
                                                    </dt>
                                                    <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                        {new Date(
                                                            selectedEmployer.created_at,
                                                        ).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                                                <Building2 className="size-4 sm:size-5 text-primary shrink-0" />
                                                <h3 className="text-base sm:text-lg font-semibold">
                                                    Employer Information
                                                </h3>
                                            </div>
                                            {selectedEmployer.employer_information ? (
                                                <dl className="space-y-3 sm:space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0 flex items-center gap-2">
                                                            <User className="size-3 sm:size-4 shrink-0" />
                                                            <span>Position</span>
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information
                                                                    .position
                                                            }
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0 flex items-center gap-2">
                                                            <Phone className="size-3 sm:size-4 shrink-0" />
                                                            <span>Contact number</span>
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information
                                                                    .contact_number
                                                            }
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0 flex items-center gap-2">
                                                            <MapPin className="size-3 sm:size-4 shrink-0" />
                                                            <span>Business address</span>
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information
                                                                    .business_address
                                                            }
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0 flex items-center gap-2">
                                                            <FileText className="size-3 sm:size-4 shrink-0" />
                                                            <span>Business permit</span>
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information
                                                                    .business_permit
                                                            }
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0">
                                                            TIN
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information.tin
                                                            }
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                                        <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0">
                                                            Type of business
                                                        </dt>
                                                        <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                            {
                                                                selectedEmployer
                                                                    .employer_information
                                                                    .type_of_business
                                                            }
                                                        </dd>
                                                    </div>
                                                    {selectedEmployer.employer_information
                                                        .status && (
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 pt-2 border-t">
                                                            <dt className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[140px] md:min-w-[160px] shrink-0">
                                                                Status
                                                            </dt>
                                                            <dd className="text-xs sm:text-sm font-medium flex-1 break-words min-w-0">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        selectedEmployer
                                                                            .employer_information
                                                                            .status
                                                                    }
                                                                </Badge>
                                                            </dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                                                    <div className="rounded-full bg-muted p-3 sm:p-4 mb-3 sm:mb-4">
                                                        <Building2 className="size-6 sm:size-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                                        No employer information
                                                    </p>
                                                    <p className="text-xs text-muted-foreground px-4">
                                                        This employer hasn't provided their
                                                        business details yet.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                                </div>
                                <DialogTitle>
                                    {confirmAction === 'approve'
                                        ? 'Approve Employer Account?'
                                        : confirmAction === 'decline'
                                        ? 'Decline Employer Account?'
                                        : confirmAction === 'approve-business'
                                        ? 'Approve Business Information?'
                                        : 'Decline Business Information?'}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="pt-2">
                                {confirmAction === 'approve' ? (
                                    <>
                                        Are you sure you want to approve{' '}
                                        <span className="font-semibold text-foreground">
                                            {employerToAction?.display_name}
                                        </span>
                                        ? This will grant them full access to the platform.
                                    </>
                                ) : confirmAction === 'decline' ? (
                                    <>
                                        Are you sure you want to decline{' '}
                                        <span className="font-semibold text-foreground">
                                            {employerToAction?.display_name}
                                        </span>
                                        ? This action will reject their account registration.
                                    </>
                                ) : confirmAction === 'approve-business' ? (
                                    <>
                                        Are you sure you want to approve the business information for{' '}
                                        <span className="font-semibold text-foreground">
                                            {employerToAction?.display_name}
                                        </span>
                                        ? This will allow them to access all platform features.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to decline the business information for{' '}
                                        <span className="font-semibold text-foreground">
                                            {employerToAction?.display_name}
                                        </span>
                                        ? They will need to resubmit their business information.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setEmployerToAction(null);
                                    setConfirmAction(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    confirmAction === 'approve' || confirmAction === 'approve-business'
                                        ? 'default'
                                        : 'destructive'
                                }
                                onClick={() => {
                                    if (confirmAction === 'approve') {
                                        executeApprove();
                                    } else if (confirmAction === 'decline') {
                                        executeDecline();
                                    } else if (confirmAction === 'approve-business') {
                                        executeApproveBusiness();
                                    } else if (confirmAction === 'decline-business') {
                                        executeDeclineBusiness();
                                    }
                                }}
                            >
                                {confirmAction === 'approve'
                                    ? 'Approve'
                                    : confirmAction === 'decline'
                                    ? 'Decline'
                                    : confirmAction === 'approve-business'
                                    ? 'Approve Business'
                                    : 'Decline Business'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
