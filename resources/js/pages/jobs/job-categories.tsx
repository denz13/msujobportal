import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Calendar,
    Layers,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';

type JobCategory = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Job Categories',
        href: '/jobs/categories',
    },
];

export default function JobCategories() {
    const pageProps = usePage().props as unknown as {
        flash?: { toast?: { type: string; message: string } };
        categories?: JobCategory[];
        errors?: Record<string, string>;
        filters?: { search?: string; status?: string };
        pagination?: {
            links: PaginationLink[];
            from: number | null;
            to: number | null;
            total: number;
        };
    };

    const {
        flash,
        categories = [],
        errors: pageErrors,
        filters = {},
        pagination,
    } = pageProps;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);
    const [nameValue, setNameValue] = useState('');
    const [descValue, setDescValue] = useState('');
    const [activeValue, setActiveValue] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [statusOverride, setStatusOverride] = useState<Record<number, boolean>>({});

    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const flashShown = useRef(false);
    const isInitialMount = useRef(true);

    const openAddModal = () => {
        setEditingCategory(null);
        setNameValue('');
        setDescValue('');
        setActiveValue(true);
        setModalOpen(true);
    };

    const openEditModal = (cat: JobCategory) => {
        setEditingCategory(cat);
        setNameValue(cat.name);
        setDescValue(cat.description ?? '');
        setActiveValue(cat.is_active);
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameValue.trim()) {
            toast.error('Please provide a category name');
            return;
        }

        setIsSubmitting(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            if (editingCategory) {
                // Update
                router.put(
                    `/jobs/categories/${editingCategory.id}`,
                    {
                        name: nameValue.trim(),
                        description: descValue.trim() || null,
                        is_active: activeValue,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setModalOpen(false);
                            setEditingCategory(null);
                        },
                        onError: (errs) => {
                            const firstErr = Object.values(errs)[0];
                            if (firstErr) toast.error(firstErr);
                        },
                        onFinish: () => setIsSubmitting(false),
                    }
                );
            } else {
                // Store
                router.post(
                    '/jobs/categories',
                    {
                        name: nameValue.trim(),
                        description: descValue.trim() || null,
                        is_active: activeValue,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setModalOpen(false);
                            setEditingCategory(null);
                        },
                        onError: (errs) => {
                            const firstErr = Object.values(errs)[0];
                            if (firstErr) toast.error(firstErr);
                        },
                        onFinish: () => setIsSubmitting(false),
                    }
                );
            }
        } catch {
            setIsSubmitting(false);
            toast.error('An unexpected error occurred.');
        }
    };

    const handleDelete = async (cat: JobCategory) => {
        if (!window.confirm(`Delete category "${cat.name}"? This action cannot be undone.`)) return;
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) {
            toast.error('CSRF token not found');
            return;
        }

        try {
            const res = await fetch(`/jobs/categories/${cat.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to delete category');
                return;
            }
            toast.success(data.message ?? 'Category deleted');
            router.reload();
        } catch {
            toast.error('An error occurred');
        }
    };

    const handleToggleStatus = async (cat: JobCategory, nextChecked: boolean) => {
        setStatusOverride((prev) => ({ ...prev, [cat.id]: nextChecked }));
        setTogglingId(cat.id);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) {
            toast.error('CSRF token not found');
            setStatusOverride((prev) => {
                const next = { ...prev };
                delete next[cat.id];
                return next;
            });
            setTogglingId(null);
            return;
        }

        try {
            const res = await fetch(`/jobs/categories/${cat.id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ is_active: nextChecked }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.message ?? 'Failed to update status');
                setStatusOverride((prev) => {
                    const next = { ...prev };
                    delete next[cat.id];
                    return next;
                });
                setTogglingId(null);
                return;
            }
            toast.success(data.message ?? 'Status updated successfully');
            router.reload();
        } catch {
            toast.error('An error occurred');
        } finally {
            setTogglingId(null);
        }
    };

    useEffect(() => {
        if (flash?.toast && !flashShown.current) {
            flashShown.current = true;
            if (flash.toast.type === 'success') {
                toast.success(flash.toast.message);
                setModalOpen(false);
                setEditingCategory(null);
            } else {
                toast.error(flash.toast.message);
            }
        }
    }, [flash]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                '/jobs/categories',
                {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page: 1,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, statusFilter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Heading
                            title="Job Categories"
                            description="Manage job categories used for posting and categorizing job listings."
                        />
                    </div>
                    <Button onClick={openAddModal} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <label htmlFor="search" className="sr-only">Search categories</label>
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Search by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="w-full sm:w-[160px]">
                            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status-filter" className="w-full">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <Layers className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">No job categories found.</p>
                                <Button onClick={openAddModal} variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Category
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Category Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Description
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Active Toggle
                                            </th>
                                            <th className="w-[80px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((cat) => {
                                            const isActive = statusOverride[cat.id] ?? cat.is_active;
                                            return (
                                                <tr
                                                    key={cat.id}
                                                    className="border-b border-sidebar-border/70 transition-colors hover:bg-accent/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                                                                <Layers className="h-4 w-4" />
                                                            </div>
                                                            <span>{cat.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="max-w-md truncate px-4 py-3 text-sm text-muted-foreground">
                                                        {cat.description || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                                isActive
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={isActive}
                                                                onCheckedChange={(checked) => handleToggleStatus(cat, checked)}
                                                                disabled={togglingId === cat.id}
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {isActive ? 'On' : 'Off'}
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
                                                                    onClick={() => openEditModal(cat)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(cat)}
                                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
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

            {/* Add / Edit Category Dialog */}
            <Dialog
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingCategory(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Job Category' : 'Add New Job Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Update the details and visibility of this category.'
                                : 'Add a new category that will be available when employers post jobs.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="category_name">Category Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="category_name"
                                required
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                placeholder="e.g. Information Technology"
                            />
                            {pageErrors?.name && <InputError message={pageErrors.name} />}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category_desc">Description</Label>
                            <textarea
                                id="category_desc"
                                rows={3}
                                value={descValue}
                                onChange={(e) => setDescValue(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Brief description of roles falling under this category..."
                            />
                            {pageErrors?.description && <InputError message={pageErrors.description} />}
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="category_active" className="text-sm font-medium">
                                    Active Status
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    When active, this category appears in the Post Job selection list.
                                </p>
                            </div>
                            <Switch
                                id="category_active"
                                checked={activeValue}
                                onCheckedChange={setActiveValue}
                            />
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setModalOpen(false);
                                    setEditingCategory(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? (editingCategory ? 'Saving...' : 'Creating...')
                                    : (editingCategory ? 'Save Changes' : 'Create Category')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
