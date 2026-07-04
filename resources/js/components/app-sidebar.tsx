import { Link, usePage } from '@inertiajs/react';
import { Building2, FileText, LayoutGrid, User, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavGroup } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import type { Auth } from '@/types/auth';
import { edit as profileEdit } from '@/routes/profile';

type EmployerProfileShared = {
    has_information: boolean;
    is_complete: boolean;
    status?: string | null;
    is_approved?: boolean;
} | null;

const defaultNavGroups: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
                iconClassName: 'h-5 w-5 shrink-0 text-emerald-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-emerald-400',
            },
        ],
    },
    {
        label: 'Jobs Management',
        items: [
            {
                title: 'Post Jobs',
                href: '/jobs/post-jobs',
                icon: Building2,
                iconClassName: 'h-5 w-5 shrink-0 text-blue-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-blue-400',
            },
            {
                title: 'List Request Jobs Post',
                href: '/jobs/list-request-jobs-post',
                icon: FileText,
                iconClassName: 'h-5 w-5 shrink-0 text-amber-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-amber-400',
            },
        ],
    },
    {
        label: 'Applicants Management',
        items: [
            {
                title: 'List Applicants',
                href: '/applicants/list-of-applied-applicants',
                icon: Users,
                iconClassName: 'h-5 w-5 shrink-0 text-violet-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-violet-400',
            },
        ],
    },
    {
        label: 'User Management',
        items: [
            {
                title: 'Employer Accounts',
                href: '/user-management/employer-account',
                icon: Users,
                iconClassName: 'h-5 w-5 shrink-0 text-rose-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-rose-400',
            },
        ],
    },
];

const employerIncompleteNavGroups: NavGroup[] = [
    {
        label: 'Account setup',
        items: [
            {
                title: 'Profile settings',
                href: profileEdit().url,
                icon: User,
                iconClassName: 'h-5 w-5 shrink-0 text-cyan-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-cyan-400',
            },
        ],
    },
];

const employerNavGroups: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
                iconClassName: 'h-5 w-5 shrink-0 text-emerald-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-emerald-400',
            },
        ],
    },
    {
        label: 'Jobs Management',
        items: [
            {
                title: 'Post Jobs',
                href: '/jobs/post-jobs',
                icon: Building2,
                iconClassName: 'h-5 w-5 shrink-0 text-blue-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-blue-400',
            },
        ],
    },
    {
        label: 'Applicants Management',
        items: [
            {
                title: 'List Applicants',
                href: '/applicants/list-of-applied-applicants',
                icon: Users,
                iconClassName: 'h-5 w-5 shrink-0 text-violet-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-violet-400',
            },
        ],
    },
    {
        label: 'Account setup',
        items: [
            {
                title: 'Profile settings',
                href: profileEdit().url,
                icon: User,
                iconClassName: 'h-5 w-5 shrink-0 text-cyan-500 transition-all duration-200 group-hover:scale-110 group-hover:rotate-6 group-hover:text-cyan-400',
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as {
        auth: Auth;
    };

    const navGroups = auth?.user?.role === 'employer'
        ? employerNavGroups
        : defaultNavGroups;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>
        </Sidebar>
    );
}
