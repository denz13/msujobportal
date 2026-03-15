import { Head, Link, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import employerAccount from '@/routes/employer-account';

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
    applications_count?: number;
};

type ApplicantItem = {
    id: number;
    jobseeker: { display_name: string; email: string; photo: string | null };
    job_title: string;
    applied_at: string | null;
    status: string | null;
};

export default function Dashboard() {
    const getInitials = useInitials();
    const pageProps = usePage().props as unknown as {
        auth?: { user?: { firstname?: string; lastname?: string; display_name?: string } };
        employers?: Employer[];
    };
    const { auth, employers: employersList = [] } = pageProps;
    const employers = employersList;
    const user = auth?.user;
    const displayName =
        user?.display_name ??
        ([user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'there');
    const greeting = getGreeting();

    function getStatusBadgeClass(status: string | null): string {
        if (!status) return 'bg-muted text-muted-foreground';
        const s = status.toLowerCase();
        if (s === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
        if (s === 'approved' || s === 'accepted' || s === 'hired') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'cancelled' || s === 'declined' || s === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-muted text-muted-foreground';
    }

    const [modalOpen, setModalOpen] = useState(false);
    const [modalEmployerName, setModalEmployerName] = useState('');
    const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
    const [loading, setLoading] = useState(false);

    async function openApplicantsModal(employer: Employer) {
        setModalEmployerName(employer.display_name);
        setModalOpen(true);
        setLoading(true);
        setApplicants([]);
        try {
            const res = await fetch(`/employer-applicants/${employer.id}`);
            const data = await res.json();
            setApplicants(Array.isArray(data) ? data : []);
        } catch {
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
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

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {employers.map((employer) => (
                        <Card
                            key={employer.id}
                            className="cursor-pointer overflow-hidden border border-sidebar-border/70 transition-shadow hover:shadow-md dark:border-sidebar-border"
                            onClick={() => openApplicantsModal(employer)}
                        >
                            <CardContent className="p-5">
                                <div className="flex">
                                    <Building2
                                        className="size-6 shrink-0 text-primary"
                                        aria-hidden
                                    />
                                    <div className="ml-auto" />
                                </div>
                                <p className="mt-4 truncate text-lg font-medium leading-tight">
                                    {employer.display_name}
                                </p>
                                <div className="mt-6 text-3xl font-medium leading-8 tabular-nums">
                                    {employer.applications_count ?? 0}
                                </div>
                                <p className="mt-1 text-base text-muted-foreground">
                                    Applied
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-h-[85vh] !max-w-[calc(100%-2rem)] sm:!max-w-[1400px] gap-0 p-0">
                        <div className="border-b border-border px-6 py-4">
                            <DialogHeader>
                                <DialogTitle className="text-lg">
                                    Applicants
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    {modalEmployerName}
                                </p>
                            </DialogHeader>
                        </div>
                        <div className="max-h-[60vh] overflow-auto px-6 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <p className="text-sm text-muted-foreground">
                                        Loading…
                                    </p>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No applicants yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-border">
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
                                                <th className="w-[20%] whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                                                    Status
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
                                                                    src={item.jobseeker.photo ? `/storage/${item.jobseeker.photo}` : undefined}
                                                                    alt={item.jobseeker.display_name}
                                                                />
                                                                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                                                    {getInitials(item.jobseeker.display_name)}
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
                                                                  {
                                                                      dateStyle:
                                                                          'medium',
                                                                  },
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {employers.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No employer accounts yet.
                            </p>
                            <Button asChild variant="outline">
                                <Link href={employerAccount.index.url()}>
                                    Go to Employer Account
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
