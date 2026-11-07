import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Filter,
    KeyRound,
    Mail,
    MapPin,
    MoreVertical,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    UserCog,
    UserPlus,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AccountItem = {
    id: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    suffix: string | null;
    display_name: string;
    email: string;
    role: string;
    status: string;
    gender: string | null;
    address: string | null;
    photo: string | null;
    company_name: string | null;
    position: string | null;
    contact_number: string | null;
    created_at: string;
    created_at_iso: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAccounts = {
    data: AccountItem[];
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

type BusinessCategory = {
    id: number;
    name: string;
};

type Props = {
    accounts: PaginatedAccounts;
    stats: {
        total: number;
        admins: number;
        employers: number;
        jobseekers: number;
        approved: number;
        pending: number;
    };
    businessCategories: BusinessCategory[];
    filters: {
        search: string;
        role: string;
        status: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/accounts',
    },
    {
        title: 'Accounts',
        href: '/accounts',
    },
];

export default function Accounts({
    accounts,
    stats,
    businessCategories = [],
    filters = { search: '', role: 'all', status: 'all' },
}: Props) {
    const getInitials = useInitials();
    const { auth } = usePage().props as { auth: { user: { id: number; email: string } } };

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const isInitialMount = useRef(true);

    // Modal state for Create Account
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Modal state for Edit Account
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

    // Delete Confirmation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState<AccountItem | null>(null);

    // Status Change Confirmation state
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState<{ account: AccountItem; newStatus: string } | null>(null);

    // Create Account Form
    const createForm = useForm({
        firstname: '',
        middlename: '',
        lastname: '',
        suffix: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'employer' as 'admin' | 'employer',
        status: 'approved',
        gender: '',
        address: '',
        // Employer Specific
        company_name: '',
        type_of_business: '',
        position: '',
        contact_number: '',
        tin: '',
    });

    // Edit Account Form
    const editForm = useForm({
        firstname: '',
        middlename: '',
        lastname: '',
        suffix: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'employer' as 'admin' | 'employer' | 'jobseeker',
        status: 'approved',
        gender: '',
        address: '',
        // Employer Specific
        company_name: '',
        type_of_business: '',
        position: '',
        contact_number: '',
        tin: '',
    });

    // Handle filter changes with debounce
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/accounts',
                {
                    search: search.trim() || undefined,
                    role: roleFilter !== 'all' ? roleFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);

    const handleResetFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
        router.visit('/accounts');
    };

    // Open edit modal and populate data
    const openEditModal = (account: AccountItem) => {
        setEditingAccount(account);
        editForm.setData({
            firstname: account.firstname,
            middlename: account.middlename || '',
            lastname: account.lastname,
            suffix: account.suffix || '',
            email: account.email,
            password: '',
            password_confirmation: '',
            role: (account.role as 'admin' | 'employer' | 'jobseeker') || 'employer',
            status: account.status || 'approved',
            gender: account.gender || '',
            address: account.address || '',
            company_name: account.company_name || '',
            type_of_business: account.company_name || '',
            position: account.position || '',
            contact_number: account.contact_number || '',
            tin: '',
        });
        setEditModalOpen(true);
    };

    // Submit Create Account
    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post('/accounts', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Account created successfully with role: ${createForm.data.role.toUpperCase()}`);
                createForm.reset();
                setCreateModalOpen(false);
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(firstError || 'Please fix the errors in the form.');
            },
        });
    };

    // Submit Edit Account
    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingAccount) return;

        editForm.put(`/accounts/${editingAccount.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Account updated successfully.');
                editForm.reset();
                setEditModalOpen(false);
                setEditingAccount(null);
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(firstError || 'Please fix the errors in the form.');
            },
        });
    };

    // Submit Delete Account
    const handleDeleteSubmit = () => {
        if (!deletingAccount) return;

        router.delete(`/accounts/${deletingAccount.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Account deleted successfully.');
                setDeleteModalOpen(false);
                setDeletingAccount(null);
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(firstError || 'Failed to delete account.');
            },
        });
    };

    // Submit Status Change
    const handleStatusSubmit = () => {
        if (!statusTarget) return;

        router.patch(
            `/accounts/${statusTarget.account.id}/toggle-status`,
            { status: statusTarget.newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Account status updated to ${statusTarget.newStatus}.`);
                    setStatusModalOpen(false);
                    setStatusTarget(null);
                },
                onError: (err) => {
                    const firstError = Object.values(err)[0];
                    toast.error(firstError || 'Failed to update account status.');
                },
            }
        );
    };

    const getRoleBadge = (role: string) => {
        const r = role.toLowerCase();
        if (r === 'admin') {
            return (
                <Badge
                    variant="outline"
                    className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300"
                >
                    <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Admin
                </Badge>
            );
        }
        if (r === 'employer') {
            return (
                <Badge
                    variant="outline"
                    className="gap-1.5 border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
                >
                    <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Employer
                </Badge>
            );
        }
        return (
            <Badge
                variant="outline"
                className="gap-1.5 border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Jobseeker
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'approved' || s === 'active') {
            return (
                <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-medium"
                >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Approved
                </Badge>
            );
        }
        if (s === 'pending') {
            return (
                <Badge
                    variant="secondary"
                    className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] font-medium"
                >
                    <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    Pending
                </Badge>
            );
        }
        return (
            <Badge
                variant="secondary"
                className="gap-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-[11px] font-medium"
            >
                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Declined'}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header banner & Action Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Accounts Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create, configure, and manage user accounts with role assignments (Admin, Employer).
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            createForm.reset();
                            setCreateModalOpen(true);
                        }}
                        size="lg"
                        className="gap-2 self-start sm:self-auto bg-primary shadow-sm hover:shadow"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Create Account</span>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="border border-border/80 shadow-xs">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Total Accounts
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Users className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-2xl sm:text-3xl font-bold tabular-nums">
                                {stats.total}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Registered platform users
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/80 shadow-xs">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Admin Accounts
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                    <Shield className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-2xl sm:text-3xl font-bold tabular-nums text-purple-700 dark:text-purple-300">
                                {stats.admins}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                System administrators
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/80 shadow-xs">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Employer Accounts
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    <Building2 className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-2xl sm:text-3xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
                                {stats.employers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Registered companies & employers
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/80 shadow-xs">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Jobseekers
                                </span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    <UserCheck className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-2xl sm:text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                                {stats.jobseekers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active job applicants
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name, email, or employer company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Role Select */}
                            <div className="w-[150px]">
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="h-10">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder="Role" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="employer">Employer</SelectItem>
                                        <SelectItem value="jobseeker">Jobseeker</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Select */}
                            <div className="w-[150px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="declined">Declined</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="h-10 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Reset</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Accounts Table Card */}
                <Card className="border border-border shadow-xs overflow-hidden">
                    {accounts.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Users className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 font-semibold text-lg text-foreground">
                                No accounts found
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                {search || roleFilter !== 'all' || statusFilter !== 'all'
                                    ? 'No users match your specified filters. Try resetting search or filter criteria.'
                                    : 'There are currently no user accounts created in the system.'}
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    createForm.reset();
                                    setCreateModalOpen(true);
                                }}
                                className="mt-4 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create First Account</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <th className="py-3.5 pl-6 pr-3 w-[60px] text-center">User</th>
                                        <th className="py-3.5 px-4">Name & Email</th>
                                        <th className="py-3.5 px-4 w-[140px]">Role</th>
                                        <th className="py-3.5 px-4">Company / Details</th>
                                        <th className="py-3.5 px-4 w-[120px] text-center">Status</th>
                                        <th className="py-3.5 px-4 w-[130px]">Created</th>
                                        <th className="py-3.5 pl-3 pr-6 text-right w-[100px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {accounts.data.map((account) => {
                                        const isCurrentUser = auth.user.id === account.id;

                                        return (
                                            <tr
                                                key={account.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* Avatar */}
                                                <td className="py-3.5 pl-6 pr-3 text-center">
                                                    <div className="flex justify-center">
                                                        <Avatar className="h-10 w-10 border border-border/80">
                                                            <AvatarImage
                                                                src={account.photo ? `/${account.photo}` : undefined}
                                                                alt={account.display_name}
                                                            />
                                                            <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                                                                {getInitials(account.display_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </td>

                                                {/* Name & Email */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground">
                                                            {account.display_name}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-muted">
                                                                You
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Mail className="h-3 w-3 text-muted-foreground/70" />
                                                        <span>{account.email}</span>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-3.5 px-4">
                                                    {getRoleBadge(account.role)}
                                                </td>

                                                {/* Company / Details */}
                                                <td className="py-3.5 px-4 text-xs">
                                                    {account.role === 'employer' ? (
                                                        <div>
                                                            <span className="font-medium text-foreground">
                                                                {account.company_name || 'General Employer'}
                                                            </span>
                                                            {account.position && (
                                                                <span className="block text-muted-foreground">
                                                                    {account.position}
                                                                </span>
                                                            )}
                                                            {account.contact_number && account.contact_number !== '—' && (
                                                                <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                                                                    <Phone className="h-2.5 w-2.5" />
                                                                    {account.contact_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">
                                                            {account.address ? (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                                    <span className="line-clamp-1">{account.address}</span>
                                                                </span>
                                                            ) : (
                                                                <span>System Staff</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {getStatusBadge(account.status)}
                                                </td>

                                                {/* Created Date */}
                                                <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                                                    {account.created_at}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 pl-3 pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel className="text-xs">
                                                                Account Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => openEditModal(account)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                <span>Edit Account</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            {/* Quick status change */}
                                                            {account.status !== 'approved' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setStatusTarget({ account, newStatus: 'approved' });
                                                                        setStatusModalOpen(true);
                                                                    }}
                                                                    className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700"
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    <span>Set to Approved</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {account.status !== 'pending' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setStatusTarget({ account, newStatus: 'pending' });
                                                                        setStatusModalOpen(true);
                                                                    }}
                                                                    className="gap-2 cursor-pointer text-amber-600 focus:text-amber-700"
                                                                >
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span>Set to Pending</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {account.status !== 'declined' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setStatusTarget({ account, newStatus: 'declined' });
                                                                        setStatusModalOpen(true);
                                                                    }}
                                                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-700"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                    <span>Set to Declined</span>
                                                                </DropdownMenuItem>
                                                            )}

                                                            {!isCurrentUser && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setDeletingAccount(account);
                                                                            setDeleteModalOpen(true);
                                                                        }}
                                                                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        <span>Delete Account</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {accounts.links && accounts.links.length > 0 && (
                        <Pagination
                            links={accounts.links}
                            from={accounts.from}
                            to={accounts.to}
                            total={accounts.total}
                        />
                    )}
                </Card>
            </div>

            {/* CREATE ACCOUNT MODAL */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-h-[90vh] !max-w-[calc(100%-2rem)] sm:!max-w-[700px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Create New Account
                        </DialogTitle>
                        <DialogDescription>
                            Create an account with role as either <strong>Employer</strong> or <strong>Admin</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-5 py-2">
                        {/* ROLE SELECTION CARDS */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">
                                Select Account Role <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Admin Option */}
                                <div
                                    onClick={() => createForm.setData('role', 'admin')}
                                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col gap-2 ${
                                        createForm.data.role === 'admin'
                                            ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20 dark:bg-purple-950/40 dark:border-purple-500'
                                            : 'border-border hover:border-purple-300 dark:hover:border-purple-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                                <Shield className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground">
                                                Admin
                                            </span>
                                        </div>
                                        {createForm.data.role === 'admin' && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Administrative control to oversee jobs, manage employer & seeker accounts, and inspect platform reports.
                                    </p>
                                </div>

                                {/* Employer Option */}
                                <div
                                    onClick={() => createForm.setData('role', 'employer')}
                                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col gap-2 ${
                                        createForm.data.role === 'employer'
                                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 dark:bg-blue-950/40 dark:border-blue-500'
                                            : 'border-border hover:border-blue-300 dark:hover:border-blue-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground">
                                                Employer
                                            </span>
                                        </div>
                                        {createForm.data.role === 'employer' && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Can post job vacancies, review applications, schedule candidate interviews, and hire job seekers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BASIC USER INFORMATION */}
                        <div className="space-y-3 border-t border-border/80 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Basic Account Information
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="firstname">First Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="firstname"
                                        value={createForm.data.firstname}
                                        onChange={(e) => createForm.setData('firstname', e.target.value)}
                                        placeholder="e.g. Maria"
                                        required
                                        className="mt-1"
                                    />
                                    {createForm.errors.firstname && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.firstname}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="lastname">Last Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="lastname"
                                        value={createForm.data.lastname}
                                        onChange={(e) => createForm.setData('lastname', e.target.value)}
                                        placeholder="e.g. Santos"
                                        required
                                        className="mt-1"
                                    />
                                    {createForm.errors.lastname && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="middlename">Middle Name (Optional)</Label>
                                    <Input
                                        id="middlename"
                                        value={createForm.data.middlename}
                                        onChange={(e) => createForm.setData('middlename', e.target.value)}
                                        placeholder="e.g. Dela Cruz"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="suffix">Suffix (Optional)</Label>
                                    <Input
                                        id="suffix"
                                        value={createForm.data.suffix}
                                        onChange={(e) => createForm.setData('suffix', e.target.value)}
                                        placeholder="e.g. Jr., III"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                    className="mt-1"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-destructive mt-1">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                        required
                                        className="mt-1"
                                    />
                                    {createForm.errors.password && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirm Password <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Re-enter password"
                                        required
                                        className="mt-1"
                                    />
                                    {createForm.errors.password_confirmation && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={createForm.data.gender || 'none'}
                                        onValueChange={(val) => createForm.setData('gender', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="gender" className="mt-1">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Prefer not to say</SelectItem>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="status">Initial Status</Label>
                                    <Select
                                        value={createForm.data.status}
                                        onValueChange={(val) => createForm.setData('status', val)}
                                    >
                                        <SelectTrigger id="status" className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approved">Approved (Active immediately)</SelectItem>
                                            <SelectItem value="pending">Pending Approval</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Input
                                    id="address"
                                    value={createForm.data.address}
                                    onChange={(e) => createForm.setData('address', e.target.value)}
                                    placeholder="City, Province or Full Address"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* EMPLOYER BUSINESS DETAILS (CONDITIONAL) */}
                        {createForm.data.role === 'employer' && (
                            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300">
                                    <Building2 className="h-4 w-4" />
                                    <span>Employer Company Details</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Information regarding the employer company or establishment.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <Label htmlFor="company_name">Company / Business Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="company_name"
                                            value={createForm.data.company_name}
                                            onChange={(e) => createForm.setData('company_name', e.target.value)}
                                            placeholder="e.g. Tech Solutions Inc."
                                            required={createForm.data.role === 'employer'}
                                            className="mt-1 bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="type_of_business">Business Category</Label>
                                        <Select
                                            value={createForm.data.type_of_business || 'none'}
                                            onValueChange={(val) => createForm.setData('type_of_business', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="type_of_business" className="mt-1 bg-background">
                                                <SelectValue placeholder="Select business category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">General / Unspecified</SelectItem>
                                                {businessCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="position">Position / Designation</Label>
                                        <Input
                                            id="position"
                                            value={createForm.data.position}
                                            onChange={(e) => createForm.setData('position', e.target.value)}
                                            placeholder="e.g. HR Manager / Representative"
                                            className="mt-1 bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_number">Contact Number</Label>
                                        <Input
                                            id="contact_number"
                                            value={createForm.data.contact_number}
                                            onChange={(e) => createForm.setData('contact_number', e.target.value)}
                                            placeholder="e.g. 09123456789"
                                            className="mt-1 bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={createForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="gap-2 bg-primary"
                            >
                                {createForm.processing ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT ACCOUNT MODAL */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-h-[90vh] !max-w-[calc(100%-2rem)] sm:!max-w-[700px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Pencil className="h-5 w-5 text-primary" />
                            Edit Account Details
                        </DialogTitle>
                        <DialogDescription>
                            Update profile information, change role, or reset password for {editingAccount?.display_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        {/* ROLE & STATUS SELECTION */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-role">Assigned Role</Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(val) => editForm.setData('role', val as any)}
                                >
                                    <SelectTrigger id="edit-role" className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="employer">Employer</SelectItem>
                                        <SelectItem value="jobseeker">Jobseeker</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-status">Account Status</Label>
                                <Select
                                    value={editForm.data.status}
                                    onValueChange={(val) => editForm.setData('status', val)}
                                >
                                    <SelectTrigger id="edit-status" className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="declined">Declined</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* NAME FIELDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-firstname">First Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-firstname"
                                    value={editForm.data.firstname}
                                    onChange={(e) => editForm.setData('firstname', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-lastname">Last Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-lastname"
                                    value={editForm.data.lastname}
                                    onChange={(e) => editForm.setData('lastname', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-middlename">Middle Name</Label>
                                <Input
                                    id="edit-middlename"
                                    value={editForm.data.middlename}
                                    onChange={(e) => editForm.setData('middlename', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-suffix">Suffix</Label>
                                <Input
                                    id="edit-suffix"
                                    value={editForm.data.suffix}
                                    onChange={(e) => editForm.setData('suffix', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-email">Email Address <span className="text-destructive">*</span></Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        {/* OPTIONAL PASSWORD RESET */}
                        <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <KeyRound className="h-3.5 w-3.5" />
                                <span>Change Password (Leave blank to keep existing password)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="edit-password">New Password</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="Leave empty to keep"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="edit-password_confirmation"
                                        type="password"
                                        value={editForm.data.password_confirmation}
                                        onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat new password"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EMPLOYER BUSINESS DETAILS (IF EMPLOYER) */}
                        {editForm.data.role === 'employer' && (
                            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300">
                                    <Building2 className="h-4 w-4" />
                                    <span>Employer Details</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="edit-company_name">Company / Business Name</Label>
                                        <Input
                                            id="edit-company_name"
                                            value={editForm.data.company_name}
                                            onChange={(e) => editForm.setData('company_name', e.target.value)}
                                            className="mt-1 bg-background"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="edit-position">Position / Title</Label>
                                        <Input
                                            id="edit-position"
                                            value={editForm.data.position}
                                            onChange={(e) => editForm.setData('position', e.target.value)}
                                            className="mt-1 bg-background"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="edit-contact_number">Contact Number</Label>
                                    <Input
                                        id="edit-contact_number"
                                        value={editForm.data.contact_number}
                                        onChange={(e) => editForm.setData('contact_number', e.target.value)}
                                        className="mt-1 bg-background"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                                disabled={editForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="gap-2 bg-primary"
                            >
                                {editForm.processing ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* STATUS CHANGE CONFIRMATION MODAL */}
            <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            Confirm Status Update
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to change the status of{' '}
                            <strong>{statusTarget?.account.display_name}</strong> to{' '}
                            <strong className="uppercase text-foreground">{statusTarget?.newStatus}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStatusModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleStatusSubmit}
                            className="bg-primary"
                        >
                            Confirm Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE ACCOUNT CONFIRMATION MODAL */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete the account of{' '}
                            <strong>{deletingAccount?.display_name}</strong> ({deletingAccount?.email})? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Permanently</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

